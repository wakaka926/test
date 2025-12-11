<template>
	<view class="classmate-page">
		<view class="subject-bar">
			<view class="subject-info">
				<text class="subject-name">{{ currentSubject || '加载中...' }}</text>
				<text class="subject-tag">我的同学</text>
			</view>
			<view class="switch-btn" @click="openSubjectPicker" v-if="!loading">
				<text>切换科目</text>
				<view class="iconfont icon-right"></view>
			</view>
		</view>

		<view class="champion-board" v-if="champion">
			<text class="board-title">同学冠军榜</text>
			<view class="champion-card">
				<view class="medal-badge medal-gold"></view>
				<view class="champion-info">
					<text class="champion-name">{{ champion.name }}</text>
					<text class="champion-score">得分 {{ champion.score }} 分</text>
					<text class="champion-time">用时 {{ champion.time }}</text>
				</view>
			</view>
		</view>

		<view class="training-info">
			<text class="training-label">培训单位</text>
			<text class="training-value">{{ trainingOrg }}</text>
		</view>

		<view class="rank-section">
			<view class="rank-tabs">
				<view class="rank-tab" :class="{ active: activeTab === 'week' }" @click="setActiveTab('week')">
					本周排行
				</view>
				<view class="rank-tab" :class="{ active: activeTab === 'month' }" @click="setActiveTab('month')">
					本月排行
				</view>
			</view>

			<view class="rank-header">
				<text class="col-rank">排名</text>
				<text class="col-name">姓名</text>
				<text class="col-score">得分</text>
				<text class="col-time">用时</text>
			</view>

			<view class="rank-list">
				<view class="rank-row" v-for="(item, index) in displayRanking" :key="index">
					<view class="rank-badge">
						<view v-if="index === 0" class="medal-badge medal-gold"></view>
						<view v-else-if="index === 1" class="medal-badge medal-silver"></view>
						<view v-else-if="index === 2" class="medal-badge medal-bronze"></view>
						<text v-else>{{ index + 1 }}</text>
					</view>
					<text class="rank-name">{{ item.name }}</text>
					<text class="rank-score">{{ item.score }}</text>
					<text class="rank-time">{{ item.time }}</text>
				</view>
			</view>
		</view>

		<view class="action-bar">
			<button class="cta-btn" @click="gotoMockExam">
				争夺冠军 · 立即模拟考试
			</button>
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

const loading = ref(false)
const currentSubject = ref('')
const currentSubjectId = ref(null)
const subjectList = ref([])
const subjectPopup = ref(null)
const activeTab = ref('week')
const trainingOrg = ref('——')

const weeklyRanking = ref([])
const monthlyRanking = ref([])

const rankingTemplates = {
	default: {
		trainingOrg: '国家安监局认证培训中心',
		week: [
			{ name: '张伟', score: 98, time: '32分20秒' },
			{ name: '李敏', score: 95, time: '35分08秒' },
			{ name: '王强', score: 94, time: '34分11秒' },
			{ name: '刘洋', score: 92, time: '36分42秒' },
			{ name: '陈婷', score: 90, time: '38分15秒' }
		],
		month: [
			{ name: '赵磊', score: 99, time: '30分55秒' },
			{ name: '孙甜', score: 96, time: '33分18秒' },
			{ name: '周浩', score: 95, time: '34分22秒' },
			{ name: '吴静', score: 93, time: '37分05秒' },
			{ name: '郑凯', score: 91, time: '39分41秒' }
		]
	},
	'低压电工作业': {
		trainingOrg: '低压电工实训基地',
		week: [
			{ name: '胡斌', score: 97, time: '31分40秒' },
			{ name: '罗颖', score: 96, time: '32分55秒' },
			{ name: '郭鹏', score: 94, time: '35分02秒' },
			{ name: '马亮', score: 92, time: '36分48秒' },
			{ name: '贾晓', score: 89, time: '40分10秒' }
		],
		month: [
			{ name: '贺晨', score: 99, time: '30分20秒' },
			{ name: '魏爽', score: 97, time: '31分50秒' },
			{ name: '任凯', score: 95, time: '34分05秒' },
			{ name: '于雪', score: 94, time: '35分33秒' },
			{ name: '杜娟', score: 92, time: '37分44秒' }
		]
	}
}

