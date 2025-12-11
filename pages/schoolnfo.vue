<template>
    <view class="page-container">
      <view class="school-info">
        <view class="left">
          <image :src="school.imgUrl" mode="aspectFill" class="school-image" />
        </view>
        <view class="right">
          <view class="school-name">{{ school.name }}</view>
          <view class="school-phone" @click="callPhone">
            联系电话: <text class="phone-number">{{ school.phone }}</text>
          </view>
          <view class="school-address">地址: {{ school.address }}</view>
  
          <view v-if="hasLocation" class="map-container">
            <map
              :longitude="school.longitude"
              :latitude="school.latitude"
              :scale="16"
              style="width: 100%; height: 200rpx;"
              show-location
              enable-3D
            ></map>
          </view>
  
          <button v-if="hasLocation" type="primary" @click="openNavigation">导航到学校</button>
        </view>
      </view>
    </view>
  </template>
  
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getStudentSchoolMsg } from '@/api/student/school.js' // 注意路径根据项目调整
  
  const school = ref({
    imgUrl: '',
    name: '',
    phone: '',
    address: '',
    longitude: 0,
    latitude: 0,
  })
  
  const hasLocation = ref(false)
  

  const schoolId = uni.getStorageSync('token').data.schoolId
  
  async function fetchSchoolInfo() {
    try {
      const res = await getStudentSchoolMsg(schoolId)
      if (res && res.data) {
        const data = res.data
        school.value = {
          imgUrl: data.imgUrl || '',
          name: data.name || '',
          phone: data.contactInfo || '',
          address: data.address || '',
          longitude: data.addressLongitude || 0,
          latitude: data.addressLatitude || 0,
        }
        hasLocation.value = !!(data.addressLongitude && data.addressLatitude)
        console.log(hasLocation.value)
      } else {
        uni.showToast({ title: '获取学校信息失败', icon: 'error' })
      }
    } catch (error) {
      uni.showToast({ title: '请求异常', icon: 'error' })
      console.error(error)
    }
  }
  
  function callPhone() {
    if (!school.value.phone) {
      uni.showToast({ title: '暂无联系电话', icon: 'none' })
      return
    }
    uni.makePhoneCall({
      phoneNumber: school.value.phone,
    })
  }
  
  function openNavigation() {
    if (!hasLocation.value) {
      uni.showToast({ title: '无效的学校定位', icon: 'none' })
      return
    }
    uni.openLocation({
      latitude: school.value.latitude,
      longitude: school.value.longitude,
      name: school.value.name,
      address: school.value.address,
      scale: 18,
    })
  }
  
  onMounted(() => {
    fetchSchoolInfo()
  })
  </script>
  


<style scoped>
/* 页面整体背景白色 */
.page-container {
  background-color: #ffffff;
  min-height: 100vh; /* 填满视口高度 */
  padding: 20rpx;
}

/* 学校信息栏目浅灰背景 */
.school-info {
  display: flex;
  background-color: #f5f5f5; /* 浅灰色 */
  border-radius: 12rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.left {
  width: 40%;
  padding-right: 20rpx;
}

.right {
  width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.school-image {
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  object-fit: cover;
}

.school-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.school-phone {
  margin-bottom: 15rpx;
  color: #007aff;
  cursor: pointer;
}

.phone-number {
  text-decoration: underline;
}

.school-address {
  margin-bottom: 30rpx;
  color: #666666;
}

.map-container {
  margin-bottom: 20rpx;
}
</style>
  