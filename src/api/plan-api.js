import http from "@/api/http";

// 创建培训计划
export function createTrainingPlan(obj){
    return http.post('/training/v3/plan', obj)
}

// 删除培训计划
export function deleteTrainingPlanByPlanId(planId){
    return http.delete('/training/v3/plan/' + planId)
}

// 获取培训计划列表
export function getAllPlanList(offset){
    return http.get('/training/v3/plan/9/' + offset)
}

// 模糊查询培训计划
export function getAllPlanByKeyword(keyword, offset){
    return http.get('/training/v3/plan/keyword/' + keyword + '/9/' + offset)
}

// 获取指定部门的所有培训计划列表
export function getPlanListByDeptId(deptId, offset){
    return http.get('/training/v3/plan/dept/' + deptId + '/9/' + offset)
}

// 获取指定培训计划的讲师列表
export function getTeacherListByPlanId(planId){
    return http.get('/training/v1/plan/teacher/' + planId + '/999999/0')
}

// 获取指定培训计划的员工列表
export function getStudentListByPlanId(planId){
    return http.get('/training/v1/plan/student/'  + planId + '/999999/0')
}

// 编辑指定培训计划
export function updatePlanInfoByPlanId(planId, obj){
    return http.put('/training/v3/plan/' + planId, obj)
}

// 修改培训计划状态
export function updatePlanStateByPlanId(planId, state){
    return http.put('/training/v3/plan/state/' + planId + '/' + state)
}

// 删除培训计划下的指定讲师
export function deleteTeacherById(planId, teacherId){
    return http.delete('/training/v3/plan/teacher/' + planId + '/' + teacherId)
}

// 删除培训计划下的指定学员
export function deleteStudentById(planId, studentId){
    return http.delete('/training/v3/plan/student/' + planId + '/' + studentId)
}

// 添加教师至指定培训计划下
export function addTeacherToPlan(planId, teacherList){
    return http.post('/training/v3/plan/teacher/' + planId + '?teacherIdList=' + teacherList)
}
// 添加学员至指定培训计划下
export function addStudentToPlan(planId, studentList){
    return http.post('/training/v3/plan/student/' + planId + '?studentIdList=' + studentList)
}

// 获取指定教师所处的培训计划列表
export function getPlanListByTeacherId(teacherId){
    return http.get('/training/v2/teacher/plan/' + teacherId)
}

// 创建一门课程
export function addLessonByTeacher(planId, obj){
    return http.post('/training/v2/lesson/' + planId, obj)
}