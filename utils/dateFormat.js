/**
 * 日期格式化工具函数
 */

/**
 * 将日期转换为指定格式
 * @param {string|Date|number} dateInput - 输入的日期（字符串、Date对象或时间戳）
 * @param {string} format - 目标格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateInput, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateInput) {
    return ''
  }

  let date
  
  // 处理不同类型的输入
  if (typeof dateInput === 'string') {
    // 字符串格式
    date = new Date(dateInput)
  } else if (typeof dateInput === 'number') {
    // 时间戳格式
    date = new Date(dateInput)
  } else if (dateInput instanceof Date) {
    // Date对象
    date = dateInput
  } else {
    return ''
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return ''
  }

  // 获取日期各部分
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // 根据格式字符串替换
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 将日期转换为标准格式 YYYY-MM-DD HH:mm:ss
 * @param {string|Date|number} dateInput - 输入的日期
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(dateInput) {
  return formatDate(dateInput, 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 将日期转换为日期格式 YYYY-MM-DD
 * @param {string|Date|number} dateInput - 输入的日期
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateOnly(dateInput) {
  return formatDate(dateInput, 'YYYY-MM-DD')
}

/**
 * 将日期转换为时间格式 HH:mm:ss
 * @param {string|Date|number} dateInput - 输入的日期
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimeOnly(dateInput) {
  return formatDate(dateInput, 'HH:mm:ss')
}

/**
 * 将日期转换为中文格式
 * @param {string|Date|number} dateInput - 输入的日期
 * @returns {string} 中文格式的日期字符串
 */
export function formatDateChinese(dateInput) {
  if (!dateInput) {
    return ''
  }

  let date
  
  if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (dateInput instanceof Date) {
    date = dateInput
  } else {
    return ''
  }

  if (isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`
}

/**
 * 获取相对时间描述
 * @param {string|Date|number} dateInput - 输入的日期
 * @returns {string} 相对时间描述
 */
export function getRelativeTime(dateInput) {
  if (!dateInput) {
    return ''
  }

  let date
  
  if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (dateInput instanceof Date) {
    date = dateInput
  } else {
    return ''
  }

  if (isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}天后`
  } else if (days < 0) {
    return `${Math.abs(days)}天前`
  } else if (hours > 0) {
    return `${hours}小时后`
  } else if (hours < 0) {
    return `${Math.abs(hours)}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟后`
  } else if (minutes < 0) {
    return `${Math.abs(minutes)}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 检查日期是否过期
 * @param {string|Date|number} dateInput - 输入的日期
 * @returns {boolean} 是否过期
 */
export function isExpired(dateInput) {
  if (!dateInput) {
    return false
  }

  let date
  
  if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput)
  } else if (dateInput instanceof Date) {
    date = dateInput
  } else {
    return false
  }

  if (isNaN(date.getTime())) {
    return false
  }

  return date.getTime() < new Date().getTime()
}
