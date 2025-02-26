import './style.css'
import 'primeicons/primeicons.css'
import 'notyf/notyf.min.css'
import 'vditor/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

import { AxiosPlugin } from './axios'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { Notyf } from 'notyf'
import VueVditor from 'vue-vditor'
import ConfirmationService from 'primevue/confirmationservice'


const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(AxiosPlugin)
app.use(pinia)
app.use(router)
app.use(VueVditor)
app.use(ConfirmationService)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
})

window.notyf = new Notyf({
    position: {
        x: 'right',
        y: 'top',
    },
    duration: 2000,
})

app.mount('#app')
