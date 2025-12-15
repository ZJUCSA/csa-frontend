import ax from 'axios'
import { useUserStore } from './stores/user'
import router from './router/index'

const instance = ax.create({
    baseURL: '/api',
    timeout: 10000000,
})

instance.interceptors.request.use(
    config => {
        const userStore = useUserStore()

        let access_token = userStore.access_token

        if (access_token) {
            if (userStore.expires <= new Date().getTime()) {
                userStore.logout()
                router.push({ name: 'login' })
                return Promise.reject(new Error('Token expired'))
            } else {
                config.headers.Authorization = 'Bearer ' + access_token
            }
        }

        return config
    },
    error => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.message === 'Token expired') {
            return Promise.reject(error)
        }
        
        const userStore = useUserStore()
        
        if (error.response?.status === 401) {
            if (userStore.access_token) {
                window.notyf.error('登录已过期，请重新登录')
                userStore.logout()
                router.push({ name: 'login' })
            }
            // 未登录状态的 401 不显示错误提示
        } else if (error.response?.status === 403) {
            // 403 错误显示具体的错误信息
            const detail = error.response?.data?.detail
            if (typeof detail === 'string') {
                window.notyf.error(detail)
            } else {
                window.notyf.error('您没有权限访问此资源')
            }
        } else if (error.response?.status === 422) {
            // 请求验证失败
            const detail = error.response?.data?.detail
            if (Array.isArray(detail)) {
                // FastAPI 验证错误格式
                const errors = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('; ')
                window.notyf.error(`请求参数错误: ${errors}`)
            } else if (typeof detail === 'string') {
                window.notyf.error(detail)
            } else {
                window.notyf.error('请求参数验证失败')
            }
        } else if (typeof error.response?.data?.detail === 'string') {
            window.notyf.error(error.response.data.detail)
        } else if (error.response) {
            window.notyf.error('操作失败，未知错误')
        }
        return Promise.reject(error)
    }
)

export const AxiosPlugin = {
    install: app => {
        app.provide('axios', instance)
    },
}

export const axios = instance
