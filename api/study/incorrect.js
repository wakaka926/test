import request from '@/utils/request'

// 加载错题练习记录
export function loadPracticeRecord(studentId) {
    return request({
      url: '/api/elearning/favorite-error-practice/load',
      method: 'post',
      data: {
        studentId
      }
    })
  }
  
  //提交答案时更新错题练习记录
  export function updatePracticeRecordWhileSubmitAnswer(errorPracticeId, questionId,userAnswer,timeSpentSeconds) {
    return request({
      url: '/api/elearning/favorite-error-practice/submit-answer',
      method: 'post',
      data: {
        errorPracticeId,
        questionId, 
        userAnswer,
        timeSpentSeconds
      }
    })
  }
  
  //退出错题练习页面时更新错题练习记录
  export function updatePracticeRecordWhileLeavePage(errorPracticeId) {
    return request({
      url: `/api/elearning/favorite-error-practice/save-on-leave/${errorPracticeId}`,
      method: 'post'
    })
  }