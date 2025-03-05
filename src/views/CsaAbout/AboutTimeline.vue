<script setup>
</script>

<template>
  <section id="timeline" class="section">
    <div class="content-wrapper">
      <h2 class="fade-in">发展历程</h2>
      <div class="timeline">
        <div class="timeline-item fade-in left">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/founding.jpg" alt="协会成立" class="timeline-image">
            <div class="year">2023/xx/xx</div>
            <div class="event">协会正式成立</div>
            <div class="event-description">浙江大学学生网络空间安全协会正式成立，开启网络安全人才培养新篇章</div>
          </div>
        </div>
        <div class="timeline-item fade-in right">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/recruitment24.jpg" alt="纳新大会" class="timeline-image">
            <div class="year">2024/xx/xx</div>
            <div class="event">24届纳新大会吃吃吃</div>
            <div class="event-description">欢迎新成员加入大家庭!</div>
          </div>
        </div>
        <div class="timeline-item fade-in left">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/whole_staff_meeting24.jpg" alt="全员大会" class="timeline-image">
            <div class="year">2024/xx/xx</div>
            <div class="event">24届全员大会听取蛙声一片</div>
            <div class="event-description">举办全员大会，看各路神仙大显神通</div>
          </div>
        </div>
        <div class="timeline-item fade-in right">
          <div class="timeline-content">
            <img src="@/assets/about/timeline/website_founding.png" alt="官网上线" class="timeline-image">
            <div class="year">2024/xx/xx</div>
            <div class="event">协会官网正式上线</div>
            <div class="event-description">全新协会官网上线，搭建信息共享与展示平台</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  width: 2px;
  background: #2c3e50;
  top: 0;
  bottom: 0;
  left: 50%;
  margin-left: -1px;
}

.timeline-item {
  padding: 1rem;
  position: relative;
  width: 50%;
  margin-bottom: 2rem;
}

.timeline-item.left {
  left: 0;
  padding-right: 2rem;
}

.timeline-item.right {
  left: 50%;
  padding-left: 2rem;
}

.timeline-content {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.timeline-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.year {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.event {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.event-description {
  color: #34495e;
  line-height: 1.6;
}
</style>