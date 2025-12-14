<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const axios = inject('axios')
const loading = ref(false)
const editMode = ref(false)

const profile = ref({
    uid: '',
    nick: '',
    email: '',
    name: '',
    gender: '',
    phone: '',
    wechat: '',
    qq: '',
    major_name: '',
    college_name: '',
    grade: null,
    department: '',
    position: '',
    is_active: null,
    skills: '',
    role_name: '会员'  // 角色名称
})

const editForm = reactive({
    email: '',      // User表字段，所有用户可编辑
    phone: '',      // Member表字段，仅干事可编辑
    wechat: '',     // Member表字段，仅干事可编辑
    qq: '',         // Member表字段，仅干事可编辑
    skills: ''      // Member表字段，仅干事可编辑
})

// 获取用户资料
const fetchProfile = async () => {
    loading.value = true
    try {
        const response = await axios.get('/user/profile')
        profile.value = response.data
        // 初始化编辑表单
        editForm.email = response.data.email || ''
        editForm.phone = response.data.phone || ''
        editForm.wechat = response.data.wechat || ''
        editForm.qq = response.data.qq || ''
        editForm.skills = response.data.skills || ''
    } catch (error) {
        window.notyf.error('获取个人资料失败')
    } finally {
        loading.value = false
    }
}

// 进入编辑模式
const enterEditMode = () => {
    editMode.value = true
}

// 取消编辑
const cancelEdit = () => {
    editMode.value = false
    // 恢复原始数据
    editForm.email = profile.value.email || ''
    editForm.phone = profile.value.phone || ''
    editForm.wechat = profile.value.wechat || ''
    editForm.qq = profile.value.qq || ''
    editForm.skills = profile.value.skills || ''
}

// 保存编辑
const saveEdit = async () => {
    loading.value = true
    try {
        await axios.put('/user/profile', editForm)
        window.notyf.success('个人资料更新成功')
        editMode.value = false
        await fetchProfile()
    } catch (error) {
        window.notyf.error('个人资料更新失败')
    } finally {
        loading.value = false
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
                <div class="mb-8 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <Button
                            icon="pi pi-arrow-left"
                            severity="secondary"
                            text
                            @click="router.back()"
                        />
                        <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                            个人资料
                        </h1>
                    </div>
                    <div class="flex gap-2">
                        <Button
                            v-if="!editMode"
                            label="编辑资料"
                            icon="pi pi-pencil"
                            @click="enterEditMode"
                            severity="secondary"
                        />
                        <template v-else>
                            <Button
                                label="取消"
                                severity="secondary"
                                @click="cancelEdit"
                                :disabled="loading"
                            />
                            <Button
                                label="保存"
                                icon="pi pi-check"
                                @click="saveEdit"
                                :loading="loading"
                            />
                        </template>
                    </div>
                </div>

                <!-- 头像和基本信息 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 mb-6">
                    <div class="flex items-center gap-6">
                        <div class="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span class="text-white text-4xl font-bold">{{ profile.nick?.substring(0, 2) || '用户' }}</span>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h2 class="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                                    {{ profile.nick }}
                                </h2>
                                <span 
                                    class="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                                >
                                    {{ profile.role_name }}
                                </span>
                            </div>
                            <div class="space-y-1">
                                <p class="text-neutral-600 dark:text-neutral-400">
                                    <i class="pi pi-id-card mr-2"></i>学号: {{ profile.uid }}
                                </p>
                                <p class="text-neutral-600 dark:text-neutral-400">
                                    <i class="pi pi-envelope mr-2"></i>邮箱: {{ profile.email || '-' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 基本信息 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                            基本信息
                        </h2>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- 姓名 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                姓名
                            </label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.name || profile.nick || '-' }}
                            </div>
                        </div>
                        
                        <!-- 学号 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                学号
                            </label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.uid }}
                            </div>
                        </div>
                        
                        <!-- 性别 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">性别</label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.gender || '-' }}
                            </div>
                        </div>
                        
                        <!-- 专业 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                专业
                            </label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.major_name || '-' }}
                            </div>
                        </div>
                        
                        <!-- 学院 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">学院</label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.college_name || '-' }}
                            </div>
                        </div>
                        
                        <!-- 年级 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">年级</label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.grade || '-' }}
                            </div>
                        </div>
                        
                        <!-- 部门 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                部门
                            </label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.department || '-' }}
                            </div>
                        </div>
                        
                        <!-- 职位 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">职位</label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.position || '-' }}
                            </div>
                        </div>
                        
                        <!-- 状态 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">状态</label>
                            <div class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.is_active === true ? '在职' : (profile.is_active === false ? '离职' : '-') }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 联系方式 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">
                        联系方式
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- 邮箱（所有用户可编辑） -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                邮箱
                            </label>
                            <InputText
                                v-if="editMode"
                                v-model="editForm.email"
                                placeholder="请输入邮箱"
                                class="w-full"
                            />
                            <div v-else class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.email || '-' }}
                            </div>
                        </div>
                                                <!-- 电话 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                电话
                            </label>
                            <InputText
                                v-if="editMode"
                                v-model="editForm.phone"
                                placeholder="请输入联系电话"
                                class="w-full"
                            />
                            <div v-else class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.phone || '-' }}
                            </div>
                        </div>
                        <!-- 微信号 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                微信号
                            </label>
                            <InputText
                                v-if="editMode"
                                v-model="editForm.wechat"
                                placeholder="请输入微信号"
                                class="w-full"
                            />
                            <div v-else class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.wechat || '-' }}
                            </div>
                        </div>
                        
                        <!-- QQ号 -->
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                QQ号
                            </label>
                            <InputText
                                v-if="editMode"
                                v-model="editForm.qq"
                                placeholder="请输入QQ号"
                                class="w-full"
                            />
                            <div v-else class="text-neutral-800 dark:text-neutral-200 font-medium">
                                {{ profile.qq || '-' }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 技能特长 -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
                        技能特长
                    </h2>
                    <div class="space-y-2">
                        <Textarea
                            v-if="editMode"
                            v-model="editForm.skills"
                            placeholder="请输入技能特长"
                            rows="5"
                            class="w-full"
                        />
                        <div v-else class="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                            {{ profile.skills || '-' }}
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
