import http from "@/api/http";

export function getDeptList(pageSize, offset){
    return http.get('/dept/v1/department/' + pageSize + '/' + offset)
}