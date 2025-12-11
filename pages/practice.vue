<template>
  <view class="practice-container">
    <!-- 顶部栏：返回 + 科目/练习类型 -->
    <view class="practice-header">
      <view class="header-center">
        <text class="practice-title">{{ typeName }}</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-wrap" v-if="loading">
      <view class="loading-content">
        <text class="loading-text">正在加载题目...</text>
      </view>
    </view>

    <!-- 题面 -->
    <view class="question-wrap" v-if="!loading">
      <view class="question-head">
        <text class="q-index">第{{ currentIndex + 1 }}题</text>
        <text class="q-type-tag">{{ getTypeText(currentQuestion.type) }}</text>
        <text v-if="isFav" class="fav-flag">★ 已收藏</text>
      </view>

      <!-- 答题时间显示 -->
      <view class="question-timer" v-if="!isCurrentQuestionSubmitted">
        <text class="timer-label">答题时间：</text>
        <text class="timer-value">{{ formatTime(currentQuestionTime) }}</text>
      </view>
      <view class="question-text">
        <text class="q-text">{{ currentQuestion.content }}</text>
      </view>

      <!-- 选项（非判断） -->
      <view class="options" v-if="currentQuestion.type !== 'true_false'">
        <view class="option-item" v-for="(opt, idx) in getOptionsArray(currentQuestion.options)" :key="idx"
          :class="optionClass(opt.value)" @tap="selectOption(opt.value)">
          <view class="opt-label">{{ opt.label }}</view>
          <view class="opt-text">{{ opt.text }}</view>
        </view>
      </view>

      <!-- 判断题 -->
      <view class="judge-options" v-else>
        <view class="judge-item" :class="judgeClass('A')" @tap="selectOption('A')">
          <view class="judge-label">A</view>
          <view class="judge-text">{{ currentQuestion.options?.A || '对' }}</view>
        </view>
        <view class="judge-item" :class="judgeClass('B')" @tap="selectOption('B')">
          <view class="judge-label">B</view>
          <view class="judge-text">{{ currentQuestion.options?.B || '错' }}</view>
        </view>
      </view>

      <!-- 当前题目提交按钮 -->
      <view class="question-submit" v-if="!isCurrentQuestionSubmitted">
        <button class="submit-btn" @tap="submitCurrentQuestion" hover-class="btn-hover">
          <text class="submit-text">提交答案</text>
        </button>
      </view>

      <!-- 答案与解析（提交后显示） -->
      <view class="answer-explain" v-if="isCurrentQuestionSubmitted">
        <view class="answer-row">
          <text class="answer-label">正确答案</text>
          <text class="answer-value">{{ formatCorrect(currentQuestion.correctAnswer) }}</text>
        </view>
        <view class="time-row" v-if="questionTimes[currentIndex]">
          <text class="time-label">答题时间</text>
          <text class="time-value">{{ formatTime(questionTimes[currentIndex]) }}</text>
        </view>
        <view class="explain-row" v-if="currentQuestion.explanation">
          <text class="explain-label">题目解析</text>
          <text class="explain-text">{{ currentQuestion.explanation }}</text>
        </view>
      </view>
    </view>

    <!-- 题目列表弹窗（目录） -->
    <uni-popup ref="listPopup" type="bottom" :zIndex="2000">
      <view class="list-popup">
        <view class="list-header">
          <text class="list-title">题目目录</text>
          <view class="close-btn" @tap="closeList">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="grid">
          <view class="grid-item" v-for="(q, i) in questions" :key="i" :class="gridItemClass(i)" @tap="jump(i)">
            <text class="num">{{ i + 1 }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 底部工具栏 -->
    <view class="practice-footer">
      <view class="footer-grid">
        <button class="pf-btn" @tap="prev" :class="{ disabled: currentIndex === 0 }" hover-class="btn-hover">
          <text class="pf-text">上一题</text>
        </button>
        <button class="pf-btn" @tap="openList" hover-class="btn-hover">
          <text class="pf-text">目录</text>
        </button>
        <button class="pf-btn" @tap="toggleFav" hover-class="btn-hover">
          <text class="pf-text">{{ isFav ? '已收藏' : '收藏' }}</text>
        </button>
        <button class="pf-btn" @tap="next" :class="{ disabled: currentIndex === questions.length - 1 }"
          hover-class="btn-hover">
          <text class="pf-text">下一题</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload, onShow } from '@dcloudio/uni-app'
