import request from '@/utils/request'


// 记录易错题目
export function recordWrongQuestion(questionId, isWrong) {
  return request({
    url: '/api/elearning/wrong-question/record',
    method: 'post',
    data: {
      questionId: questionId,
      isWrong: isWrong
    }
  })
}

// 加载练习记录
export function loadPracticalRecord(studentId, practicalBankId, practicalType) {
  return request({
    url: '/api/elearning/practical-record/load',
    method: 'post',
    data: {
      studentId,
      practicalBankId,
      practicalType  // 即使是 null 也会传给后端
    }
  })
}

//提交答案时更新练习记录
export function updatePracticalRecordWhileSubmitAnswer(practicalRecordsId, questionId,userAnswer,timeSpentSeconds,isCorrect,scoreObtained) {
  return request({
    url: '/api/elearning/practical-record/submit-answer',
    method: 'post',
    data: {
      practicalRecordsId,
      questionId,
      userAnswer,
      timeSpentSeconds,
      isCorrect,
      scoreObtained
    }
  })
}

//退出练习页面时更新练习记录
export function updatePracticalRecordWhileLeavePage(practicalRecordsId) {
  return request({
    url: `/api/elearning/practical-record/save-on-leave/${practicalRecordsId}`,
    method: 'post'
  })
}