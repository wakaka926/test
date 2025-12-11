<template>
  <view class="online-course-container">
    <!-- 科目信息头部 -->
    <view class="course-header">
      <view class="header-left">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">‹</text>
          <text class="back-text">返回</text>
        </view>
      </view>
      <view class="header-center">
        <text class="course-title">{{ currentSubject }}</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 课程统计信息 -->
    <view class="course-stats">
      <view class="stats-item">
        <text class="stats-label">视频数量</text>
        <text class="stats-value">{{ courseStats.totalVideos }}</text>
      </view>
      <view class="stats-item">
        <text class="stats-label">完成数量</text>
        <text class="stats-value">{{ courseStats.completedVideos }}</text>
      </view>
      <view class="stats-item">
        <text class="stats-label">完成比例</text>
        <text class="stats-value">{{ courseStats.completionRate }}%</text>
      </view>
    </view>

    <!-- 视频列表 -->
    <view class="video-list">
      <view class="list-header">
        <text class="list-title">课程视频</text>
      </view>
      <view class="video-items">
        <view 
          class="video-item" 
          v-for="(video, index) in videoList" 
          :key="index"
          @tap="playVideo(video)">
          <view class="video-info">
            <text class="video-name">{{ video.name }}</text>
            <text class="video-duration">{{ video.duration }}</text>
          </view>
          <view class="video-progress">
            <view class="progress-bar">
              <view 
                class="progress-fill" 
                :style="{ width: video.progress + '%' }"></view>
            </view>
            <text class="progress-text">{{ video.progress }}%</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 当前科目
const currentSubject = ref('低压电工作业')

// 课程统计信息
const courseStats = ref({
  totalVideos: 20,
  completedVideos: 12,
  completionRate: 60
})

// 视频列表数据
const videoList = ref([
  {
    id: 1,
    name: '电工基础知识概述',
    duration: '01:14:30',
    progress: 100,
    status: 'completed'
  },
  {
    id: 2,
    name: '安全用电基本要求',
    duration: '00:38:15',
    progress: 100,
    status: 'completed'
  },
  {
    id: 3,
    name: '电气设备安全操作',
    duration: '00:52:45',
    progress: 80,
    status: 'in_progress'
  },
  {
    id: 4,
    name: '配电系统基础知识',
    duration: '00:41:20',
    progress: 60,
    status: 'in_progress'
  },
  {
    id: 5,
    name: '低压电器设备维护',
    duration: '00:35:10',
    progress: 0,
    status: 'not_started'
  },
  {
    id: 6,
    name: '电气事故预防措施',
    duration: '00:48:30',
    progress: 0,
    status: 'not_started'
  },
  {
    id: 7,
    name: '接地保护系统',
    duration: '00:43:25',
    progress: 0,
    status: 'not_started'
  },
  {
    id: 8,
    name: '漏电保护装置',
    duration: '00:39:40',
    progress: 0,
    status: 'not_started'
  },
  {
    id: 9,
    name: '电气安全距离',
    duration: '00:36:55',
    progress: 0,
    status: 'not_started'
  },
  {
    id: 10,
    name: '电气作业安全规程',
    duration: '00:44:18',
    progress: 0,
    status: 'not_started'
  }
])

// 播放视频
function playVideo(video) {
  uni.showModal({
    title: '播放视频',
    content: `确定要播放《${video.name}》吗？`,
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '开始播放视频',
          icon: 'success'
        })
        // 这里可以跳转到视频播放页面
        // uni.navigateTo({ url: `/pages/videoPlayer?id=${video.id}` })
      }
    }
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}

// 页面加载
onLoad((options) => {
  if (options.subject) {
    currentSubject.value = decodeURIComponent(options.subject)
  }
})
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.online-course-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  .course-header {
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

    .header-left {
      .back-btn {
        display: flex;
        align-items: center;
        padding: 10rpx;

        .back-icon {
          font-size: 32rpx;
          color: #007aff;
          margin-right: 10rpx;
          font-weight: bold;
        }

        .back-text {
          font-size: 28rpx;
          color: #007aff;
        }
      }
    }

    .header-center {
      .course-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .header-right {
      width: 80rpx; // 占位保持居中
    }
  }

  .course-stats {
    background-color: #ffffff;
    margin: 20rpx 30rpx;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    border: 1rpx solid #e9ecef;

    .stats-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .stats-label {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 12rpx;
      }

      .stats-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #007aff;
      }
    }
  }

  .video-list {
    background-color: #ffffff;
    margin: 0 30rpx 20rpx 30rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    border: 1rpx solid #e9ecef;
    flex: 1;

    .list-header {
      padding: 30rpx 30rpx 20rpx 30rpx;
      border-bottom: 1rpx solid #e9ecef;

      .list-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .video-items {
      .video-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #f0f0f0;
        transition: all 0.3s ease;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: #f8f9fa;
          transform: scale(0.98);
        }

        .video-info {
          flex: 1;
          margin-right: 20rpx;

          .video-name {
            display: block;
            font-size: 28rpx;
            color: #333;
            font-weight: 600;
            margin-bottom: 8rpx;
            line-height: 1.4;
          }

          .video-duration {
            font-size: 24rpx;
            color: #666;
          }
        }

        .video-progress {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 120rpx;

          .progress-bar {
            width: 100rpx;
            height: 8rpx;
            background-color: #e9ecef;
            border-radius: 4rpx;
            overflow: hidden;
            margin-bottom: 8rpx;

            .progress-fill {
              height: 100%;
              background-color: #007aff;
              border-radius: 4rpx;
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 20rpx;
            color: #007aff;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
