# SpringBoot 后端接口文档

## 学习记录相关接口

### 1. 获取学习统计信息
**接口地址**: `GET /study/stats`
**请求参数**:
```json
{
  "subjectId": "科目ID"
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "highestScore": 95,      // 最高分
    "averageScore": 78,      // 平均分
    "monthlyRank": 15,       // 月度排名
    "practiceCount": 12      // 模拟次数
  }
}
```

### 2. 获取考试记录列表
**接口地址**: `GET /study/exam-records`
**请求参数**:
```json
{
  "subjectId": "科目ID",
  "pageNum": 1,              // 页码
  "pageSize": 10,            // 每页大小
  "type": "all|wrong"        // 类型：all-全部，wrong-错题
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 50,             // 总记录数
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

### 3. 获取考试详情
**接口地址**: `GET /study/exam-detail/{examId}`
**请求参数**: 路径参数 examId

**响应数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "name": "低压电工作业模拟考试（一）",
    "score": 95,
    "date": "2024-01-15 14:30:00",
    "duration": 120,         // 考试时长（分钟）
    "totalQuestions": 100,   // 总题数
    "correctAnswers": 95,    // 正确题数
    "wrongAnswers": 5,       // 错题数
    "details": [             // 题目详情
      {
        "questionId": 1,
        "question": "题目内容",
        "userAnswer": "A",
        "correctAnswer": "A",
        "isCorrect": true
      }
    ]
  }
}
```

### 4. 获取错题记录
**接口地址**: `GET /study/wrong-questions`
**请求参数**:
```json
{
  "subjectId": "科目ID",
  "pageNum": 1,
  "pageSize": 10
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 20,
    "records": [
      {
        "id": 1,
        "question": "题目内容",
        "userAnswer": "A",
        "correctAnswer": "B",
        "wrongCount": 3,      // 错误次数
        "lastWrongDate": "2024-01-15 14:30:00"
      }
    ]
  }
}
```

### 5. 获取科目列表
**接口地址**: `GET /study/subjects`
**请求参数**: 无

**响应数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "低压电工作业",
      "description": "低压电工作业安全培训"
    },
    {
      "id": 2,
      "name": "高压电工作业",
      "description": "高压电工作业安全培训"
    }
  ]
}
```

### 6. 获取月度排名
**接口地址**: `GET /study/monthly-ranking`
**请求参数**:
```json
{
  "subjectId": "科目ID",
  "month": "2024-01"         // 月份，格式：YYYY-MM
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "userRank": 15,           // 用户排名
    "totalUsers": 100,       // 总用户数
    "topUsers": [            // 前10名用户
      {
        "rank": 1,
        "username": "张三",
        "score": 98,
        "avatar": "头像URL"
      }
    ]
  }
}
```

## 数据库表结构建议

### 1. 科目表 (subjects)
```sql
CREATE TABLE subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '科目名称',
  description TEXT COMMENT '科目描述',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. 考试记录表 (exam_records)
```sql
CREATE TABLE exam_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  subject_id BIGINT NOT NULL COMMENT '科目ID',
  exam_name VARCHAR(200) NOT NULL COMMENT '考试名称',
  score INT NOT NULL COMMENT '分数',
  total_questions INT NOT NULL COMMENT '总题数',
  correct_answers INT NOT NULL COMMENT '正确题数',
  duration INT NOT NULL COMMENT '考试时长（分钟）',
  exam_type VARCHAR(20) DEFAULT 'all' COMMENT '考试类型：all-全部，wrong-错题',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_subject (user_id, subject_id),
  INDEX idx_create_time (create_time)
);
```

### 3. 题目详情表 (exam_details)
```sql
CREATE TABLE exam_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_record_id BIGINT NOT NULL COMMENT '考试记录ID',
  question_id BIGINT NOT NULL COMMENT '题目ID',
  question_content TEXT NOT NULL COMMENT '题目内容',
  user_answer VARCHAR(10) COMMENT '用户答案',
  correct_answer VARCHAR(10) NOT NULL COMMENT '正确答案',
  is_correct BOOLEAN NOT NULL COMMENT '是否正确',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_exam_record (exam_record_id)
);
```

## 实现建议

1. **统一响应格式**: 所有接口返回统一的JSON格式，包含code、msg、data字段
2. **分页处理**: 列表接口支持分页，返回total和records
3. **错误处理**: 统一的异常处理机制，返回合适的错误码和错误信息
4. **数据验证**: 对请求参数进行验证，确保数据有效性
5. **缓存优化**: 对统计数据可以考虑使用Redis缓存
6. **日志记录**: 记录关键操作日志，便于问题排查
