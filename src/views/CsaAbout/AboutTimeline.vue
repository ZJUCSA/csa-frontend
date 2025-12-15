<script setup>
</script>

<template>
  <section id="timeline" class="section">
    <div class="content-wrapper">
      <h2>发展历程</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content card">
            <div class="timeline-date">2023年7月10日</div>
            <h3>协会正式成立</h3>
            <p>浙江大学学生网络空间安全协会正式成立，开启网络安全人才培养新篇章</p>
            <img src="@/assets/about/timeline/founding.jpg" alt="协会成立" class="timeline-image">
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content card">
            <div class="timeline-date">2024年</div>
            <h3>24届纳新大会</h3>
            <p>欢迎新成员加入大家庭</p>
            <img src="@/assets/about/timeline/recruitment24.jpg" alt="纳新大会" class="timeline-image">
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content card">
            <div class="timeline-date">2024年</div>
            <h3>24届全员大会</h3>
            <p>举办全员大会，展示协会成果与未来规划</p>
            <img src="@/assets/about/timeline/whole_staff_meeting24.jpg" alt="全员大会" class="timeline-image">
          </div>
        </div>
        <!-- <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content card">
            <div class="timeline-date">2024年</div>
            <h3>协会官网正式上线</h3>
            <p>全新协会官网上线，搭建信息共享与展示平台</p>
            <img src="@/assets/about/timeline/website_founding.png" alt="官网上线" class="timeline-image">
          </div>
        </div> -->
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  max-width: 900px;
  margin: 3rem auto 0;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
  transition: background 0.3s ease;
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 3px solid var(--bg-surface);
  box-shadow: 0 0 0 2px var(--border-color);
  z-index: 1;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.timeline-content {
  margin-left: 1rem;
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.timeline-content h3 {
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.timeline-content p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.timeline-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .timeline {
    padding-left: 1.5rem;
  }

  .timeline-marker {
    left: -1.75rem;
  }

  .timeline-content {
    margin-left: 0.5rem;
  }

  .timeline-image {
    height: 160px;
  }
}
</style>