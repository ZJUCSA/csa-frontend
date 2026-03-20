<script setup>
import Typed from 'typed.js'
import { ref, onMounted } from 'vue'

import banner1 from '@/assets/banner1.jpg?url'
import banner2 from '@/assets/banner2.jpg?url'
import banner3 from '@/assets/banner3.jpg?url'

const images = [
    {
        itemImageSrc: banner1,
        alt: 'banner1',
    },
    {
        itemImageSrc: banner2,
        alt: 'banner2',
    },
    {
        itemImageSrc: banner3,
        alt: 'banner3',
    },
]

const currentSlide = ref(0)

onMounted(() => {
    new Typed('#typing', {
        strings: [
            '探索网络空间的无限可能',
            '筑牢网络国度的数字防线',
            '守护网络世界的和谐安宁',
        ],
        typeSpeed: 80,
        loop: true,
        backSpeed: 50,
        backDelay: 2000,
    })
})
</script>

<template>
    <div class="banner-container">
        <!-- 背景轮播图 -->
        <div class="banner-carousel">
            <Carousel
                :value="images"
                :numVisible="1"
                :numScroll="1"
                circular
                :showNavigators="false"
                :autoplayInterval="5000"
                @page="(e) => currentSlide = e.page"
            >
                <template #item="slotProps">
                    <div class="banner-slide">
                        <img
                            :src="slotProps.data.itemImageSrc"
                            :alt="slotProps.data.alt"
                            class="banner-image"
                        />
                        <div class="banner-overlay"></div>
                    </div>
                </template>
            </Carousel>
        </div>

        <!-- 内容区域 -->
        <div class="banner-content">
            <div class="content-wrapper">
                <div class="welcome-text">
                    <p class="welcome-line">欢迎来到</p>
                    <h1 class="main-title">浙江大学学生网络空间安全协会</h1>
                </div>
                
                <div class="typing-container">
                    <span id="typing" class="typing-text"></span>
                    <span class="typing-cursor">|</span>
                </div>
                
                <!-- <div class="banner-actions">
                    <router-link to="/about" class="action-btn primary">
                        <i class="pi pi-info-circle"></i>
                        了解更多
                    </router-link>
                    <router-link to="/events" class="action-btn secondary">
                        <i class="pi pi-calendar"></i>
                        查看活动
                    </router-link>
                </div> -->
            </div>
        </div>

        <!-- 指示器 -->
        <div class="banner-indicators">
            <div 
                v-for="(image, index) in images" 
                :key="index"
                class="indicator"
                :class="{ active: currentSlide === index }"
                @click="currentSlide = index"
            ></div>
        </div>

        <!-- 滚动提示 -->
        <div class="scroll-hint">
            <div class="scroll-arrow"></div>
            <span>向下滚动</span>
        </div>
    </div>
</template>

<style scoped>
.banner-container {
    position: relative;
    height: 100vh;
    overflow: hidden;
}

.banner-carousel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.banner-slide {
    position: relative;
    width: 100%;
    height: 100vh;
}

.banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.1) 100%
    );
}

.banner-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.content-wrapper {
    text-align: center;
    color: white;
    max-width: 800px;
    padding: 0 20px;
}

.welcome-text {
    margin-bottom: 30px;
}

.welcome-line {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: white;
    opacity: 0.9;
}

.main-title {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
}

.typing-container {
    margin: 40px 0;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.typing-text {
    font-size: 2.5rem;
    font-weight: 600;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.typing-cursor {
    font-size: 2.5rem;
    font-weight: 600;
    color: #fff;
    animation: blink 1s infinite;
    margin-left: 5px;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.banner-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 40px;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 15px 30px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.action-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
}

.action-btn.secondary {
    background: transparent;
    color: white;
    border-color: white;
}

.action-btn.secondary:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
}

.banner-indicators {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
}

.indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s ease;
}

.indicator.active {
    background: white;
    transform: scale(1.2);
}

.indicator:hover {
    background: rgba(255, 255, 255, 0.8);
}

.scroll-hint {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    font-size: 0.9rem;
    opacity: 0.8;
    animation: bounce 2s infinite;
}

.scroll-arrow {
    width: 2px;
    height: 20px;
    background: white;
    margin-bottom: 8px;
    position: relative;
}

.scroll-arrow::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(45deg);
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateX(-50%) translateY(0);
    }
    40% {
        transform: translateX(-50%) translateY(-20px);
    }
    60% {
        transform: translateX(-50%) translateY(-10px);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .main-title {
        font-size: 2rem;
    }
    
    .typing-text {
        font-size: 1.8rem;
    }
    
    .typing-cursor {
        font-size: 1.8rem;
    }
    
    .banner-actions {
        flex-direction: column;
        align-items: center;
    }
    
    .action-btn {
        width: 200px;
        justify-content: center;
    }
    
    .welcome-line {
        font-size: 1.2rem;
    }
}

@media (max-width: 480px) {
    .main-title {
        font-size: 1.5rem;
    }
    
    .typing-text {
        font-size: 1.4rem;
    }
    
    .typing-cursor {
        font-size: 1.4rem;
    }
    
    .content-wrapper {
        padding: 0 15px;
    }
}
</style>
