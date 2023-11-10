// 获取培训计划进度列表
import http from "@/api/http";

export function getPlanProgress(){
    return http.get('/progress/v3/plan/persent/999999/0')
}