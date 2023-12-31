import axios from 'axios'
import {ElMessage} from "element-plus";
import {nonWarningMsg} from "@/config/globalConfig";

const request = (config) => {
    const instance = axios.create({
        baseURL:'http://localhost:8180/api',
        timeout: 100000
    })

    instance.interceptors.response.use(
        response => {
            // 如果响应是下载文件
            if (response.headers['content-type'] !== "application/json") {
                return response; // 返回Blob对象，不进行处理
            }
            if (response.data.code!==2002 && response.data.msg){
                if (response.data.code === 4001){
                    ElMessage.error({
                        message:response.data.msg,
                        grouping:true,
                        type:'error'
                    })
                    setTimeout(()=>{
                        sessionStorage.clear()
                        window.location.href = '/login'
                    }, 1000)
                }else {
                    if (!nonWarningMsg.includes(response.data.msg)){
                        ElMessage.warning({
                            message:response.data.msg,
                            grouping:true,
                            type:'error'
                        })
                    }
                }
            }
            if (response.status !== 200){
                ElMessage.error({
                    message:response.data.msg,
                    grouping:true,
                    type:'error'
                })
            }
            return response.data;
        },
        error => {
            console.error(error)
            if (error.code){
                ElMessage.error({
                    message:"内部服务错误",
                    grouping:true,
                    type:'error'
                })
            }
        }
    );
    return instance(config)
}

export default request