<template>
  <view class="mock-exam-container">
    <!-- 考试信息卡片 -->
    <view class="exam-info-section">
      <view class="exam-info-card">
        <!-- 座位号 -->
        <view class="seat-number">
          <text class="seat-label">座位号</text>
          <text class="seat-value">{{ examInfo.seatNumber }}</text>
        </view>
        
        <!-- 考生信息 -->
        <view class="student-info">
          <view class="info-item">
            <text class="info-label">姓名</text>
            <text class="info-value">{{ examInfo.studentName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">身份证</text>
            <text class="info-value">{{ examInfo.idCard }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">考试科目</text>
            <text class="info-value">{{ examInfo.examSubject }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 开始考试按钮 -->
    <view class="button-section">
      <button class="start-exam-btn" type="primary" @tap="showExamDetails" hover-class="btn-hover">
        <text class="btn-text">开始考试</text>
      </button>
    </view>
		
    <!-- 试卷详情弹窗 -->
    <view class="exam-detail-popup" v-if="showPopup" @click="closeExamDetails">
      <view class="popup-mask"></view>
      <view class="popup-content" @click.stop>
        <!-- 试卷详情头部 -->
        <view class="detail-header">
          <text class="detail-title">试卷详情</text>
          <view class="close-btn" @tap="closeExamDetails">
            <text class="close-icon">×</text>
          </view>
        </view>
        
        <!-- 试卷信息 -->
        <view class="exam-info-grid">
          <view class="info-card">
            <text class="info-label">总题数</text>
            <text class="info-value">{{ examDetail.totalQuestions }}题</text>
          </view>
          <view class="info-card">
            <text class="info-label">判断题</text>
            <text class="info-value">{{ examDetail.judgeQuestions }}题</text>
          </view>
          <view class="info-card">
            <text class="info-label">单选题</text>
            <text class="info-value">{{ examDetail.singleQuestions }}题</text>
          </view>
          <view class="info-card">
            <text class="info-label">多选题</text>
            <text class="info-value">{{ examDetail.multipleQuestions }}题</text>
          </view>
          <view class="info-card">
            <text class="info-label">总分数</text>
            <text class="info-value">{{ examDetail.totalScore }}分</text>
          </view>
          <view class="info-card">
            <text class="info-label">及格分</text>
            <text class="info-value">{{ examDetail.passScore }}分</text>
          </view>
          <view class="info-card">
            <text class="info-label">考试时长</text>
            <text class="info-value">{{ examDetail.duration }}分钟</text>
          </view>
        </view>
        
        <!-- 考试须知 -->
        <view class="exam-notice">
          <text class="notice-title">考试须知</text>
          <view class="notice-content">
            <text class="notice-item">1. 考试时间为{{ examDetail.duration }}分钟，请在规定时间内完成答题</text>
            <text class="notice-item">2. 考试过程中请勿关闭页面或刷新浏览器</text>
            <text class="notice-item">3. 单选题和多选题请仔细阅读题目，选择正确答案</text>
            <text class="notice-item">4. 判断题请根据题目内容判断对错</text>
            <text class="notice-item">5. 考试结束后系统将自动提交试卷</text>
            <text class="notice-item">6. 考试过程中如有技术问题，请联系监考老师</text>
          </view>
        </view>
        
        <!-- 倒计时按钮 -->
        <view class="countdown-section">
          <button 
            class="countdown-btn" 
            type="primary"
            :class="{ 'disabled': countdown > 0, 'enabled': countdown === 0 }"
            @tap="startRealExam"
            hover-class="btn-hover">
            <text class="btn-text">
              {{ countdown > 0 ? `请仔细阅读 (${countdown}s)` : '开始答题' }}
            </text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'


const currentSubjectId = ref(null)
const currentSubjectName = ref(null)

// 考试信息数据
const examInfo = ref({
  seatNumber: generateSeatNumber(),
  studentName: uni.getStorageSync('token').data.name,
  idCard: uni.getStorageSync('token').data.idNumber,
  examSubject: currentSubjectName
})

// 试卷详情数据
const examDetail = ref({
  totalQuestions: 100,
  judgeQuestions: 20,
  singleQuestions: 60,
  multipleQuestions: 20,
  totalScore: 100,
  passScore: 60,
  duration: 120
})

// 倒计时相关
const countdown = ref(5)
const countdownTimer = ref(null)
const showPopup = ref(false)


// 生成一个0~99之间的随机整数，然后填充成3位字符串（前面补0）
function generateSeatNumber() {
  const num = Math.floor(Math.random() * 100); // 0~99
  return num.toString().padStart(3, '0');      // 补齐为3位宽，不足前面补0
}

// 显示试卷详情
function showExamDetails() {
  console.log('showExamDetails 被调用')
  uni.showToast({
    title: '按钮被点击了',
    icon: 'success'
  })
  showPopup.value = true
  startCountdown()
}

// 关闭试卷详情
function closeExamDetails() {
  showPopup.value = false
  stopCountdown()
}

// 开始倒计时
function startCountdown() {
  countdown.value = 5
  countdownTimer.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
    }
  }, 1000)
}

// 停止倒计时
function stopCountdown() {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  countdown.value = 0
}

// 开始真实考试
function startRealExam() {
  if (countdown.value > 0) {
    return // 倒计时未结束，不允许点击
  }
		
  uni.showModal({
    title: '确认开始考试',
    content: '考试开始后将计时，确定要开始考试吗？',
    success: function (res) {
      if (res.confirm) {
        closeExamDetails()
        uni.showToast({
          title: '考试开始！',
          icon: 'success'
        })
        // 跳转到答题页面
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/examAnswer?subjectId=${currentSubjectId.value}&seatNumber=${examInfo.value.seatNumber}` 
          })
        }, 1000)
      }
    }
  })
}

// 页面生命周期
onLoad(async (opts) => {
  currentSubjectId.value = opts?.subjectId || null
  currentSubjectName.value = opts?.subjectName || null
})


onUnload(() => {
  // 页面卸载时清理定时器
  stopCountdown()
})
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.mock-exam-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
  box-sizing: border-box;

  .exam-info-section {
    width: 100%;
    margin-bottom: 60rpx;

    .exam-info-card {
      background-color: #ffffff;
      border-radius: 20rpx;
      padding: 40rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

      .seat-number {
        text-align: center;
        margin-bottom: 40rpx;
        padding-bottom: 40rpx;
        border-bottom: 2rpx solid #e9ecef;

        .seat-label {
          display: block;
          font-size: 28rpx;
          color: #666;
          margin-bottom: 20rpx;
          font-weight: 500;
        }

        .seat-value {
          display: block;
          font-size: 80rpx;
          font-weight: 800;
          color: #007aff;
        }
      }

      .student-info {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30rpx 0;
          border-bottom: 1rpx solid #e9ecef;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            font-size: 28rpx;
            color: #666;
            flex-shrink: 0;
            width: 120rpx;
            font-weight: 500;
          }

          .info-value {
            font-size: 28rpx;
            color: #333;
            font-weight: 600;
            text-align: right;
            flex: 1;
            margin-left: 30rpx;
          }
        }
      }
    }
  }

  .button-section {
    width: 100%;
    padding: 0 20rpx;

    .start-exam-btn {
      width: 100%;
      height: 88rpx;
      background-color: #007aff !important;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
      border: none !important;
      position: relative;
      overflow: hidden;
      margin: 0;
      padding: 0;

      &.btn-hover {
        background-color: #0056cc !important;
        transform: scale(0.98);
      }

      .btn-text {
        font-size: 32rpx;
        color: #ffffff !important;
        font-weight: 700;
        letter-spacing: 2rpx;
      }
    }
  }
		
  /* 试卷详情弹窗样式 */
  .exam-detail-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;

    .popup-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .popup-content {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #ffffff;
      border-radius: 40rpx 40rpx 0 0;
      max-height: 80vh;
      overflow-y: auto;

      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40rpx;
        border-bottom: 2rpx solid #e9ecef;
        background-color: #007aff;
        border-radius: 40rpx 40rpx 0 0;

        .detail-title {
          font-size: 36rpx;
          font-weight: 700;
          color: #ffffff;
        }

        .close-btn {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;

          .close-icon {
            font-size: 36rpx;
            color: #ffffff;
            font-weight: bold;
          }
        }
      }

      .exam-info-grid {
        padding: 40rpx;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20rpx;

        .info-card {
          background-color: #f8f9fa;
          border-radius: 20rpx;
          padding: 30rpx;
          text-align: center;
          border: 2rpx solid #e9ecef;

          .info-label {
            display: block;
            font-size: 24rpx;
            color: #666;
            margin-bottom: 20rpx;
            font-weight: 500;
          }

          .info-value {
            display: block;
            font-size: 32rpx;
            font-weight: 700;
            color: #007aff;
          }
        }
      }

      .exam-notice {
        padding: 0 40rpx 40rpx 40rpx;

        .notice-title {
          display: block;
          font-size: 32rpx;
          font-weight: 700;
          color: #007aff;
          margin-bottom: 30rpx;
          text-align: center;
        }

        .notice-content {
          .notice-item {
            display: block;
            font-size: 26rpx;
            color: #333;
            line-height: 1.8;
            margin-bottom: 20rpx;
            padding: 20rpx 30rpx;
            background-color: #f8f9fa;
            border-radius: 12rpx;
            border-left: 6rpx solid #007aff;
          }
        }
      }

      .countdown-section {
        padding: 0 40rpx 60rpx 40rpx;

        .countdown-btn {
          width: 100%;
          height: 88rpx;
          border-radius: 44rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none !important;
          margin: 0;
          padding: 0;

          &.disabled {
            background-color: #e9ecef !important;

            .btn-text {
              color: #666 !important;
            }
          }

          &.enabled {
            background-color: #007aff !important;

            &.btn-hover {
              background-color: #0056cc !important;
              transform: scale(0.98);
            }

            .btn-text {
              color: #ffffff !important;
            }
          }

          .btn-text {
            font-size: 32rpx;
            font-weight: 700;
            letter-spacing: 2rpx;
          }
        }
      }
    }
  }
}
</style>
