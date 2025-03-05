<script setup>
</script>

<template>
  <section id="timeline" class="section">
    <div class="content-wrapper">
      <h2>发展历程</h2>
      <div class="timeline">
        <div class="timeline-item left">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/founding.jpg" alt="协会成立" class="timeline-image">
            <div class="timeline-text">
              <div class="year">2023/xx/xx</div>
              <div class="event">协会正式成立</div>
              <div class="event-description">浙江大学学生网络空间安全协会正式成立，开启网络安全人才培养新篇章</div>
            </div>
          </div>
        </div>
        <div class="timeline-item right">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/recruitment24.jpg" alt="纳新大会" class="timeline-image">
            <div class="timeline-text">
              <div class="year">2024/xx/xx</div>
              <div class="event">24届纳新大会吃吃吃</div>
              <div class="event-description">欢迎新成员加入大家庭!</div>
            </div>
          </div>
        </div>
        <div class="timeline-item left">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/whole_staff_meeting24.jpg" alt="全员大会" class="timeline-image">
            <div class="timeline-text">
              <div class="year">2024/xx/xx</div>
              <div class="event">24届全员大会听取蛙声一片</div>
              <div class="event-description">举办全员大会，看各路神仙大显神通</div>
            </div>
          </div>
        </div>
        <div class="timeline-item right">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/website_founding.png" alt="官网上线" class="timeline-image">
            <div class="timeline-text">
              <div class="year">2024/xx/xx</div>
              <div class="event">协会官网正式上线</div>
              <div class="event-description">全新协会官网上线，搭建信息共享与展示平台</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-wrapper {
  max-width: 1000px; /* 等着修bug吧你 */
  margin: 0 auto;
  padding: 2rem 0;
}

/* 时间线基础样式 */
.timeline {
  position: relative;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem 0;
}

/* 中轴线样式 */
.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  width: 3px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    #3498db 10%,
    #ff0077 90%,
    transparent
  );
  transform: translateX(-50%);
  border-radius: 1.5px;
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
}
/* 定位 */
.timeline-item {
  position: relative;
  width: calc(50% - 50px);  /* 固定宽度，50px 是留给中轴线和间距的空间 */
  /* padding: 2rem; 不要padding，会影响计算， 就用width来控制间距吧 */
  z-index:1 ;
}

.timeline-item.left {
  margin-left: 0;  /* 每个容器的宽度被设置为父容器宽度的50%-50px, 然后将左侧对齐到父容器的0%处，就完美实现了中间-2vw为右侧 */
}

.timeline-item.right {
  margin-left: calc(50% + 50px);  /* 右侧对齐 */
}

/* 连接点脉动效果 */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
}
/* 连接点 */
.timeline-item::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2),
             0 0 15px rgba(52, 152, 219, 0.4);
  animation: pulse 2s infinite;
  z-index: 1;
}

.timeline-item.left::before {
  left: calc(100% + 40px);  /* 左侧位置写死，相较于写死的左侧位置偏移，就能保证落在中轴线上, 40 = 50-20/2 */
}

.timeline-item.right::before {
  right: calc(100% + 40px);
}

/* 连接线 */
.timeline-item::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: all 0.3s ease;
  z-index: -1;  /* 放在下面 */
  transform: translateY(9px); /* 一个连接点高20px， 一个连接线高2px， 10-1=9 */
}

.timeline-item.left::after {
  left: 100%;
}

.timeline-item.right::after {
  right: 100%;
}

/* 内容卡片样式 */
.timeline-content {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-content:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(52, 152, 219, 0.3);
}

/* 图片样式 */
.timeline-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}


/* 文本样式 */
.timeline-text {
  padding: 0 1rem;
}

.year {
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.event {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  line-height: 1.4;
}

.event-description {
  color: #34495e;
  line-height: 1.6;
  font-size: 1rem;
}


/* 响应式布局 */
@media (max-width: 768px) {
  .timeline-item {
    width: 85%;
    margin: 3rem auto;
  }

  .timeline-item.left::before,
  .timeline-item.right::before {
    left: -40px;
  }

  .timeline-item.left::after,
  .timeline-item.right::after {
    left: -20px;
    width: 20px;
  }

  .timeline::before {
    left: 0;
  }

  .timeline-content {
    padding: 1.2rem;
  }

  .timeline-image {
    height: 160px;
  }
}
</style>
