/*
 * 职责范围：提供教师介绍页前端第一阶段使用的临时 seed 数据和字段契约样例。
 * 功能边界：本文件只保存四位白名单教师的占位字段，不承载正式公开资料审校，也不替代后端教师 API。
 */

const MANUAL_REVIEWED_AT = '2026-04-29T00:00:00+08:00'

export const mentorSyncMeta = {
    last_synced_at: MANUAL_REVIEWED_AT,
    source_status: 'manual_seed',
    source_url: 'https://icsr.zju.edu.cn/jsdw/list.htm',
    sync_note: '本批数据为人工整理的临时 seed，后续接入后端同步。',
}

export const mentors = [
    {
        id: 'li-song',
        name: '李松',
        title: '百人计划研究员 | 博士生导师',
        affiliation: '浙江大学计算机科学与技术学院 / 网络空间安全学院',
        research_areas: ['程序分析', '漏洞挖掘', '应用安全', '网络安全', '系统安全'],
        summary: '研究方向包括程序分析、漏洞挖掘和应用安全，学院教师队伍页同时列出网络安全、系统安全方向。',
        bio: '李松为浙江大学百人计划研究员、博士生导师。公开主页介绍其研究工作聚焦程序分析、漏洞挖掘与应用安全；学院教师队伍页列出的方向包括漏洞挖掘、网络安全、系统安全和程序分析。',
        email: 'songli@zju.edu.cn',
        avatar_url: '/mentors/li-song/avatar.png',
        homepage_urls: [
            {
                label: '个人主页',
                url: 'https://songli.io/',
                type: 'profile',
            },
            {
                label: 'Google Scholar',
                url: 'https://scholar.google.com/citations?user=BBPDISIAAAAJ&hl=en',
                type: 'scholar',
            },
            {
                label: '学院教师队伍页',
                url: 'https://icsr.zju.edu.cn/jsdw/list.htm',
                type: 'source',
            },
        ],
        source_url: 'https://songli.io/',
        source_status: 'manual_seed',
        last_synced_at: MANUAL_REVIEWED_AT,
        sync_note: '个人主页邮箱以图片形式展示；正式接入同步前需继续复核字段抽取方式。',
        profile_sections: [],
    },
    {
        id: 'du-wenliang',
        name: '杜文亮',
        title: '求是讲席教授 | 博士生导师 | ACM/IEEE Fellow',
        affiliation: '浙江大学计算机科学与技术学院',
        research_areas: ['网络空间安全', '系统安全', '网络仿真', '网络系统仿真', '车联网安全'],
        summary: '浙大个人主页列出网络空间安全、系统安全和网络仿真方向，学院教师队伍页补充网络系统仿真、互联网、无线移动网、车联网、工控网。',
        bio: '杜文亮为浙江大学求是讲席教授、博士生导师。浙大个人主页列出研究方向为网络空间安全、系统安全和网络仿真；学院教师队伍页列出网络系统仿真、互联网、无线移动网、车联网、工控网等方向。',
        email: 'wenliangdu@zju.edu.cn',
        avatar_url: '/mentors/du-wenliang/avatar.jpg',
        homepage_urls: [
            {
                label: '浙大个人主页',
                url: 'https://person.zju.edu.cn/wenliangdu',
                type: 'profile',
            },
            {
                label: 'SEED Labs 主页',
                url: 'https://seedsecuritylabs.org/wenliangdu/',
                type: 'profile',
            },
            {
                label: '学院教师队伍页',
                url: 'https://icsr.zju.edu.cn/jsdw/list.htm',
                type: 'source',
            },
        ],
        source_url: 'https://person.zju.edu.cn/wenliangdu',
        source_status: 'manual_seed',
        last_synced_at: MANUAL_REVIEWED_AT,
        sync_note: '字段人工整理自浙大个人主页、学院教师队伍页和公开个人主页。',
        profile_sections: [],
    },
    {
        id: 'lin-feng',
        name: '林峰',
        title: '百人计划研究员 | 博士生导师',
        affiliation: '浙江大学计算机科学与技术学院 / 网络空间安全学院',
        research_areas: ['智能网联车安全', '物联网安全', '人工智能安全', '无线感知攻防', '生物识别身份认证'],
        summary: '浙大个人主页列出智能网联车安全、物联网安全、人工智能安全、无线感知攻防和生物识别身份认证等方向。',
        bio: '林峰为浙江大学百人计划研究员、博士生导师。浙大个人主页列出研究方向为智能网联车安全、物联网安全、人工智能安全、无线感知攻防和生物识别身份认证；其公开主页也列出 IoT Security、Smart Vehicle Security、Deepfake Detection、Artificial Intelligence Security 等兴趣方向。',
        email: 'flin@zju.edu.cn',
        avatar_url: '/mentors/lin-feng/avatar.jpg',
        homepage_urls: [
            {
                label: '浙大个人主页',
                url: 'https://person.zju.edu.cn/flin',
                type: 'profile',
            },
            {
                label: '个人主页',
                url: 'https://flin.group/',
                type: 'profile',
            },
            {
                label: '学院教师队伍页',
                url: 'https://icsr.zju.edu.cn/jsdw/list.htm',
                type: 'source',
            },
        ],
        source_url: 'https://person.zju.edu.cn/flin',
        source_status: 'manual_seed',
        last_synced_at: MANUAL_REVIEWED_AT,
        sync_note: '字段人工整理自浙大个人主页、学院教师队伍页和公开个人主页。',
        profile_sections: [],
    },
    {
        id: 'shen-dakun',
        name: '申大坤',
        title: '研究员',
        affiliation: '浙江大学网络空间安全学院',
        research_areas: ['系统安全', 'IoT 安全', '软件供应链'],
        summary: '学院教师队伍页列为研究员，研究方向为系统安全、IoT 安全和软件供应链。',
        bio: '申大坤为浙江大学网络空间安全学院教师队伍页列出的研究员。当前公开来源列出的研究方向为系统安全、IoT 安全和软件供应链；个人主页、邮箱等字段在本阶段暂未确认。',
        email: '',
        avatar_url: '/mentors/shen-dakun/avatar.png',
        homepage_urls: [
            {
                label: '学院教师队伍页',
                url: 'https://icsr.zju.edu.cn/jsdw/list.htm',
                type: 'source',
            },
        ],
        source_url: 'https://icsr.zju.edu.cn/jsdw/list.htm',
        source_status: 'manual_seed',
        last_synced_at: MANUAL_REVIEWED_AT,
        sync_note: '本阶段仅确认学院教师队伍页基础信息；邮箱和个人主页入口待后续复核。',
        profile_sections: [],
    },
]

export const mentorsListResponse = {
    items: mentors,
    meta: mentorSyncMeta,
}

export const getMentorDetailResponse = id => {
    const item = mentors.find(mentor => mentor.id === id)

    return {
        item: item || null,
        meta: mentorSyncMeta,
    }
}
