<template>
	<view class="personal-page">
		<view class="top-card">
			<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
			<view class="base-info">
				<text class="name">{{ userInfo.name }}</text>
				<view class="info-row">
					<text class="info-label">性别：</text>
					<text class="info-value">{{ userInfo.gender || '未知' }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">学历：</text>
					<text class="info-value">{{ userInfo.education || '未填写' }}</text>
				</view>
				<view class="info-row">
					<text class="info-label">手机：</text>
					<text class="info-value">{{ userInfo.phone || '——' }}</text>
				</view>
			</view>
		</view>

		<view class="subject-strip">
			<text>培训科目：{{ currentSubject || '待选择' }}</text>
			<text>身份证号：{{ userInfo.idCard || '——' }}</text>
			<view class="subject-switch" @click="openSubjectPicker" v-if="subjectList.length">
				<text>切换科目</text>
				<view class="iconfont icon-right"></view>
			</view>
		</view>

		<view class="middle-card">
			<view class="stat-grid">
				<view class="stat-item" v-for="(item, idx) in stats" :key="idx">
					<text class="stat-value">{{ item.value }}</text>
					<text class="stat-label">{{ item.label }}</text>
				</view>
			</view>

			<view class="schedule-block">
				<view class="schedule-item">
					<text class="schedule-label">考试/上课日期</text>
					<text class="schedule-value">{{ scheduleInfo.date }}</text>
				</view>
				<view class="schedule-item">
					<text class="schedule-label">最新培训动态</text>
					<text class="schedule-value">{{ scheduleInfo.news }}</text>
				</view>
			</view>
		</view>

		<view class="function-section">
			<view class="function-item" v-for="func in functionList" :key="func.key" @click="handleFunction(func.key)">
				<view class="function-icon">
					<view class="iconfont" :class="func.icon"></view>
				</view>
				<text class="function-text">{{ func.label }}</text>
			</view>
		</view>

		<uni-popup ref="subjectPopup" type="bottom">
			<view class="subject-picker">
				<view class="picker-header">
					<text class="picker-title">选择科目</text>
					<view class="picker-close" @click="closeSubjectPicker">
						<view class="iconfont icon-close"></view>
					</view>
				</view>
				<view class="picker-content">
					<view class="picker-item" v-for="(subject, index) in subjectList" :key="index"
						@click="selectSubject(subject)">
						<text class="picker-text">{{ typeof subject === 'object' ? subject.subjectName : subject }}</text>
						<view class="picker-check" v-if="isCurrentSubject(subject)">
							<view class="iconfont icon-check text-blue"></view>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudentAccessibleSubjects } from '@/api/student/subjectList'

const userInfo = ref({
	name: '学员',
	gender: '',
	education: '',
	phone: '',
	idCard: '',
	avatar: '/static/images/profile.jpg'
})

const stats = ref([
	{ label: '视频课程进度', value: '0%' },
	{ label: '模拟考试次数', value: 0 },
	{ label: '全科练习次数', value: 0 }
])

const scheduleInfo = ref({
	date: '— —',
	news: '暂无培训动态'
})

const currentSubject = ref('')
const currentSubjectId = ref(null)
const subjectList = ref([])
const subjectPopup = ref(null)
const loadingSubjects = ref(false)

const functionList = [
	{ key: 'password', label: '修改密码', icon: 'icon-password' },
	{ key: 'certificate', label: '证书查询', icon: 'icon-book' },
	{ key: 'print', label: '学时打印', icon: 'icon-edit' },
	{ key: 'orders', label: '我的订单', icon: 'icon-service' },
	{ key: 'wechat', label: '绑定微信', icon: 'icon-share' },
	{ key: 'classmate', label: '我的同学', icon: 'icon-people' },
	{ key: 'practical', label: '实操练习', icon: 'icon-tool' },
	{ key: 'evaluate', label: '培训评价', icon: 'icon-aixin' }
]

const subjectNameFromRoute = ref('')
const subjectIdFromRoute = ref('')

