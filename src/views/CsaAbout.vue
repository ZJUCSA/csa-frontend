<!--  关于我们  -->

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

//引入各个section组件
import AboutUs from './CsaAbout/AboutUs.vue'
import Vision from './CsaAbout/AboutVision.vue'
import Timeline from './CsaAbout/AboutTimeline.vue'
import Team from './CsaAbout/AboutTeam.vue'
import Activities from './CsaAbout/AboutActivities.vue'
import Venue from './CsaAbout/AboutVenue.vue'
import Test from './CsaAbout/AboutTest.vue'

import '@/assets/about/styles/about.css' //引入公有样式

const parallaxBg = ref(null)

// 添加节流函数， 原始函数+延迟时间(ms)
function throttle(fn, delay) {
  let timer = null
  return function() {
    if (timer) return //计时器如果已存在，则直接返回
    timer = setTimeout(() => {
      fn.apply(this, arguments)
      timer = null
    }, delay)
  }
}

onMounted(() => {
  const sections = document.querySelectorAll('.section')

  // 使用节流包装 handleScroll
  const throttledScroll = throttle(() => {
    // 视差滚动效果
    if (parallaxBg.value) {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      // 计算滚动百分比，确保滚动到底部时图片底部对齐
      const scrollPercentage = (scrolled / maxScroll) * 66.7 // 这里的倍率取决于.parallax-bg的高度
      parallaxBg.value.style.transform = `translateY(-${scrollPercentage}%)`
    }

    // section滚动效果
    sections.forEach(section => {
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // 计算section在视口中的可见比例（相对于视口高度）
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
      const visibleRatio = Math.max(0, Math.min(1, visibleHeight / windowHeight))

      // 根据可见比例设置透明度和模糊效果
      section.style.opacity = (visibleRatio > 0.9) ? 1 : visibleRatio/0.9
      //可见比例占到屏幕的90%就让它完全不透明吧,占满的要求还是有点高了
      section.style.backdropFilter = `blur(${8 - (visibleRatio * 8)}px)`
      // section.style.transform = `translateY(${20 - (visibleRatio * 20)}px)` //或许可以优化视觉效果(更流畅)，但上滑和下滑的表现不可兼得,可能起到反效果
    })
  }, 8) // 125fps的更新频率

  window.addEventListener('scroll', throttledScroll)
  throttledScroll() // 初始化

  onUnmounted(() => {
    window.removeEventListener('scroll', throttledScroll)
  })
})
</script>


<template>
  <head>
    <title>关于我们-CSA-网络空间安全协会</title>
    <meta name='about' content="协会介绍-about界面">
  </head>

  <div class="about-container">

    <!-- 背景图片， 图片z-index=-1, 遮罩层z-index=0 -->
    <div class="parallax-bg" ref="parallaxBg"></div>
    <div class="parallax-overlay"></div>

    <!-- 各个板块组件 -->
    <!-- 关于我们 -->
    <AboutUs />

    <!-- 协会愿景 -->
    <Vision />

    <!-- 发展历程 -->
    <Timeline />

    <!-- 核心团队 -->
    <Team />

    <!-- 社团活动 -->
    <Activities />

    <!-- 活动场所 -->
    <Venue />

    <!-- 测试用 -->
    <Test />

  </div>
</template>

<style>

/* 其它公有样式通过import引入 */

/* 简单定义背景样式 */
.parallax-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%; /*使背景宽度占满整个视口宽度*/
  height: 300%; /* 背景高度为3倍视口高度 ;这里也不可以随便填，用来调整容器尺寸，图片自适应cover容器，故而调整背景图的显示尺寸，现在的滚动逻辑会受到这个参数的影响，但是好改，改一下倍率即可，背景图一旦选定则长期不改，可以接受。去handleScroll()里找视差效果实现的代码 */
  background-image: url('@/assets/about/background/bg.jpg');
  background-size: cover;  /* 如果使用100% auto的话，如果图片尺寸和容器大小没调好...那么图片会反复，还是别了 */
  /*但是100% auto对变化大小的窗口表现更好，对手机端的表现应该也更好，考虑是否要优化 */
  background-position: center top; /*水平方向居中对齐，垂直方向顶部对齐*/
  transform: translate3d(0,0,0); /* 独立的图层，触发GPU加速，防止页面重排 */
  z-index: -1;
  will-change: transform; /* 提前告知，优化性能 */
}
/* 定义遮罩 */
.parallax-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  z-index: 0;
}
</style>
