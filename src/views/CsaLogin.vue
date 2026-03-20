<script setup>
import sha256 from 'crypto-js/sha256'

import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)
const axios = inject('axios')

const loginForm = reactive({
    uid: '',
    passwd: '',
})

const submitLogin = () => {
    loading.value = true
    
    axios
        .post('/user/login', {
            uid: loginForm.uid,
            passwd: sha256(loginForm.passwd).toString(),
        })
        .then(async response => {
            if (response.data.access_token) {
                let token = response.data.access_token
                let payload = JSON.parse(atob(token.split('.')[1]))
                
                const isAdmin = payload.aid !== undefined
                const userType = isAdmin ? 'admin' : 'user'
                
                userStore.login(
                    token,
                    payload.uid,
                    payload.nick,
                    payload.exp * 1000,
                    userType,
                    null
                )

                let adminRoleId = null
                if (isAdmin) {
                    try {
                        const statusRes = await axios.get('/user/admin_status')
                        adminRoleId = statusRes.data.admin_role_id
                    } catch (err) {
                        console.error('获取管理员角色失败', err)
                    }
                }
                userStore.login(
                    token,
                    payload.uid,
                    payload.nick,
                    payload.exp * 1000,
                    userType,
                    adminRoleId
                )
                loading.value = false
                router.push({ name: 'user' })
            }
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
                <!-- <h2 class="association-subtitle"></h2>
                <div class="association-logo">
                    <i class="pi pi-shield"></i>
                </div> -->
                <div class="association-divider"></div>
            </div>
            <div class="flex items-center justify-center gap-x-4 mb-8">
                <p class="text-3xl font-bold">登录</p>
            </div>
            <div class="login-form">
                <div class="form-group">
                    <p class="form-label">用户名</p>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText
                            v-model="loginForm.uid"
                            placeholder="用户名"
                        />
                    </InputGroup>
                </div>
                <div class="form-group">
                    <p class="form-label">密码</p>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"> </i>
                        </InputGroupAddon>
                        <Password
                            v-model="loginForm.passwd"
                            :feedback="false"
                            placeholder="密码"
                        />
                    </InputGroup>
                </div>
                <div class="flex justify-center mt-8">
                    <Button
                        type="button"
                        label="登录"
                        severity="secondary"
                        :loading="loading"
                        @click="submitLogin"
                        class="login-button"
                    >
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 2rem calc(2rem + var(--page-footer-gap));
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
