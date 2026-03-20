<script setup>
import { useRoute } from 'vue-router'

import { useNavbarStore } from '@/stores/navbar'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const navbarStore = useNavbarStore()
const themeStore = useThemeStore()
const userStore = useUserStore()

const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-home',
        jump: 'home',
    },
    {
        label: 'News',
        icon: 'pi pi-book',
        jump: 'news_list',
    },
    {
        label: 'Events',
        icon: 'pi pi-star',
        jump: 'event_list',
    },
    {
        label: 'Contact',
        icon: 'pi pi-envelope',
        jump: 'recruit',
    },
    {
        label: 'About',
        icon: 'pi pi-user',
        jump: 'about',
    },
])

watch(
    () => route.name,
    () => {
        navbarStore.setCollapsed(false)
    },
    { immediate: true }
)
</script>

<template>
    <div class="fixed-nav">
        <Menubar :model="items" class="nav-content">
            <template #start>
                <span class="my-3 mx-5 text-xl">ZJUCSA</span>
            </template>
            <template #item="{ item, props, hasSubmenu, root }">
                <router-link
                    v-ripple
                    class="flex items-center"
                    v-bind="props.action"
                    :to="{ name: item.jump }"
                >
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                    <Badge
                        v-if="item.badge"
                        :class="{ 'ml-auto': !root, 'ml-2': root }"
                        :value="item.badge"
                    />
                    <span
                        v-if="item.shortcut"
                        class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
                    >
                        {{ item.shortcut }}
                    </span>
                    <i
                        v-if="hasSubmenu"
                        :class="[
                            'pi pi-angle-down',
                            {
                                'pi-angle-down ml-2': root,
                                'pi-angle-right ml-auto': !root,
                            },
                        ]"
                    ></i>
                </router-link>
            </template>
            <template #end>
                <div class="nav-actions">
                    <button
                        @click="themeStore.toggleTheme()"
                        class="theme-toggle-nav"
                        :title="themeStore.isDark ? '切换到浅色模式' : '切换到深色模式'"
                    >
                        <i v-if="themeStore.isDark" class="pi pi-sun"></i>
                        <i v-else class="pi pi-moon"></i>
                    </button>
                    <csa-user v-if="userStore.uid" />
                </div>
            </template>
        </Menubar>
    </div>
</template>

<style>
.fixed-nav {
    --nav-action-bg: rgba(var(--bg-surface-rgb), 0.72);
    --nav-action-bg-hover: rgba(var(--bg-surface-rgb), 0.8);
    --nav-action-border: rgba(255, 255, 255, 0.42);
    --nav-action-border-hover: rgba(255, 255, 255, 0.52);
    --nav-action-shadow: none;
    --nav-action-shadow-hover: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    margin: 0;
    padding: 0;
    border: none;
}

.dark .fixed-nav {
    --nav-action-bg: rgba(45, 45, 45, 0.72);
    --nav-action-bg-hover: rgba(52, 52, 52, 0.82);
    --nav-action-border: rgba(255, 255, 255, 0.08);
    --nav-action-border-hover: rgba(255, 255, 255, 0.14);
    --nav-action-shadow: none;
    --nav-action-shadow-hover: none;
    background-color: rgba(30, 30, 30, 0.95);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.fixed-nav .p-menubar {
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.fixed-nav .p-menubar a {
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.fixed-nav .p-menubar a:hover {
    color: var(--accent-color);
}

.fixed-nav .my-3 {
    color: var(--text-primary);
    font-weight: bold;
    transition: color 0.3s ease;
}

.p-menubar {
    background: transparent !important;
    border: none !important;
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.p-menubar .p-menuitem-link {
    color: var(--text-primary) !important;
    transition: color 0.3s ease;
}

.p-menubar .p-menuitem-link:hover {
    color: var(--accent-color) !important;
    background-color: rgba(102, 126, 234, 0.1) !important;
}

.p-menubar .p-menuitem.p-highlight .p-menuitem-link {
    color: var(--accent-color) !important;
    background-color: rgba(102, 126, 234, 0.1) !important;
}

.nav-button-container {
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 1001;
}

.nav-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-surface) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 8px var(--shadow-color) !important;
}

.nav-toggle-btn:hover {
    background: var(--bg-secondary) !important;
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--shadow-color) !important;
}

.nav-collapsed {
    transform: translateY(-100%);
    opacity: 0;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.theme-toggle-nav {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    border: 1px solid var(--nav-action-border);
    background: var(--nav-action-bg);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: var(--nav-action-shadow);
}

.theme-toggle-nav:hover {
    background: var(--nav-action-bg-hover);
    border-color: var(--nav-action-border-hover);
    box-shadow: var(--nav-action-shadow-hover);
}

.theme-toggle-nav:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.35);
    outline-offset: 2px;
}

.theme-toggle-nav i {
    font-size: 1rem;
}
</style>
