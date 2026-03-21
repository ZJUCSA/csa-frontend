<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const isActiveRoute = routeName => route.name === routeName

const createMenuItem = (label, icon, routeName) => ({
    label,
    icon,
    class: isActiveRoute(routeName) ? 'route-active' : '',
    command: () => {
        if (!isActiveRoute(routeName)) {
            router.push({ name: routeName })
        }
    },
})

const items = computed(() => [
    {
        label: '数据管理',
        items: [
            createMenuItem('信息管理', 'pi pi-file-edit', 'admin-news'),
            createMenuItem('活动管理', 'pi pi-calendar', 'admin-event'),
        ],
    },
    {
        label: '用户管理',
        items: [
            createMenuItem('用户管理', 'pi pi-user', 'admin-users'),
            createMenuItem('纳新管理', 'pi pi-user', 'admin-recruit'),
            createMenuItem('面试管理', 'pi pi-comments', 'admin-interview'),
            createMenuItem('干事管理', 'pi pi-users', 'admin-member'),
        ],
    },
])
</script>

<template>
    <div class="flex min-h-screen">
        <div
            class="w-64 min-h-screen border-r theme-transition"
            :class="themeStore.isDark ? 'dark' : ''"
            :style="{
                backgroundColor: themeStore.isDark
                    ? 'var(--bg-primary)'
                    : 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
            }"
        >
            <div class="py-8">
                <Menu :model="items" />
            </div>
        </div>

        <div
            class="grow min-w-0 p-8 theme-transition"
            :class="themeStore.isDark ? 'dark' : ''"
            :style="{
                backgroundColor: themeStore.isDark
                    ? 'var(--bg-primary)'
                    : 'var(--bg-secondary)',
            }"
        >
            <router-view />
        </div>
    </div>
</template>

<style scoped>
::v-deep(.p-menu) {
    width: 100%;
    border: none;
    box-shadow: none;
    background: transparent;
    padding: 0;
}

::v-deep(.p-menu .p-menu-list) {
    padding: 0 12px;
    gap: 6px;
}

::v-deep(.p-menu .p-menu-item-content) {
    border-radius: 10px !important;
    color: var(--text-primary) !important;
    background: transparent !important;
    transition:
        background-color 0.22s ease,
        color 0.22s ease,
        box-shadow 0.22s ease;
}

::v-deep(.p-menu .p-menu-item-link) {
    padding: 12px 16px !important;
    gap: 12px !important;
    min-height: 48px !important;
    color: inherit !important;
    font-size: 16px !important;
    line-height: 1.4 !important;
}

::v-deep(.p-menu .p-menu-item-icon) {
    margin-right: 0 !important;
    width: 18px !important;
    min-width: 18px !important;
    font-size: 18px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0;
    color: inherit !important;
}

::v-deep(.p-menu .p-menu-item-label) {
    font-size: 16px !important;
    font-weight: 500 !important;
    line-height: 1.4 !important;
    color: inherit !important;
}

::v-deep(.p-menu .p-menu-submenu-label) {
    margin-top: 14px !important;
    padding: 18px 16px 8px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    background: transparent !important;
    color: var(--text-secondary) !important;
}

::v-deep(.p-menu .p-menu-submenu-label:first-child) {
    margin-top: 0 !important;
    padding-top: 0 !important;
}

::v-deep(.p-menu .p-menu-item:not(.route-active):not(.p-disabled) > .p-menu-item-content:hover),
::v-deep(.p-menu .p-menu-item.p-focus:not(.route-active):not(.p-disabled) > .p-menu-item-content) {
    background-color: rgba(102, 126, 234, 0.08) !important;
    color: var(--text-primary) !important;
}

::v-deep(.p-menu .p-menu-item.route-active > .p-menu-item-content) {
    background-color: rgba(102, 126, 234, 0.14) !important;
    color: var(--accent-color) !important;
    box-shadow: inset 4px 0 0 var(--accent-color);
}

::v-deep(.p-menu .p-menu-item.route-active > .p-menu-item-content > .p-menu-item-link) {
    color: inherit !important;
}

::v-deep(.p-menu .p-menu-item.route-active > .p-menu-item-content .p-menu-item-label) {
    font-weight: 600 !important;
}

::v-deep(.p-menu .p-menu-item.route-active > .p-menu-item-content:hover) {
    background-color: rgba(102, 126, 234, 0.14) !important;
}

::v-deep(.p-menu .p-menu-separator) {
    margin: 16px 16px 0 !important;
    border-color: var(--border-color) !important;
}
</style>