import { recordWrongQuestion, loadPracticeRecord, updatePracticeRecordWhileSubmitAnswer, updatePracticeRecordWhileLeavePage } from '@/api/study/practiceRecord'

const type = ref(null) // null | true_false | single_choice
const questionBankId = ref(null)
const loading = ref(false)

const questions = ref([])
const currentIndex = ref(0)
const answers = ref({})
const favSet = ref(new Set())
const listPopup = ref(null)
const submittedQuestions = ref(new Set()) // 记录已提交的题目索引

// 计时器相关变量
const questionStartTime = ref(null) // 当前题目开始时间
const questionTimer = ref(null) // 计时器ID
const currentQuestionTime = ref(0) // 当前题目已用时间（秒）
const questionTimes = ref({}) // 记录每道题的答题时间

// 练习记录相关变量
const practiceRecord = ref(null) // 练习记录
const practiceRecordId = ref(null) // 练习记录ID
const studentId = uni.getStorageSync('token').data.id

// 计时器相关方法
function startQuestionTimer() {
  // 清除之前的计时器
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }

  // 记录开始时间
  questionStartTime.value = Date.now()
  currentQuestionTime.value = 0

  // 每秒更新一次时间
  questionTimer.value = setInterval(() => {
    if (questionStartTime.value) {
      currentQuestionTime.value = Math.floor((Date.now() - questionStartTime.value) / 1000)
    }
  }, 1000)
}

function stopQuestionTimer() {
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
    questionTimer.value = null
  }

  // 保存当前题目的答题时间
  if (questionStartTime.value) {
    const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000)
    questionTimes.value[currentIndex.value] = timeSpent
    currentQuestionTime.value = timeSpent
  }

  questionStartTime.value = null
}

function resetQuestionTimer() {
  stopQuestionTimer()
  currentQuestionTime.value = 0
}

// 格式化时间显示
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 恢复练习状态
function restorePracticeState(data) {
  console.log('restorePracticeState:', data)
  if (!data || !data.practiceRecord || !data.details) {
    console.log('没有练习记录数据，开始新的练习')
    return false
  }

  const record = data.practiceRecord
  const details = data.details
  const savedIndex = data.currentQuestionIndex
  console.log('savedIndex:', savedIndex)
  // 保存练习记录信息
  practiceRecord.value = record
  practiceRecordId.value = record.id

  // 恢复当前题目索引
  if (savedIndex !== null && savedIndex !== undefined) {
    const targetIndex = savedIndex >= 0 ? savedIndex : 0
    if (targetIndex < questions.value.length) {
      currentIndex.value = targetIndex
    }
  }

  // 恢复已答题的答案和提交状态
  details.forEach((detail, index) => {
    // 需要通过 questionId 找到对应的题目索引
    const questionIndex = questions.value.findIndex(q => q.questionId === detail.questionId)
    if (questionIndex >= 0) {
      // 恢复答案
      if (detail.userAnswer) {
        answers.value[questionIndex] = detail.userAnswer
      }

      // 恢复答题时间
      if (detail.timeSpentSeconds !== null && detail.timeSpentSeconds !== undefined) {
        questionTimes.value[questionIndex] = detail.timeSpentSeconds
      }

      // 如果已回答，标记为已提交
      if (detail.userAnswer) {
        submittedQuestions.value.add(questionIndex)
      }
    }
  })

  console.log('练习状态已恢复:', {
    practiceRecordId: practiceRecordId.value,
    currentIndex: savedIndex,
    restoredAnswers: Object.keys(answers.value).length,
    restoredTimes: Object.keys(questionTimes.value).length
  })

  return true
}

