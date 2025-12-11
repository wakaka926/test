<template>
	<view class="home-container">
		<!-- 标题区域 -->
		<view class="header-section">
			<text class="title">特种作业在线培训考试平台</text>
		</view>

		<!-- 图片区域 -->
		<view class="image-section">
			<image src="/static/images/banner/banner1.jpg" class="banner-image" mode="aspectFill"></image>
		</view>

		<!-- 科目切换栏 -->
		<view class="subject-section">
			<view class="subject-header flex justify-between align-center">
				<text class="subject-label">科目：{{ currentSubject || '加载中...' }}</text>
				<view class="switch-btn" @click="showSubjectPicker" v-if="!loading">
					<text class="switch-text">切换</text>
					<view class="iconfont icon-right switch-icon"></view>
				</view>
			</view>
		</view>

		<!-- 进度信息区域 -->
		<view class="progress-section">
			<view class="progress-grid">
				<view class="progress-item">
					<text class="progress-label">线上课程进度</text>
					<text class="progress-value">{{ courseProgress }}%</text>
				</view>
				<view class="progress-item">
					<text class="progress-label">培训状态</text>
					<text class="progress-value">{{ trainingStatus }}</text>
				</view>
				<view class="progress-item">
					<text class="progress-label">有效期至</text>
					<text class="progress-value">{{ expiryDate }}</text>
				</view>
				<view class="progress-item">
					<text class="progress-label">会员等级</text>
					<text class="progress-value">{{ memberLevel }}</text>
				</view>
			</view>
		</view>

		<!-- 功能模块区域 -->
		<view class="function-section">
			<view class="function-grid">
				<view class="function-item" @click="handleFunction('practiceAll')">
					<view class="function-icon">
						<view class="iconfont icon-book text-blue"></view>
					</view>
					<text class="function-text">全科练习</text>
				</view>
				<view class="function-item" @click="handleFunction('collection')">
					<view class="function-icon">
						<view class="iconfont icon-star text-orange"></view>
					</view>
					<text class="function-text">错题收藏</text>
				</view>
				<view class="function-item" @click="handleFunction('record')">
					<view class="function-icon">
						<view class="iconfont icon-time text-green"></view>
					</view>
					<text class="function-text">学习记录</text>
				</view>
				<view class="function-item" @click="handleFunction('practical')">
					<view class="function-icon">
						<view class="iconfont icon-tool text-purple"></view>
					</view>
					<text class="function-text">实操练习</text>
				</view>
				<view class="function-item" @click="handleFunction('classmate')">
					<view class="function-icon">
						<view class="iconfont icon-people text-red"></view>
					</view>
					<text class="function-text">我的同学</text>
				</view>
				<view class="function-item" @click="handleFunction('school')">
					<view class="function-icon">
						<view class="iconfont icon-service text-cyan"></view>
					</view>
					<text class="function-text">联系学校</text>
				</view>
				<view class="function-item" @click="handleFunction('service')">
					<view class="function-icon">
						<view class="iconfont icon-service text-cyan"></view>
					</view>
					<text class="function-text">联系客服</text>
				</view>
				<view class="function-item" @click="handleFunction('personal')">
					<view class="function-icon">
						<view class="iconfont icon-service text-cyan"></view>
					</view>
					<text class="function-text">个人中心</text>
				</view>
			</view>
		</view>

		<!-- 快捷功能双列区域 -->
		<view class="quick-section">
			<view class="quick-grid">
				<view class="quick-item" @click="handleFunction('mock')">
					<text class="quick-text">模拟考试</text>
					<view class="quick-icon">
						<view class="iconfont icon-time text-green"></view>
					</view>
				</view>
				<view class="quick-item" @click="handleFunction('course')">
					<text class="quick-text">线上课程</text>
					<view class="quick-icon">
						<view class="iconfont icon-book text-blue"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 科目知识点 -->
		<view class="knowledge-section">
			<view class="knowledge-header">
				<text class="knowledge-title">科目知识点</text>
			</view>
			<view class="knowledge-grid">
				<view class="knowledge-card" v-for="(item, idx) in knowledgeList" :key="idx"
					@click="handleKnowledge(item)">
					<image :src="item.cover" class="knowledge-cover" mode="aspectFill"></image>
					<view class="knowledge-info">
						<text class="knowledge-name">{{ item.name }}</text>
						<view class="knowledge-meta">
							<text class="meta-left">￥{{ item.purchaseProgress }}</text>
							<text class="meta-right">{{ item.learners }} 人学习</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 科目选择弹窗 -->
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
						<text class="picker-text">{{ typeof subject === 'object' ? subject.subjectName : subject
						}}</text>
						<view v-if="(typeof subject === 'object' ? subject.subjectName : subject) === currentSubject"
							class="picker-check">
							<view class="iconfont icon-check text-blue"></view>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import {
	ref,
	getCurrentInstance
} from "vue"
import { getStudentAccessibleSubjects } from '@/api/student/subjectList'
import { formatDateTime } from '@/utils/dateFormat'
import {
	onLoad
} from "@dcloudio/uni-app"

