import request from '@/utils/request'

/**
 * 根据科目ID和类型获取题目列表
 * @param {string|number} subjectId - 科目ID
 * @param {string} type - 题目类型 (all|single|judge|multiple)
 * @returns {Promise} 题目列表数据
 */
export function getQuestionsBySubjectAndType(subjectId, type) {
  return request({
    url: `/api/elearning/question-bank/questions/subject/${subjectId}`,
    method: 'get',
    params: {  // 请求查询参数
      type: type
    }
  })
}

/**
 * 根据科目ID获取题库信息
 * @param {string|number} subjectId - 科目ID
 * @returns {Promise} 题库信息
 */
export function getSubjectQuestionBank(subjectId) {
  return request({
    url: `/api/elearning/question-bank/questionBank/subjectId/${subjectId}`,
    method: 'get'
  })
}

/**
 * 根据科目ID获取实操题库信息
 * @param {string|number} subjectId - 科目ID
 * @returns {Promise} 实操题库信息
 */
export function getSubjectPracticalQuestionBank(subjectId) {
  return request({
    url: `/api/elearning/practical-question-bank/practicalQuestionBank/subjectId/${subjectId}`,
    method: 'get'
  })
}

