import './style.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { AxiosPlugin } from './axios'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

const app = createApp(App)
const pinia = createPinia()

app.use(AxiosPlugin)
app.use(pinia)
app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
})

app.mount('#app')
