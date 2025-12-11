# 日期转换工具说明

## 功能概述

创建了完整的日期转换工具库，支持多种日期格式的转换，特别针对expiryDate字段转换为"2025-10-23 22:04:00"格式。

## 工具函数

### 1. 核心转换函数

#### formatDate(dateInput, format)
- **功能**: 将日期转换为指定格式
- **参数**: 
  - `dateInput`: 输入的日期（字符串、Date对象或时间戳）
  - `format`: 目标格式，默认为 'YYYY-MM-DD HH:mm:ss'
- **返回**: 格式化后的日期字符串

#### formatDateTime(dateInput)
- **功能**: 将日期转换为标准格式 YYYY-MM-DD HH:mm:ss
- **参数**: `dateInput` - 输入的日期
- **返回**: 格式化后的日期字符串

### 2. 专用格式函数

#### formatDateOnly(dateInput)
- **功能**: 转换为日期格式 YYYY-MM-DD
- **用途**: 仅显示日期部分

#### formatTimeOnly(dateInput)
- **功能**: 转换为时间格式 HH:mm:ss
- **用途**: 仅显示时间部分

#### formatDateChinese(dateInput)
- **功能**: 转换为中文格式
- **示例**: "2025年10月23日 22:04:00"

### 3. 实用工具函数

#### getRelativeTime(dateInput)
- **功能**: 获取相对时间描述
- **示例**: "3天后", "2小时前", "刚刚"

#### isExpired(dateInput)
- **功能**: 检查日期是否过期
- **返回**: boolean值

## 支持的输入格式

1. **ISO字符串**: "2025-10-23T22:04:00.000Z"
2. **标准字符串**: "2025-10-23 22:04:00"
3. **时间戳**: 1732301040000
4. **Date对象**: new Date()
5. **其他格式**: 自动解析

## 在home.vue中的应用

### 导入工具函数
```javascript
import { formatDateTime } from '@/utils/dateFormat'
```

### 使用示例
```javascript
// 在updateSubjectDataFromList函数中
expiryDate.value = formatDateTime(subject.validUntil) || ""
```

## 测试工具

创建了 `pages/date-test.vue` 测试页面，包含：

1. **输入测试**: 手动输入日期进行转换
2. **预设测试**: 使用当前时间、时间戳、日期字符串
3. **示例数据**: 多种格式的示例数据
4. **结果展示**: 显示所有格式的转换结果

## 使用示例

### 基本用法
```javascript
import { formatDateTime, formatDateOnly, getRelativeTime } from '@/utils/dateFormat'

// 标准格式
const dateTime = formatDateTime('2025-10-23T22:04:00.000Z')
// 结果: "2025-10-23 22:04:00"

// 仅日期
const dateOnly = formatDateOnly(new Date())
// 结果: "2025-01-15"

// 相对时间
const relative = getRelativeTime('2025-12-31 23:59:59')
// 结果: "350天后"
```

### 在组件中使用
```javascript
// 格式化显示
const displayDate = formatDateTime(expiryDate.value)

// 检查是否过期
if (isExpired(expiryDate.value)) {
  // 处理过期逻辑
}
```

## 错误处理

1. **无效输入**: 返回空字符串
2. **格式错误**: 自动尝试解析
3. **类型检查**: 支持多种输入类型
4. **边界情况**: 处理null、undefined等

## 性能优化

1. **类型检测**: 快速判断输入类型
2. **缓存机制**: 避免重复计算
3. **原生方法**: 使用原生Date对象方法
4. **最小化操作**: 减少不必要的字符串操作

## 扩展性

工具函数设计为可扩展的，可以轻松添加新的格式：

```javascript
// 添加新格式
export function formatCustom(dateInput) {
  return formatDate(dateInput, 'YYYY/MM/DD HH:mm')
}
```

## 注意事项

1. **时区处理**: 使用本地时区
2. **格式一致性**: 确保输出格式统一
3. **性能考虑**: 避免频繁调用
4. **错误处理**: 提供合理的默认值

## 测试建议

1. **边界测试**: 测试各种输入格式
2. **错误测试**: 测试无效输入
3. **性能测试**: 测试大量数据转换
4. **兼容性测试**: 测试不同环境下的表现
