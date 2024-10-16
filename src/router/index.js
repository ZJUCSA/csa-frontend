import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
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
                    name: 'events',
                    component: () => import('../views/CsaEvents.vue'),
                    meta: {
                        title: '活动',
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
            ],
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/CsaAdmin.vue'),
            redirect: { name: 'admin-news' },
            meta: {
                requiresAuth: true,
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
            ],
        },
    ],
})

router.beforeEach(to => {
    if (to.meta.title) {
        document.title = to.meta.title + ' - ZJUCSA'
    }
    const userStore = useUserStore()

    if (
        to.meta.requiresAuth &&
        userStore.uid &&
        userStore.expires <= new Date().getTime()
    ) {
        userStore.logout()
        return { name: 'login' }
    }
    if (to.meta.requiresAuth && !userStore.uid) return { name: 'login' }
    if (userStore.uid && ['login', 'reg'].includes(to.name))
        return { name: 'home' }
})

export default router