const {
	proxy
} = getCurrentInstance()

// 页面状态
const loading = ref(false)

// 当前科目
const currentSubject = ref("")
const currentSubjectId = ref(null)

// 科目列表
const subjectList = ref([])

// 进度信息
const courseProgress = ref(75)
const trainingStatus = ref("进行中")
const expiryDate = ref(null)
const memberLevel = ref("VIP会员")

// 弹窗引用
const subjectPopup = ref(null)

// 知识点数据
const knowledgeList = ref([
	{ name: '电工基础-安全用电', cover: '/static/images/banner/banner01.jpg', purchaseProgress: 40, learners: 1280 },
	{ name: '配电系统-常见隐患', cover: '/static/images/banner/banner02.jpg', purchaseProgress: 75, learners: 2034 },
	{ name: '低压操作规范', cover: '/static/images/banner/banner01.jpg', purchaseProgress: 20, learners: 890 },
	{ name: '事故应急与处置', cover: '/static/images/banner/banner02.jpg', purchaseProgress: 55, learners: 1560 }
])

// 加载学生科目列表
async function loadStudentSubjects(studentId) {
	try {
		loading.value = true
		const response = await getStudentAccessibleSubjects(studentId)
		console.log('科目列表响应:', response)

		if (response.code === 200 && response.data && response.data.length > 0) {
			subjectList.value = response.data
			// 默认选择第一个科目
			const firstSubject = response.data[0]
			currentSubject.value = typeof firstSubject === 'object' ? firstSubject.subjectName : firstSubject
			currentSubjectId.value = typeof firstSubject === 'object' ? firstSubject.subjectId : null

			// 从第一个科目数据中获取进度信息
			updateSubjectDataFromList(firstSubject)
		} else {
			uni.showToast({
				title: '暂无可用科目',
				icon: 'none'
			})
		}
	} catch (error) {
		console.error('加载科目列表失败:', error)
		uni.showToast({
			title: '加载科目列表失败',
			icon: 'error'
		})
	} finally {
		loading.value = false
	}
}

function handleKnowledge(item) {
	uni.showToast({ title: item.name, icon: 'none' })
}

// 显示科目选择器
function showSubjectPicker() {
	subjectPopup.value.open()
}

// 关闭科目选择器
function closeSubjectPicker() {
	subjectPopup.value.close()
}

// 选择科目
function selectSubject(subject) {
	currentSubject.value = typeof subject === 'object' ? subject.subjectName : subject
	currentSubjectId.value = typeof subject === 'object' ? subject.subjectId : null
	closeSubjectPicker()

	// 从科目列表中获取进度数据
	updateSubjectDataFromList(subject)
}

