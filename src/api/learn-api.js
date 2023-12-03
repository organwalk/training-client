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

// 编写试卷详细
export function editTestPaper(testId, obj){
    return http.post('/learn/v1/test/' + testId, obj)
}

// 发布试卷
export function setRelease(testId){
    return http.put('/learn/v1/test/' + testId)
}

// 编辑试卷信息
export function editTestPaperInfo(testId, obj){
    return http.put('/learn/v1/test/info/' + testId, obj)
}

// 根据试卷ID删除试卷
export function deleteTest(testId){
    return http.delete('/learn/v1/test/' + testId)
}

// 获取指定员工所具有的培训计划列表
export function getStudentAllPlanList(studentId){
    return http.get('/learn/v1/plan/' + studentId + '/999999/0')
}

// 获取指定培训计划的课程列表
export function getLessonListByPlanId(planId, studentId){
    return http.get('/learn/v1/plan/lesson/'+ planId + '/' + studentId + '/999999/0')
}

// 获取指定课程下的章节列表
export function getChapterListByLesson(lessonId, studentId){
    return http.get('/learn/v1/plan/lesson/chapter/' + lessonId + '/' + studentId)
}

// 根据课程ID和章节ID发布评论
export function sendFatherComment(obj){
    return http.post('/learn/v1/lesson/chapter/comment', obj)
}

// 根据课程和章节ID获取评论列表
export function getChapterCommentList(lessonId, chapterId, userId, offset){
    return http.get('/learn/v1/comment/lesson/chapter/' + lessonId + '/' + chapterId + '/' + userId + '/' + '/10/' + offset)
}

// 根据主评论ID进行点赞/取消点赞操作
export function likeOrUnlikeFatherComment(userId, comment_id, state){
    return http.post('/learn/v1/comment/like/' + userId + '/' + comment_id + '/' + state)
}

// 根据评论ID发布回复
export function sendFatherReply(obj){
    return http.post('/learn/v1/lesson/reply', obj)
}

// 根据课程和章节ID获取评论列表
export function sendChildrenReply(obj){
    return http.post('/learn/v1/lesson/reply/thread', obj)
}

// 根据跟帖回复ID进行点赞/取消点赞操作
export function likeOrUnlikeChildrenComment(userId, replyId, state){
    return http.post('/learn/v1/reply/like/' + userId + '/' + replyId + '/' + state)
}

// 根据主评论ID删除评论
export function deleteFatherComment(commentId){
    return http.delete('/learn/v1/comment/' + commentId)
}

// 根据跟帖回复ID删除评论
export function deleteChildrenComment(replyId){
    return http.delete('/learn/v1/reply/' + replyId)
}

// 发布学习笔记
export function sendNote(userId, lessonId, chapterId, obj){
    return http.post('/learn/v1/lesson/chapter/comment/note/' + userId + '/' + lessonId + '/' + chapterId,  obj)
}

// 根据笔记ID获取笔记
export function getNote(noteId){
    return http.get('/resource/v2/file/note/' + noteId)
}