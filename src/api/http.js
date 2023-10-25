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