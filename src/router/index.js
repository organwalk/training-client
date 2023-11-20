import { createRouter, createWebHistory } from 'vue-router'
import routes from "./router"
import {ElMessage} from "element-plus";

const router =createRouter({
    history:createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const accessToken = sessionStorage.getItem("access_token")
    if (!accessToken) {
        if (to.fullPath === '/login'){
            next()
        }else {
            ElMessage.warning("您尚未登录")
            setTimeout(()=>{
                window.location.href = "/login"
            },1000)
        }
    } else {
        if (sessionStorage.getItem('auth_name') === 'admin' && to.fullPath.startsWith('/admin/')){
            next()
        }else if (sessionStorage.getItem('auth_name') === 'teacher' && to.fullPath.startsWith('/teacher') || to.fullPath.startsWith('/test')){
            next()
        }
    }
})

export default router