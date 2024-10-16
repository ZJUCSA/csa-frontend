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
    <div class="card">
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
