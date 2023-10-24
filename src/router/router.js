const routes = [
    {
        path : '/login',
        name : 'login',
        component: ()=>import('@/view/UserLogin.vue')
    },
    {
        path : '/admin/user',
        name : 'adminUserManage',
        component: () => import('@/view/admin-view/AdminUserManage.vue')
    }
]

export default routes