// 从科目列表中更新科目数据
function updateSubjectDataFromList(subject) {
	if (typeof subject === 'object') {
		// 学习进度统一设为100%
		courseProgress.value = 100
		// 从科目数据中获取其他字段
		trainingStatus.value = subject.status || "进行中"
		// 使用日期转换方法格式化有效期
		expiryDate.value = formatDateTime(subject.validUntil) || ""
		memberLevel.value = subject.membershipLevel || "普通会员"
	} else {
		// 如果是字符串格式，使用默认值
		courseProgress.value = 100
		trainingStatus.value = "进行中"
		expiryDate.value = ""
		memberLevel.value = "普通会员"
	}
}

// 更新科目数据（保留原函数用于兼容）
async function updateSubjectData(subject) {
	// 直接使用科目列表中的数据，不再调用API
	updateSubjectDataFromList(subject)
}

// 处理功能点击
function handleFunction(type) {
	// 模拟用户会员信息，可替换为后端/Store
	const userVipMap = {
		'低压电工作业': true
	}
	const isVip = !!userVipMap[currentSubject.value]

	const needVip = ['practiceAll', 'collection', 'practical', 'record']
	if (needVip.includes(type) && !isVip) {
		uni.navigateTo({ url: `/pages/recharge?subject=${encodeURIComponent(currentSubject.value)}` })
		return
	}

	switch (type) {
		case 'practiceAll':
			uni.navigateTo({
				url: `/pages/generalPractice?subjectId=${currentSubjectId.value}`
			})
			break
		case 'collection':
			uni.navigateTo({
				url: `/pages/incorrectCollection?subject=${encodeURIComponent(currentSubject.value)}`
			})
			break
		case 'practical':
			uni.navigateTo({
				url: `/pages/practicalType?subjectId=${currentSubjectId.value}`
			})
			break
		case 'record':
			uni.navigateTo({
				url: `/pages/studyRecord?subjectId=${currentSubjectId.value}&subjectName=${encodeURIComponent(currentSubject.value)}`
			})
			break
		case 'classmate':
			uni.navigateTo({
				url: `/pages/classmate?subjectId=${currentSubjectId.value}&subjectName=${encodeURIComponent(currentSubject.value)}`
			})
			break
		case 'school':
			uni.navigateTo({
				url: `/pages/schoolnfo`
			})
			break
		case 'service':
			uni.showToast({ title: '联系客服', icon: 'none' })
			break
		case 'personal':
			uni.navigateTo({
				url: `/pages/personalCenter?subjectId=${currentSubjectId.value}&subjectName=${encodeURIComponent(currentSubject.value)}`
			})
			break
		case 'mock':
			uni.navigateTo({ url: `/pages/mockExam?subjectId=${currentSubjectId.value}&subjectName=${encodeURIComponent(currentSubject.value)}` })
			break
		case 'course':
			uni.navigateTo({
				url: `/pages/onlineCourse?subject=${encodeURIComponent(currentSubject.value)}`
			})
			break
		default:
			break
	}
}

onLoad(async () => {
	// 页面加载时的初始化逻辑
	try {
		const token = uni.getStorageSync('token')
		console.log('token:', token)
		if (token && token.data.id) {
			await loadStudentSubjects(token.data.id)
		} else {
			uni.showToast({
				title: '用户信息获取失败，请重新登录',
				icon: 'error'
			})
		}
	} catch (error) {
		console.error('页面初始化失败:', error)
		uni.showToast({
			title: '页面初始化失败',
			icon: 'error'
		})
	}
})
</script>

<style lang="scss" scoped>
page {
	background-color: #f5f6f7;
}

