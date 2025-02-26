<script setup>
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
</script>

<template>
    <div class="card fixed-nav fixed-nav-opacity">
        <Menubar :model="items">
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
.fixed-nav{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.1); /*想设一个透明度但是失败了？可能下面的东西也设了这个覆盖了,试着穿透也穿透不下去，虽然丑了点但是应该不影响使用..*/
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

</style>