const displayRanking = computed(() => activeTab.value === 'week' ? weeklyRanking.value : monthlyRanking.value)
const champion = computed(() => displayRanking.value.length ? displayRanking.value[0] : null)

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
	updateRankingData()
}

function setActiveTab(tab) {
	activeTab.value = tab
}

function updateRankingData() {
	const key = currentSubject.value && rankingTemplates[currentSubject.value] ? currentSubject.value : 'default'
	const template = rankingTemplates[key]
	trainingOrg.value = template.trainingOrg
	weeklyRanking.value = template.week
	monthlyRanking.value = template.month
}

function applySubjectFromRoute(list, subjectId, subjectName) {
	if (!list.length) return
	if (subjectId) {
		const matched = list.find(item => typeof item === 'object' && `${item.subjectId}` === `${subjectId}`)
		if (matched) {
			currentSubject.value = matched.subjectName
			currentSubjectId.value = matched.subjectId
			return
		}
	}
	if (subjectName) {
		const matched = list.find(item => {
			const name = typeof item === 'object' ? item.subjectName : item
			return name === subjectName
		})
		if (matched) {
			currentSubject.value = typeof matched === 'object' ? matched.subjectName : matched
			currentSubjectId.value = typeof matched === 'object' ? matched.subjectId : null
			return
		}
	}
	const first = list[0]
	currentSubject.value = typeof first === 'object' ? first.subjectName : first
	currentSubjectId.value = typeof first === 'object' ? first.subjectId : null
}

async function loadSubjects(studentId, options = {}) {
	try {
		loading.value = true
		const res = await getStudentAccessibleSubjects(studentId)
		if (res.code === 200 && Array.isArray(res.data) && res.data.length) {
			subjectList.value = res.data
			applySubjectFromRoute(res.data, options.subjectId, options.subjectName)
			updateRankingData()
		} else {
			uni.showToast({ title: '暂无科目信息', icon: 'none' })
		}
	} catch (error) {
		console.error('加载科目失败', error)
		uni.showToast({ title: '加载科目失败', icon: 'error' })
	} finally {
		loading.value = false
	}
}

function gotoMockExam() {
	uni.navigateTo({
		url: `/pages/mockExam?subjectId=${currentSubjectId.value || ''}&subjectName=${encodeURIComponent(currentSubject.value)}`
	})
}

onLoad(async (options) => {
	try {
		const token = uni.getStorageSync('token')
		const subjectId = options?.subjectId || ''
		const subjectName = options?.subjectName ? decodeURIComponent(options.subjectName) : ''
		if (token && token.data?.id) {
			await loadSubjects(token.data.id, { subjectId, subjectName })
		} else {
			uni.showToast({ title: '请重新登录', icon: 'none' })
		}
	} catch (error) {
		console.error('页面初始化失败', error)
		uni.showToast({ title: '初始化失败', icon: 'error' })
	}
})
</script>

