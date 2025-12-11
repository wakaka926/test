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
export function loadPracticeRecord(studentId, questionBankId, practiceType) {
  return request({
    url: '/api/elearning/practice-record/load',
    method: 'post',
    data: {
      studentId,
      questionBankId,
      practiceType  // 即使是 null 也会传给后端
    }
  })
}

//提交答案时更新练习记录
export function updatePracticeRecordWhileSubmitAnswer(practiceRecordsId, questionId,userAnswer,timeSpentSeconds,isCorrect,scoreObtained) {
  return request({
    url: '/api/elearning/practice-record/submit-answer',
    method: 'post',
    data: {
      practiceRecordsId,
      questionId,
      userAnswer,
      timeSpentSeconds,
      isCorrect,
      scoreObtained
    }
  })
}

//退出练习页面时更新练习记录
export function updatePracticeRecordWhileLeavePage(practiceRecordsId) {
  return request({
    url: `/api/elearning/practice-record/save-on-leave/${practiceRecordsId}`,
    method: 'post'
  })
}