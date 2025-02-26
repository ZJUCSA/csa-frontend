<script setup>
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
        .post('/user/login/admin', {
            uid: loginForm.uid,
            passwd: loginForm.passwd,
        })
        .catch(() => {
            loading.value = false
        })
        .then(async response => {
            if (response.data.access_token) {
                let token = response.data.access_token
                let payload = JSON.parse(atob(token.split('.')[1]))
                userStore.login(
                    token,
                    payload.uid,
                    payload.nick,
                    payload.exp * 1000
                )
                loading.value = true
                router.push({ name: 'home' })
            }
        })
}
</script>

<template>
    <div class="mx-8 w-auto md:mx-auto md:w-[60vw] lg:w-[40vw] mt-[15vh]">
        <div class="border px-8 md:px-20 py-12 rounded-2xl">
            <p class="text-lg mb-2">浙江大学学生网络空间协会</p>
            <p class="text-4xl font-bold">登录</p>
            <div size="large" class="mt-10">
                <div>
                    <p class="mb-2">用户名</p>
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
                <div class="mt-4">
                    <p class="mb-2">密码</p>
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
                <div class="flex gap-x-4 justify-center mt-12">
                    <Button
                        class="basis-1/2"
                        label="登录"
                        :loading="loading"
                        @click="submitLogin"
                    >
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
