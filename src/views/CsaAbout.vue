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


// 场地数据， 并不强制要求5个，随便几个都行，至少一个
const venues = [
  {
    image: '@/assets/about/venue/main_room1.png',
    title: '网络空间安全协会活动室',
    description: '位于浙江大学紫金港校区，是我们开展日常活动、技术交流和团队协作的主要场所。配备完善的网络设施和安全设备，为成员提供良好的学习环境。'
  },
  {
    image: '@/assets/about/venue/main_room2.png',
    title: '网安实验室',
    description: '配备专业的网络安全设备和工具，为成员提供实践环境。'
  },
  {
    image: '@/assets/about/venue/meeting_room.png',
    title: '会议室',
    description: '用于举办技术分享会、学术讨论和小组会议的专属空间。'
  }
]

//const currentIndex = ref(0)  //这个以活动场所的单位为模，用来管理不同场景的偏移
const position = ref(0)  //用来表示card的位置；这个以卡片数量为模，处于性能优化的考量，卡片只有五张，所以只能模5
const isDragging = ref(false)
const startX = ref(0)
const dragThreshold = 100 // 拖动阈值，超过这个值才会触发切换

// 计算当前显示的五个卡片索引
const displayCards = computed(() => {
  const len = 5
  return [
    (position.value) % len,  // 确保不会出现负数
    (position.value + 1) % len,
    (position.value + 2) % len,
    (position.value + 3) % len,
    (position.value + 4) % len
  ]
})

const handleMouseDown = (e) => {
  isDragging.value = true
  startX.value = e.clientX
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const deltaX = e.clientX - startX.value

  if (Math.abs(deltaX) > dragThreshold) {
    if (deltaX > 0) {
      // 向右拖动，每个card的位置向右移动，position增加
      position.value = (position.value + 1) % 5
      //currentIndex.value = (currentIndex.value - 1 + venues.length) % venues.length
    } else {
      // 向左拖动
      position.value = (position.value - 1 + 5) % 5
      //currentIndex.value = (currentIndex.value + 1) % venues.length
    }
    isDragging.value = false  //保证一次只能滑动一块
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const getCardStyle = (position) => {

  let transform = ''
  let opacity = 1
  let zIndex = 1

  switch(position) {
    case 0: // 最左边屏幕外
      transform = 'translateX(-200%) scale(0.8)'
      opacity = 0.5
      zIndex = 0
      break
    case 1: // 左边
      transform = 'translateX(-100%) scale(0.9)'
      opacity = 0.8
      zIndex = 1
      break
    case 2: // 中间
      transform = 'translateX(0) scale(1)'
      opacity = 1
      zIndex = 2
      break
    case 3: // 右边
      transform = 'translateX(100%) scale(0.9)'
      opacity = 0.8
      zIndex = 1
      break
    case 4: // 最右边
      transform = 'translateX(200%) scale(0.8)'
      opacity = 0.5
      zIndex = 0
      break
  }

  return {
    transform,
    opacity,
    zIndex,
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
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
          浙江大学学生网络空间安全协会（CSA）成立于2023年，是浙江大学网络空间安全领域的重要育苗基地。我们致力于培养对网络安全感兴趣的学生，通过举办各类技术讲座、实践演练、竞赛培训等活动，为同学们提供全方位的学习和交流平台，助力他们在网络空间安全领域的成长与发展。
        </p>
      </div>
    </section>

    <!-- 协会愿景板块 -->
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

    <!-- 发展历程时间线 -->
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
              <div class="event-description">全新协会官网上线，搭建信息共享与展示平台(内容随便写的，后期按这个模版加内容就可以了(()))</div>
            </div>
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

    <!-- 活动场所 -->
    <section id="venue" class="section">
      <div class="content-wrapper">
        <h2 class="fade-in">活动场所</h2>
        <div class="venue-carousel" @mousedown="handleMouseDown">
          <div class="venue-stage">
            <div
              v-for="(position,index) in displayCards"
              :key="index"
              class="venue-card"
              :style="getCardStyle(position)"
            >
              <img :src="venues[0].image" :alt="venues[0].title" class="venue-image">
              <div class="venue-info">
                <h3>{{ venues[0].title }}</h3>
                <p>{{ venues[0].description }}</p>
              </div>
            </div>
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
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    #3498db 10%,
    #3498db 90%,
    transparent
  );
  transform: translateX(-50%);
  border-radius: 1.5px;
}

.timeline-item {
  position: relative;
  margin: 4rem 0;
  width: 45%;
}

.timeline-item.left {
  margin-left: 0;
  margin-right: auto;
}

.timeline-item.right {
  margin-left: auto;
  margin-right: 0;
}

.timeline-content {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.timeline-item::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
}

.timeline-item.left::before {
  right: -60px;
  transform: translateY(-50%);
}

.timeline-item.right::before {
  left: -60px;
  transform: translateY(-50%);
}

.timeline-item::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40px;
  height: 2px;
  background: #3498db;
}

.timeline-item.left::after {
  right: -40px;
  transform: translateY(-50%);
}

.timeline-item.right::after {
  left: -40px;
  transform: translateY(-50%);
}

.timeline-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.year {
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.event {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.event-description {
  color: #34495e;
  line-height: 1.6;
  font-size: 1rem;
}

.timeline-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

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

.team-member h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
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
.activity-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
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

/* 活动场所样式 */
.venue-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.venue-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.venue-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.venue-image {
  width: 100%;
  height: 40rem;
  object-fit: cover;
}

.venue-info {
  padding: 2rem;
}

.venue-info h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.venue-info p {
  color: #34495e;
  line-height: 1.8;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .venue-image {
    height: 300px;
  }

  .venue-info h3 {
    font-size: 1.5rem;
  }
}



.venue-carousel {
  position: relative;
  width: 100%;
  height: 600px;
  perspective: 1000px;
  user-select: none;
}

.venue-stage {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.venue-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 400px;
  height: 500px;
  margin-left: -200px;
  margin-top: -250px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.5s ease;
  cursor: grab;
  transform-origin: center center;
}

.venue-card:active {
  cursor: grabbing;
}

.venue-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.venue-info {
  padding: 1.5rem;
}

.venue-info h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.venue-info p {
  color: #34495e;
  line-height: 1.6;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .venue-carousel {
    height: 500px;
  }

  .venue-card {
    width: 300px;
    height: 400px;
    margin-left: -150px;
    margin-top: -200px;
  }

  .venue-image {
    height: 200px;
  }

  .venue-info h3 {
    font-size: 1.2rem;
  }

  .venue-info p {
    font-size: 0.9rem;
  }
}
</style>
