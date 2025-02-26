<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

const toggleNav = () => {
    isCollapsed.value = !isCollapsed.value
}

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
        jump: 'contact',
    },
    {
        label: 'About',
        icon: 'pi pi-user',
        jump: 'about',
    },
])

const isAboutPage = computed(() => route.name === 'about')
</script>

<template>

    <!-- 收起导航栏的按钮，点击翻转isCollapsed的值， 目前只适用于about，没对其它页面做测试 -->
    <div class="nav-button-container">
        <Button
            v-if="isAboutPage"
            icon="pi pi-bars"
            @click="toggleNav"
            class="nav-toggle-btn"
            severity="secondary"
            text
            rounded
        />
    </div>


    <div class="card" :class="[isAboutPage ? 'about-nav' : 'fixed-nav', isCollapsed ? 'nav-collapsed' : '']">
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
                <csa-user class="mx-2" />
            </template>
        </Menubar>
    </div>
</template>

<style>
.fixed-nav {
    /* position: fixed; */
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.9); /*想设一个透明度但是失败了？可能下面的东西也设了这个覆盖了,试着穿透也穿透不下去，虽然丑了点但是应该不影响使用..*/
    backdrop-filter: blur(10px);
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 阴影*/
}

.about-nav {
    position: fixed; /* 改用absolute，那么屏幕向下滚动navbar就会隐藏； 现在会和导航栏收起的功能冲突了 */
    /*或许只要给navbar一个透明效果，fixed也不是不能接受 */
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(6px);
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
}
.about-nav .p-menubar { /*使用deep失败了，但是这样似乎可行，透明度穿下来了 */
    background: transparent !important;
}

/*折叠导航栏的按钮*/
.nav-button-container {
    position: fixed;
    right: 1rem;
    top: 1rem;
    z-index: 1001;
}
.nav-toggle-btn {
    /* 移除position: fixed，因为现在由容器控制位置 */
    display: flex;
    align-items: center;
    justify-content: center;
}
.nav-content {
    transition: all 0.3s ease; /* 添加过渡效果 */
}
.nav-collapsed {
    transform: translateY(-100%);
    opacity: 0;
}
</style>
