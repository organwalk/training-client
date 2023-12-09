import http from "@/api/http";

// 获取培训计划进度列表
export function getPlanProgress(){
    return http.get('/progress/v3/plan/persent/999999/0')
}

// 获取指定教师所有课程总体平均进度的平均值和各课程总体平均进度百分比数据列表
export function getTeacherAndLessonProgress(planId, teacherId){
    return http.get('/progress/v4/lesson/teacher/persent/' + planId + '/' + teacherId)
}

// 获取学员在指定课程下学习进度百分比数据
export function getStudentLearningProgress(){
    return http.get('/progress/v2/lesson/student/chapter/persent/')
}

//获取学员在指定课程下学习到的章节列表
export function getStudentLearningChapters(lesson_id , pageSize , offset){
    return http.get('/progress/v2/lesson/student/chapter/' + lesson_id + '/' + pageSize + '/' + offset)
}

//获取学员在指定课程下学习进度百分比数据
export function getStudentLearningProgressByLessonId(lesson_id , pageSize , offset){
    return http.get('/progress/v2/lesson/student/chapter/persent/' + lesson_id + '/' + pageSize + '/' + offset)
}
