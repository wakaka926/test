<template>
	<view class="login-wx-container">
		<view class="logo-content align-center justify-center flex">
			<image src="/static/logo.png" class="logo-image" mode="aspectFit"></image>
			<text class="title">在线学习模拟平台</text>
		</view>
		<view class="login-form-content">
			<!-- 登录方式切换 -->
			<view class="login-type-switch">
				<view 
					class="switch-item" 
					:class="{ active: loginType === 'account' }" 
					@click="switchLoginType('account')"
				>
					<text class="switch-text">账号密码登录</text>
				</view>
				<view 
					class="switch-item" 
					:class="{ active: loginType === 'phone' }" 
					@click="switchLoginType('phone')"
				>
					<text class="switch-text">手机号登录</text>
				</view>
			</view>

			<!-- 账号密码登录表单 -->
			<view v-if="loginType === 'account'" class="login-form">
				<view class="input-item flex align-center">
					<view class="iconfont icon-user icon"></view>
					<input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
				</view>
				<view class="input-item flex align-center">
					<view class="iconfont icon-password icon"></view>
					<input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
				</view>
				<view class="input-item flex align-center captcha-container">
					<view class="iconfont icon-code icon"></view>
					<input v-model="loginForm.code" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
					<view class="captcha-code" @click="generateCaptcha">
						<text class="captcha-text">{{ captchaCode }}</text>
					</view>
				</view>
			</view>

			<!-- 手机号登录表单 -->
			<view v-if="loginType === 'phone'" class="login-form">
				<view class="input-item flex align-center">
					<view class="iconfont icon-phone icon"></view>
					<input v-model="phoneForm.phone" class="input" type="number" placeholder="请输入手机号" maxlength="11" />
				</view>
				<view class="input-item flex align-center sms-container">
					<view class="iconfont icon-code icon"></view>
					<input v-model="phoneForm.smsCode" type="number" class="input" placeholder="请输入短信验证码" maxlength="6" />
					<view class="sms-code-btn" @click="sendSmsCode" :class="{ disabled: smsCountdown > 0 }">
						<text class="sms-text">{{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}</text>
					</view>
				</view>
			</view>

			<view class="action-btn">
				<button @tap="handleLogin" class="login-btn cu-btn block bg-blue lg round">登录</button>
			</view>

			<!-- 注册和忘记密码链接 -->
			<view class="bottom-links">
				<view class="link-item left-link" @click="handleRegister">
					<text class="link-text">注册账号</text>
				</view>
				<view class="link-item right-link" @click="handleForgotPassword">
					<text class="link-text">忘记密码？</text>
				</view>
			</view>
		</view>
		<uni-popup ref="bindWechatPopup" type="center">
			<view class="bind-popup-content">
				<view class="bind-popup-header">
					<text class="bind-popup-title">提示</text>
				</view>
				<view class="bind-popup-body">
					<text class="bind-tip">首次登录请绑定微信</text>
					<button class="bind-btn cu-btn bg-blue round" @tap="confirmBindWechat">确认绑定</button>
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
	import {
		onLoad
	} from "@dcloudio/uni-app"
	import {
		getToken
	} from '@/utils/auth'
	import {
		useConfigStore,
		useUserStore
	} from '@/store'

	const {
		proxy
	} = getCurrentInstance()
	const globalConfig = useConfigStore().config

	// 验证码相关
	const captchaCode = ref("")
	const bindWechatPopup = ref(null)

	// 登录方式
	const loginType = ref("account") // 默认账号密码登录

	// 账号密码登录表单
	const loginForm = ref({
		username: "lisi",
		password: "123456",
		code: ""
	})

	// 手机号登录表单
	const phoneForm = ref({
		phone: "",
		smsCode: ""
	})

	// 短信验证码倒计时
	const smsCountdown = ref(0)
	let smsTimer = null

	// 生成随机四位数字验证码
	function generateCaptcha() {
		captchaCode.value = Math.floor(1000 + Math.random() * 9000).toString()
	}

	// 切换登录方式
	function switchLoginType(type) {
		loginType.value = type
		// 清空表单数据，但保持默认账户密码
		if (type === 'account') {
			phoneForm.value = { phone: "", smsCode: "" }
			// 恢复默认账户密码
			loginForm.value = { username: "lisi", password: "123456", code: "" }
		} else {
			loginForm.value = { username: "", password: "", code: "" }
		}
	}

	// 验证手机号格式
	function validatePhone(phone) {
		const phoneRegex = /^1[3-9]\d{9}$/
		return phoneRegex.test(phone)
	}

	// 发送短信验证码
	async function sendSmsCode() {
		if (smsCountdown.value > 0) return

		if (!phoneForm.value.phone) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
			return
		}

		if (!validatePhone(phoneForm.value.phone)) {
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
					phone: phoneForm.value.phone
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

	// 注册账号
	function handleRegister() {
		uni.navigateTo({
			url: '/pages/register'
		})
	}

	// 忘记密码
	function handleForgotPassword() {
		uni.navigateTo({
			url: '/pages/resetPwd'
		})
	}

	// 检查账号是否绑定微信
	async function checkWechatBinding(username) {
		// 模拟已绑定微信，直接返回true，跳过微信绑定流程
		return true
		
		// 实际项目中的API调用代码（已注释）
		// try {
		// 	const response = await uni.request({
		// 		url: '/api/user/checkWechatBinding',
		// 		method: 'POST',
		// 		data: {
		// 			username
		// 		}
		// 	})
		// 	return response.data.isBound
		// } catch (error) {
		// 	console.error('检查微信绑定状态失败:', error)
		// 	return false
		// }
	}

	// 绑定微信账号
	async function bindWechatAccount(username) {
		try {
			// 获取微信登录code
			const loginRes = await uni.login({
				provider: 'weixin'
			})

			// 获取用户信息
			const userInfoRes = await uni.getUserProfile({
				desc: '用于绑定微信账号'
			})

			// 调用后端API绑定微信
			const response = await uni.request({
				url: '/api/user/bindWechat',
				method: 'POST',
				data: {
					username: username,
					code: loginRes.code,
					userInfo: userInfoRes.userInfo
				}
			})

			if (response.data.success) {
				uni.showToast({
					title: '微信绑定成功',
					icon: 'success'
				})
				return true
			} else {
				uni.showToast({
					title: '微信绑定失败',
					icon: 'error'
				})
				return false
			}
		} catch (error) {
			console.error('绑定微信失败:', error)
			uni.showToast({
				title: '绑定微信失败，请重试',
				icon: 'error'
			})
			return false
		}
	}


	// 确认绑定微信
	async function confirmBindWechat() {
		const success = await bindWechatAccount(loginForm.value.username)
		if (success) {
			bindWechatPopup.value.close()
			// 绑定成功后继续登录流程
			await performLogin()
		}
	}

	// 登录方法
	async function handleLogin() {
		if (loginType.value === 'account') {
			// 账号密码登录验证
			if (loginForm.value.username === "") {
				uni.showToast({
					title: '请输入账号',
					icon: 'none'
				})
				return
			} else if (loginForm.value.password === "") {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				})
				return
			} else if (loginForm.value.code === "") {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				})
				return
			} else if (loginForm.value.code !== captchaCode.value) {
				uni.showToast({
					title: '验证码错误',
					icon: 'none'
				})
				generateCaptcha() // 重新生成验证码
				return
			}

			// 检查账号是否绑定微信
			const isWechatBound = await checkWechatBinding(loginForm.value.username)

			if (!isWechatBound) {
				// 未绑定微信，显示绑定弹窗
				bindWechatPopup.value.open()
			} else {
				// 已绑定微信，直接登录
				await performLogin()
			}
		} else {
			// 手机号登录验证
			if (phoneForm.value.phone === "") {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				})
				return
			} else if (!validatePhone(phoneForm.value.phone)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
				return
			} else if (phoneForm.value.smsCode === "") {
				uni.showToast({
					title: '请输入短信验证码',
					icon: 'none'
				})
				return
			}

			// 直接执行手机号登录
			await performPhoneLogin()
		}
	}

	// 执行账号密码登录
	async function performLogin() {
		uni.showLoading({
			title: '登录中...'
		})

		try {
			// 模拟登录成功
			// setTimeout(() => {
			// 	uni.hideLoading()
			// 	uni.showToast({
			// 		title: '登录成功',
			// 		icon: 'success'
			// 	})

			// 	// 保存登录信息
			// 	uni.setStorageSync('token', 'mock_token_' + Date.now())
			// 	uni.setStorageSync('userInfo', {
			// 		username: loginForm.value.username,
			// 		loginTime: new Date().toISOString()
			// 	})

			// 	// 跳转到首页
			// 	setTimeout(() => {
			// 		uni.reLaunch({
			// 			url: '/pages/home'
			// 		})
			// 	}, 1500)
			// }, 1000)

			// 实际项目中的API调用代码（已注释）
			const response = await uni.request({
				url: `${globalConfig.baseUrl}/api/auth/studentLogin`,
				method: 'POST',
				data: {
					username: loginForm.value.username,
					password: loginForm.value.password
				}
			})
			console.log(response.statusCode)

			if (response.statusCode === 200) {
				uni.hideLoading()
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})

				// 保存登录信息
				uni.setStorageSync('token', response.data)

				// 跳转到首页
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/home'
					})
				}, 1500)
			} else {
				uni.hideLoading()
				uni.showToast({
					title: response.message || '登录失败',
					icon: 'error'
				})
				generateCaptcha() // 登录失败时重新生成验证码
			}
		} catch (error) {
			uni.hideLoading()
			console.error('登录失败:', error)
			uni.showToast({
				title: '登录失败，请重试',
				icon: 'error'
			})
			generateCaptcha() // 登录失败时重新生成验证码
		}
	}
	
	// 执行手机号登录
	async function performPhoneLogin() {
		uni.showLoading({
			title: '登录中...'
		})

		try {
			// 调用手机号登录API
			const response = await uni.request({
				url: `${globalConfig.baseUrl}/api/auth/phoneLogin`,
				method: 'POST',
				data: {
					phone: phoneForm.value.phone,
					smsCode: phoneForm.value.smsCode
				}
			})

			if (response.code === 200) {
				uni.hideLoading()
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				})

				// 保存登录信息
				uni.setStorageSync('token', response.data)

				// 跳转到首页
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/home'
					})
				}, 1500)
			} else {
				uni.hideLoading()
				uni.showToast({
					title: response.message || '登录失败',
					icon: 'error'
				})
			}
		} catch (error) {
			uni.hideLoading()
			console.error('手机号登录失败:', error)
			uni.showToast({
				title: '登录失败，请重试',
				icon: 'error'
			})
		}
	}

	onLoad(() => {
		// 检查是否已登录
		if (getToken()) {
			uni.reLaunch({
				url: '/pages/home'
			})
		}
		// 初始化时生成验证码
		generateCaptcha()
	})
