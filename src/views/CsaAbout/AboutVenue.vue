<script setup>
import { ref, computed } from 'vue'

// 场地数据， 并不强制要求5个，随便几个都行，至少一个
const venues = [
  {
    image: '@/assets/about/venue/main_room1.png',
    title: '网络空间安全协会活动室',
    description: '位于浙江大学紫金港校区，是我们开展日常活动、技术交流和团队协作的主要场所。配备完善的网络设施和安全设备，为成员提供良好的学习环境。'
  },
  {
    image: '@/assets/about/venue/main_room2.png',
    title: '网安实验室',
    description: '配备专业的网络安全设备和工具，为成员提供实践环境。'
  },
  {
    image: '@/assets/about/venue/meeting_room.png',
    title: '会议室',
    description: '用于举办技术分享会、学术讨论和小组会议的专属空间。'
  }
]

const position = ref(0)  //用来表示card的位置；这个以卡片数量为模，处于性能优化的考量，卡片只有五张，所以只能模5
const isDragging = ref(false)
const startX = ref(0)
const dragThreshold = 100 // 拖动阈值，超过这个值才会触发切换
const imgID = [0%venues.length, 1%venues.length, 2%venues.length, 3%venues.length, 4%venues.length] //五张卡片对应显示的图片的初始索引

const shiftLeft = () => { //imgID全体左移，position在中间的和最右边的显示的图片不变
  //因为最左边的card被移到最右边了，所以显示的图片要更新
  //因为position.value表示第一张卡片的position， 所以position=0的卡片是第index张卡片
  const index = (5 - position.value) % 5 //枚举一下就知道了，直接推也可以
  imgID[index] = (imgID[(index + 4) % 5] + 1) % venues.length
}

const shiftRight = () => { //imgID全体右移, position在中间的和最左边的显示的图片不变
  //最右边的card的图片更新
  //同理，计算出position最右边的卡片在imgID中的index
  const index =(5 - position.value + 4) % 5 // 同理，实际上就是最左边的card的index-1
  imgID[index] = (imgID[(index + 1) % 5] - 1 + venues.length) % venues.length
}

// 计算当前显示的五个卡片索引
const displayCards = computed(() => {
  const len = 5
  return [
    [(position.value) % len, imgID[0]],
    [(position.value + 1) % len, imgID[1]],
    [(position.value + 2) % len, imgID[2]],
    [(position.value + 3) % len, imgID[3]],
    [(position.value + 4) % len, imgID[4]]
  ]
})

const handleMouseDown = (e) => {
  isDragging.value = true
  startX.value = e.clientX
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const deltaX = e.clientX - startX.value

  if (Math.abs(deltaX) > dragThreshold) {
    if (deltaX > 0) {
      // 向右拖动，每个card的位置向右移动，position增加
      shiftRight() //要在position更新前做
      position.value = (position.value + 1) % 5
    } else {
      // 向左拖动
      shiftLeft() //要在position更新前做
      position.value = (position.value - 1 + 5) % 5
    }
    isDragging.value = false  //保证一次只能滑动一块
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const getCardStyle = (position) => {
  let transform = ''
  let opacity = 1
  let zIndex = 1

  switch(position) {
    case 0: // 最左边屏幕外
      transform = 'translateX(-200%) scale(0.8)'
      opacity = 0.5
      zIndex = 0
      break
    case 1: // 左边
      transform = 'translateX(-100%) scale(0.9)'
      opacity = 0.8
      zIndex = 1
      break
    case 2: // 中间
      transform = 'translateX(0) scale(1)'
      opacity = 1
      zIndex = 2
      break
    case 3: // 右边
      transform = 'translateX(100%) scale(0.9)'
      opacity = 0.8
      zIndex = 1
      break
    case 4: // 最右边
      transform = 'translateX(200%) scale(0.8)'
      opacity = 0.5
      zIndex = 0
      break
  }

  return {
    transform,
    opacity,
    zIndex,
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <section id="venue" class="section">
    <div class="content-wrapper">
      <h2 class="fade-in">活动场所</h2>
      <div class="venue-carousel" @mousedown="handleMouseDown">
        <div class="venue-stage">
          <div
            v-for="([position, imgID],index) in displayCards"
            :key="index"
            class="venue-card"
            :style="getCardStyle(position)"
          >
          <!-- key为index，共5张卡片，可见的三张卡牌不会变更内容，隐藏的两张卡片顺序切换图片 -->
            <img :src="venues[imgID].image" :alt="venues[imgID].title" class="venue-image">
            <div class="venue-info">
              <h3>{{ venues[imgID].title }}</h3>
              <p>{{ venues[imgID].description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.venue-carousel {
  position: relative;
  width: 100%;
  height: 600px;
  perspective: 1000px;
  user-select: none;
}

.venue-stage {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.venue-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 400px;
  height: 500px;
  margin-left: -200px;
  margin-top: -250px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.5s ease;
  cursor: grab;
  transform-origin: center center;
}

.venue-card:active {
  cursor: grabbing;
}

.venue-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.venue-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.venue-info {
  padding: 1.5rem;
}

.venue-info h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.venue-info p {
  color: #34495e;
  line-height: 1.6;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .venue-carousel {
    height: 500px;
  }

  .venue-card {
    width: 300px;
    height: 400px;
    margin-left: -150px;
    margin-top: -200px;
  }

  .venue-image {
    height: 200px;
  }

  .venue-info h3 {
    font-size: 1.2rem;
  }

  .venue-info p {
    font-size: 0.9rem;
  }
}
</style>