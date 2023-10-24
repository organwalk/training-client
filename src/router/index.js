import { createRouter, createWebHistory } from 'vue-router'
import routes from "./router"
import {ElMessage} from "element-plus";

const router =createRouter({
    history:createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (!sessionStorage.getItem("access_token")) {
        if (to.fullPath === '/login'){
            next()
        }else {
            ElMessage.warning("您尚未登录")
            setTimeout(()=>{
                window.location.href = "/login"
            },1000)
        }
    } else {
        next()
    }
})

export default router