<script setup>
import { ref, onUnmounted } from 'vue'
import { useNavbarStore } from '@/stores/navbar'

import competition_avatar from '@/assets/about/department/team-avatar/competition.jpg?url'
import research_avatar from '@/assets/about/department/team-avatar/research.png?url'
import activity_avatar from '@/assets/about/department/team-avatar/activity.png?url'
import publicity_avatar from '@/assets/about/department/team-avatar/publicity.png?url'
import secretary_avatar from '@/assets/about/department/team-avatar/secretary.png?url'

const navbarStore = useNavbarStore() //引入navbarStore， 方便修改navbar的状态
let originalNavbarState = false //存储当前状态，在特殊事件结束后可以恢复
navbarStore.setCollapsed(true) //关闭导航栏，默认关它一手， 但是默认一开始又是开的，所以能看到关的动画

const showModal = ref(false)
const currentDepartment = ref('')

const departments = ref({
    competition: {
        name: '竞赛部',
        avatar: competition_avatar,
        shortDescription: '负责技术培训、竞赛指导',
        description:
            '<p><strong>我们是一群沉迷于数字迷宫的极客</strong></p><br><p>日常生活在代码与漏洞之间穿梭。在这里，"破解"不是犯罪，而是一门艺术；"渗透"不是违法，而是一场智力游戏。</p><br><br><p>作为竞赛部，我们负责组织各类CTF（Capture The Flag）比赛，这是一场数字版的"夺旗战"。想象一下，深夜里，一群熬红眼睛的极客们，为了找出隐藏在程序深处的那个小小"旗帜"，愿意与复杂算法和神秘漏洞战斗到天明。</p><br><br><p>除了锻造校内CTF战队，我们还负责协会的数字基础设施建设。服务器出问题了？找我们。网站被攻陷了？也找我们。我们是协会的数字工程师，用键盘和代码构筑安全的数字堡垒。</p>',
    },

    research: {
        name: '科研部',
        avatar: research_avatar,
        shortDescription: '负责组织讲座和科研活动',
        description:
            '<p><strong>咱们科研部简直就是一个技术大世界！</strong></p><br><p>想要学习互联网技术，对互联网进行仿真，并亲自上手病毒传播实验，有 SEED 兴趣小组；想要学习大模型，体验最新的模型以及流行生成式 AI 应用创新引擎，使用协会服务器搭建定制的工作流，有「大模型在网络安全运营领域探索」小组；想要学习实践 web 开发相关技术，也有学长手把手教你，并参与到协会微信小程序与网站的设计和维护中；想要参与到意向导师的科研团队中，我们也会邀请科研负责人做讲座，或是和导师面对面交流，深入了解科研项目或是，毛遂自荐；想要学习 CTF 知识，我们和竞赛部也有对接，让每一个感兴趣的人参与到同等的培训和实践。</p><br><br><p>在这里，你更有一群志同道合的小伙伴，分享项目经历，共克技术难题；无论是 SQTP、SRTP还是创赛、网络安全竞赛，你总能找到经验丰富的小组，更有高技术且亲切和蔼的学长带队。平日在协会活动室自习，身边就是其他部门成员，有问题及时交流，也可以一起分享并准备课业任务，在这里你总能找到和你相似的人。</p><br><br><p>要我说，你们科研部部员吃的也太好了吧。我已经垂直入坑了！🥰</p>',
    },

    activity: {
        name: '活动部',
        avatar: activity_avatar,
        shortDescription: '负责活动策划与执行',
        description:
            '<p><strong>活动部，超燃的幕后英雄</strong></p><br><p>宝子们，今天来给大家揭秘学生网络空间安全协会里超酷炫的活动部！</p><br><br><p><strong>【日常事务大公开】</strong></p><p>活动策划：从创意构思到精细策划，我们精心打造每一场网络安全主题活动。无论是线上的知识竞赛，还是线下的讲座论坛，每一个环节都经过反复推敲，力求让活动既有趣又有深度，让同学们在轻松愉快的氛围中学习网络安全知识。</p><br><p>组织协调：与各方紧密合作，确保活动顺利推进。从邀请业内专家作为嘉宾，到与学校各部门沟通协调场地等资源，再到组织志愿者团队进行现场服务，每一个细节都不放过，只为完美呈现每一场活动。</p><br><p>现场执行：在活动现场，我们有条不紊地把控流程，处理突发状况。无论是设备故障还是人员调度问题，都能迅速解决，保障每一个环节都精彩绝伦，给参与者留下深刻印象。</p><br><br><p><strong>【独特亮点在这里】</strong></p><p>创新无限：不断探索新的活动形式和内容，结合网络安全热点，给同学们带来全新的体验。例如，模拟网络攻击场景，让同学们亲身体验网络安全的重要性；举办网络安全创意作品大赛，激发同学们的创新思维和实践能力。</p><br><p>团队协作：与秘书部、宣传部等紧密配合，形成强大的工作合力，共同推动协会发展。秘书部XXX，宣传部干XXX，而活动部则将各个环节有机整合，确保活动的顺利进行。</p><br><p>学习成长：在活动筹备和执行过程中，不仅提升组织能力，还能深入了解网络安全知识，实现自我提升。通过与专业人士的交流和合作，我们不断拓宽自己的视野，为未来的职业发展打下坚实的基础。</p>',
    },

    publicity: {
        name: '宣传部',
        avatar: publicity_avatar,
        shortDescription: '负责宣传活动',
        description:
            '<p><strong>这里是宣传部！ヾ(@^▽^@)ノ</strong></p><br><p>我们是协会对外宣传的中坚力量。</p><br><p><strong>我们主要负责：</strong></p><p>推文制作！我们的推文内容五花八门~科研导师/业界大牛讲座预告推文、学长分享会总结推文、全员大会总结推文、网络安全科普推文（CyberSecurity MindSet系列）、纳新推文、年终总结推文……我们不仅是活动前的预告者，也是活动圆满完成后的总结者。我们以简洁有力的文章为媒介，将创意与才华挥洒在方寸屏幕间，架起协会与外界沟通的桥梁。在我们的推文里，你不仅能看到协会走过的足迹，还能学到更多与网络安全有关的知识。快快关注我们吧！☞公众号：ZJU网小安，朵朵号：浙大网安协会（打广告.jpg~坏笑.jpg~）。</p><br><p>这么说...难道我们的工作仅仅是制作推文？NONONO!我们也是协会公众号、朵朵号的实际运营者，多平台扩大协会影响力。我们还是协会大大小小的活动中摄影工作的承担者，用相机定格珍贵的记忆。此外，在网络安全宣传周活动、网络安全宣传展厅设计等工作中，我们宣传部也发挥着不可或缺的作用。</p><br><p>在网安协会这个温暖的大家庭中，宣传部从来不是单打独斗的——我们与秘书部、活动部、竞赛部、科研部各部门紧密合作，将讲座、科普、竞赛、团建等等各类活动举办得精彩纷呈。</p><br><br><p><strong>100字概括：</strong></p><p>宣传部！对外宣传的中坚力量！ヾ(@^▽^@)ノ我们主要负责推文制作☞科研导师/业界大牛讲座推文、学长分享会推文、全员大会推文、网络安全科普推文、纳新推文、年终总结推文……五花八门，应有尽有。我们也是协会公众号、朵朵号的运营者，协会活动中摄影工作的承担者。我们与其他部门密切合作，共同把协会建设得越来越好！</p>',
    },

    secretary: {
        name: '秘书部',
        avatar: secretary_avatar,
        shortDescription: '负责协会运营的大小事宜',
        description:
            '<p><strong>浙大网安协会的秘书部可以说是整个协会的"神经系统"~</strong></p><br><p>我们作为协会的神经中枢，日常要玩转"多线程操作"——既要当好会员信息数据库的"数字园丁"，又要化身网站运营的"一把手"，还要完成往年资料和协会大事的"编年史"。24小时的在线冲浪，只力求把活动通知、干货资讯迅速精准地投递到每个协会成员的手机上。</p><br><br><p>我们的团队成员还是"码上特种兵"。"文"能产出活动总结的"高光时刻小作文"，捕捉活动中的精彩瞬间和关键细节；也能撰写网络安全调研的"硬核"报告，不仅能精确地对讲座内容进行全景回顾，还能结合网络安全发展的现状和趋势，提出切实可行的建议和解决方案。"武"既能进行大模型部署，能够快速搭建和优化模型，为协会的活动开展打下了坚实的技术基础；还能借助deepseek做网络渗透工作，通过模拟黑客攻击，发现网络系统中的漏洞和隐患。</p><br><br><p>但我们团队最动人的地方，还是在值班表上默默划勾的日夜，就像生物体的"毛细血管"，用看不见的细致工作将关怀、责任和热情输送到协会的每一个角落。正是这些看似微不足道的细节，日日夜夜的默默付出，不在耀眼的聚光灯下，却汇聚成了协会强大的生命力。</p><br><br><p>让协会的每一次活动都能顺利开展，让每一位会员都能感受到温暖和关怀，让协会在成长的道路上稳步前行，这就是我们秘书部的使命必达！</p>',
    },
})

