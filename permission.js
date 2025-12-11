import { getToken } from '@/utils/auth'

// 登录页面
const loginPage = "/pages/loginWx"
// 首页
const homePage = "/pages/home"

// 页面白名单
const whiteList = [
  '/pages/login',
  '/pages/loginWx',
  '/pages/register',
  '/pages/resetPwd',
  '/pages/common/webview/index'
]

// 检查地址白名单
function checkWhite(url) {
  const path = url.split('?')[0]
  return whiteList.indexOf(path) !== -1
}

// 页面跳转验证拦截器
// let list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"]
// list.forEach(item => {
//   uni.addInterceptor(item, {
//     invoke(to) {
//       if (True) {
//         // 已登录用户访问登录相关页面时跳转到首页
//         if (to.url === loginPage) {
//           uni.reLaunch({ url: homePage })
//           return false
//         }
//         return true
//       } else {
//         if (checkWhite(to.url)) {
//           return true
//         }
//         uni.reLaunch({ url: loginPage })
//         return false
//       }
//     },
//     fail(err) {
//       console.log(err)
//     }
//   })
// })
