<script setup>
import { ref } from 'vue'

const venues = [
  {
    image: new URL('@/assets/about/venue/main_room1.png', import.meta.url).href,
    title: '浙江大学学生网安协会实践训练基地',
    description: '位于浙江大学紫金港校区蒙民伟楼226，是我们开展日常活动、技术交流和团队协作的主要场所。配备完善的网络设施和安全设备，为成员提供良好的学习环境。'
  },
  {
    image: new URL('@/assets/about/venue/main_room2.png', import.meta.url).href,
    title: '浙江大学学生网安协会实践训练基地',
    description: '位于浙江大学紫金港校区蒙民伟楼226，是我们开展日常活动、技术交流和团队协作的主要场所。配备完善的网络设施和安全设备，为成员提供良好的学习环境。'
  },
  {
    image: new URL('@/assets/about/venue/meeting_room1.jpg', import.meta.url).href,
    title: '蒙民伟楼培训教室',
    description: '用于开展各类技术培训和讲座活动'
  }
]

const currentIndex = ref(0)

const nextVenue = () => {
  currentIndex.value = (currentIndex.value + 1) % venues.length
}

const prevVenue = () => {
  currentIndex.value = (currentIndex.value - 1 + venues.length) % venues.length
}
</script>

<template>
  <section id="venue" class="section">
    <div class="content-wrapper">
      <h2>活动场所</h2>
      <div class="venue-container">
        <div class="venue-card card">
          <div class="venue-image-wrapper">
            <img 
              :src="venues[currentIndex].image" 
              :alt="venues[currentIndex].title" 
              class="venue-image"
            >
            <button class="nav-btn prev-btn" @click="prevVenue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button class="nav-btn next-btn" @click="nextVenue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div class="venue-indicators">
              <span 
                v-for="(venue, index) in venues" 
                :key="index"
                class="indicator"
                :class="{ active: index === currentIndex }"
                @click="currentIndex = index"
              ></span>
            </div>
          </div>
          <div class="venue-info">
            <h3>{{ venues[currentIndex].title }}</h3>
            <p>{{ venues[currentIndex].description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.venue-container {
  max-width: 900px;
  margin: 2rem auto 0;
}

.venue-card {
  padding: 0;
  overflow: hidden;
}

.venue-image-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: var(--bg-secondary);
  transition: background 0.3s ease;
}

.venue-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(var(--bg-surface-rgb), 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.nav-btn:hover {
  background: var(--bg-surface);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.nav-btn svg {
  width: 20px;
  height: 20px;
}

.prev-btn {
  left: 1rem;
}

.next-btn {
  right: 1rem;
}

.venue-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(var(--bg-surface-rgb), 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--bg-surface);
  width: 24px;
  border-radius: 4px;
}

.venue-info {
  padding: 2rem;
}

.venue-info h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.venue-info p {
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .venue-image-wrapper {
    height: 300px;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
  }

  .nav-btn svg {
    width: 18px;
    height: 18px;
  }

  .venue-info {
    padding: 1.5rem;
  }
}
</style>