import {
    disableBodyScroll,
    enableBodyScroll,
    clearAllBodyScrollLocks,
} from 'body-scroll-lock' //使用专门的滚动库来更进一步控制模态框打开时的滚动行为

const openModal = dept => {
    // 禁用主页面滚动   //滚动过程中就把滚轮禁用了，免得出幺蛾子
    disableBodyScroll(document.body)

    // 移动到指定位置，保证显示正常
    const section = document.getElementById('team')
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }

    //记录当前导航栏状态，并关闭导航栏
    originalNavbarState = navbarStore.isCollapsed //存储当前状态，以便恢复
    navbarStore.setCollapsed(true)

    // 300ms后显示模态框，确保滚动动画完成再显示模态框
    setTimeout(() => {
        currentDepartment.value = dept
        showModal.value = true
    }, 350)
}

const closeModal = () => {
    showModal.value = false

    // 启用主页面滚动
    enableBodyScroll(document.body)

    //恢复导航栏
    navbarStore.setCollapsed(originalNavbarState)
}

// 组件卸载时清理事件监听
onUnmounted(() => {
    // 清理所有滚动锁
    clearAllBodyScrollLocks()
})
</script>

<template>
    <section id="team" class="section">
        <div class="content-wrapper">
            <h2>核心部门</h2>
            <!-- 部门卡片 -->
            <div class="team-grid">
                <div
                    class="team-member"
                    v-for="(dept, key) in departments"
                    :key="key"
                    @click="openModal(key)"
                >
                    <img
                        :src="dept.avatar"
                        class="member-avatar"
                        :alt="`${dept.name}头像`"
                    />
                    <!-- 这里不能用@ -->
                    <h3>{{ dept.name }}</h3>
                    <p>{{ dept.shortDescription }}</p>
                </div>
            </div>

            <!-- 模态框 -->
            <Transition name="modal">
                <div
                    v-if="showModal"
                    class="department-modal"
                    @click.self="closeModal"
                >
                    <!-- 点击外面也能关闭 -->
                    <div class="modal-content">
                        <button class="close-btn" @click="closeModal">×</button>
                        <h2>{{ departments[currentDepartment].name }}</h2>
                        <!-- 直接使用对应部门提供的说明， 通过html尽可能保留必要的格式 -->
                        <div
                            class="modal-body"
                            v-html="departments[currentDepartment].description"
                        ></div>
                    </div>
                </div>
            </Transition>
        </div>
    </section>
