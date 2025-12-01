<script setup>
</script>

<template>
  <section id="about" class="section">
    <div class="content-wrapper">
      <h2>关于我们</h2>
      <div class="about-content">
        <p class="description">
          浙江大学学生网络空间安全协会（ZJUCSA）成立于2023年，旨在成为浙江大学网络空间安全领域的重要育苗基地。我们致力于培养对网络安全感兴趣的学生，通过举办各类技术讲座、实践演练、竞赛培训等活动，为同学们提供全方位的学习和交流平台，助力他们在网络空间安全领域的成长与发展。
        </p>



        <div class="content-section">
          <h3>基本情况</h3>
          <p>
            浙江大学学生网络空间安全协会，是一个由浙江大学网络空间安全学院与信息技术中心联合成立的全校唯一网络空间安全相关的学生社团。协会于2023年5月顺利完成学校社团成立答辩，并于同年7月10日正式成立。协会聘请了由院士级学者、白帽黑客和产业精英组成的导师团队，包括德育导师宋炜铁、学术导师李松、张聪，以及产业导师李均等。
          </p>
        </div>

        <div class="content-section">
          <h3>发展宗旨</h3>
          <p>
            协会定位为网络安全育苗基地，秉承"全师生、多平台、共运维，务创新、培英才、肩大任"的团队理念，旨在培养学生对网络空间安全的兴趣爱好，提高学生网络空间安全学习和实践能力，开拓学生网络空间安全知识视野，并拓宽学生就业渠道。
          </p>
        </div>

        <div class="content-section">
          <h3>活动情况</h3>
          <p>
            协会自成立以来，积极开展了网安知识的宣传与科普、网安主题暑期学校、国家网络安全周等系列活动，并通过代表学校参与各级攻防演练、参与或组办网络空间安全相关比赛等方式，为学生提供更多"实战"演练机会。
          </p>
        </div>

        <div class="content-section">
          <h3>成果成就</h3>
          <p>
            协会主导以SeedLab为核心的网络安全研究项目，为学校的网络空间安全学科发展做出了贡献。协会搭建了CTF竞赛平台和攻防演练系统，形成"赛训结合"的特色模式，在网鼎杯，浙江省大学生网络与信息安全等竞赛中均取得成就。
          </p>
        </div>
        <div class="team-photo-container">
          <img 
            src="@/assets/about/team/team1.jpg" 
            alt="协会团队合影" 
            class="team-photo"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-content {
  max-width: 900px;
  margin: 0 auto;
}

.description {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #4b5563;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 400;
}

.team-photo-container {
  margin: 2rem auto 3rem;
  max-width: 100%;
  text-align: center;
}

.team-photo {
  width: 100%;
  max-width: 900px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.content-section {
  margin-bottom: 2.5rem;
}

.content-section:last-child {
  margin-bottom: 0;
}

.content-section h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.content-section p {
  color: #4b5563;
  line-height: 1.9;
  font-size: 1rem;
  margin: 0;
  text-align: left;
}

@media (max-width: 768px) {
  .about-content {
    max-width: 100%;
  }

  .description {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .team-photo-container {
    margin: 1.5rem auto 2rem;
  }

  .team-photo {
    border-radius: 6px;
  }

  .content-section {
    margin-bottom: 2rem;
  }

  .content-section h3 {
    font-size: 1.25rem;
  }

  .content-section p {
    font-size: 0.95rem;
  }
}
</style>