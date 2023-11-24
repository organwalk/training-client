import http from "@/api/http";

// 获取试卷列表
export function getTestPaperList(teacherId, lessonId, pageSize, offset){
    return http.get('/learn/v1/test/' + teacherId + '/' + lessonId + '/' + pageSize + '/' + offset)
}