const selectedSubjectDisplay = computed(() => currentSubject.value || subjectNameFromRoute.value)

function openSubjectPicker() {
	subjectPopup.value?.open()
}

function closeSubjectPicker() {
	subjectPopup.value?.close()
}

function isCurrentSubject(subject) {
	const name = typeof subject === 'object' ? subject.subjectName : subject
	return name === currentSubject.value
}

function selectSubject(subject) {
	currentSubject.value = typeof subject === 'object' ? subject.subjectName : subject
	currentSubjectId.value = typeof subject === 'object' ? subject.subjectId : null
	closeSubjectPicker()
}

function handleFunction(key) {
	switch (key) {
		case 'password':
			uni.navigateTo({ url: '/pages/mine/pwd/index' })
			break
		case 'certificate':
			uni.showToast({ title: '证书查询功能建设中', icon: 'none' })
			break
		case 'print':
			uni.showToast({ title: '学时打印功能建设中', icon: 'none' })
			break
		case 'orders':
			uni.showToast({ title: '暂无订单信息', icon: 'none' })
			break
		case 'wechat':
			uni.showToast({ title: '请前往我的-设置绑定', icon: 'none' })
			break
		case 'classmate':
			uni.navigateTo({
				url: `/pages/classmate?subjectId=${currentSubjectId.value || subjectIdFromRoute.value || ''}&subjectName=${encodeURIComponent(selectedSubjectDisplay.value || '')}`
			})
			break
		case 'practical':
			uni.navigateTo({
				url: `/pages/practicalType?subjectId=${currentSubjectId.value || ''}`
			})
			break
		case 'evaluate':
			uni.showToast({ title: '感谢评价，功能即将上线', icon: 'none' })
			break
		default:
			break
	}
}

function initUserInfo(token) {
	if (!token) return
	const data = token.data || {}
	userInfo.value = {
		name: data.nickName || data.userName || '学员',
		gender: data.sex === '1' ? '男' : data.sex === '0' ? '女' : data.sex || '',
		education: data.education || '未填写',
		phone: data.phonenumber || data.mobile || data.phone || '',
		idCard: data.idCard || '——',
		avatar: data.avatar || '/static/images/profile.jpg'
	}
	stats.value = [
		{ label: '视频课程进度', value: `${data.courseProgress || 72}%` },
		{ label: '模拟考试次数', value: data.mockTimes || 12 },
		{ label: '全科练习次数', value: data.practiceTimes || 34 }
	]
	scheduleInfo.value = {
		date: data.examDate || '2025-01-18',
		news: data.trainingNews || '安全教育专项班 - 请按时参加实操演练'
	}
}

async function loadSubjects(userId) {
	try {
		loadingSubjects.value = true
		const res = await getStudentAccessibleSubjects(userId)
		if (res.code === 200 && Array.isArray(res.data) && res.data.length) {
			subjectList.value = res.data
			applyRouteSubject(res.data)
		}
	} catch (error) {
		console.error('加载科目失败', error)
		uni.showToast({ title: '加载科目失败', icon: 'error' })
	} finally {
		loadingSubjects.value = false
	}
}

function applyRouteSubject(list) {
	if (!list.length) return
	if (subjectIdFromRoute.value) {
		const match = list.find(item => typeof item === 'object' && `${item.subjectId}` === `${subjectIdFromRoute.value}`)
		if (match) {
			currentSubject.value = match.subjectName
			currentSubjectId.value = match.subjectId
			return
		}
	}
	if (subjectNameFromRoute.value) {
		const match = list.find(item => {
			const name = typeof item === 'object' ? item.subjectName : item
			return name === subjectNameFromRoute.value
		})
		if (match) {
			currentSubject.value = typeof match === 'object' ? match.subjectName : match
			currentSubjectId.value = typeof match === 'object' ? match.subjectId : null
			return
		}
	}
	const first = list[0]
	currentSubject.value = typeof first === 'object' ? first.subjectName : first
	currentSubjectId.value = typeof first === 'object' ? first.subjectId : null
}

