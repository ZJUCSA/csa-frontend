<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const items = ref([
    {
        label: '数据管理',
        items: [
            {
                label: '新闻管理',
                icon: 'pi pi-plus',
                command: () => {
                    router.push({ name: 'admin-news' })
                },
            },
            {
                label: '活动管理',
                icon: 'pi pi-search',
                command: () => {
                    router.push({ name: 'admin-event' })
                },
            },
        ],
    },
    {
        label: '用户管理',
        items: [
            {
                label: '用户管理',
                icon: 'pi pi-cog',
                command: () => {
                    router.push({ path: 'admin-users' })
                },
            },
            {
                label: '会员管理',
                icon: 'pi pi-sign-out',
                command: () => {
                    router.push({ path: 'admin-members' })
                },
            },
        ],
    },
])
</script>

<template>
    <div class="flex">
        <div class="grow-0">
            <div class="card flex justify-center m-4 lg:m-8">
                <Menu :model="items" />
            </div>
        </div>
        <div class="grow min-w-0 my-16">
            <router-view />
        </div>
    </div>
</template>
