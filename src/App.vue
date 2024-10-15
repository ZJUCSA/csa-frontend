<template>
    <div id="app">
        <csa-navbar />
        <router-view />
        <csa-footer />
    </div>
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
</style>
