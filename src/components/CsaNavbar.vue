<script setup>
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'

const route = useRoute()

import { useNavbarStore } from '@/stores/navbar'
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
        // jump: 'contact'
    },
    {
        label: 'About',
        icon: 'pi pi-user',
        jump: 'about',
    },
])

const isAboutPage = ref(false)
watch(
    () => route.name,
    val => {
        if (val !== 'about') {
            isAboutPage.value = false
            navbarStore.isCollapsed = false // 进入其他页面时收起导航栏
        } else {
            isAboutPage.value = true
        }
    }
)
</script>

<template>
    <!-- 收起导航栏的按钮，点击翻转isCollapsed的值， 目前只适用于about，没对其它页面做测试 -->
    <div class="nav-button-container">
        <Button
            v-if="isAboutPage"
            :icon="
                navbarStore.isCollapsed
                    ? 'pi pi-chevron-down'
                    : 'pi pi-chevron-up'
            "
            @click="navbarStore.toggleNav"
            class="nav-toggle-btn"
            severity="secondary"
            text
            rounded
        />
    </div>

    <div
        class="card"
        :class="[
            isAboutPage ? 'about-nav' : 'fixed-nav',
            navbarStore.isCollapsed ? 'nav-collapsed' : '',
        ]"
    >
        <!-- 不确定其它页面是否也要采取position:absolute(这会带来一些问题)或者其他设置, 所以仅对about页面进行特殊处理，但navbar的z-index所有页面都设置得高一点应该是合理的，需要的话直接把about的判断去掉，全部用about-nav就行了(( -->

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
                        >{{ item.shortcut }}</span
                    >
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
                <div class="flex items-center gap-2">
                    <button 
                        @click="themeStore.toggleTheme()" 
                        class="theme-toggle-nav"
                        :title="themeStore.isDark ? '切换到浅色模式' : '切换到深色模式'"
                    >
                        <i v-if="themeStore.isDark" class="pi pi-sun"></i>
                        <i v-else class="pi pi-moon"></i>
                    </button>
                    <!-- 未登录时显示登录按钮 -->
                    <router-link v-if="!userStore.uid" :to="{ name: 'login' }">
                        <Button label="登录" severity="secondary" class="mx-2 min-w-40" />
                    </router-link>
                    <!-- 已登录时显示用户组件 -->
                    <csa-user v-else class="mx-2" />
                </div>
            </template>
        </Menubar>
    </div>
</template>

<style>
.fixed-nav {
    position: absolute;
    /* 不使用absolute会导致部分页面层叠顺序出错 */
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.about-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(6px);
    transition: background-color 0.3s ease, color 0.3s ease;
}

/* 深色模式下的导航栏样式 */
.dark .fixed-nav {
    background-color: rgba(30, 30, 30, 0.9);
}

.dark .about-nav {
    background-color: rgba(0, 0, 0, 0.8);
}

/* 导航栏文字颜色适配主题 */
.fixed-nav .p-menubar,
.about-nav .p-menubar {
    color: var(--text-primary);
    transition: color 0.3s ease;
}

/* 导航栏链接颜色适配主题 */
.fixed-nav .p-menubar a,
.about-nav .p-menubar a {
    color: var(--text-primary);
    transition: color 0.3s ease;
}

.fixed-nav .p-menubar a:hover,
.about-nav .p-menubar a:hover {
    color: var(--accent-color);
}

/* 导航栏品牌名称颜色 */
.fixed-nav .my-3,
.about-nav .my-3 {
    color: var(--text-primary);
    font-weight: bold;
    transition: color 0.3s ease;
}

.about-nav .p-menubar {
    background: transparent !important;
    color: var(--text-primary);
    transition: color 0.3s ease;
}

/* 确保PrimeVue组件也适配主题 */
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

/*折叠导航栏的按钮*/
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
.about-nav {
    transition: all 0.3s ease; /* 添加过渡效果 */
    /* z-index: 1001; */
}
.nav-collapsed {
    transform: translateY(-100%);
    opacity: 0;
}

/* 导航栏主题切换按钮 */
.theme-toggle-nav {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: var(--bg-surface);
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px var(--shadow-color);
}

.theme-toggle-nav:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px var(--shadow-color);
}

.theme-toggle-nav i {
    font-size: 1rem;
}
</style>
