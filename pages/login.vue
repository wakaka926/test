<template>
	<view class="normal-login-container">
		<view class="logo-content align-center justify-center flex">
			<text class="title">在线学习模拟平台</text>
		</view>
		<view class="login-form-content">
			<view class="input-item flex align-center">
				<view class="iconfont icon-user icon"></view>
				<input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30" />
			</view>
			<view class="input-item flex align-center">
				<view class="iconfont icon-password icon"></view>
				<input v-model="loginForm.password" type="password" class="input" placeholder="请输入密码" maxlength="20" />
			</view>
			<view class="input-item flex align-center" style="width: 60%;margin: 0px;" v-if="captchaEnabled">
				<view class="iconfont icon-code icon"></view>
				<input v-model="loginForm.code" type="number" class="input" placeholder="请输入验证码" maxlength="4" />
				<view class="login-code">
					<image :src="codeUrl" @click="getCode" class="login-code-img"></image>
				</view>
			</view>
			<view class="action-btn">
				<button @tap="handleLogin" open-type="getUserInfo"
					class="login-btn cu-btn block bg-blue lg round">登录</button>
			</view>
		</view>

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
		getCodeImg
	} from '@/api/login'
	import {
		useConfigStore,
		useUserStore
	} from '@/store'
	const {
		proxy
	} = getCurrentInstance()
	const globalConfig = useConfigStore().config
	const codeUrl = ref("")
	// 验证码开关
	const captchaEnabled = ref(true)
	// 用户注册开关
	const register = ref(false)
	const loginForm = ref({
		username: "admin",
		password: "admin123",
		code: "",
		uuid: ""
	})

	// 用户注册
	function handleUserRegister() {
		proxy.$tab.redirectTo(`/pages/register`)
	}

	// 隐私协议
	function handlePrivacy() {
		let site = globalConfig.appInfo.agreements[0]
		proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
	}

	// 用户协议
	function handleUserAgrement() {
		let site = globalConfig.appInfo.agreements[1]
		proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
	}

	// 获取图形验证码
	function getCode() {
		getCodeImg().then(res => {
			captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
			if (captchaEnabled.value) {
				codeUrl.value = 'data:image/gif;base64,' + res.img
				loginForm.value.uuid = res.uuid
			}
		})
	}

	async function weixinLogin() {
		let that = this;
		await uni.login({
			provider: 'weixin',
			success: function(resp) {
				let code = resp.code;
				that.code = code
				const res = uni.request({
					url: 'http://192.168.28.35:8001/api/wx/login',
					method: 'GET',
					data: {
						code
					}
				});
			}
		});
		// 获取用户信息
		await uni.getUserProfile({
			desc: '获取你的昵称、头像、地区及性别',
			success: res => {
				console.log('获取你的昵称、头像', res);
				// 登录请求
				// api.apiPost("/api/member/wechatappauth", {
				// 	jscode: jsCode,
				// 	jscodeinfo:res
				// }, (res1) => {
				// 	console.log(res1)
				// 	if (res1.code == 0) {
				// 	} else {
				// 		uni.showModal({
				// 			title: '登录失败',
				// 			content: '请刷新小程序后重新操作',
				// 		});
				// 	}
				// })
			},
			fail: res => {
				console.log(2);
				console.log(res)
				//拒绝授权
				uni.showToast({
					title: '您拒绝了请求,不能正常使用小程序',
					icon: 'error',
					duration: 2000
				});
				return;
			}
		});

	}


	// 登录方法
	async function handleLogin() {
		proxy.$modal.confirm('首次登陆请绑定微信',weixinLogin())
		if (loginForm.value.username === "") {
			proxy.$modal.msgError("请输入账号")
		} else if (loginForm.value.password === "") {
			proxy.$modal.msgError("请输入密码")
		} else if (loginForm.value.code === "" && captchaEnabled.value) {
			proxy.$modal.msgError("请输入验证码")
		} else {
			proxy.$modal.loading("登录中，请耐心等待...")
			pwdLogin()
		}
	}

	// 密码登录
	async function pwdLogin() {
		useUserStore().login(loginForm.value).then(() => {
			proxy.$modal.closeLoading()
			loginSuccess()
		}).catch(() => {
			if (captchaEnabled.value) {
				getCode()
			}
		})
	}

	// 登录成功后，处理函数
	function loginSuccess(result) {
		// 设置用户信息
		useUserStore().getInfo().then(res => {
			proxy.$tab.reLaunch('/pages/home')
		})
	}

	onLoad(() => {
		//#ifdef H5
		if (getToken()) {
			proxy.$tab.reLaunch('/pages/home')
		}
		//#endif
	})

	getCode()
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

			.login-btn {
				margin-top: 40px;
				height: 45px;
			}

			.reg {
				margin-top: 15px;
			}

			.xieyi {
				color: #333;
				margin-top: 20px;
			}

			.login-code {
				height: 38px;
				float: right;

				.login-code-img {
					height: 38px;
					position: absolute;
					margin-left: 10px;
					width: 200rpx;
				}
			}
		}
	}
</style>