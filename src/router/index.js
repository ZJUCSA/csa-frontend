import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }

        return {
            top: 0,
            left: 0,
            behavior: 'auto',
        }
    },
    routes: [
        {
            path: '/',
            name: 'index',
            redirect: { name: 'home' },
            component: () => import('../views/CsaIndex.vue'),
            meta: {
                requiresAuth: false,
            },
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('../views/CsaHome.vue'),
                    meta: {
                        title: '首页',
                    },
                },
                {
                    path: 'login',
                    name: 'login',
                    component: () => import('../views/CsaLogin.vue'),
                    meta: {
                        title: '登录',
                    },
                },
                {
                    path: 'change-password',
                    name: 'change-password',
                    component: () => import('../views/CsaChangePassword.vue'),
                    meta: {
                        title: '修改密码',
                        requiresAuth: true,
                    },
                },
                /* {
                    path: 'register',
                    name: 'register',
                    component: () => import('../views/CsaRegister.vue'),
                    meta: {
                        title: '注册',
                    },
                }, */
                {
                    path: 'about',
                    name: 'about',
                    component: () => import('../views/CsaAbout.vue'),
                    meta: {
                        title: '关于',
                    },
                },
                {
                    path: 'contact',
                    name: 'contact',
                    component: () => import('../views/CsaContact.vue'),
                    meta: {
                        title: '联系我们',
                    },
                },
                {
                    path: 'events',
                    name: 'event_list',
                    component: () => import('../views/CsaEvents.vue'),
                    meta: {
                        title: '活动',
                    },
                },
                {
                    path: 'news',
                    name: 'news_list',
                    component: () => import('../views/CsaNews.vue'),
                    meta: {
                        title: '新闻',
                    },
                },
                {
                    path: 'news/:id',
                    name: 'news',
                    component: () => import('../views/CsaNewsDetail.vue'),
                    meta: {
                        title: '新闻',
                    },
                },
                {
                    path: 'event/:id',
                    name: 'event',
                    component: () => import('../views/CsaEventDetail.vue'),
                    meta: {
                        title: '活动详情',
                    },
                },
                {
                    path: 'recruit',
                    name: 'recruit',
                    component: () => import('../views/CsaRecruit.vue'),
                    meta: {
                        title: '招新',
                    },
                },
            ],
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/CsaAdmin.vue'),
            redirect: { name: 'admin-news' },
            meta: {
                hideFooter: true,
                requiresAuth: true,
                requiresAdmin: true,
            },
            children: [
                {
                    path: 'news',
                    name: 'admin-news',
                    component: () => import('../views/CsaAdminNews.vue'),
                    meta: {
                        title: '新闻管理',
                    },
                },
                {
                    path: 'event',
                    name: 'admin-event',
                    component: () => import('../views/CsaAdminEvent.vue'),
                    meta: {
                        title: '活动管理',
                    },
                },
                {
                    path: 'user',
                    name: 'admin-users',
                    component: () => import('../views/CsaAdminUser.vue'),
                    meta: {
                        title: '用户管理',
                    },
                },
                {
                    path: 'recruit',
                    name: 'admin-recruit',
                    component: () => import('../views/CsaAdminRecruit.vue'),
                    meta: {
                        title: '招新管理',
                    },
                },
                {
                    path: 'interview',
                    name: 'admin-interview',
                    component: () => import('../views/CsaAdminInterview.vue'),
                    meta: {
                        title: '面试管理',
                    },
                },
                {
                    path: 'member',
                    name: 'admin-member',
                    component: () => import('../views/CsaAdminMember.vue'),
                    meta: {
                        title: '干事管理',
                    },
                },
            ],
        },
        {
            path: '/user',
            name: 'user',
            component: () => import('../views/CsaUserDashboard.vue'),
            meta: {
                requiresAuth: true,
                title: '用户后台',
            },
        },
        {
            path: '/user/profile',
            name: 'user-profile',
            component: () => import('../views/CsaUserProfile.vue'),
            meta: {
                requiresAuth: true,
                title: '个人资料',
            },
        },
        {
            path: '/forbidden',
            name: 'forbidden',
            component: () => import('../views/VsaForbidden.vue'),
            meta: {
                title: '访问被拒绝',
            },
        },
    ],
})

router.beforeEach(to => {
    if (to.meta.title) {
        document.title = to.meta.title + ' - ZJUCSA'
    }
    const userStore = useUserStore()

    // 检查token是否过期
    if (
        to.meta.requiresAuth &&
        userStore.uid &&
        userStore.expires <= new Date().getTime()
    ) {
        userStore.logout()
        return { name: 'login' }
    }
    
    // 检查是否需要登录
    if (to.meta.requiresAuth && !userStore.uid) {
        return { name: 'login' }
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
        return { name: 'forbidden' }
    }
    
    // 已登录用户不能访问登录页
    if (userStore.uid && ['login', 'reg'].includes(to.name)) {
        return { name: 'home' }
    }
})

if (sessionStorage.getItem("access_token")){
    userStore.set_token(sessionStorage.getItem("access_token"))
}

export default router
