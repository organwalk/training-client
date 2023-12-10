import http from "@/api/http";

// 获取用户登录url
export const authUrl = 'http://localhost:8180/api/user/v1/auth'
// 获取权限列表
export function getAuthList(){
    return http.get('/user/v3/auth')
}
// 创建用户账号
export function createUserAccount(apiObj){
    return http.post('/user/v3/account', apiObj)
}
// 获取指定类别用户账号列表
export function getUserAccountList(type, offset){
    return http.get('/user/v3/account/' + type + '/10/' + offset)
}
// 获取指定用户的账号信息
export function getUserAccountInfo(uid){
    return http.get('/user/v1/account/' + uid)
}
// 编辑指定用户
export function editUserAccountInfo(uid, apiObj){
    return http.put('/user/v3/account/' + uid, apiObj)
}
// 模糊搜索
export function getUserAccountByKeyword(keyword, type, offset){
    return http.get('/user/v3/account/keyword/' + keyword + '/' + type + '/10/' + offset)
}
// 删除指定用户
export function deleteAccountByUid(uid){
    return http.delete('/user/v3/account/' + uid)
}
//获取指定用户信息
export function getUserInfoByUid(uid){
    return http.get('/user/v1/info/' + uid)
}
// 获取教师列表
export function getTeacherList(){
    return http.get('/user/v3/account/2/999999/0')
}
// 获取学生列表
export function getStudentList(){
    return http.get('/user/v3/account/1/999999/0')
}


//部门获取用户列表
export function getUserAccountList1(type, offset){
    return http.get('/user/v3/account/' + type + '/999/' + offset)
}


// 用户自行修改账号信息
export function updateUserAccountInfo(obj){
    return http.put('/user/v1/account/' + sessionStorage.getItem("uid"), obj)
}

// 获取指定类别的列表
export function getAccountList(type){
    return http.get('/user/v3/account/' + type + '/999999/0')
}