// 加载练习记录
async function loadPracticeRecordData() {
  try {
    const bankId = questionBankId.value

    if (!studentId || !bankId) {
      console.log('缺少必要参数，跳过加载练习记录')
      return false
    }

    // 转换练习类型：'all' 或 null -> null，其他值保持不变
    const practiceType = (type.value === 'all' || type.value === null) ? null : type.value

    console.log('加载练习记录，参数:', { studentId, bankId, practiceType })

    const response = await loadPracticeRecord(studentId, bankId, practiceType)

    if (response.code === 200 && response.data) {
      return restorePracticeState(response.data)
    } else {
      console.log('未找到练习记录')
      return false
    }
  } catch (error) {
    console.error('加载练习记录失败:', error)
    return false
  }
}

// 加载题目列表
async function loadQuestions() {
  if (!questionBankId.value) {
    console.warn('题库ID为空，使用默认题目')
    return
  }

  try {
    loading.value = true
    const response = await loadPracticeRecord(studentId, questionBankId.value, type.value)
    console.log('练习记录响应:', response)

    if (response.code === 200 && response.data && Array.isArray(response.data.details)) {
      questions.value = response.data.details

    } else {
      console.warn('未获取到练习记录')
    }
  } catch (error) {
    console.error('加载练习记录失败:', error)
    uni.showToast({
      title: '加载练习记录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}


const currentQuestion = computed(() => {
  const question = questions.value[currentIndex.value] || {}
  console.log('currentQuestion 计算属性被调用')
  console.log('questions.value:', questions.value)
  console.log('currentIndex.value:', currentIndex.value)
  console.log('当前题目:', question)
  console.log('题目类型:', question.type)
  console.log('题目选项:', question.options)
  return question
})
const hasAnswered = computed(() => {
  const a = answers.value[currentIndex.value]
  if (a === undefined || a === null || a === '') return false

  // 如果是字符串，检查是否非空
  if (typeof a === 'string') {
    return a.trim() !== ''
  }

  // 如果是数组，检查长度
  return Array.isArray(a) ? a.length > 0 : true
})
const isFav = computed(() => favSet.value.has(currentIndex.value))

// 判断当前题目是否已提交
const isCurrentQuestionSubmitted = computed(() => {
  return submittedQuestions.value.has(currentIndex.value)
})

// 答题统计
const answerStats = computed(() => {
  const total = questions.value.length
  const answered = Object.keys(answers.value).length
  const correct = questions.value.reduce((count, q, index) => {
    const userAnswer = answers.value[index]
    if (userAnswer === undefined || userAnswer === null || userAnswer === '') return count

    const correctAnswer = q.answer
    if (Array.isArray(correctAnswer)) {
      // 多选题（数组格式）
      if (typeof userAnswer === 'string') {
        const userAnswers = userAnswer.split(',').sort()
        const correctAnswers = [...correctAnswer].sort()
        return userAnswers.join(',') === correctAnswers.join(',') ? count + 1 : count
      }
      return count
    } else if (typeof correctAnswer === 'string') {
      // 单选题和判断题：直接比较
      if (q.type !== 'multiple_choice') {
        return userAnswer === correctAnswer ? count + 1 : count
      }

      // 多选题（字符串格式）：比较排序后的答案
      if (typeof userAnswer === 'string') {
        const userAnswers = userAnswer.split(',').sort()
        const correctAnswers = correctAnswer.split(',').sort()
        return userAnswers.join(',') === correctAnswers.join(',') ? count + 1 : count
      }
      return count
    }

    return count
  }, 0)

  return {
    total,
    answered,
    correct,
    wrong: answered - correct,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0
  }
})

function getTypeText(t) {
  return ({ single_choice: '单选题', multiple_choice: '多选题', true_false: '判断题' }[t]) || '题目'
}
const typeName = computed(() => ({
  null: '全部题目',
  true_false: '判断题',
  single_choice: '单选题',
  multiple_choice: '多选题'
}[type.value]))

// 将选项对象转换为数组格式
function getOptionsArray(options) {
  console.log('getOptionsArray 被调用，输入参数:', options)
  console.log('参数类型:', typeof options)

  // 如果 options 是字符串，尝试解析为 JSON
  if (typeof options === 'string') {
    try {
      const parsedOptions = JSON.parse(options)
      console.log('解析后的选项:', parsedOptions)
      if (parsedOptions && typeof parsedOptions === 'object') {
        const result = Object.entries(parsedOptions).map(([key, value]) => ({
          label: key,
          value: key,
          text: value
        }))
        console.log('getOptionsArray 转换结果:', result)
        return result
      }
    } catch (error) {
      console.error('解析选项字符串失败:', error)
    }
  }

  // 如果 options 是对象
  if (options && typeof options === 'object') {
    const result = Object.entries(options).map(([key, value]) => ({
      label: key,
      value: key,
      text: value
    }))
    console.log('getOptionsArray 转换结果:', result)
    return result
  }

  console.warn('选项数据无效，返回空数组')
  return []
}

function isSelected(v) {
  const a = answers.value[currentIndex.value]
  if (!a) return false

  // 如果是字符串，检查是否包含该选项
  if (typeof a === 'string') {
    return a === v || a.split(',').includes(v)
  }

  // 如果是数组，使用原来的逻辑
  return Array.isArray(a) ? a.includes(v) : a === v
}

function selectOption(value) {
  // 当前题目已提交则不允许修改
  if (isCurrentQuestionSubmitted.value) return
  const q = currentQuestion.value

  if (q.type === 'multiple_choice') {
    // 多选题：支持多选，存储为逗号分隔的字符串
    const currentAnswer = answers.value[currentIndex.value] || ''
    const answerArray = currentAnswer ? currentAnswer.split(',') : []
    const i = answerArray.indexOf(value)
    if (i >= 0) {
      answerArray.splice(i, 1)
    } else {
      answerArray.push(value)
    }
    answers.value[currentIndex.value] = answerArray.join(',')
  } else {
    // 单选题和判断题：单选，存储为单个字符
    answers.value[currentIndex.value] = value
  }
}

function formatCorrect(c) {
  return Array.isArray(c) ? c.join('、') : c
}

// 当前题是否答对
function isCurrentCorrect() {
  if (!hasAnswered.value) return false
  const q = currentQuestion.value
  const a = answers.value[currentIndex.value]
  const c = q.correctAnswer

  // 如果正确答案是数组（多选题）
  if (Array.isArray(c)) {
    if (typeof a === 'string') {
      const userAnswers = a.split(',').sort()
      const correctAnswers = [...c].sort()
      return userAnswers.join(',') === correctAnswers.join(',')
    }
    return false
  }

  // 如果正确答案是字符串
  if (typeof c === 'string') {
    // 单选题和判断题：直接比较
    if (q.type !== 'multiple_choice') {
      return a === c
    }

    // 多选题：比较排序后的答案
    if (typeof a === 'string') {
      const userAnswers = a.split(',').sort()
      const correctAnswers = c.split(',').sort()
      return userAnswers.join(',') === correctAnswers.join(',')
    }
    return false
  }

  return false
}

// 选项样式（非判断题）
function optionClass(val) {
  const classes = {}

  // 只有在当前题目已提交时才显示正确答案和错误答案的样式
  if (isCurrentQuestionSubmitted.value) {
    const q = currentQuestion.value
    const correct = q.correctAnswer

    // 检查是否为正确答案
    let isRightAnswer = false
    if (Array.isArray(correct)) {
      isRightAnswer = correct.includes(val)
    } else if (typeof correct === 'string') {
      if (q.type === 'multiple_choice') {
        isRightAnswer = correct.split(',').includes(val)
      } else {
        isRightAnswer = correct === val
      }
    }

    if (isRightAnswer) classes['is-right-answer'] = true

    // 检查是否为用户选择
    const isUserChoice = isSelected(val)
    if (isUserChoice) {
      // 判断用户答案是否正确
      const isCorrect = isCurrentCorrect()
      classes[isCorrect ? 'is-correct' : 'is-wrong'] = true
    }
  } else {
    // 未提交时只显示选中状态
    classes.selected = isSelected(val)
  }

  return classes
}

// 判断题样式
function judgeClass(val) {
  const classes = {}

  // 只有在当前题目已提交时才显示正确答案和错误答案的样式
  if (isCurrentQuestionSubmitted.value) {
    const correct = currentQuestion.value.correctAnswer
    if (correct === val) classes['is-right-answer'] = true
    if (answers.value[currentIndex.value] === val) classes[correct === val ? 'is-correct' : 'is-wrong'] = true
  } else {
    // 未提交时只显示选中状态
    classes.selected = answers.value[currentIndex.value] === val
  }

  return classes
}

function prev() {
  if (currentIndex.value > 0) {
    // 停止当前题目的计时
    stopQuestionTimer()
    currentIndex.value--
    // 如果新题目未提交，开始计时
    if (!submittedQuestions.value.has(currentIndex.value)) {
      startQuestionTimer()
    }
  }
}
function next() {
  if (currentIndex.value < questions.value.length - 1) {
    // 停止当前题目的计时
    stopQuestionTimer()
    currentIndex.value++
    // 如果新题目未提交，开始计时
    if (!submittedQuestions.value.has(currentIndex.value)) {
      startQuestionTimer()
    }
  }
}
function openList() { listPopup.value.open() }
function closeList() { listPopup.value.close() }
function jump(i) {
  // 停止当前题目的计时
  stopQuestionTimer()
  currentIndex.value = i
  // 如果新题目未提交，开始计时
  if (!submittedQuestions.value.has(currentIndex.value)) {
    startQuestionTimer()
  }
  closeList()
}
function isAnswered(i) {
  const a = answers.value[i]
  if (a === undefined || a === null || a === '') return false

  // 如果是字符串，检查是否非空
  if (typeof a === 'string') {
    return a.trim() !== ''
  }

  // 如果是数组，检查长度
  return Array.isArray(a) ? a.length > 0 : true
}
function isCorrectAt(i) {
  const q = questions.value[i]
  const a = answers.value[i]
  const c = q?.answer
  if (a === undefined || a === null || a === '') return false

  // 如果正确答案是数组（多选题）
  if (Array.isArray(c)) {
    if (typeof a === 'string') {
      const userAnswers = a.split(',').sort()
      const correctAnswers = [...c].sort()
      return userAnswers.join(',') === correctAnswers.join(',')
    }
    return false
  }

  // 如果正确答案是字符串
  if (typeof c === 'string') {
    // 单选题和判断题：直接比较
    if (q.type !== 'multiple_choice') {
      return a === c
    }

    // 多选题：比较排序后的答案
    if (typeof a === 'string') {
      const userAnswers = a.split(',').sort()
      const correctAnswers = c.split(',').sort()
      return userAnswers.join(',') === correctAnswers.join(',')
    }
    return false
  }

  return false
}
function gridItemClass(i) {
  const cls = []
  if (i === currentIndex.value) cls.push('current')
  if (isAnswered(i)) cls.push(isCorrectAt(i) ? 'answered-correct' : 'answered-wrong')
  if (favSet.value.has(i)) cls.push('collected')
  return cls.join(' ')
}
function toggleFav() {
  const idx = currentIndex.value
  if (favSet.value.has(idx)) favSet.value.delete(idx)
  else favSet.value.add(idx)

}
function goBack() { uni.navigateBack() }

// 提交当前题目答案
async function submitCurrentQuestion() {
  if (!hasAnswered.value) {
    uni.showToast({
      title: '请先选择答案',
      icon: 'none'
    })
    return
  }

  // 停止当前题目的计时
  stopQuestionTimer()

  // 获取答题时间（秒）
  const timeSpentSeconds = questionTimes.value[currentIndex.value] || 0

  // 将当前题目标记为已提交
  submittedQuestions.value.add(currentIndex.value)

  // 获取题目ID和用户答案
  const questionId = currentQuestion.value.questionId
  const userAnswer = answers.value[currentIndex.value]
  console.log('currentQuestion:', currentQuestion.value)
  // 检查是否答错，如果答错则调用记录接口
  const isCorrect = isCurrentCorrect()
  const isWrong = !isCorrect

  // 计算得分：如果答对则为题目分数，否则为0
  const questionScore = currentQuestion.value.score || 0
  const scoreObtained = isCorrect ? questionScore : 0

  try {
    if (questionId) {
      await recordWrongQuestion(questionId, isWrong)
      console.log('易错题目记录成功:', questionId, 'isWrong:', isWrong)
    }
  } catch (error) {
    console.error('记录易错题目失败:', error)
    // 不显示错误提示，避免影响用户体验
  }

  // 如果有练习记录ID，更新练习记录
  if (practiceRecordId.value && questionId && userAnswer) {
    try {
      await updatePracticeRecordWhileSubmitAnswer(
        practiceRecordId.value,
        questionId,
        userAnswer,
        timeSpentSeconds,
        isCorrect,
        scoreObtained
      )
      console.log('练习记录更新成功:', {
        practiceRecordsId: practiceRecordId.value,
        questionId,
        userAnswer,
        timeSpentSeconds,
        isCorrect,
        scoreObtained
      })
    } catch (error) {
      console.error('更新练习记录失败:', error)
      // 不显示错误提示，避免影响用户体验
    }
  } else {
    console.warn('无法更新练习记录，缺少必要参数:', {
      practiceRecordId: practiceRecordId.value,
      questionId,
      userAnswer
    })
  }

  // 显示提交成功提示
  uni.showToast({
    title: '答案已提交',
    icon: 'success'
  })
}

// 提交答案
function submitAnswers() {
  uni.showModal({
    title: '确认提交',
    content: `您已完成 ${answerStats.value.answered}/${answerStats.value.total} 题，确定要提交答案吗？`,
    success: (res) => {
      if (res.confirm) {
        isSubmitted.value = true
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        })
      }
    }
  })
}

// 重新练习
function restartPractice() {
  uni.showModal({
    title: '重新练习',
    content: '确定要重新开始练习吗？当前进度将被清空。',
    success: (res) => {
      if (res.confirm) {
        // 重置所有状态
        currentIndex.value = 0
        answers.value = {}
        favSet.value = new Set()
        isSubmitted.value = false

        uni.showToast({
          title: '重新开始',
          icon: 'success'
        })
      }
    }
  })
}

onLoad(async (opts) => {
  type.value = opts?.type || 'all'
  questionBankId.value = opts?.questionBankId || null

  // 加载题目列表
  await loadQuestions()

  // 加载练习记录并恢复状态
  const hasRecord = await loadPracticeRecordData()

  // 开始当前题目的计时（如果已恢复状态，会在恢复的题目上计时；否则从第一题开始）
  if (questions.value.length > 0) {
    // 如果已恢复状态且当前题目已提交，不启动计时器
    if (!hasRecord || !submittedQuestions.value.has(currentIndex.value)) {
      startQuestionTimer()
    }
  }
})


onShow(() => {

})


onUnload(() => {
  // 清理计时器（如果正在计时，也会保存当前题目的时间）
  stopQuestionTimer()

  // 如果有练习记录ID，保存当前状态
  if (practiceRecordId.value) {
    // 异步调用更新接口，但不等待完成（因为页面正在卸载）
    updatePracticeRecordWhileLeavePage(practiceRecordId.value).then(() => {
      console.log('离开页面时练习记录保存成功:', practiceRecordId.value)
    }).catch((error) => {
      console.error('离开页面时保存练习记录失败:', error)
    })
  }
})
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.practice-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  /* 预留底部工具栏高度，避免内容被遮挡 */
  padding-bottom: 160rpx;

  .practice-header {
    background-color: #ffffff;
    padding: 20rpx 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    border-bottom: 1rpx solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 100;

    .practice-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .header-right {
      width: 80rpx;
    }
  }

  .loading-wrap {
    background-color: #ffffff;
    margin: 20rpx 30rpx;
    border-radius: 16rpx;
    border: 1rpx solid #e9ecef;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .05);
    padding: 60rpx 30rpx;

    .loading-content {
      text-align: center;

      .loading-text {
        font-size: 28rpx;
        color: #666;
      }
    }
  }

  .question-wrap {
    background-color: #ffffff;
    margin: 20rpx 30rpx;
    border-radius: 16rpx;
    border: 1rpx solid #e9ecef;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .05);
    padding: 30rpx;

    .question-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
    }

    .q-index {
      font-size: 24rpx;
      color: #666;
      font-weight: 600;
    }

    .q-type-tag {
      font-size: 24rpx;
      color: #007aff;
      background-color: #f0f8ff;
      border: 1rpx solid #e0f0ff;
      padding: 6rpx 14rpx;
      border-radius: 20rpx;
    }

    .fav-flag {
      margin-left: 12rpx;
      font-size: 24rpx;
      color: #ffb400;
      font-weight: 700;
    }

    .question-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
      padding: 12rpx 20rpx;
      background-color: #f8f9fa;
      border: 1rpx solid #e9ecef;
      border-radius: 12rpx;
    }

    .timer-label {
      font-size: 24rpx;
      color: #666;
      margin-right: 8rpx;
    }

    .timer-value {
      font-size: 28rpx;
      color: #007aff;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    .question-text {
      margin-bottom: 24rpx;
    }

    .q-text {
      font-size: 28rpx;
      color: #333;
      line-height: 1.7;
    }

    .options {
      .option-item {
        display: flex;
        align-items: center;
        padding: 24rpx;
        border: 2rpx solid #e9ecef;
        border-radius: 12rpx;
        margin-bottom: 16rpx;

        &.selected {
          border-color: #007aff;
          background-color: #f0f8ff;

          .opt-label {
            background-color: #007aff;
            color: #fff;
          }
        }

        &.is-right-answer {
          border-color: #28a745;
        }

        &.is-correct {
          border-color: #28a745;
          background-color: #e6ffe6;

          .opt-label {
            background-color: #28a745;
            color: #fff;
          }
        }

        &.is-wrong {
          border-color: #ff4d4f;
          background-color: #fff1f0;

          .opt-label {
            background-color: #ff4d4f;
            color: #fff;
          }
        }

        .opt-label {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22rpx;
          font-weight: 700;
          color: #666;
          margin-right: 20rpx;
        }

        .opt-text {
          font-size: 26rpx;
          color: #333;
          flex: 1;
        }
      }
    }

    .judge-options {
      display: flex;
      gap: 20rpx;

      .judge-item {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 24rpx;
        border: 2rpx solid #e9ecef;
        border-radius: 12rpx;

        &.selected {
          border-color: #007aff;
          background-color: #f0f8ff;

          .judge-label {
            background-color: #007aff;
            color: #fff;
          }
        }

        &.is-right-answer {
          border-color: #28a745;
        }

        &.is-correct {
          border-color: #28a745;
          background-color: #e6ffe6;

          .judge-label {
            background-color: #28a745;
            color: #fff;
          }
        }

        &.is-wrong {
          border-color: #ff4d4f;
          background-color: #fff1f0;

          .judge-label {
            background-color: #ff4d4f;
            color: #fff;
          }
        }

        .judge-label {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22rpx;
          font-weight: 700;
          color: #666;
          margin-right: 20rpx;
        }

        .judge-text {
          font-size: 26rpx;
          color: #333;
        }
      }
    }

    .question-submit {
      margin-top: 24rpx;
      text-align: center;

      .submit-btn {
        background-color: #007aff;
        border: none;
        border-radius: 12rpx;
        padding: 24rpx 0;
        width: 100%;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        &.btn-hover {
          background-color: #0056cc;
          transform: scale(0.98);
        }
      }

      .submit-text {
        font-size: 28rpx;
        color: #fff;
        font-weight: 700;
      }
    }

    .answer-explain {
      margin-top: 16rpx;
      padding: 24rpx;
      background-color: #f8f9fa;
      border: 1rpx solid #e9ecef;
      border-radius: 12rpx;

      .answer-row {
        display: flex;
        gap: 12rpx;
        margin-bottom: 10rpx;
      }

      .answer-label {
        font-size: 24rpx;
        color: #333;
        font-weight: 700;
      }

      .answer-value {
        font-size: 24rpx;
        color: #007aff;
        font-weight: 700;
      }

      .time-row {
        display: flex;
        gap: 12rpx;
        margin-bottom: 10rpx;
      }

      .time-label {
        font-size: 24rpx;
        color: #333;
        font-weight: 700;
      }

      .time-value {
        font-size: 24rpx;
        color: #28a745;
        font-weight: 700;
        font-family: 'Courier New', monospace;
      }

      .explain-label {
        display: block;
        font-size: 24rpx;
        color: #333;
        font-weight: 700;
        margin: 8rpx 0;
      }

      .explain-text {
        display: block;
        font-size: 24rpx;
        color: #555;
        line-height: 1.7;
      }
    }
  }

  .practice-footer {
    background-color: #fff;
    padding: 16rpx 20rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
    border-top: 1rpx solid #e9ecef;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12rpx;
      margin-bottom: 16rpx;
    }

    .pf-btn {
      background-color: #007aff;
      border: none;
      border-radius: 12rpx;
      padding: 20rpx 0;
      width: 100%;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.disabled {
        background-color: #e9ecef;

        .pf-text {
          color: #999;
        }
      }

      &.btn-hover:not(.disabled) {
        background-color: #0056cc;
        transform: scale(0.98);
      }
    }

    .pf-text {
      font-size: 24rpx;
      color: #fff;
      font-weight: 700;
      text-align: center;
    }

    // 提交按钮样式
    .submit-section {
      .submit-btn {
        background-color: #28a745;
        border: none;
        border-radius: 12rpx;
        padding: 24rpx 0;
        width: 100%;
        height: 88rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        &.btn-hover {
          background-color: #218838;
          transform: scale(0.98);
        }
      }

      .submit-text {
        font-size: 28rpx;
        color: #fff;
        font-weight: 700;
      }
    }

    // 结果统计样式
    .result-section {
      .result-stats {
        background-color: #f8f9fa;
        border-radius: 12rpx;
        padding: 20rpx;
        margin-bottom: 16rpx;
        text-align: center;

        .stats-text {
          display: block;
          font-size: 32rpx;
          color: #28a745;
          font-weight: 700;
          margin-bottom: 8rpx;
        }

        .stats-detail {
          display: block;
          font-size: 26rpx;
          color: #333;
          margin-bottom: 4rpx;
        }

        .stats-accuracy {
          display: block;
          font-size: 24rpx;
          color: #666;
        }
      }

      .restart-btn {
        background-color: #6c757d;
        border: none;
        border-radius: 12rpx;
        padding: 20rpx 0;
        width: 100%;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        &.btn-hover {
          background-color: #5a6268;
          transform: scale(0.98);
        }
      }

      .restart-text {
        font-size: 26rpx;
        color: #fff;
        font-weight: 700;
      }
    }
  }

  /* 目录状态色 */
  .list-popup {
    .grid {
      .grid-item {
        &.answered-correct {
          background-color: #e6ffe6;
          border-color: #28a745;

          .num {
            color: #28a745;
            font-weight: 700;
          }
        }

        &.answered-wrong {
          background-color: #fff1f0;
          border-color: #ff4d4f;

          .num {
            color: #ff4d4f;
            font-weight: 700;
          }
        }

        &.collected {
          box-shadow: 0 0 0 3rpx #ffb400 inset;
        }
      }
    }
  }
}
</style>
