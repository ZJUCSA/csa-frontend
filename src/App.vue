<template>
    <csa-navbar />
    <div class="main-content-area">
        <router-view />
    </div>
    <csa-footer v-if="!hideFooter" />
    <ConfirmDialog />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import CsaNavbar from './components/CsaNavbar.vue'
import CsaFooter from './components/CsaFooter.vue'
import ConfirmDialog from 'primevue/confirmdialog'

const route = useRoute()
const hideFooter = computed(() => Boolean(route.meta?.hideFooter))
</script>

<style>
/* Global styles can go here */
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
}

html {
    min-height: 100%;
}

body {
    margin: 0;
    min-height: 100vh;
    background: var(--bg-secondary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 70px;
    background: var(--bg-secondary);
    --page-footer-gap: 56px;
}

.main-content-area > * {
    flex: 1 0 auto;
    width: 100%;
}
</style>