<style lang="scss" scoped>
.classmate-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fef7f1 0%, #f5f6f7 45%, #f5f6f7 100%);
	padding: 15px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;

	.subject-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #fff;
		border-radius: 12px;
		padding: 14px 16px;
		box-shadow: 0 6px 14px rgba(255, 153, 0, 0.12);
		margin-bottom: 12px;

		.subject-info {
			display: flex;
			flex-direction: column;
			gap: 4px;

			.subject-name {
				font-size: 18px;
				font-weight: 600;
				color: #333;
			}

			.subject-tag {
				font-size: 12px;
				color: #ff8a00;
				background-color: rgba(255, 165, 0, 0.12);
				padding: 2px 10px;
				border-radius: 20px;
			}
		}

		.switch-btn {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 14px;
			color: #ff8a00;
			padding: 6px 12px;
			border-radius: 20px;
			background-color: rgba(255, 138, 0, 0.12);
		}
	}

	.champion-board {
		background: linear-gradient(120deg, #ffe9c4, #ffd399);
		border-radius: 16px;
		padding: 18px;
		box-shadow: 0 12px 20px rgba(255, 153, 0, 0.18);
		margin-bottom: 12px;

		.board-title {
			font-size: 16px;
			font-weight: bold;
			color: #8c4b00;
		}

		.champion-card {
			margin-top: 12px;
			background: rgba(255, 255, 255, 0.8);
			border-radius: 14px;
			padding: 12px;
			display: flex;
			align-items: center;
			gap: 12px;

			.champion-info {
				display: flex;
				flex-direction: column;
				gap: 4px;

				.champion-name {
					font-size: 16px;
					font-weight: bold;
					color: #333;
				}

				.champion-score,
				.champion-time {
					font-size: 12px;
					color: #666;
				}
			}
		}
	}

	.training-info {
		background-color: #fff;
		border-radius: 12px;
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #333;
		font-size: 14px;
		margin-bottom: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

		.training-label {
			color: #999;
		}

		.training-value {
			font-weight: 600;
			color: #444;
		}
	}

	.rank-section {
		background-color: #fff;
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
		flex: 1;
		display: flex;
		flex-direction: column;

		.rank-tabs {
			display: flex;
			background-color: #f7f7f7;
			border-radius: 999px;
			padding: 4px;
			gap: 4px;
			margin-bottom: 16px;

			.rank-tab {
				flex: 1;
				text-align: center;
				padding: 8px 0;
				border-radius: 999px;
				font-size: 14px;
				color: #777;
			}

			.rank-tab.active {
				background-color: #ff8a00;
				color: #fff;
				box-shadow: 0 8px 18px rgba(255, 138, 0, 0.3);
			}
		}

		.rank-header {
			display: flex;
			font-size: 12px;
			color: #999;
			padding: 0 6px 8px;
			border-bottom: 1px solid #f0f0f0;

			.col-rank {
				width: 60px;
			}

			.col-name {
				flex: 1;
			}

			.col-score,
			.col-time {
				width: 70px;
				text-align: right;
			}
		}

		.rank-list {
			margin-top: 8px;
			flex: 1;

			.rank-row {
				display: flex;
				align-items: center;
				padding: 10px 6px;
				border-bottom: 1px solid #f6f6f6;

				&:last-child {
					border-bottom: none;
				}

				.rank-badge {
					width: 60px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					color: #333;
				}

				.rank-name {
					flex: 1;
					font-size: 14px;
					color: #333;
				}

				.rank-score,
				.rank-time {
					width: 70px;
					text-align: right;
					font-size: 14px;
					color: #555;
				}
			}
		}
	}

	.action-bar {
		margin-top: 20px;

		.cta-btn {
			width: 100%;
			background: linear-gradient(90deg, #ff9330, #ff6b00);
			color: #fff;
			border: none;
			border-radius: 999px;
			padding: 14px 0;
			font-size: 16px;
			box-shadow: 0 12px 24px rgba(255, 111, 0, 0.35);
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

.medal-badge {
	width: 36px;
	height: 36px;
	border-radius: 50%;
}

.medal-gold {
	background: radial-gradient(circle at 30% 30%, #fff4ce, #ffb703);
	box-shadow: 0 6px 12px rgba(255, 183, 3, 0.4);
}

.medal-silver {
	background: radial-gradient(circle at 30% 30%, #ffffff, #bfc4ce);
	box-shadow: 0 6px 12px rgba(191, 196, 206, 0.4);
}

.medal-bronze {
	background: radial-gradient(circle at 30% 30%, #ffe4c4, #c57a3d);
	box-shadow: 0 6px 12px rgba(197, 122, 61, 0.4);
}
</style>


