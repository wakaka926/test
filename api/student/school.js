import request from '@/utils/request'

// 获取学生学校信息
export function getStudentSchoolMsg(id) {
    return request({
        url: `/api/admin/school/select/${id}`,
        method: 'post',
        data: {
            id
        }
    })
}

