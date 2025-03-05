<script setup>
</script>

<template>
  <section id="vision" class="section">
    <div class="content-wrapper">
      <h2>协会愿景</h2>
      <div class="vision-grid">
        <div class="vision-card card-interest">
          <i class="vision-icon">🎮</i>
          <h3>培养兴趣爱好</h3>
          <p>激发对网络安全的热情，通过有趣的活动和项目，让每位成员在探索中找到乐趣，培养持久的学习动力。</p>
        </div>
        <div class="vision-card card-skill">
          <i class="vision-icon">💪</i>
          <h3>提高学习与实践能力</h3>
          <p>通过系统化的培训体系和实战演练，帮助成员掌握专业技能，提升实践能力，打造过硬的技术本领。</p>
        </div>
        <div class="vision-card card-vision">
          <i class="vision-icon">🔭</i>
          <h3>开拓知识视野</h3>
          <p>定期举办技术讲座和交流活动，邀请业内专家分享经验，帮助成员了解行业动态，拓展专业视野。</p>
        </div>
        <div class="vision-card card-career">
          <i class="vision-icon">🌈</i>
          <h3>拓宽就业渠道</h3>
          <p>搭建校企合作平台，培养成员从业技能，为成员提供优质的就业资源，助力职业发展。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-wrapper {
  max-width: 65vw;
  margin: 0 auto;
  padding: 4vh 0;
}


/* 协会愿景样式 */
.vision-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  column-gap: 5rem;
  row-gap: 3rem;
  margin-top: 3rem;
}

.vision-card {
  padding: 2.5rem;
  border-radius: 25px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.vision-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  transition: opacity 0.4s ease;
  z-index: 0;
}

.vision-card:hover::before {
  opacity: 0.15;
}

.vision-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.12);
}

.card-interest {
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
}

.card-interest::before {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.card-skill {
  background: linear-gradient(135deg, #ffffff 0%, #fff0f7 100%);
}

.card-skill::before {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
}

.card-vision {
  background: linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%);
}

.card-vision::before {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
}

.card-career {
  background: linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%);
}

.card-career::before {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
}

.vision-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  position: relative;
  z-index: 1;
}

.vision-card h3 {
  font-size: 1.75rem;
  margin-bottom: 1.25rem;
  color: #1a202c;
  position: relative;
  z-index: 1;
}

.vision-card p {
  color: #4a5568;
  line-height: 1.75;
  position: relative;
  z-index: 1;
  font-size: 1.1rem;
}
</style>
