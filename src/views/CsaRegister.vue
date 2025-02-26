<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const axios = inject('axios')

if (!route.query.code) {
    const REDIRECT_URI = encodeURIComponent(window.location.host + '/register')
    let url = `https://zjuam.zju.edu.cn/cas/oauth2.0/authorize?response_type=code&client_id=${CAS_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
    window.location.href = url
}

const seid = ref(null)
const data = ref(null)
const miniapp = ref(null)
const miniappStatus = ref(false)
const finished = ref(false)

let timer

axios
    .post('/register/new_sess', {
        code: route.query.code,
    })
    .then(res => {
        seid.value = res.data.seid
        data.value = res.data
    })
    .then(() => {
        getMiniappCode()
    })

const getMiniappCode = () => {
    axios
        .get('/register/miniapp_code', {
            params: {
                seid: seid,
            },
        })
        .then(res => {
            miniapp.value = 'data:image/png;base64,' + res.data.code
            timer = setInterval(getMiniappStatus, 1000)
        })
}

const getMiniappStatus = () => {
    axios
        .get('/register/miniapp_status', {
            params: {
                seid: seid,
            },
        })
        .then(res => {
            miniappStatus.value = res.data.status
            if (res.data.status === true) {
                clearInterval(timer)
            }
        })
}

const submit = () => {
    axios
        .post('/register/submit', {
            seid: seid,
        })
        .then(() => {
            finished.value = true
        })
}
</script>

<template>
    <div>
        <div>姓名</div>
        <div>{{ data.nick }}</div>
    </div>
    <div>
        <div>学号</div>
        <div>{{ data.uid }}</div>
    </div>
    <div>
        <div>微信小程序绑定码</div>
        <img :src="miniapp" alt="miniapp" />
    </div>
    <div>
        <Button label="提交" @click="submit" :disabled="!miniappStatus" />
    </div>
    <div v-if="finished">
        <div>提交成功</div>
    </div>
</template>
