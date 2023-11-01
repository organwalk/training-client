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

// 上传资源文件
export function uploadNormalResource(obj, file){
    const formData = new FormData()
    formData.append('dept_id', obj.dept_id)
    formData.append('tag_id', obj.tag_id)
    formData.append('resource_name', obj.resource_name)
    formData.append('resource_file', file)
    formData.append('up_id', obj.up_id)
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