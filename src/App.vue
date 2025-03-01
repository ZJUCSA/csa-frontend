<template>
    <csa-navbar />
    <div class="main-content-area">
        <router-view />
    </div>
    <csa-footer />
</template>

<style>
/* Global styles can go here */
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    margin-top: 0;
    margin-bottom: 6rem;
}

html {
    position: relative;
    min-height: 100%;
}

body {
    margin: 0 0 3.5rem;
}

.main-content-area {
    padding-top: 70px;
    padding-bottom: 56px;
}
</style>