</script>

<style lang="scss" scoped>
	page {
		background-color: #ffffff;
	}

	.login-wx-container {
		width: 100%;

		.logo-content {
			width: 100%;
			font-size: 21px;
			text-align: center;
			padding-top: 15%;

			.logo-image {
				width: 80px;
				height: 80px;
				border-radius: 4px;
				margin-bottom: 10px;
			}

			.title {
				font-size: 18px;
				font-weight: bold;
				color: #333;
			}
		}

		.login-form-content {
			text-align: center;
			margin: 20px auto;
			margin-top: 15%;
			width: 80%;

			// 登录方式切换样式
			.login-type-switch {
				display: flex;
				background-color: #f5f6f7;
				border-radius: 25px;
				padding: 4px;
				margin-bottom: 30px;
				position: relative;

				.switch-item {
					flex: 1;
					text-align: center;
					padding: 12px 0;
					border-radius: 20px;
					transition: all 0.3s ease;
					cursor: pointer;

					&.active {
						background-color: #007aff;
						box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);

						.switch-text {
							color: #ffffff;
							font-weight: bold;
						}
					}

					.switch-text {
						font-size: 16px;
						color: #666;
						transition: all 0.3s ease;
					}
				}
			}

			.login-form {
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
				}

				.captcha-container {
					.captcha-code {
						position: absolute;
						right: 10px;
						top: 50%;
						transform: translateY(-50%);
						background-color: #f0f0f0;
						border-radius: 4px;
						padding: 5px 10px;
						cursor: pointer;
						
						.captcha-text {
							font-size: 16px;
							font-weight: bold;
							color: #333;
							letter-spacing: 2px;
						}
					}
				}

				.sms-container {
					.sms-code-btn {
						position: absolute;
						right: 10px;
						top: 50%;
						transform: translateY(-50%);
						background-color: #007aff;
						border-radius: 4px;
						padding: 8px 12px;
						cursor: pointer;
						transition: all 0.3s ease;

						&.disabled {
							background-color: #ccc;
							cursor: not-allowed;
						}

						&:not(.disabled):active {
							transform: translateY(-50%) scale(0.95);
						}
						
						.sms-text {
							font-size: 14px;
							color: #ffffff;
							font-weight: bold;
						}
					}
				}
			}

			.login-btn {
				margin-top: 40px;
				height: 45px;
			}

			// 底部链接样式
			.bottom-links {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: 30px;
				padding: 0 10px;

				.link-item {
					.link-text {
						font-size: 14px;
						color: #007aff;
						text-decoration: underline;
						transition: all 0.3s ease;
					}

					&:active .link-text {
						opacity: 0.7;
						transform: scale(0.95);
					}
				}

				.left-link {
					text-align: left;
				}

				.right-link {
					text-align: right;
				}
			}
		}
	}

	.bind-popup-content {
		background-color: #ffffff;
		border-radius: 10px;
		width: 300px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		
		.bind-popup-header {
			background-color: #f8f9fa;
			padding: 15px;
			text-align: center;
			border-bottom: 1px solid #e9ecef;
			
			.bind-popup-title {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
		}
		
		.bind-popup-body {
			padding: 20px;
			text-align: center;
			
			.bind-tip {
				display: block;
				font-size: 14px;
				color: #666;
				margin-bottom: 20px;
				line-height: 1.5;
			}
			
			.bind-btn {
				padding: 12px 30px;
				font-size: 16px;
			}
		}
	}
</style>