onLoad(async (options) => {
	try {
		subjectIdFromRoute.value = options?.subjectId || ''
		subjectNameFromRoute.value = options?.subjectName ? decodeURIComponent(options.subjectName) : ''
		const token = uni.getStorageSync('token')
		if (token && token.data?.id) {
			initUserInfo(token)
			await loadSubjects(token.data.id)
		} else {
			uni.showToast({ title: '请重新登录', icon: 'none' })
		}
	} catch (error) {
		console.error('个人中心初始化失败', error)
		uni.showToast({ title: '初始化失败', icon: 'error' })
	}
})
</script>

<style lang="scss" scoped>
.personal-page {
	min-height: 100vh;
	background-color: #f5f6f7;
	padding: 15px;
	box-sizing: border-box;
}

.top-card {
	display: flex;
	gap: 14px;
	background: linear-gradient(135deg, #1e76ff, #5ca6ff);
	padding: 16px;
	border-radius: 16px;
	align-items: center;
	color: #ffffff;
	margin-bottom: 10px;

	.avatar {
		width: 70px;
		height: 70px;
		border-radius: 12px;
		background-color: rgba(255, 255, 255, 0.2);
	}

	.base-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;

		.name {
			font-size: 20px;
			font-weight: 600;
		}

		.info-row {
			display: flex;
			font-size: 12px;
			color: rgba(255, 255, 255, 0.9);

			.info-label {
				width: 48px;
			}
		}
	}
}

.subject-strip {
	background-color: #ffffff;
	border-radius: 12px;
	padding: 12px 16px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	position: relative;
	margin-bottom: 12px;

	text {
		color: #333;
		font-size: 14px;
	}

	.subject-switch {
		position: absolute;
		right: 16px;
		top: 12px;
		display: flex;
		align-items: center;
		gap: 4px;
		color: #1e76ff;
		font-size: 12px;
	}
}

.middle-card {
	background-color: #ffffff;
	border-radius: 16px;
	padding: 16px;
	box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
	margin-bottom: 12px;

	.stat-grid {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 16px;

		.stat-item {
			flex: 1;
			background-color: #f5f9ff;
			border-radius: 12px;
			padding: 12px;
			text-align: center;

			.stat-value {
				font-size: 20px;
				font-weight: 600;
				color: #1e76ff;
			}

			.stat-label {
				font-size: 12px;
				color: #666;
			}
		}
	}

	.schedule-block {
		background-color: #f9fbff;
		border-radius: 12px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;

		.schedule-item {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.schedule-label {
				font-size: 13px;
				color: #999;
			}

			.schedule-value {
				font-size: 14px;
				color: #333;
				font-weight: 500;
			}
		}
	}
}

.function-section {
	background-color: #ffffff;
	border-radius: 16px;
	padding: 16px 8px;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);

	.function-item {
		width: 25%;
		padding: 12px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;

		.function-icon {
			width: 44px;
			height: 44px;
			border-radius: 12px;
			background-color: #f0f5ff;
			display: flex;
			align-items: center;
			justify-content: center;

			.iconfont {
				font-size: 22px;
				color: #1e76ff;
			}
		}

		.function-text {
			font-size: 12px;
			color: #333;
			text-align: center;
		}
	}
}

.subject-picker {
	background-color: #ffffff;
	border-radius: 20px 20px 0 0;
	max-height: 60vh;

	.picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #e9ecef;

		.picker-title {
			font-size: 18px;
			font-weight: bold;
			color: #333;
		}

		.picker-close {
			padding: 5px;

			.iconfont {
				font-size: 20px;
				color: #666;
			}
		}
	}

	.picker-content {
		max-height: 400px;
		overflow-y: auto;

		.picker-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 15px 20px;
			border-bottom: 1px solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.picker-text {
				font-size: 16px;
				color: #333;
			}

			.picker-check {
				.iconfont {
					font-size: 18px;
				}
			}
		}
	}
}
</style>

