<script setup>
</script>

<template>
  <section id="activities" class="section">
    <div class="content-wrapper">
      <h2 class="fade-in">社团活动</h2>
      <div class="activities-grid">
        <div class="activity-card fade-in">
          <h3>网安知识培训</h3>
          <p>
            密码与数据安全<br>
            硬件与物联网安全<br>
            软件与系统安全<br>
            人工智能安全
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>攻防技术培训</h3>
          <p>
            CTF竞赛、数据安全 <br>
            系统安全、AI安全 <br>
            车安全
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>参加竞赛</h3>
          <p>
            组织竞赛<br>
            提供报名费、车旅费
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>攻防演练</h3>
          <p>
            校级攻防演练<br>
            省部级攻防演练
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>训练OJ</h3>
          <p>
            各类安全竞赛练习题
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>承办竞赛</h3>
          <p>
            举办校级安全竞赛
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>网安知识宣传科普</h3>
          <p>
            网络安全知识与技术宣讲会 <br>
            网络安全暑期summer school
          </p>
        </div>
        <div class="activity-card fade-in">
          <h3>科研人才培养</h3>
          <p>
            联系导师科研 <br>
            定期师生见面交流会 <br>
            学术沙龙
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-wrapper {
  max-width: 70vw;
  margin: 0 auto;
  padding: 2vh 0;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.activity-card {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
}

.activity-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.activity-card p {
  color: #34495e;
  line-height: 1.8;
}
</style>
