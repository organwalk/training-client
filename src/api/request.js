import axios from 'axios'
import {ElMessage} from "element-plus";

const request = (config) => {
    const instance = axios.create({
        baseURL:'http://localhost:8180/api',
        timeout: 100000
    })


    instance.interceptors.response.use(
        response => {
            if (response.data.code!==2002){
                if (response.data.code === 4001){
                    ElMessage.error({
                        message:response.data.msg,
                        grouping:true,
                        type:'error'
                    })
                    setTimeout(()=>{
                        window.location.href = '/login'
                    })
                }else {
                    ElMessage.error({
                        message:response.data.msg,
                        grouping:true,
                        type:'error'
                    })
                }
            }
            return response.data;
        },
        error => {
            if (error.code && error.code === 'ECONNABORTED' || error.code === '502 Bad Gateway') {
                return instance(error.config);
            }
            try {
                ElMessage.error({
                    message:error,
                    grouping:true,
                    type:'error'
                })
            }catch (e){
                return Promise.reject(error);
            }
        }
    );

    return instance(config)
}

export default request