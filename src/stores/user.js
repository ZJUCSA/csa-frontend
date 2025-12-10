import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore(
    'user',
    () => {
        const uid = ref(null)
        const nick = ref(null)
        const access_token = ref(null)
        const expires = ref(new Date().getTime())
        const user_type = ref(null) // 'admin' | 'user'
        const admin_role_id = ref(null) // 7=管理员, 8=发布者, 9=运维

        function login(user_access_token, user_uid, user_nick, user_expires, type = 'user', roleId = null) {
            access_token.value = user_access_token
            uid.value = user_uid
            nick.value = user_nick
            expires.value = user_expires
            user_type.value = type
            admin_role_id.value = roleId
        }

        function logout() {
            uid.value = null
            nick.value = null
            access_token.value = null
            expires.value = new Date().getTime()
            user_type.value = null
            admin_role_id.value = null
        }

        // 计算属性：是否为管理员
        const isAdmin = computed(() => user_type.value === 'admin')

        return { uid, access_token, nick, expires, user_type, admin_role_id, isAdmin, login, logout }
    },
    {
        persist: {
            storage: sessionStorage,
        },
    }
)
