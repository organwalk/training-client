import request from '@/api/request'

const http = {
    get(url,params){
        const config = {
            method:'get',
            url:url,
            headers:{
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        }
        if (params) config.params = params
        return request(config)
    },
    downloadGet(url,params){
        const config = {
            method:'get',
            url:url,
            responseType: 'blob',
            headers:{
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        }
        if (params) config.params = params
        return request(config).then(response => {
            // 获取文件名
            const filename = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
            // 处理blob响应
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(new Blob([response.data]))
            link.setAttribute('download', decodeURIComponent(filename)) // 设置下载文件的文件名
            document.body.appendChild(link)
            link.click()
            link.remove()
        })
    },
    post(url,params){
        const config = {
            method: 'post',
            url:url,
            data: params,
            headers: {
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        }
        if (params) config.data = params
        return request(config)
    },
    formDataPost(url, formData){
        const config = {
            method: 'post',
            url: url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        };
        return request(config);
    },
    formDataPut(url, formData){
        const config = {
            method: 'put',
            url: url,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        };
        return request(config);
    },
    put(url,params){
        const config = {
            method:'put',
            url:url,
            data: params,
            headers: {
                'Content-Type': 'application/json',
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        }
        if (params) config.data = params
        return request(config)
    },
    delete(url,params){
        const config = {
            method:'delete',
            url:url,
            headers:{
                'username': sessionStorage.getItem("username"),
                'access_token': sessionStorage.getItem("access_token"),
                'auth': sessionStorage.getItem("auth_name")
            }
        }
        if (params) config.params = params
        return request(config)
    }
}
export default http