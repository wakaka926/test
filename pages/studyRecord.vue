<template>
  <view class="study-record-container">
    <!-- 科目名称头部 -->
    <view class="subject-header">
      <text class="subject-title">{{ subjectInfo.name }}</text>
    </view>

    <!-- 统计信息卡片 -->
    <view class="stats-section">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ stats.highestScore }}</text>
          <text class="stat-label">最高分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.averageScore }}</text>
          <text class="stat-label">平均分</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.monthlyRank }}</text>
          <text class="stat-label">月度排名</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.practiceCount }}</text>
          <text class="stat-label">模拟次数</text>
        </view>
      </view>
    </view>

    <!-- 模拟考试列表 -->
    <view class="exam-list-section">
      <view class="list-header">
        <text class="list-title">模拟考试记录</text>
        <view class="filter-buttons">
          <button 
            class="filter-btn" 
            :class="{ 'active': currentFilter === 'all' }"
            @click="setFilter('all')"
            hover-class="btn-hover">
            <text class="btn-text">全部</text>
          </button>
          <button 
            class="filter-btn" 
            :class="{ 'active': currentFilter === 'wrong' }"
            @click="setFilter('wrong')"
            hover-class="btn-hover">
            <text class="btn-text">错题</text>
          </button>
        </view>
      </view>

      <view class="exam-list">
        <!-- 加载状态 -->
        <view v-if="loading && exams.length === 0" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 考试记录列表 -->
        <view v-else-if="filteredExams.length > 0">
          <view class="exam-item" v-for="(exam, index) in filteredExams" :key="index" @click="viewExamDetail(exam)">
            <view class="exam-info">
              <view class="exam-header">
                <text class="exam-name">{{ exam.name }}</text>
                <text class="exam-score" :class="getScoreClass(exam.score)">{{ exam.score }}分</text>
              </view>
              <view class="exam-meta">
                <text class="exam-date">{{ formatDate(exam.date) }}</text>
              </view>
            </view>
            <view class="exam-actions">
              <view class="action-icon">›</view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-else class="empty-container">
          <text class="empty-text">暂无考试记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudyStats, getExamRecords, getSubjectList } from '@/api/study/record'

// 页面状态
const loading = ref(false)
const subjectInfo = ref({
  id: null,
  name: '低压电工作业'
})

// 统计数据
const stats = ref({
  highestScore: 0,
  averageScore: 0,
  monthlyRank: 0,
  practiceCount: 0
})

// 当前筛选条件
const currentFilter = ref('all')

// 考试记录数据
const exams = ref([])
const totalCount = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 筛选后的考试列表
const filteredExams = computed(() => {
  if (currentFilter.value === 'all') {
    return exams.value
  } else {
    return exams.value.filter(exam => exam.type === currentFilter.value)
  }
})

