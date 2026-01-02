<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const axios = inject('axios')

const profile = ref({
    nick: '',
    uid: '',
    email: '',
    role_name: '未知'
})

const adminStatus = ref({
    is_admin: false,
    admin_role_id: null,
    admin_role_name: null,
    admin_token: null
})

const fetchProfile = async () => {
    try {
        const response = await axios.get('/user/profile')
        profile.value = response.data
    } catch (error) {
        // 静默处理错误，避免在加载时显示错误提示
        if (error.response?.status !== 401) {
            console.error('获取用户资料失败', error)
        }
    }
}

const checkAdminStatus = async () => {
    try {
        const response = await axios.get('/user/admin_status')
        adminStatus.value = response.data
    } catch (error) {
        // 静默处理错误，避免在加载时显示错误提示
        if (error.response?.status !== 401) {
            console.error('检查管理员状态失败', error)
        }
    }
}

const goToAdmin = () => {
    if (adminStatus.value.is_admin && adminStatus.value.admin_token) {
        // 保存管理员token并跳转
        userStore.login(
            adminStatus.value.admin_token,
            userStore.uid,
            userStore.nick,
            new Date().getTime() + 2 * 60 * 60 * 1000, // 2小时后过期
            'admin',
            adminStatus.value.admin_role_id
        )
        router.push({ name: 'admin' })
    }
}

// 部门名称翻译映射
const departmentMap = {
    'office': '办公室部',
    'competition': '竞赛部',
    'research': '科研部',
    'activity': '活动部'
}

// 翻译部门名称
const translateDepartment = (dept) => {
    if (!dept) return '-'
    return departmentMap[dept] || dept
}

// 计算属性：翻译后的部门名称
const translatedDepartment = computed(() => {
    return translateDepartment(profile.value.department)
})

onMounted(() => {
    fetchProfile()
    checkAdminStatus()
})
</script>

<template>
    <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-4xl mx-auto">
                <!-- 页面标题 -->
                <div class="mb-8">
                    <div class="flex items-center gap-3">
                        <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                            用户后台
                        </h1>
                    </div>
                    <p class="text-neutral-600 dark:text-neutral-400 mt-2">
                        欢迎, {{ userStore.nick }}
                    </p>
                </div>

                <!-- 用户信息卡片 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                            基本信息
                        </h2>
                        <span 
                            class="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                        >
                            {{ profile.role_name }}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">姓名</span>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.nick || userStore.nick }}
                            </div>
                        </div>
                        
                        <div class="space-y-2">
                            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">学号</span>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.uid || userStore.uid }}
                            </div>
                        </div>
                        
                        <div class="space-y-2">
                            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">邮箱</span>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.email || '-' }}
                            </div>
                        </div>
                        <div class="space-y-2">
                            <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">部门</span>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ translatedDepartment }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 功能区域 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
                        仪表盘
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <router-link :to="{ name: 'user-profile' }">
                            <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-user text-2xl text-green-500"></i>
                                    <div>
                                        <h3 class="font-medium text-neutral-800 dark:text-neutral-200">详细资料</h3>
                                        <p class="text-sm text-neutral-500 dark:text-neutral-400">查看、编辑个人信息</p>
                                    </div>
                                </div>
                            </div>
                        </router-link>

                        <router-link :to="{ name: 'change-password' }">
                            <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-key text-2xl text-blue-500"></i>
                                    <div>
                                        <h3 class="font-medium text-neutral-800 dark:text-neutral-200">修改密码</h3>
                                        <p class="text-sm text-neutral-500 dark:text-neutral-400">更改账户登录密码</p>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                        <!-- <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-calendar text-2xl text-blue-500"></i>
                                <div>
                                    <h3 class="font-medium text-neutral-800 dark:text-neutral-200">我的活动</h3>
                                    <p class="text-sm text-neutral-500 dark:text-neutral-400">查看参与的活动</p>
                                </div>
                            </div>
                        </div> -->
                        <!-- <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-cog text-2xl text-purple-500"></i>
                                <div>
                                    <h3 class="font-medium text-neutral-800 dark:text-neutral-200">账户设置</h3>
                                    <p class="text-sm text-neutral-500 dark:text-neutral-400">管理账户设置</p>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 深色模式适配 */
.dark {
    color-scheme: dark;
}
</style>
