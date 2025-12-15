<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

const items = ref([
    {
        label: '数据管理',
        items: [
            {
                label: '新闻管理',
                icon: 'pi pi-file-edit',
                command: () => {
                    router.push({ name: 'admin-news' })
                },
            },
            {
                label: '活动管理',
                icon: 'pi pi-calendar',
                command: () => {
                    router.push({ name: 'admin-event' })
                },
            }
        ],
    },
    {
        label: '用户管理',
        items: [
            {
                label: '用户管理',
                icon: 'pi pi-user',
                command: () => {
                    router.push({ name: 'admin-users' })
                },
            },
            {
                label: '纳新管理',
                icon: 'pi pi-user',
                command: () => {
                    router.push({ name: 'admin-recruit' })
                },
            },
            {
                label: '面试管理',
                icon: 'pi pi-comments',
                command: () => {
                    router.push({ name: 'admin-interview' })
                },
            },
            {
                label: '干事管理',
                icon: 'pi pi-users',
                command: () => {
                    router.push({ name: 'admin-member' })
                },
            }
        ],
    }
])
</script>

<template>
    <div class="flex min-h-screen">
        <!-- 左侧菜单区域 -->
        <div class="w-64 min-h-screen border-r theme-transition"
             :class="themeStore.isDark ? 'dark' : ''"
             :style="{
                 backgroundColor: themeStore.isDark ? 'var(--bg-primary)' : 'var(--bg-surface)',
                 borderColor: themeStore.isDark ? 'var(--border-color)' : 'var(--border-color)'
             }">
            <!-- 菜单容器 -->
            <div class="py-8">
                <Menu :model="items" />
            </div>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="grow min-w-0 p-8 theme-transition"
             :class="themeStore.isDark ? 'dark' : ''"
             :style="{
                 backgroundColor: themeStore.isDark ? 'var(--bg-primary)' : 'var(--bg-secondary)'
             }">
            <router-view />
        </div>
    </div>
</template>

<style scoped>
/* 基础菜单样式 */
::v-deep(.p-menu) {
    width: 100%;
    border: none;
    box-shadow: none;
    background: transparent;
    padding: 0;
}

/* 菜单项 - 中等字号 */
::v-deep(.p-menu .p-menuitem-link) {
    border-radius: 0 !important;
    padding: 16px 24px !important;
    border-left: 4px solid transparent !important;
    margin: 0 !important;
    font-size: 18px !important; /* 18px - 中等大小 */
    font-weight: 500 !important;
    line-height: 1.5 !important;
    min-height: 56px !important;
    display: flex !important;
    align-items: center !important;
    transition: all 0.3s ease !important;
}

/* 应用主题颜色 */
::v-deep(.p-menu .p-menuitem-link) {
    color: var(--text-primary) !important;
    background-color: transparent !important;
}

::v-deep(.p-menu .p-menuitem-link:hover) {
    background-color: rgba(102, 126, 234, 0.1) !important;
    border-left-color: var(--accent-color) !important;
}

::v-deep(.p-menu .p-menuitem-link.p-highlight) {
    background-color: rgba(102, 126, 234, 0.2) !important;
    border-left-color: var(--accent-color) !important;
    color: var(--accent-color) !important;
    font-weight: 600 !important;
    font-size: 19px !important; /* 选中时稍大 */
}

/* 分组标题 - 中等字号 */
::v-deep(.p-menu .p-submenu-header) {
    font-size: 16px !important; /* 16px - 中等大小 */
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    padding: 24px 24px 12px !important;
    background: transparent !important;
    border: none !important;
    margin-top: 16px !important;
    min-height: 48px !important;
    color: var(--text-secondary) !important;
}

::v-deep(.p-menu .p-submenu-header:first-child) {
    margin-top: 0 !important;
}

/* 图标 - 中等大小 */
::v-deep(.p-menu .p-menuitem-icon) {
    margin-right: 16px !important;
    font-size: 20px !important; /* 20px - 中等大小 */
    width: 24px !important;
    min-width: 24px !important;
    text-align: center !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: inherit !important;
}

/* 菜单文字 - 单独控制 */
::v-deep(.p-menu .p-menuitem-text) {
    font-size: 18px !important; /* 18px */
    font-weight: 500 !important;
    line-height: 1.5 !important;
    color: inherit !important;
}

/* 菜单分隔线 */
::v-deep(.p-menu .p-menu-separator) {
    margin: 16px 24px !important;
    border-color: var(--border-color) !important;
    border-width: 1px !important;
    min-height: 1px !important;
}

/* 确保PrimeVue组件的样式覆盖 */
:global(.p-menu) {
    font-size: 18px !important;
}

:global(.p-menu *) {
    font-size: inherit !important;
}
</style>

<style>
/* 全局样式 - 中等字号 */
.p-menu .p-menuitem-link {
    font-size: 18px !important;
}

.p-menu .p-submenu-header {
    font-size: 16px !important;
}

.p-menu .p-menuitem-icon {
    font-size: 20px !important;
}

.p-menu .p-menuitem-text {
    font-size: 18px !important;
}
</style>