.home-container {
	width: 100%;
	min-height: 100vh;
	background-color: #f5f6f7;
	display: flex;
	flex-direction: column;
	overflow-y: auto;

	.header-section {
		background-color: #ffffff;
		padding: 15px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;

		.title {
			font-size: 16px;
			font-weight: bold;
			color: #333;
		}
	}

	.image-section {
		width: 100%;
		padding: 10px;
		flex-shrink: 0;

		.banner-image {
			width: 100%;
			height: 120px;
			border-radius: 8px;
		}
	}

	.subject-section {
		background-color: #ffffff;
		margin: 0 15px 10px 15px;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex-shrink: 0;

		.subject-header {
			.subject-label {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}

			.switch-btn {
				display: flex;
				align-items: center;
				padding: 8px 12px;
				background-color: #007aff;
				border-radius: 20px;

				.switch-text {
					font-size: 14px;
					color: #ffffff;
					margin-right: 5px;
				}

				.switch-icon {
					font-size: 12px;
					color: #ffffff;
				}
			}
		}
	}

	.progress-section {
		background-color: #ffffff;
		margin: 0 15px 10px 15px;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex-shrink: 0;

		.progress-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;

			.progress-item {
				text-align: center;
				padding: 10px;
				background-color: #f8f9fa;
				border-radius: 8px;

				.progress-label {
					display: block;
					font-size: 12px;
					color: #666;
					margin-bottom: 8px;
				}

				.progress-value {
					display: block;
					font-size: 16px;
					font-weight: bold;
					color: #333;
				}
			}
		}
	}

	.function-section {
		background-color: #ffffff;
		margin: 0 15px 10px 15px;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex-shrink: 0;

		.function-grid {
			display: flex;
			flex-wrap: wrap;
			margin: -2.5px;

			.function-item {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				width: calc(25% - 5px);
				padding: 10px 5px;
				margin: 2.5px;
				border-radius: 8px;
				background-color: #f8f9fa;
				transition: all 0.3s ease;
				box-sizing: border-box;

				&:active {
					background-color: #e9ecef;
					transform: scale(0.95);
				}

				.function-icon {
					margin-bottom: 6px;

					.iconfont {
						font-size: 24px;
					}
				}

				.function-text {
					font-size: 11px;
					color: #333;
					text-align: center;
					line-height: 1.2;
					word-break: break-all;
				}
			}
		}
	}

	/* 科目知识点 */
	.knowledge-section {
		background-color: #ffffff;
		margin: 0 15px 10px 15px;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex-shrink: 0;

		.knowledge-header {
			margin-bottom: 8px;

			.knowledge-title {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
		}

		.knowledge-grid {
			display: flex;
			flex-wrap: wrap;
			margin: -2.5px;

			.knowledge-card {
				width: calc(50% - 5px);
				margin: 2.5px;
				background-color: #f8f9fa;
				border-radius: 8px;
				overflow: hidden;
				box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
				transition: all 0.2s ease;

				&:active {
					transform: scale(0.98);
				}

				.knowledge-cover {
					width: 100%;
					height: 90px;
					display: block;
				}

				.knowledge-info {
					padding: 8px;

					.knowledge-name {
						display: block;
						font-size: 14px;
						color: #333;
						margin-bottom: 6px;
					}

					.knowledge-meta {
						display: flex;
						justify-content: space-between;
						align-items: center;
						font-size: 12px;
						color: #666;
					}
				}
			}
		}
	}

	/* 快捷功能双列区域 */
	.quick-section {
		background-color: #ffffff;
		margin: 0 15px 10px 15px;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		flex-shrink: 0;

		.quick-grid {
			display: flex;
			flex-wrap: wrap;
			margin: -2.5px;
		}

		.quick-item {
			width: calc(50% - 5px);
			margin: 2.5px;
			border-radius: 8px;
			background-color: #f8f9fa;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: 8px;
			padding: 14px 12px;
			box-sizing: border-box;
			transition: all 0.3s ease;

			&:active {
				background-color: #e9ecef;
				transform: scale(0.96);
			}

			.quick-icon {
				margin-left: 10px;

				.iconfont {
					font-size: 24px;
				}
			}

			.quick-text {
				font-size: 14px;
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
}
</style>
