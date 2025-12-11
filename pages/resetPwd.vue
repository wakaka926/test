<template>
	<view class="normal-login-container">
		<view class="login-form-content">
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<input v-model="resetForm.username" class="input" type="text" placeholder="姓名" maxlength="30" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="resetForm.idNumber" type="text" class="input" placeholder="身份证号码" maxlength="20" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="resetForm.password" type="password" class="input" placeholder="设置新密码"
					maxlength="20" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="resetForm.confirmPassword" type="password" class="input" placeholder="重复新密码"
					maxlength="20" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<input v-model="resetForm.phoneNumber" class="input" type="text" placeholder="手机号码" maxlength="30" />
			</view>
			<view class="input-item flex align-center sms-container">
				<view class="iconfont icon-code icon"></view>
				<input v-model="resetForm.smsCode" type="number" class="input" placeholder="请输入短信验证码" maxlength="6" />
				<view class="sms-code-btn" @click="sendSmsCode" :class="{ disabled: smsCountdown > 0 }">
					<text class="sms-text">{{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}</text>
				</view>
			</view>
			<view class="action-btn">
				<button @click="handleRegister()" class="register-btn cu-btn block bg-blue lg round">提交</button>
			</view>
		</view>
		<view class="xieyi text-center">
			<text @click="handleUserLogin" class="text-blue">使用已有账号登录</text>
		</view>
	</view>
</template>

<script setup>
	import {
		getCodeImg,
		register
	} from '@/api/login'
	import {
		ref,
		getCurrentInstance
	} from "vue"
	import {
		useConfigStore
	} from '@/store'

	const {
		proxy
	} = getCurrentInstance()
	const globalConfig = useConfigStore().config
	
	// 短信验证码倒计时
	const smsCountdown = ref(0)
	let smsTimer = null
	
	const resetForm = ref({
		username: "",
		idNumber: "",
		password: "",
		confirmPassword: "",
		phoneNumber: "",
		smsCode: ""
	})

	// 用户登录
	function handleUserLogin() {
		proxy.$tab.navigateTo(`/pages/login`)
	}

	// 验证手机号格式
	function validatePhone(phone) {
		const phoneRegex = /^1[3-9]\d{9}$/
		return phoneRegex.test(phone)
	}

	// 发送短信验证码
	async function sendSmsCode() {
		if (smsCountdown.value > 0) return

		if (!resetForm.value.phoneNumber) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
			return
		}

		if (!validatePhone(resetForm.value.phoneNumber)) {
			uni.showToast({
				title: '请输入正确的手机号',
				icon: 'none'
			})
			return
		}

		try {
			uni.showLoading({
				title: '发送中...'
			})

			// 调用发送短信验证码API
			const response = await uni.request({
				url: '/api/user/sendSmsCode',
				method: 'POST',
				data: {
					phone: resetForm.value.phoneNumber,
					type: 'resetPassword' // 标识这是重置密码的验证码
				}
			})

			uni.hideLoading()

			if (response.data.success) {
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				})
				// 开始倒计时
				startSmsCountdown()
			} else {
				uni.showToast({
					title: response.data.message || '发送失败',
					icon: 'error'
				})
			}
		} catch (error) {
			uni.hideLoading()
			console.error('发送短信验证码失败:', error)
			uni.showToast({
				title: '发送失败，请重试',
				icon: 'error'
			})
		}
	}

	// 开始短信验证码倒计时
	function startSmsCountdown() {
		smsCountdown.value = 60
		smsTimer = setInterval(() => {
			smsCountdown.value--
			if (smsCountdown.value <= 0) {
				clearInterval(smsTimer)
				smsTimer = null
			}
		}, 1000)
	}

	// 重置密码方法
	async function handleRegister() {
		if (resetForm.value.username === "") {
			uni.showToast({
				title: '请输入姓名',
				icon: 'none'
			})
		} else if (resetForm.value.idNumber === "") {
			uni.showToast({
				title: '请输入身份证号码',
				icon: 'none'
			})
		} else if (resetForm.value.password === "") {
			uni.showToast({
				title: '请输入新密码',
				icon: 'none'
			})
		} else if (resetForm.value.confirmPassword === "") {
			uni.showToast({
				title: '请再次输入新密码',
				icon: 'none'
			})
		} else if (resetForm.value.password !== resetForm.value.confirmPassword) {
			uni.showToast({
				title: '两次输入的密码不一致',
				icon: 'none'
			})
		} else if (resetForm.value.phoneNumber === "") {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
		} else if (!validatePhone(resetForm.value.phoneNumber)) {
			uni.showToast({
				title: '请输入正确的手机号',
				icon: 'none'
			})
		} else if (resetForm.value.smsCode === "") {
			uni.showToast({
				title: '请输入短信验证码',
				icon: 'none'
			})
		} else {
			uni.showLoading({
				title: '重置中，请耐心等待...'
			})
			resetPassword()
		}
	}

	// 重置密码
	async function resetPassword() {
		try {
			// 调用重置密码API
			const response = await uni.request({
				url: '/api/user/resetPassword',
				method: 'POST',
				data: {
					username: resetForm.value.username,
					idNumber: resetForm.value.idNumber,
					phone: resetForm.value.phoneNumber,
					smsCode: resetForm.value.smsCode,
					newPassword: resetForm.value.password
				}
			})

			uni.hideLoading()

			if (response.data.success) {
				uni.showModal({
					title: "系统提示",
					content: "密码重置成功！请使用新密码登录。",
					success: function(res) {
						if (res.confirm) {
							uni.redirectTo({
								url: `/pages/login`
							})
						}
					}
				})
			} else {
				uni.showToast({
					title: response.data.message || '重置失败',
					icon: 'error'
				})
			}
		} catch (error) {
			uni.hideLoading()
			console.error('重置密码失败:', error)
			uni.showToast({
				title: '重置失败，请重试',
				icon: 'error'
			})
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #ffffff;
	}

	.normal-login-container {
		width: 100%;

		.logo-content {
			width: 100%;
			font-size: 21px;
			text-align: center;
			padding-top: 15%;

			image {
				border-radius: 4px;
			}

			.title {
				margin-left: 10px;
			}
		}

		.login-form-content {
			text-align: center;
			margin: 20px auto;
			margin-top: 15%;
			width: 80%;

			.input-item {
				margin: 20px auto;
				background-color: #f5f6f7;
				height: 45px;
				border-radius: 20px;

				.icon {
					font-size: 38rpx;
					margin-left: 10px;
					color: #999;
				}

				.input {
					width: 100%;
					font-size: 14px;
					line-height: 20px;
					text-align: left;
					padding-left: 15px;
				}

			}

			.register-btn {
				margin-top: 40px;
				height: 45px;
			}

			.xieyi {
				color: #333;
				margin-top: 20px;
			}

			.sms-container {
				position: relative;
				
				.input {
					padding-right: 100px; // 为按钮留出空间
				}
				
				.sms-code-btn {
					position: absolute;
					right: 5px;
					top: 50%;
					transform: translateY(-50%);
					background-color: #007aff;
					border-radius: 15px;
					padding: 6px 12px;
					cursor: pointer;
					transition: all 0.3s ease;
					height: 32px;
					display: flex;
					align-items: center;
					justify-content: center;
					min-width: 80px;

					&.disabled {
						background-color: #ccc;
						cursor: not-allowed;
					}

					&:not(.disabled):active {
						transform: translateY(-50%) scale(0.95);
					}
					
					.sms-text {
						font-size: 12px;
						color: #ffffff;
						font-weight: bold;
						white-space: nowrap;
					}
				}
			}
		}
	}
</style>