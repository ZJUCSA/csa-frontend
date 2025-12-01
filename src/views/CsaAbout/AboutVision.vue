<script setup>
</script>

<template>
  <section id="vision" class="section">
    <div class="content-wrapper">
      <h2>协会愿景</h2>
      <p class="description">
        我们致力于打造一个充满活力、技术领先的网络安全学习社区，为每一位成员提供成长和发展的平台
      </p>
      <div class="vision-grid">
        <div class="vision-card card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>培养兴趣爱好</h3>
          <p>我们通过多样化的活动形式激发成员对网络安全的热情。从CTF竞赛的紧张刺激，到技术沙龙的轻松交流，从实战演练的成就感，到开源项目的创新探索，让每位成员在多样化的学习场景中找到属于自己的兴趣点。我们相信，兴趣是最好的老师，通过营造轻松愉快的学习氛围，帮助成员在探索中收获快乐，在挑战中培养持久的学习动力和职业热情。</p>
        </div>
        <div class="vision-card card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3>提高学习与实践能力</h3>
          <p>我们建立了从基础到进阶的系统化培训体系，涵盖密码学、网络协议、漏洞挖掘、安全防护等多个领域。通过理论课程、实验操作、项目实战相结合的方式，帮助成员循序渐进地掌握专业技能。协会提供CTF竞赛平台、攻防演练环境、OJ训练系统等丰富的实践资源，让成员在真实场景中锻炼技术能力。同时，我们组织定期技术分享会，鼓励成员互相学习、共同进步，打造过硬的技术本领和团队协作能力。</p>
        </div>
        <div class="vision-card card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3>开拓知识视野</h3>
          <p>我们定期邀请院士级学者、行业专家、企业技术负责人等举办专题讲座，分享前沿技术动态、行业发展趋势和实战经验。通过网络安全周、暑期学校、学术沙龙等活动，帮助成员了解最新的安全威胁、防护技术和研究热点。我们鼓励成员参与各类学术会议、技术峰会，与业界精英面对面交流，拓展专业视野。同时，协会与国内外高校、科研院所、知名企业建立合作关系，为成员提供更多学习和交流的机会。</p>
        </div>
        <div class="vision-card card">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3>拓宽就业渠道</h3>
          <p>我们积极搭建校企合作平台，与多家知名网络安全企业建立长期合作关系，为成员提供实习机会、就业推荐和职业指导。通过企业参访、实习实践、项目合作等方式，帮助成员了解行业需求，培养从业技能。协会定期组织职业规划讲座、简历指导、面试培训等活动，提升成员的就业竞争力。同时，我们建立了校友网络，为成员提供行业资讯、内推机会和职业发展建议，助力成员在网络安全领域实现职业理想。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vision-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 2rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.vision-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border-radius: 12px;
  margin-bottom: 1.25rem;
  color: #2563eb;
  flex-shrink: 0;
}

.card-icon svg {
  width: 28px;
  height: 28px;
}

.vision-card h3 {
  margin-bottom: 1rem;
  color: #1f2937;
  font-size: 1.25rem;
}

.vision-card p {
  color: #4b5563;
  line-height: 1.8;
  margin: 0;
  flex-grow: 1;
}

/* 平板端：2列布局 */
@media (max-width: 1024px) {
  .vision-grid {
    gap: 1.5rem;
  }
}

/* 中等屏幕：保持2列但调整间距 */
@media (max-width: 768px) {
  .vision-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 100%;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
  }

  .card-icon svg {
    width: 24px;
    height: 24px;
  }

  .vision-card h3 {
    font-size: 1.125rem;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .vision-grid {
    gap: 1.25rem;
  }
}
</style>