</template>

<style scoped>
.content-wrapper {
    max-width: 70vw;
    margin: 0 auto;
    padding: 2vh 0;
}

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.team-member {
    cursor: pointer; /* 鼠标悬停时显示手型 */
    text-align: center;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.team-member:hover {
    transform: translateY(-5px);
}

.member-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover; /* 保持图片比例，那么截图的logo只要全部1:1即可*/
    object-position: center;
    margin-bottom: 1rem;
    border: 3px solid #f8f9fa;
    transition: border-color 0.3s ease;
    display: block;
    margin-left: auto;
    margin-right: auto;
    user-select: none; /* 防止图片被选中 */
    -webkit-user-drag: none;
}

.team-member:hover .member-avatar {
    border-color: #3498db;
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

.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from, /* 进入和离开时均为透明度0 */
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 随便用个贝塞尔曲线实现弹性效果 */
}

.modal-enter-from .modal-content,  /* 进入和离开时大小都小一号， 可以产生一个跳动的效果 */
.modal-leave-to .modal-content {
    /*大小变 */
    transform: scale(0.9);
}

.department-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    /* overflow: hidden; */
}

.modal-content {
    position: relative;
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    /* overflow: hidden; */
    transform: scale(1);
    opacity: 1;
}

/* dark */
@media (prefers-color-scheme: dark) {
    .modal-content {
        background: #2c3e50;
        color: white;
    }

    .modal-content h2 {
        color: #ecf0f1;
    }

    .modal-body {
        color: #ecf0f1;
    }

    .close-btn {
        color: #ecf0f1;
    }
}

.modal-body {
    overflow-y: auto;
    flex-grow: 1;
    padding: 0 1rem;
    margin-top: 1rem;
    margin-bottom: 2rem;
    max-height: 70vh; /* 预留标题和按钮空间 */
    scrollbar-width: thin; /* 更细的滚动条 */
    overscroll-behavior: contain; /* 阻止滚动穿透—— 具体来说就是滚到底部的时候不会移动其它内容 */
}
/* 有必要的话， 对内部description需要进一步定义，因为提供的直接就是html， 但是有点麻烦*/

.close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 2rem;
    line-height: 1;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #333;
}
</style>
