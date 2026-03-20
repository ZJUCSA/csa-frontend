<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const op = ref()

const members = computed(() => {
    if (userStore.isAdmin) {
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
    }

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
})

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
    <div v-if="userStore.uid" class="user-menu">
        <Button
            type="button"
            :label="displayNick"
            severity="secondary"
            @click="toggle"
            class="user-trigger"
        />

        <Popover ref="op" class="user-popover">
            <ul class="user-menu-list">
                <li
                    v-for="member in members"
                    :key="member.name"
                    class="user-menu-item"
                    @click="selectMember(member)"
                >
                    <i :class="member.icon"></i>
                    <span>{{ member.name }}</span>
                </li>
            </ul>
        </Popover>
    </div>
</template>

<style scoped>
.user-menu {
    display: inline-flex;
    align-items: center;
}

.user-menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    min-width: 140px;
}

.user-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.user-menu-item:hover {
    background: rgba(102, 126, 234, 0.08);
    color: var(--accent-color);
}

:deep(.user-trigger.p-button) {
    min-width: 6.5rem;
    min-height: var(--nav-action-height, 2.5rem);
    padding: var(--nav-action-padding, 0 1rem);
    border-radius: var(--nav-action-radius, 10px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--nav-action-bg, transparent) !important;
    color: var(--nav-action-color, var(--text-secondary)) !important;
    border: 1px solid var(--nav-action-border, var(--border-color)) !important;
    box-shadow: var(--nav-action-shadow, none) !important;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease,
        box-shadow 0.2s ease;
}

:deep(.user-trigger.p-button:not(:disabled):hover) {
    background: var(--nav-action-bg-hover, var(--bg-secondary)) !important;
    color: var(--nav-action-color-hover, var(--text-primary)) !important;
    border-color: var(--nav-action-border-hover, var(--border-color)) !important;
    box-shadow: var(--nav-action-shadow-hover, none) !important;
}

:deep(.user-trigger.p-button:focus-visible) {
    box-shadow: none;
    outline: 2px solid rgba(102, 126, 234, 0.18);
    outline-offset: 2px;
}

:deep(.user-trigger .p-button-label) {
    font-weight: 600;
    white-space: nowrap;
}

:deep(.user-popover .p-popover-content) {
    padding: 0.5rem;
}
</style>
