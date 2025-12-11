import request from '@/utils/request'


// 初始化模拟考试
export function initSimulationExam(studentId, subjectId,seatNumber) {
    return request({
        url: `/api/elearning/simulation-exam/init`,
        method: 'post',
        data: {
            studentId,
            subjectId,
            seatNumber
        }
    })
}

//加载模拟考试题目
export function loadSimulationExamQuestion(examId) {
    return request({
        url: `/api/elearning/simulation-exam/${examId}/questions`,
        method: 'get'
    })
}

//切换题目保存最新进度
export function saveSimulationExamprogress(examId, questionId, userAnswer, isCorrect, timeSpentSeconds, answeredAt) {
    return request({
        url: `/api/elearning/simulation-exam/${examId}/progress`,
        method: 'post',
        data: {
            questionId,
            userAnswer,
            isCorrect,
            timeSpentSeconds,
            answeredAt
        }
    })
}

//模拟考试交卷
export function submitSimulationExam(examId, details) {
    return request({
        url: `/api/elearning/simulation-exam/${examId}/submit`,
        method: 'post',
        data: {
            details
        }
    })
}

//放弃模拟考试
export function abandonSimulationExam(examId) {
    return request({
        url: `/api/elearning/simulation-exam/${examId}/abandon`,
        method: 'post'
    })
}

