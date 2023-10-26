import http from "@/api/http";

//获取权限列表
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