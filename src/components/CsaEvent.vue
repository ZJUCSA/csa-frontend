<script setup>
const events = ref([
    { id: 1, title: 'CTF 竞赛即将开启' },
    { id: 2, title: '技术分享会报名中' },
    { id: 3, title: '安全训练营开始招募' },
])
</script>

<template>
    <section id="events">
        <h2>最新动态</h2>
        <ul>
            <li v-for="event in events" :key="event.id">{{ event.title }}</li>
        </ul>
    </section>
</template>

<style>
#events {
    padding: 2rem;
    background-color: #f9f9f9;
}

#events ul {
    list-style-type: none;
    padding: 0;
}

#events li {
    font-size: 1.2rem;
    margin: 1rem 0;
}
</style>
