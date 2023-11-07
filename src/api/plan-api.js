import http from "@/api/http";

export function createTrainingPlan(obj){
    return http.post('/training/v3/plan', obj)
}