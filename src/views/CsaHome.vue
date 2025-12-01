<template>
    <div class="home-container">
        <!-- Banner区域 -->
        <div class="banner-area">
            <CsaBanner />
        </div>
        
        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 新闻和活动区域 -->
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">最新资讯</h2>
                    <p class="section-subtitle">Stay Updated with Latest News and Events</p>
                </div>
                
                <div class="cards-grid">
                    <div class="news-card">
                        <csa-news-home />
                    </div>
                    <div class="event-card">
                        <csa-event-home />
                    </div>
                </div>
            </div>
            
            <!-- 信息展示区域 -->
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">信息中心</h2>
                    <p class="section-subtitle">Important Information and Resources</p>
                </div>
                
                <div class="info-grid">
                    <csa-info-home />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-container {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
}

.banner-area {
    position: relative;
    height: 100vh;
    overflow: hidden;
}

.main-content {
    background: rgba(var(--bg-surface-rgb, 255, 255, 255), 0.95);
    backdrop-filter: blur(10px);
    border-radius: 30px 30px 0 0;
    margin-top: -50px;
    position: relative;
    z-index: 10;
    padding: 60px 0;
}

.content-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.content-section:not(:last-child) {
    margin-bottom: 80px;
}

.section-header {
    text-align: center;
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.header-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.8rem;
    box-shadow: 0 8px 25px var(--shadow-color);
    margin-bottom: 10px;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
    position: relative;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
    border-radius: 2px;
}

.section-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 400;
}

.cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 40px;
}

.news-card,
.event-card {
    background: var(--bg-surface);
    border-radius: 20px;
    box-shadow: 0 10px 30px var(--shadow-color);
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    border: 1px solid var(--border-color);
}

.news-card::before,
.event-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
}

.news-card:hover,
.event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px var(--shadow-color);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .main-content {
        margin-top: -30px;
        padding: 40px 0;
    }
    
    .content-section {
        padding: 0 15px;
    }
    
    .content-section:not(:last-child) {
        margin-bottom: 60px;
    }
    
    .section-header {
        gap: 10px;
    }
    
    .header-icon {
        width: 50px;
        height: 50px;
        font-size: 1.5rem;
        margin-bottom: 5px;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .cards-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}

/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.content-section {
    animation: fadeInUp 0.6s ease-out;
}

.cards-grid {
    animation: fadeInUp 0.8s ease-out;
}

.info-grid {
    animation: fadeInUp 1s ease-out;
}
</style>
