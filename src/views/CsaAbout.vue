<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// 引入各个section组件
import AboutUs from './CsaAbout/AboutUs.vue'
import Vision from './CsaAbout/AboutVision.vue'
import Timeline from './CsaAbout/AboutTimeline.vue'
import Team from './CsaAbout/AboutTeam.vue'
import Activities from './CsaAbout/AboutActivities.vue'
import Venue from './CsaAbout/AboutVenue.vue'

import '@/assets/about/styles/about.css'

let sections = []
let rafId = null

const handleScroll = () => {
  sections.forEach(section => {
    const rect = section.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
    const visibleRatio = Math.max(0, Math.min(1, visibleHeight / (windowHeight * 0.5)))
    section.style.opacity = Math.max(0.5, visibleRatio)
  })
}

const scrollHandler = () => {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(handleScroll)
}

onMounted(() => {
  sections = document.querySelectorAll('.section')
  window.addEventListener('scroll', scrollHandler, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', scrollHandler)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <head>
    <title>关于我们-CSA-网络空间安全协会</title>
    <meta name='about' content="协会介绍-about界面">
  </head>

  <div class="about-container">
    <!-- 各个板块组件 -->
    <AboutUs />
    <Vision />
    <Timeline />
    <Team />
    <!-- <Activities /> -->
    <Venue />
  </div>
</template>

<style>
.about-container {
  width: 100%;
  background: var(--bg-secondary);
  min-height: 100%;
  box-sizing: border-box;
  padding: 0;
  position: relative;
  transition: background 0.3s ease;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
</style>
