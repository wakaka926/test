<template>
	<view class="recharge-container">
		<!-- 标题 -->
		<view class="header-section">
			<text class="title">会员充值</text>
		</view>

		<!-- 会员卡片 -->
		<view class="vip-card">
			<view class="vip-left">
				<text class="vip-badge">VIP会员</text>
				<image class="vip-icon" src="/static/logo.png" mode="aspectFit"></image>
			</view>
			<view class="vip-right">
				<text class="amount-label">充值金额</text>
				<text class="amount-value">18元</text>
			</view>
		</view>

		<!-- 科目信息 -->
		<view class="subject-info">
			<text class="row">充值科目：{{ subject }}</text>
			<text class="row">有效期至：{{ expiry }}</text>
		</view>

		<!-- 支付方式 -->
		<view class="pay-section">
			<text class="pay-title">充值方式</text>
			<view class="pay-item">
				<view class="iconfont icon-wechat text-green"></view>
				<text class="pay-text">微信支付</text>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action">
			<button class="btn-pay cu-btn block bg-blue round" @click="payNow">立即充值</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	const subject = ref('')
	const expiry = ref('2025-09-25')

onLoad((opts)=>{
	subject.value = decodeURIComponent(opts?.subject || '低压电工作业')
})

async function payNow(){
	try {
		uni.showLoading({ title: '处理中...' })
		// 1) 向后端创建订单，获取微信支付参数
		const orderResp = await uni.request({
			url: '/api/pay/unifiedOrder',
			method: 'POST',
			data: {
				subject: subject.value,
				amount: 18, // 单位：元
				productType: 'VIP',
				payChannel: 'WECHAT_MP'
			}
		})
		const payData = (orderResp.data && (orderResp.data.data || orderResp.data)) || {}
		// 2) 拉起微信支付
		await new Promise((resolve, reject) => {
			uni.requestPayment({
				provider: 'wxpay',
				timeStamp: payData.timeStamp,
				nonceStr: payData.nonceStr,
				package: payData.package,
				signType: payData.signType || 'MD5',
				paySign: payData.paySign,
				success: () => resolve(true),
				fail: (err) => reject(err)
			})
		})
		uni.hideLoading()
		uni.showToast({ title: '支付成功', icon: 'success' })
		setTimeout(()=>{ uni.navigateBack({ delta: 1 }) }, 800)
	} catch (err) {
		uni.hideLoading()
		uni.showToast({ title: err?.errMsg || '支付失败', icon: 'none' })
	}
}
</script>

<style lang="scss" scoped>
	page { background: #f5f6f7; }
	.recharge-container { padding-bottom: 20px; }

	.header-section {
		background: #ffffff;
		padding: 15px;
		text-align: center;
		.title { font-size: 16px; font-weight: bold; color: #333; }
	}

	.vip-card {
		margin: 10px 15px;
		background: #e6f0ff;
		border-radius: 10px;
		padding: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.vip-left { display: flex; align-items: center; }
		.vip-badge { background:#2f80ed; color:#fff; padding:4px 8px; border-radius: 6px; font-size: 12px; }
		.vip-icon { width: 40px; height: 40px; margin-left: 10px; border-radius: 8px; background:#fff; }

		.amount-label { font-size: 12px; color: #333; }
		.amount-value { display: block; font-size: 20px; font-weight: bold; color:#2f80ed; }
	}

	.subject-info {
		margin: 10px 15px;
		background: #ffffff;
		border-radius: 8px;
		padding: 12px;
		.row { display:block; font-size: 14px; color:#333; line-height: 22px; }
	}

	.pay-section {
		margin: 10px 15px;
		background: #ffffff;
		border-radius: 8px;
		padding: 12px;
		.pay-title { display:block; font-size: 14px; color:#333; margin-bottom:8px; }
		.pay-item { display:flex; align-items:center; background:#f8f9fa; border-radius:8px; padding:10px; }
		.iconfont { font-size: 20px; margin-right: 8px; }
		.pay-text { font-size: 14px; color:#333; }
	}

	.action { margin: 20px 15px; text-align: center; }
	.btn-pay { height: 44px; }
</style>

