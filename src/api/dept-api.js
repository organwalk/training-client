import http from "@/api/http";
// 创建新部门
export function creatDeptAccount(apiObj){
    return http.post('/dept/v3/department', apiObj)
}
// 获取部门列表
export function getDeptList(pageSize, offset){
    return http.get('/dept/v1/department/' + pageSize + '/' + offset)
}

//获取指定部门信息
export function getDeptInfo(dept_id){
    return http.get('/dept/v1/department/' + dept_id)
}

//删除部门
export function deleteDeptByDept_id(dept_id){
    return http.delete('/dept/v3/department/' + dept_id)
}