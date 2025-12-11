# 前端后端接口集成说明

## 配置说明

### 1. 后端地址配置
在 `config.js` 文件中已经将后端地址配置为本地SpringBoot项目：
```javascript
export default {
  baseUrl: 'http://localhost:8080',  // 本地SpringBoot后端地址
  // 其他配置...
}
```

### 2. API接口文件
已创建 `api/study/record.js` 文件，包含以下接口：

- `getStudyStats(subjectId)` - 获取学习统计信息
- `getExamRecords(params)` - 获取考试记录列表
- `getExamDetail(examId)` - 获取考试详情
- `getWrongQuestions(params)` - 获取错题记录
- `getSubjectList()` - 获取科目列表
- `getMonthlyRanking(subjectId, month)` - 获取月度排名

### 3. 页面集成
`pages/studyRecord.vue` 页面已经集成了真实的API接口：

- ✅ 动态加载科目信息
- ✅ 获取统计数据（最高分、平均分、月度排名、模拟次数）
- ✅ 分页加载考试记录
- ✅ 筛选功能（全部/错题）
- ✅ 加载状态和错误处理
- ✅ 空状态显示

## 使用方法

### 1. 启动后端服务
确保SpringBoot后端服务运行在 `http://localhost:10005`

### 2. 实现后端接口
参考 `docs/backend-api.md` 文档实现对应的SpringBoot接口

### 3. 测试接口
可以使用 `pages/api-test.vue` 页面测试API接口是否正常工作

### 4. 访问学习记录页面
```javascript
// 跳转到学习记录页面
uni.navigateTo({
  url: '/pages/studyRecord?subjectId=1&subjectName=低压电工作业'
})
```

## 接口数据结构

### 统计数据响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "highestScore": 95,
    "averageScore": 78,
    "monthlyRank": 15,
    "practiceCount": 12
  }
}
```

### 考试记录响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 50,
    "records": [
      {
        "id": 1,
        "name": "低压电工作业模拟考试（一）",
        "score": 95,
        "date": "2024-01-15 14:30:00",
        "type": "all"
      }
    ]
  }
}
```

## 错误处理

页面已集成完整的错误处理机制：

1. **网络错误**: 显示"后端接口连接异常"
2. **超时错误**: 显示"系统接口请求超时"
3. **业务错误**: 显示后端返回的错误信息
4. **加载状态**: 显示加载中状态
5. **空状态**: 显示"暂无考试记录"

## 注意事项

1. **跨域问题**: 确保SpringBoot后端配置了CORS支持
2. **认证问题**: 接口可能需要用户认证，确保token正确传递
3. **数据格式**: 确保后端返回的数据格式与前端期望一致
4. **分页处理**: 考试记录支持分页加载，避免一次性加载大量数据

## 开发建议

1. **接口测试**: 使用Postman或类似工具先测试后端接口
2. **数据模拟**: 可以先在后端返回模拟数据，确保前端功能正常
3. **错误调试**: 查看浏览器控制台和uni-app调试工具的错误信息
4. **性能优化**: 考虑使用缓存减少重复请求
