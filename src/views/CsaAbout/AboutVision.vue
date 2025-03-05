<script setup>
</script>

<template>
  <section id="vision" class="section">
    <div class="content-wrapper">
      <h2 class="fade-in">协会愿景</h2>
      <div class="vision-grid">
        <div class="vision-card fade-in">
          <i class="vision-icon">🎮</i>
          <h3>培养兴趣爱好</h3>
          <p>激发对网络安全的热情，通过有趣的活动和项目，让每位成员在探索中找到乐趣，培养持久的学习动力。</p>
        </div>
        <div class="vision-card fade-in">
          <i class="vision-icon">💪</i>
          <h3>提高学习与实践能力</h3>
          <p>通过系统化的培训体系和实战演练，帮助成员掌握专业技能，提升实践能力，打造过硬的技术本领。</p>
        </div>
        <div class="vision-card fade-in">
          <i class="vision-icon">🔭</i>
          <h3>开拓知识视野</h3>
          <p>定期举办技术讲座和交流活动，邀请业内专家分享经验，帮助成员了解行业动态，拓展专业视野。</p>
        </div>
        <div class="vision-card fade-in">
          <i class="vision-icon">🌈</i>
          <h3>拓宽就业渠道</h3>
          <p>搭建校企合作平台，培养成员从业技能，为成员提供优质的就业资源，助力职业发展。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.vision-card {
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.vision-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.vision-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.vision-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.vision-card p {
  color: #34495e;
  line-height: 1.6;
}
</style>