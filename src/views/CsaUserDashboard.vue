<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const axios = inject('axios')

const profile = ref({
    user_type: '会员',
    is_member: false
})

const fetchProfile = async () => {
    try {
        const response = await axios.get('/user/profile')
        profile.value = response.data
    } catch (error) {
        console.error('获取用户资料失败', error)
    }
}

onMounted(() => {
    fetchProfile()
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
                        <span 
                            class="px-3 py-1 text-sm font-medium rounded-full"
                            :class="profile.is_member 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'"
                        >
                            {{ profile.user_type }}
                        </span>
                    </div>
                    <p class="text-neutral-600 dark:text-neutral-400 mt-2">
                        欢迎, {{ userStore.nick }}
                    </p>
                </div>

                <!-- 用户信息卡片 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
                        个人信息
                    </h2>
                    <div class="space-y-3">
                        <div class="flex items-center">
                            <span class="text-neutral-600 dark:text-neutral-400 w-24">学号:</span>
                            <span class="text-neutral-800 dark:text-neutral-200 font-medium">{{ userStore.uid }}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-neutral-600 dark:text-neutral-400 w-24">昵称:</span>
                            <span class="text-neutral-800 dark:text-neutral-200 font-medium">{{ userStore.nick }}</span>
                        </div>
                    </div>
                </div>

                <!-- 功能区域（预留） -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
                        快捷功能
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-calendar text-2xl text-blue-500"></i>
                                <div>
                                    <h3 class="font-medium text-neutral-800 dark:text-neutral-200">我的活动</h3>
                                    <p class="text-sm text-neutral-500 dark:text-neutral-400">查看参与的活动</p>
                                </div>
                            </div>
                        </div>
                        
                        <router-link :to="{ name: 'user-profile' }">
                            <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                                <div class="flex items-center space-x-3">
                                    <i class="pi pi-user text-2xl text-green-500"></i>
                                    <div>
                                        <h3 class="font-medium text-neutral-800 dark:text-neutral-200">个人资料</h3>
                                        <p class="text-sm text-neutral-500 dark:text-neutral-400">编辑个人信息</p>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                        
                        <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div class="flex items-center space-x-3">
                                <i class="pi pi-cog text-2xl text-purple-500"></i>
                                <div>
                                    <h3 class="font-medium text-neutral-800 dark:text-neutral-200">账户设置</h3>
                                    <p class="text-sm text-neutral-500 dark:text-neutral-400">管理账户设置</p>
                                </div>
                            </div>
                        </div>
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
