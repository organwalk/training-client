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
    return http.get('/dept/v1/department/info/' + dept_id)
}

//编辑部门
export function editDeptInfo(dept_id , apiObj){
    return http.put('/dept/v3/department/' + dept_id , apiObj)
}

//删除部门
export function deleteDeptByDept_id(dept_id){
    return http.delete('/dept/v3/department/' + dept_id)
}

//添加部门成员
export function addDeptMember( apiObj) {
    return http.post('/dept/v3/department/worker', apiObj)
}

//获取指定部门的---成员信息
export function getDeptMember(dept_id , pageSize, offset) {
    return http.get('/dept/v1/department/' + dept_id + '/' + pageSize + '/' + offset)
}

//删除指定部门的--成员
export function deleteDeptMember(dept_id, uid) {
    return http.delete('/dept/v3/worker/' + dept_id + '/' + uid)
}

//模糊查询部门
export function getDeptAccountByKeyword(keyword, pageSize, offset){
    return http.get('/dept/v1/department/' +  keyword + '/' + pageSize + '/' + offset)
}



