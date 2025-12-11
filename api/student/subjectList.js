import request from '@/utils/request'

// 获取学生可访问的科目列表
export function getStudentAccessibleSubjects(studentId) {
    return request({
        url: '/api/admin/student/subjects/accessible/' + studentId,
        method: 'get',
        params: {
            studentId
        }
    })
}

