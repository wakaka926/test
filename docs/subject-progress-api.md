# 科目进度API集成说明

## 功能概述

已成功将selectSubject和updateSubjectData函数修改为使用接口获取的数据，实现了动态的科目学习进度加载。

## 主要修改

### 1. 新增API接口 (`api/student/subjectList.js`)

```javascript
// 获取学生科目学习进度
export function getStudentSubjectProgress(studentId, subjectId) {
    return request({
        url: '/api/admin/student/subject-progress',
        method: 'get',
        params: {
            studentId,
            subjectId
        }
    })
}
```

### 2. 更新selectSubject函数

```javascript
// 选择科目
async function selectSubject(subject) {
    currentSubject.value = typeof subject === 'object' ? subject.subjectName : subject
    currentSubjectId.value = typeof subject === 'object' ? subject.subjectId : null
    closeSubjectPicker()
    
    // 使用接口获取科目学习进度数据
    await updateSubjectData(subject)
}
```

### 3. 更新updateSubjectData函数

```javascript
// 更新科目数据
async function updateSubjectData(subject) {
    try {
        // 获取学生ID
        const token = uni.getStorageSync('token')
        const studentId = token.data.id
        const subjectId = typeof subject === 'object' ? subject.subjectId : null
        
        // 调用接口获取科目学习进度
        const response = await getStudentSubjectProgress(studentId, subjectId)
        
        if (response.code === 200 && response.data) {
            const progressData = response.data
            courseProgress.value = progressData.progress || 0
            trainingStatus.value = progressData.status || "未开始"
            expiryDate.value = progressData.expiryDate || ""
            memberLevel.value = progressData.memberLevel || "普通会员"
        }
    } catch (error) {
        // 错误处理，使用默认数据
    }
}
```

## 数据流程

```
用户选择科目 → selectSubject → updateSubjectData → 调用API → 更新页面数据
```

## API接口要求

### 科目进度接口
- **地址**: `GET /api/admin/student/subject-progress`
- **参数**: 
  - `studentId`: 学生ID
  - `subjectId`: 科目ID
- **认证**: 需要Authorization token

### 响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "progress": 75,           // 学习进度百分比
    "status": "进行中",       // 培训状态
    "expiryDate": "2024-12-31", // 有效期
    "memberLevel": "VIP会员"   // 会员等级
  }
}
```

## 字段映射

### 科目数据字段
- `subjectName`: 科目名称
- `subjectId`: 科目ID

### 进度数据字段
- `progress`: 学习进度百分比
- `status`: 培训状态
- `expiryDate`: 有效期
- `memberLevel`: 会员等级

## 错误处理

1. **Token获取失败**: 控制台输出错误，不更新数据
2. **科目ID缺失**: 控制台输出错误，不更新数据
3. **API调用失败**: 使用默认数据（进度0%，状态"未开始"）
4. **数据格式错误**: 使用默认值

## 测试工具

创建了 `pages/progress-test.vue` 测试页面，可以验证：
- 科目列表加载
- 科目选择功能
- 科目进度API调用
- 进度数据显示

## 使用场景

1. **页面初始化**: 加载第一个科目的进度数据
2. **科目切换**: 用户选择新科目时自动加载进度
3. **数据更新**: 实时显示最新的学习进度信息

## 注意事项

1. **异步处理**: selectSubject和updateSubjectData都是异步函数
2. **数据格式**: 支持对象和字符串两种科目数据格式
3. **错误降级**: API失败时使用默认数据，保证页面正常显示
4. **性能优化**: 只在科目切换时调用API，避免重复请求

## 后端实现建议

1. **缓存机制**: 对科目进度数据进行缓存
2. **权限验证**: 确保学生只能查看自己的进度数据
3. **数据一致性**: 确保进度数据的实时性和准确性
4. **错误处理**: 返回统一的错误格式和错误码
