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
import ConfirmationService from 'primevue/confirmationservice'

import { useThemeStore } from './stores/theme'


const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(AxiosPlugin)
app.use(pinia)
app.use(router)
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
        // dismissible: ,
    ripple: false,
    types: [
        {
            type: 'success',
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
            icon: {
                className: 'pi pi-check-circle',
                tagName: 'i',
                color: '#2e7d32'
            }
        },
        {
            type: 'error',
            background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
            icon: {
                className: 'pi pi-times-circle',
                tagName: 'i',
                color: '#c62828'
            }
        },
        {
            type: 'warning',
            background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
            icon: {
                className: 'pi pi-exclamation-triangle',
                tagName: 'i',
                color: '#ef6c00'
            }
        },
        {
            type: 'info',
            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            icon: {
                className: 'pi pi-info-circle',
                tagName: 'i',
                color: '#1565c0'
            }
        }
    ]
})

// 初始化主题
const themeStore = useThemeStore(pinia)
themeStore.initTheme()

app.mount('#app')