// 加载统计数据
async function loadStudyStats() {
  try {
    loading.value = true
    const response = await getStudyStats(subjectInfo.value.id)
    if (response.code === 200) {
      stats.value = {
        highestScore: response.data.highestScore || 0,
        averageScore: response.data.averageScore || 0,
        monthlyRank: response.data.monthlyRank || 0,
        practiceCount: response.data.practiceCount || 0
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    uni.showToast({
      title: '加载统计数据失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 加载考试记录
async function loadExamRecords() {
  try {
    loading.value = true
    const params = {
      subjectId: subjectInfo.value.id,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      type: currentFilter.value === 'all' ? null : currentFilter.value
    }
    
    const response = await getExamRecords(params)
    if (response.code === 200) {
      exams.value = response.data.records || []
      totalCount.value = response.data.total || 0
    }
  } catch (error) {
    console.error('加载考试记录失败:', error)
    uni.showToast({
      title: '加载考试记录失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 加载科目信息
async function loadSubjectInfo() {
  try {
    const response = await getSubjectList()
    if (response.code === 200 && response.data.length > 0) {
      // 默认选择第一个科目，实际项目中可能从路由参数获取
      subjectInfo.value = response.data[0]
    }
  } catch (error) {
    console.error('加载科目信息失败:', error)
  }
}

// 设置筛选条件
function setFilter(filter) {
  currentFilter.value = filter
  pageNum.value = 1
  loadExamRecords()
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 获取分数样式类
function getScoreClass(score) {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'pass'
  return 'fail'
}

// 查看考试详情
function viewExamDetail(exam) {
  uni.navigateTo({
    url: `/pages/examDetail?id=${exam.id}`
  })
}

// 下拉刷新
function onRefresh() {
  pageNum.value = 1
  loadStudyStats()
  loadExamRecords()
}

// 上拉加载更多
function onLoadMore() {
  if (exams.value.length < totalCount.value) {
    pageNum.value++
    loadExamRecords()
  }
}

// 页面加载
onLoad((options) => {
  // 从路由参数获取科目ID
  if (options.subjectId) {
    subjectInfo.value.id = options.subjectId
  }
  if (options.subjectName) {
    subjectInfo.value.name = decodeURIComponent(options.subjectName)
  }
  
  // 初始化数据
  loadSubjectInfo().then(() => {
    loadStudyStats()
    loadExamRecords()
  })
})
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.study-record-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
  box-sizing: border-box;

  .subject-header {
    background-color: #007aff;
    padding: 40rpx;
    margin: 0 0 30rpx 0;
    border-radius: 20rpx;
    text-align: center;
    box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);

    .subject-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 2rpx;
    }
  }

  .stats-section {
    margin-bottom: 40rpx;

    .stats-card {
      background-color: #ffffff;
      border-radius: 20rpx;
      padding: 40rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
      border: 1rpx solid #e9ecef;
      display: flex;
      justify-content: space-between;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        padding: 20rpx 0;
        position: relative;

        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1rpx;
          height: 60rpx;
          background-color: #e9ecef;
        }

        .stat-value {
          font-size: 48rpx;
          font-weight: 800;
          color: #007aff;
          margin-bottom: 10rpx;
        }

        .stat-label {
          font-size: 24rpx;
          color: #666;
          font-weight: 500;
        }
      }
    }
  }

  .exam-list-section {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      padding: 0 10rpx;

      .list-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #333;
      }

      .filter-buttons {
        display: flex;
        gap: 20rpx;

        .filter-btn {
          padding: 16rpx 32rpx;
          border-radius: 40rpx;
          border: 2rpx solid #e9ecef;
          background-color: #ffffff;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin: 0;

          &.active {
            background-color: #007aff;
            border-color: #007aff;

            .btn-text {
              color: #ffffff;
            }
          }

          &.btn-hover:not(.active) {
            background-color: #f8f9fa;
            transform: scale(0.98);
          }

          .btn-text {
            font-size: 24rpx;
            color: #666;
            font-weight: 600;
          }
        }
      }
    }

    .exam-list {
      .exam-item {
        background-color: #ffffff;
        border-radius: 16rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
        border: 1rpx solid #e9ecef;
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
        }

        .exam-info {
          flex: 1;

          .exam-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16rpx;

            .exam-name {
              font-size: 28rpx;
              font-weight: 600;
              color: #333;
              flex: 1;
              margin-right: 20rpx;
            }

            .exam-score {
              font-size: 32rpx;
              font-weight: 700;
              padding: 8rpx 16rpx;
              border-radius: 20rpx;

              &.excellent {
                color: #28a745;
                background-color: #d4edda;
              }

              &.good {
                color: #17a2b8;
                background-color: #d1ecf1;
              }

              &.pass {
                color: #ffc107;
                background-color: #fff3cd;
              }

              &.fail {
                color: #dc3545;
                background-color: #f8d7da;
              }
            }
          }

          .exam-meta {
            .exam-date {
              font-size: 24rpx;
              color: #666;
            }
          }
        }

        .exam-actions {
          .action-icon {
            font-size: 32rpx;
            color: #999;
            font-weight: bold;
          }
        }
      }
    }
  }

  /* 加载状态样式 */
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80rpx 0;

    .loading-text {
      font-size: 28rpx;
      color: #666;
    }
  }

  /* 空状态样式 */
  .empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
