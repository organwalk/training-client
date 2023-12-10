

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
            },
            {
                path : 'dept',
                name : 'adminDeptManage',
                component: () => import('@/view/admin-view/AdminDeptManage.vue')
            },
            {
                path : 'resource',
                name : 'adminResourceManage',
                component: () => import('@/view/admin-view/admin-resource/AdminResourceManage.vue')
            },
            {
                path: 'plan',
                name: 'adminPlanManage',
                component:() => import('@/view/admin-view/AdminPlanManage.vue')
            }
        ]
    },
    {
        path: '/teacher',
        name: 'teacherView',
        component:() => import('@/view/teacher-view/TeacherView.vue'),
        children: [
            {
                path:'edit',
                name: 'teacherChapterEditView',
                component:() => import('@/view/teacher-view/TeacherChapterEditView.vue')
            },
            {
                path: 'exam',
                name:'teacherExamManage',
                component:() => import('@/view/teacher-view/exam/TeacherExamMange.vue'),
                children:[
                    {
                        path:'report',
                        name:'teacherExamReport',
                        component:() => import('@/view/teacher-view/report/TeacherExamReportMange.vue')
                    }
                ]
            },
            {
                path: 'test_paper',
                name: 'teacherExamEditTestPaper',
                component:() => import('@/view/teacher-view/exam/TeacherExamEditTestPaper.vue')
            }
        ]
    },
    {
        path: '/user',
        name:'userView',
        component:() => import('@/view/user-view/UserView.vue'),
        children: [
            {
                path: 'lesson',
                name: 'userLesson',
                component:() => import('@/view/user-view/lesson/UserLessonList.vue')
            },
            {
                path: 'chapter',
                name: 'userChapter',
                component:() => import('@/view/user-view/chapter/UserChapterList.vue')
            },
            {
                path: 'textbook',
                name: 'userTextBook',
                component:() => import('@/view/user-view/textbook/UserTextBook.vue')
            },
            {
                path: 'cloud',
                name: 'userCloud',
                component:() => import('@/view/user-view/cloud/UserCloud.vue')
            },
            {
                path:'exam',
                name: 'userExam',
                component:() => import('@/view/user-view/exam/UserExamList.vue')
            }
        ]
    },
    {
        path: '/user/test',
        name: 'userTest',
        component:() => import('@/view/user-view/exam/UserExamTestPaper.vue')
    }
]


export default routes;


