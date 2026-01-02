<script setup>
import sha256 from 'crypto-js/sha256'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)
const axios = inject('axios')

const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const submitChangePassword = () => {
    // 验证新密码和确认密码是否一致
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        window.notyf.error('新密码和确认密码不一致')
        return
    }
    
    // 验证新密码长度
    if (passwordForm.newPassword.length < 6) {
        window.notyf.error('新密码长度至少为6位')
        return
    }
    
    loading.value = true
    
    axios
        .post('/user/passwd', {
            old: sha256(passwordForm.oldPassword).toString(),
            new: sha256(passwordForm.newPassword).toString()
        })
        .then(() => {
            window.notyf.success('密码修改成功')
            // 清空表单
            passwordForm.oldPassword = ''
            passwordForm.newPassword = ''
            passwordForm.confirmPassword = ''
            // 可以选择跳转到登录页或用户主页
            setTimeout(() => {
                router.push({ name: 'login' })
            }, 1500)
        })
        .catch(() => {
            loading.value = false
        })
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="association-header">
                <h1 class="association-name">浙江大学学生网络空间安全协会</h1>
                <div class="association-divider"></div>
            </div>
            <div class="flex items-center justify-center gap-x-4 mb-8">
                <p class="text-3xl font-bold">修改密码</p>
            </div>
            <div class="login-form">
                <div class="form-group">
                    <p class="form-label">原密码</p>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password
                            v-model="passwordForm.oldPassword"
                            :feedback="false"
                            placeholder="请输入原密码"
                            toggleMask
                            class="w-full"
                            inputClass="w-full"
                        />
                    </InputGroup>
                </div>
                <div class="form-group">
                    <p class="form-label">新密码</p>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password
                            v-model="passwordForm.newPassword"
                            :feedback="true"
                            placeholder="请输入新密码（至少6位）"
                            toggleMask
                            class="w-full"
                            inputClass="w-full"
                        />
                    </InputGroup>
                </div>
                <div class="form-group">
                    <p class="form-label">确认新密码</p>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password
                            v-model="passwordForm.confirmPassword"
                            :feedback="false"
                            placeholder="请再次输入新密码"
                            toggleMask
                            class="w-full"
                            inputClass="w-full"
                        />
                    </InputGroup>
                </div>
                <div class="flex justify-center mt-8">
                    <Button
                        type="button"
                        label="修改密码"
                        severity="secondary"
                        :loading="loading"
                        @click="submitChangePassword"
                        class="login-button"
                    >
                    </Button>
                </div>
                <div class="flex justify-center mt-4">
                    <Button
                        type="button"
                        label="返回"
                        severity="secondary"
                        text
                        @click="router.back()"
                        :disabled="loading"
                    >
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, 
        var(--bg-primary) 0%, 
        var(--bg-secondary) 50%, 
        var(--bg-primary) 100%);
}

.login-card {
    width: 100%;
    max-width: 480px;
    padding: 3rem 2.5rem;
    background: var(--bg-surface);
    border-radius: 24px;
    box-shadow: 0 20px 60px var(--shadow-color);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.login-card:hover {
    box-shadow: 0 25px 70px var(--shadow-color);
    transform: translateY(-2px);
}

.association-header {
    text-align: center;
    margin-bottom: 2rem;
}

.association-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.association-logo i {
    font-size: 2rem;
    color: white;
}

.association-name {
    font-size: 1.75rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1.3;
}

.association-subtitle {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0.5rem 0 0 0;
    letter-spacing: 0.5px;
}

.association-divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
    margin: 1.5rem auto;
    border-radius: 2px;
}

.login-form {
    margin-top: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.login-button {
    width: 100%;
    max-width: 200px;
    height: 44px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px var(--shadow-color);
}

@media (max-width: 768px) {
    .login-card {
        padding: 2rem 1.5rem;
    }
    
    .association-name {
        font-size: 1.5rem;
    }
    
    .association-subtitle {
        font-size: 1rem;
    }
}
</style>

