import http from "@/api/http";

// 查看指定部门下的资源分类标签列表
export function getResourceTagByDeptId(deptId){
    return http.get('/resource/v1/tag/' + deptId)
}

// 获取全部上传资源列表
export function getNormalResource(offset){
    return http.get('/resource/v1/file/normal/list/10/' + offset)
}

// 获取指定部门和分类的上传资源列表
export function getNormalResourceByDeptIdAndTagId(deptId, tagId, offset){
    return http.get('/resource/v1/file/normal/' + deptId + '/' + tagId + '/10/' + offset)
}

export const fileSliceSize = 2 * 1024 * 1024; // 每个文件切片大小定为5MB
// 上传资源文件
export function uploadNormalResource(infoObj, fileObj){
    const formData = new FormData()
    formData.append('dept_id', infoObj.dept_id)
    formData.append('tag_id', infoObj.tag_id)
    formData.append('resource_name', infoObj.resource_name)
    formData.append('up_id', infoObj.up_id)
    for (let key in fileObj) {
        formData.append(key, fileObj[key]);
    }
    return http.formDataPost('/resource/v1/file/normal', formData)
}

// 获取指定资源文件详情
export function getNormalResourceDetail(rid){
    return http.get('/resource/v1/normal/file/info/' + rid)
}

// 编辑指定资源文件
export function updateNormalResourceDetail(rid, obj, file){
    const formData = new FormData()
    formData.append('dept_id', obj.dept_id)
    formData.append('tag_id', obj.tag_id)
    formData.append('resource_name', obj.resource_name)
    if (file){
        formData.append('resource_file', file)
    }
    formData.append('up_id', obj.up_id)
    return http.formDataPut('/resource/v1/normal/file/info/' + rid, formData)
}

// 模糊搜索
export function selectNormalResourceByKeyword(keyword,offset,deptId,tagId){
    let url
    if (deptId && tagId){
        url = '/resource/v1/file/normal/list/keyword/' + keyword + '/10/' + offset + '?deptId=' + deptId + '&&tagId=' + tagId
    }else {
        url = '/resource/v1/file/normal/list/keyword/' + keyword + '/10/' + offset
    }
    return http.get(url)
}

// 下载指定资源文件
export function downloadResource(rid){
    return http.downloadGet('/resource/v1/normal/file/' + rid)
}

// 删除指定资源文件
export function deleteNormalResource(rid, uid){
    return http.delete('http://localhost:8180/api/resource/v1/normal/file/' + rid + '/' + uid)
}

// 创建资源分类标签
export function addResourceTag(obj){
    return http.post('/resource/v3/tag', obj)
}

// 查看指定部门下的资源分类标签列表
export function getResourceTagList(deptId){
    return http.get('/resource/v1/tag/' + deptId)
}

// 编辑指定资源分类标签
export function editTag(tagId, tagName){
    return http.post('/resource/v3/tag/name/' + tagId + '?tag_name=' + tagName)
}

// 删除指定资源分类标签
export function deleteTag(tagId){
    return http.delete('/resource/v3/tag/' + tagId)
}

// 获取课程教材文件对象
const getResourceLessonObj = (obj) => {
    const formData = new FormData()
    formData.append('lesson_id', obj.lesson_id)
    formData.append('teacher_id', obj.teacher_id)
    formData.append('chapter_id', obj.chapter_id)
    formData.append('resource_file', obj.resource_file)
    formData.append('file_hash', obj.file_hash)
    formData.append('file_size', obj.file_size)
    formData.append('file_chunks_sum', obj.file_chunks_sum)
    formData.append('file_now_chunk', obj.file_now_chunk)
    formData.append('file_origin_name', obj.file_origin_name)
    return formData
}

// 上传指定课程教材
export function uploadLessonResource(obj){
    return http.formDataPost('/resource/v2/lesson', getResourceLessonObj(obj))
}

// 获取课程下的各章节资源列表
export function getResourceLessonRid(lessonId){
    return http.get('/resource/v1/lesson/list/' + lessonId)
}

// 根据课程教材ID获取教材
export function getResourceLesson(resourceId){
    return http.get('/resource/v1/lesson/load/' + resourceId + '/' + String(Math.random()).split('.')[1])
}

// 重传课程教材
export function reUploadLessonResource(obj){
    return http.formDataPut('/resource/v2/lesson', getResourceLessonObj(obj))
}

// 删除指定课程章节教材文件
export function deleteResourceLesson(chapterId){
    return http.delete('/resource/v2/lesson/chapter/' + chapterId)
}

// 获取指定教材资源类型
export function getResourceLessonType(resourceId){
    return http.get('/resource/v1/lesson/type/' + resourceId)
}

// 上传学习笔记
export function uploadNote(obj){
    const formData = new FormData()
    formData.append('lesson_id', obj['lesson_id'])
    formData.append('chapter_id', obj['chapter_id'])
    formData.append('up_id', obj['up_id'])
    formData.append('note_title', obj['note_title'])
    formData.append('note_des', obj['note_des'])
    formData.append('note_file', obj['note_file'])

    return http.formDataPost('/resource/v1/file/note', formData)
}