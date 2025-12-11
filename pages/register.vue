<template>
	<view class="normal-login-container">
		<view class="login-form-content">
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<input v-model="registerForm.username" class="input" type="text" placeholder="账号" maxlength="30" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="registerForm.password" type="password" class="input" placeholder="密码" maxlength="20" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<input v-model="registerForm.realName" class="input" type="text" placeholder="姓名" maxlength="30" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<picker @change="onGenderChange" :value="genderIndex" :range="genderOptions">
					<view class="picker-input">
						<text class="picker-text">{{ registerForm.gender || '请选择性别' }}</text>
					</view>
				</picker>
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="registerForm.idNumber" type="text" class="input" placeholder="身份证号码" maxlength="20" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-phone icon"></view>
				<input v-model="registerForm.phoneNumber" class="input" type="number" placeholder="手机号码" maxlength="11" />
			</view>
			<view class="input-item flex align-center sms-container">
				<view class="iconfont icon-code icon"></view>
				<input v-model="registerForm.smsCode" type="number" class="input" placeholder="请输入短信验证码" maxlength="6" />
				<view class="sms-code-btn" @click="sendSmsCode" :class="{ disabled: smsCountdown > 0 }">
					<text class="sms-text">{{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}</text>
				</view>
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-email icon"></view>
				<input v-model="registerForm.email" class="input" type="text" placeholder="电子邮箱" maxlength="50" />
			</view>
			<view class="action-btn">
				<button @click="handleRegister()" class="register-btn cu-btn block bg-blue lg round">注册</button>
			</view>
		</view>
		<view class="xieyi text-center">
			<text @click="handleUserLogin" class="text-blue">使用已有账号登录</text>
		</view>
	</view>
</template>

<script setup>
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
	
	// 性别选择
	const genderOptions = ['男', '女']
	const genderIndex = ref(0)
	
	const registerForm = ref({
		username: "",
		password: "",
		realName: "",
		gender: "",
		idNumber: "",
		phoneNumber: "",
		smsCode: "",
		email: ""
	})

	// 性别选择
	function onGenderChange(e) {
		genderIndex.value = e.detail.value
		registerForm.value.gender = genderOptions[e.detail.value]
	}

	// 用户登录
	function handleUserLogin() {
		proxy.$tab.navigateTo(`/pages/loginWx`)
	}

	// 验证手机号格式
	function validatePhone(phone) {
		const phoneRegex = /^1[3-9]\d{9}$/
		return phoneRegex.test(phone)
	}

	// 验证邮箱格式
	function validateEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	// 验证身份证号格式
	function validateIdNumber(idNumber) {
		const idRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
		return idRegex.test(idNumber)
	}

	// 发送短信验证码
	async function sendSmsCode() {
		if (smsCountdown.value > 0) return

		if (!registerForm.value.phoneNumber) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
			return
		}

		if (!validatePhone(registerForm.value.phoneNumber)) {
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
					phone: registerForm.value.phoneNumber,
					type: 'register' // 标识这是注册的验证码
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

	// 注册方法
	async function handleRegister() {
		if (registerForm.value.username === "") {
			uni.showToast({
				title: '请输入账号',
				icon: 'none'
			})
		} else if (registerForm.value.password === "") {
			uni.showToast({
				title: '请输入密码',
				icon: 'none'
			})
		} else if (registerForm.value.realName === "") {
			uni.showToast({
				title: '请输入姓名',
				icon: 'none'
			})
		} else if (registerForm.value.gender === "") {
			uni.showToast({
				title: '请选择性别',
				icon: 'none'
			})
		} else if (registerForm.value.idNumber === "") {
			uni.showToast({
				title: '请输入身份证号码',
				icon: 'none'
			})
		} else if (!validateIdNumber(registerForm.value.idNumber)) {
			uni.showToast({
				title: '请输入正确的身份证号码',
				icon: 'none'
			})
		} else if (registerForm.value.phoneNumber === "") {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
		} else if (!validatePhone(registerForm.value.phoneNumber)) {
			uni.showToast({
				title: '请输入正确的手机号',
				icon: 'none'
			})
		} else if (registerForm.value.smsCode === "") {
			uni.showToast({
				title: '请输入短信验证码',
				icon: 'none'
			})
		} else if (registerForm.value.email === "") {
			uni.showToast({
				title: '请输入电子邮箱',
				icon: 'none'
			})
		} else if (!validateEmail(registerForm.value.email)) {
			uni.showToast({
				title: '请输入正确的电子邮箱',
				icon: 'none'
			})
		} else {
			uni.showLoading({
				title: '注册中，请耐心等待...'
			})
			userRegister()
		}
	}

	// 用户注册
	async function userRegister() {
		try {
			// 调用注册API
			const response = await uni.request({
				url: '/api/user/register',
				method: 'POST',
				data: {
					username: registerForm.value.username,
					password: registerForm.value.password,
					realName: registerForm.value.realName,
					gender: registerForm.value.gender,
					idNumber: registerForm.value.idNumber,
					phone: registerForm.value.phoneNumber,
					smsCode: registerForm.value.smsCode,
					email: registerForm.value.email
				}
			})

			uni.hideLoading()

			if (response.data.success) {
				uni.showModal({
					title: "系统提示",
					content: "恭喜你，您的账号 " + registerForm.value.username + " 注册成功！",
					success: function(res) {
						if (res.confirm) {
							uni.redirectTo({
								url: `/pages/loginWx`
							})
						}
					}
				})
			} else {
				uni.showToast({
					title: response.data.message || '注册失败',
					icon: 'error'
				})
			}
		} catch (error) {
			uni.hideLoading()
			console.error('注册失败:', error)
			uni.showToast({
				title: '注册失败，请重试',
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
				position: relative;

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

				.picker-input {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					padding-left: 15px;

					.picker-text {
						font-size: 14px;
						color: #333;
					}
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
