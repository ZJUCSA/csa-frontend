<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const op = ref()

// 根据用户类型动态生成菜单
const members = computed(() => {
    if (userStore.isAdmin) {
        // 管理员菜单
        return [
            {
                name: '后台管理',
                icon: 'pi pi-cog',
                action: () => router.push({ name: 'admin' }),
            },
            {
                name: '登出',
                icon: 'pi pi-sign-out',
                action: () => {
                    userStore.logout()
                    router.push({ name: 'home' })
                },
            },
        ]
    } else {
        // 普通用户菜单
        return [
            {
                name: '用户后台',
                icon: 'pi pi-user',
                action: () => router.push({ name: 'user' }),
            },
            {
                name: '登出',
                icon: 'pi pi-sign-out',
                action: () => {
                    userStore.logout()
                    router.push({ name: 'home' })
                },
            },
        ]
    }
})

// 显示昵称前4个字符
const displayNick = computed(() => {
    if (!userStore.nick) return ''
    return userStore.nick.substring(0, 4)
})

const toggle = event => {
    op.value.toggle(event)
}

const selectMember = member => {
    member.action()
    op.value.hide()
}
</script>

<template>
    <div class="card flex justify-center" v-if="userStore.uid">
        <Button
            type="button"
            :label="displayNick"
            severity="secondary"
            @click="toggle"
            class="min-w-40"
        />

        <Popover ref="op">
            <div class="flex flex-col gap-4">
                <div>
                    <ul class="p-0 mx-1 flex flex-col">
                        <li
                            v-for="member in members"
                            :key="member.name"
                            class="flex items-center gap-2 px-4 py-2 hover:bg-neutral-400/5 cursor-pointer rounded"
                            @click="selectMember(member)"
                        >
                            <i :class="member.icon"></i>
                            <span>{{ member.name }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Popover>
    </div>
</template>
