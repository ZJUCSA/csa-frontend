<!--  关于我们  -->

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const parallaxBg = ref(null)

onMounted(() => {
  const sections = document.querySelectorAll('.section')

  const handleScroll = () => {
    // 视差滚动效果
    if (parallaxBg.value) {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      // 计算滚动百分比，确保滚动到底部时图片底部对齐
      const scrollPercentage = (scrolled / maxScroll) * 66.7
      parallaxBg.value.style.transform = `translateY(-${scrollPercentage}%)`
      //让背景图片position fixed， 再在这里加上一个位移，视差滚动马上就来了
    }

    // 原有的section滚动效果
    sections.forEach(section => {
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // 计算section在视口中的可见比例（相对于视口高度）
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
      const visibleRatio = Math.max(0, Math.min(1, visibleHeight / windowHeight))

      // 根据可见比例设置透明度和模糊效果
      section.style.opacity = (visibleRatio > 0.9) ? 1 : visibleRatio/0.9
      //可见比例占到屏幕的90%就让它完全不透明吧,占满的要求还是有点高了
      section.style.backdropFilter = `blur(${5 - (visibleRatio * 5)}px)`
      section.style.transform = `translateY(${20 - (visibleRatio * 20)}px)`
    })
  }

  window.addEventListener('scroll', handleScroll)
  handleScroll() // 初始化时执行一次

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>


<template>

  <head>
    <title>关于我们-CSA-网络空间安全协会</title>
    <meta name = 'about' content="协会介绍-about界面">
  </head>

  <div class="about-container">
    <div class="parallax-bg" ref="parallaxBg"></div>
    <div class="parallax-overlay"></div>

    <!-- 协会介绍板块 -->
    <section id="about" class="section">
      <div class="content-wrapper">
        <h2 class="fade-in">关于我们</h2>
        <p class="fade-in description">
          浙江大学学生网络空间安全协会（CSA）成立于2023年，是一个致力于培养网络空间安全人才、促进网络安全技术交流与创新的学生组织。我们通过举办各类技术讲座、实践演练、竞赛培训等活动，为对网络安全感兴趣的同学提供学习和交流的平台。
        </p>
      </div>
    </section>

    <!-- 协会愿景板块 -->
    <section id="vision" class="section">
      <div class="content-wrapper">
        <h2 class="fade-in">协会愿景</h2>
        <div class="vision-grid">
          <div class="vision-card fade-in">
            <i class="vision-icon">🔬</i>
            <h3>技术创新</h3>
            <p>致力于网络安全前沿技术研究，培养具有创新思维和实践能力的技术人才，引领网络安全技术发展。</p>
          </div>
          <div class="vision-card fade-in">
            <i class="vision-icon">🎯</i>
            <h3>人才培养</h3>
            <p>搭建系统化的技术培训体系，通过实战演练、竞赛训练等方式，培养高水平网络空间安全专业人才。</p>
          </div>
          <div class="vision-card fade-in">
            <i class="vision-icon">🌟</i>
            <h3>行业影响</h3>
            <p>搭建产学研交流平台，促进校企合作，为网络安全行业输送优秀人才，提升协会在业界的影响力。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 发展历程时间线 -->
    <section id="timeline" class="section">
      <div class="content-wrapper">
        <h2 class="fade-in">发展历程</h2>
        <div class="timeline">
          <div class="timeline-item fade-in">
            <div class="year">2023/xx/xx</div>
            <div class="event">协会正式成立</div>
          </div>
          <div class="timeline-item fade-in">
            <div class="year">2023/xx/xx</div>
            <div class="event">xxx竞赛？写点厉害的成就(?)</div>
          </div>
          <div class="timeline-item fade-in">
            <div class="year">2023/xx/xx</div>
            <div class="event">纳新(吸收新鲜血液)、全员大会</div>
          </div>
          <div class="timeline-item fade-in">
            <div class="year">2024/xx/xx</div>
            <div class="event">公布协会官网</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心团队介绍 -->
    <section id="team" class="section">
      <div class="content-wrapper">
        <h2 class="fade-in">核心团队</h2>
        <div class="team-grid">

          <!-- 在jsconfig.json中看到@定义为src -->
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

    <!-- 活动展示 -->
    <section id="activities" class="section">
      <div class="content-wrapper">
        <h2 class="fade-in">活动展示</h2>
        <div class="activities-grid">
          <div class="activity-card fade-in">
            <h3>技术讲座</h3>
            <p>定期邀请业内专家分享前沿技术</p>
          </div>
          <div class="activity-card fade-in">
            <h3>实践演练</h3>
            <p>组织模拟攻防战，动手实践，提升实战能力</p>
          </div>
          <div class="activity-card fade-in">
            <h3>竞赛培训</h3>
            <p>系统的竞赛知识培训和计算机技能培训</p>
          </div>
          <div class="activity-card fade-in">
            <h3>项目孵化</h3>
            <p>支持创新项目开发</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  padding-bottom: 5rem; /*防止最后一个section紧贴底部 */
}

.parallax-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 300%; /* 这里也不可以随便填，用来调整容器尺寸，图片自适应cover容器，故而调整背景图的显示尺寸，现在的滚动逻辑会受到这个参数的影响，但是好改，改一下倍率即可，背景图一旦选定则长期不改，可以接受。去handleScroll()里找视差效果实现的代码 */
  background-image: url('@/assets/about/background/bg.jpg');
  background-size: cover;  /* 如果使用100% auto的话，如果图片尺寸和容器大小没调好...那么图片会反复，还是别了 */
  /*但是100% auto对变化大小的窗口表现更好，对手机端的表现应该也更好，考虑是否要优化 */
  background-position: center top; /*水平方向居中对齐，垂直方向顶部对齐*/
  transform: translateZ(0);
  z-index: -1;
  will-change: transform;
}
.parallax-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  z-index: 0;
}
.section {
  min-height: 100vh;
  text-align: center;
  position: relative;
  margin-bottom: 8rem;
  padding: 4rem 0;
  opacity: 0.3;
  backdrop-filter: blur(5px);
  transform: translateY(20px);
}

.section.active {
  opacity: 1;
  backdrop-filter: blur(0);
  transform: translateY(0);
}

.section.inactive {
  opacity: 0.3;
  backdrop-filter: blur(5px);
  transform: translateY(20px);
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.description {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #34495e;
  margin-bottom: 2rem;
}

/* 愿景板块样式 */
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
  display: block;
}

.vision-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.vision-card p {
  color: #34495e;
  line-height: 1.6;
}

/* 时间线样式 */
.timeline {
  position: relative;
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background: #3498db;
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin: 2rem 0;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.year {
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

/* 团队成员样式 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.team-member {
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.team-member:hover {
  transform: translateY(-5px);
}

.member-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  object-fit: cover;
}

/* 活动卡片样式 */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.activity-card {
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn_ani 1.5s ease-out; /*使用CSS动画*/
  /* 这里不要用forwards，不然animation会让元素强制保持最后一帧状态，导致其他过渡效果失效 */
}

@keyframes fadeIn_ani {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);  /* Y偏移+透明度变化 */
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }

  h2 {
    font-size: 2rem;
  }

  .team-grid,
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
