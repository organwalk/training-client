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