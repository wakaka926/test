<template>
    <view class="practice-all-container">
  
      <!-- 练习模块列表 -->
      <view class="practice-list">
        <view class="practice-item">
          <view class="item-header">
            <text class="item-title">练习一</text>
            <text class="start-link" @tap="startPractice('collection')">开始练习</text>
          </view>
          <view class="item-footer">
            <text class="practice-name">收藏题目练习</text>
          </view>
        </view>
  
        <view class="practice-item">
          <view class="item-header">
            <text class="item-title">练习二</text>
            <text class="start-link" @tap="startPractice('incorrect')">开始练习</text>
          </view>
          <view class="item-footer">
            <text class="practice-name">答错题目练习</text>
          </view>
        </view>
  
        <view class="practice-item">
          <view class="item-header">
            <text class="item-title">练习三</text>
            <text class="start-link" @tap="startPractice('easyIncorrect')">开始练习</text>
          </view>
          <view class="item-footer">
            <text class="practice-name">易错题目练习</text>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  
  const currentSubject = ref('低压电工作业')
  
  function goBack() {
    uni.navigateBack()
  }
  
  function startPractice(type) {
    uni.navigateTo({ url: `/pages/incorrectPractice?type=${type}` })
  }
  
  onLoad(() => {
    
  })
  </script>
  
  <style lang="scss" scoped>
  page {
    background-color: #f5f5f5;
  }
  
  .practice-all-container {
    width: 100%;
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
  
  
    .practice-list {
      margin: 20rpx 30rpx;
      display: flex;
      flex-direction: column;
      gap: 20rpx;
  
      .practice-item {
        display: flex;
        flex-direction: column;
        background-color: #ffffff;
        border: 1rpx solid #e9ecef;
        border-radius: 16rpx;
        padding: 24rpx 30rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
  
        &:active {
          transform: scale(0.98);
          background-color: #f8f9fa;
        }
  
        .item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20rpx;
  
          .item-title {
            font-size: 26rpx;
            color: #666;
            font-weight: 600;
          }
  
          .start-link {
            font-size: 26rpx;
            color: #ff8f1f;
            /* 橙色 */
            font-weight: 700;
          }
        }
  
        .item-footer {
          .practice-name {
            font-size: 30rpx;
            color: #333;
            font-weight: 700;
          }
        }
      }
    }
  }
  </style>
  