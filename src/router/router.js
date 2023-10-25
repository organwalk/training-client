const routes = [
    {
        path : '/login',
        name : 'login',
        component: ()=>import('@/view/UserLogin.vue')
    },
    {
        path: '/admin',
        name: 'adminView',
        component:() => import('@/view/admin-view/AdminView.vue'),
        children:[
            {
                path : 'user',
                name : 'adminUserManage',
                component: () => import('@/view/admin-view/AdminUserManage.vue')
            }
        ]
    },
]

export default routes