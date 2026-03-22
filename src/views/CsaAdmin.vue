<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

const SIDEBAR_COLLAPSED_KEY = 'csa-admin-sidebar-collapsed'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const sidebarCollapsed = ref(
    typeof window !== 'undefined' &&
        window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
)

watch(sidebarCollapsed, value => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    }
})

const isActiveRoute = routeName => route.name === routeName

const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
}

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

const dataManagementEntries = [
    ['信息管理', 'pi pi-file-edit', 'admin-news'],
    ['活动管理', 'pi pi-calendar', 'admin-event'],
]

const userManagementEntries = [
    ['用户管理', 'pi pi-user', 'admin-users'],
    ['纳新管理', 'pi pi-user-plus', 'admin-recruit'],
    ['面试管理', 'pi pi-comments', 'admin-interview'],
    ['干事管理', 'pi pi-users', 'admin-member'],
]

const createMenuItems = entries =>
    entries.map(([label, icon, routeName]) =>
        createMenuItem(label, icon, routeName)
    )

const expandedItems = computed(() => [
    {
        label: '数据管理',
        items: createMenuItems(dataManagementEntries),
    },
    {
        label: '用户管理',
        items: createMenuItems(userManagementEntries),
    },
])

const collapsedItems = computed(() => [
    ...createMenuItems(dataManagementEntries),
    {
        separator: true,
        class: 'collapsed-group-divider',
    },
    ...createMenuItems(userManagementEntries),
])

const menuItems = computed(() =>
    sidebarCollapsed.value ? collapsedItems.value : expandedItems.value
)
</script>

<template>
    <div
        class="admin-layout flex min-h-screen"
        :class="themeStore.isDark ? 'dark' : ''"
    >
        <aside
            class="admin-sidebar border-r theme-transition"
            :class="{ 'is-collapsed': sidebarCollapsed }"
            :style="{
                backgroundColor: themeStore.isDark
                    ? 'var(--admin-sidebar-bg)'
                    : 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
            }"
        >
            <div class="admin-sidebar__header">
                <div class="admin-sidebar__title-wrap">
                    <div class="admin-sidebar__eyebrow">CSA Admin</div>
                    <div class="admin-sidebar__title">后台导航</div>
                </div>

                <Button
                    class="admin-sidebar__collapse"
                    text
                    rounded
                    :icon="
                        sidebarCollapsed
                            ? 'pi pi-angle-right'
                            : 'pi pi-angle-left'
                    "
                    :aria-label="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
                    @click="toggleSidebar"
                />
            </div>

            <div class="admin-sidebar__menu py-6">
                <Menu :model="menuItems" />
            </div>
        </aside>

        <div
            class="admin-content grow min-w-0 p-8 theme-transition"
            :style="{
                backgroundColor: themeStore.isDark
                    ? 'var(--admin-content-bg)'
                    : 'var(--bg-secondary)',
            }"
        >
            <router-view />
        </div>
    </div>
</template>

<style scoped>
.admin-layout {
    width: 100%;
    --admin-sticky-offset: 70px;
    --admin-sidebar-bg: var(--bg-surface);
    --admin-content-bg: var(--bg-secondary);
    background: var(--bg-secondary);
}

.admin-layout.dark {
    --bg-primary: #162131;
    --bg-secondary: #1b2738;
    --bg-surface: #243246;
    --text-primary: #f8fafc;
    --text-secondary: #9eb0c7;
    --border-color: rgba(148, 163, 184, 0.18);
    --shadow-color: rgba(2, 6, 23, 0.42);
    --accent-color: #66a8ff;
    --accent-hover: #8bbcff;
    --admin-sidebar-bg: #1d2a3c;
    --admin-content-bg: #131c2b;
    background: #0f172a;
}

.admin-sidebar {
    width: 16rem;
    min-width: 16rem;
    flex: 0 0 16rem;
    position: sticky;
    top: var(--admin-sticky-offset);
    align-self: flex-start;
    height: calc(100vh - var(--admin-sticky-offset));
    display: flex;
    flex-direction: column;
    box-shadow:
        inset -1px 0 0 rgba(148, 163, 184, 0.08),
        18px 0 40px -36px rgba(15, 23, 42, 0.48);
    transition:
        width 0.28s ease,
        min-width 0.28s ease,
        flex-basis 0.28s ease,
        background-color 0.3s ease,
        border-color 0.3s ease;
}

.admin-sidebar.is-collapsed {
    width: 5rem;
    min-width: 5rem;
    flex-basis: 5rem;
}

.admin-content {
    min-height: calc(100vh - var(--admin-sticky-offset));
}

.admin-layout.dark .admin-content {
    box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.06);
}

.admin-sidebar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 14px 12px;
}

.admin-sidebar__title-wrap {
    min-width: 0;
}

.admin-sidebar__eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    white-space: nowrap;
}

.admin-sidebar__title {
    margin-top: 4px;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
}

.admin-sidebar__collapse {
    width: 2.25rem;
    height: 2.25rem;
    flex-shrink: 0;
    color: var(--text-secondary) !important;
}

.admin-sidebar__collapse:hover {
    background: rgba(102, 126, 234, 0.08) !important;
    color: var(--accent-color) !important;
}

.admin-sidebar__menu {
    flex: 1;
    overflow-y: auto;
}

.admin-sidebar.is-collapsed .admin-sidebar__header {
    justify-content: center;
    padding: 16px 12px 12px;
}

.admin-sidebar.is-collapsed .admin-sidebar__title-wrap {
    display: none;
}

::v-deep(.p-menu) {
    width: 100%;
    min-width: 0 !important;
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
    white-space: nowrap;
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
    white-space: nowrap;
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

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-list) {
    width: 100%;
    padding: 0 12px;
    gap: 8px;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item) {
    width: 100%;
    display: block;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item-content) {
    width: 100%;
    min-width: 0;
    border-radius: 8px !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item-link) {
    justify-content: center;
    width: 100%;
    min-width: 0;
    min-height: 44px !important;
    padding: 12px !important;
    gap: 0 !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-submenu-label),
.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item-label) {
    display: none !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item-icon) {
    width: 18px !important;
    min-width: 18px !important;
    font-size: 18px !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item.route-active > .p-menu-item-content) {
    background-color: rgba(102, 126, 234, 0.16) !important;
    color: var(--accent-color) !important;
    box-shadow: none !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item.route-active > .p-menu-item-content:hover) {
    background-color: rgba(102, 126, 234, 0.18) !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item:not(.route-active):not(.p-disabled) > .p-menu-item-content:hover),
.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-item.p-focus:not(.route-active):not(.p-disabled) > .p-menu-item-content) {
    background-color: rgba(102, 126, 234, 0.1) !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-separator) {
    display: block !important;
    width: auto;
    margin: 8px 12px !important;
}

.admin-sidebar.is-collapsed ::v-deep(.p-menu .p-menu-separator.collapsed-group-divider) {
    border-color: var(--border-color) !important;
}
</style>
