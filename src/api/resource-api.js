import http from "@/api/http";

export function getResourceTagByDeptId(deptId){
    return http.get('/resource/v1/tag/' + deptId)
}

export function getNormalResourceByDeptIdAndTagId(deptId, tagId, offset){
    return http.get('/resource/v1/file/normal/' + deptId + '/' + tagId + '/20/' + offset)
}