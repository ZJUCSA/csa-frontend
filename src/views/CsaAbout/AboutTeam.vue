<script setup>
</script>

<template>
  <section id="team" class="section">
    <div class="content-wrapper">
      <h2 class="fade-in">核心团队</h2>
      <div class="team-grid">
        <div class="team-member fade-in">
          <img src="@/assets/about/team-avatar/competition.jpg" class="member-avatar" alt="竞赛部头像"/>
          <h3>竞赛部</h3>
          <p>负责技术培训、竞赛指导</p>
        </div>
        <div class="team-member fade-in">
          <img src="@/assets/about/team-avatar/research.jpg" class="member-avatar" alt="科研部头像"/>
          <h3>科研部</h3>
          <p>负责组织讲座和科研活动</p>
        </div>
        <div class="team-member fade-in">
          <img src="@/assets/about/team-avatar/activity.jpg" class="member-avatar" alt="活动部头像">
          <h3>活动部</h3>
          <p>负责活动策划与执行</p>
        </div>
        <div class="team-member fade-in">
          <img src="@/assets/about/team-avatar/publicity.png" class="member-avatar" alt="宣传部头像">
          <h3>宣传部</h3>
          <p>负责宣传活动</p>
        </div>
        <div class="team-member fade-in">
          <img src="@/assets/about/team-avatar/secretary.jpg" class="member-avatar" alt="秘书部头像">
          <h3>秘书部</h3>
          <p>负责协会运营的大小事宜</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.team-member {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.team-member:hover {
  transform: translateY(-5px);
}

.member-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #f8f9fa;
}

.team-member h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.team-member p {
  color: #666;
  font-size: 0.9rem;
}
</style>