import http from "@/api/http";

// 获取试卷列表
export function getTestPaperList(teacherId, lessonId, pageSize, offset){
    return http.get('/learn/v1/test/' + teacherId + '/' + lessonId + '/' + pageSize + '/' + offset)
}

// 新建试卷
export function addTestPaper(obj){
    return http.post('/learn/v1/test', obj)
}

// 根据试卷ID获取试题列表
export function getQuestionList(testId){
    return http.get('/learn/v1/test/' + testId)
}

// 暂存试卷
export function cacheTestPaper(testId, obj){
    return http.post('/learn/v1/test/cache/' + testId, obj)
}