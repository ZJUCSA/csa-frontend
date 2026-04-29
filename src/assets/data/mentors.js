/*
 * 职责范围：提供教师介绍页前端第一阶段使用的临时 seed 数据和字段契约样例。
 * 功能边界：本文件只保存四位白名单教师的占位字段，不承载正式公开资料审校，也不替代后端教师 API。
 */

export const mentorSyncMeta = {
    last_synced_at: '',
    source_status: 'manual_seed',
    source_url: '',
    sync_note: '临时 JSON 数据，后续接入后端同步。',
}

export const mentors = [
    {
        id: 'li-song',
        name: '李松',
        title: '',
        affiliation: '',
        research_areas: [],
        summary: '',
        bio: '',
        email: '',
        avatar_url: '/mentors/li-song/avatar.png',
        homepage_urls: [],
        source_url: '',
        source_status: 'manual_seed',
        last_synced_at: '',
        sync_note: '',
        profile_sections: [],
    },
    {
        id: 'du-wenliang',
        name: '杜文亮',
        title: '',
        affiliation: '',
        research_areas: [],
        summary: '',
        bio: '',
        email: '',
        avatar_url: '/mentors/du-wenliang/avatar.jpg',
        homepage_urls: [],
        source_url: '',
        source_status: 'manual_seed',
        last_synced_at: '',
        sync_note: '',
        profile_sections: [],
    },
    {
        id: 'lin-feng',
        name: '林峰',
        title: '',
        affiliation: '',
        research_areas: [],
        summary: '',
        bio: '',
        email: '',
        avatar_url: '/mentors/lin-feng/avatar.jpg',
        homepage_urls: [],
        source_url: '',
        source_status: 'manual_seed',
        last_synced_at: '',
        sync_note: '',
        profile_sections: [],
    },
    {
        id: 'shen-dakun',
        name: '申大坤',
        title: '',
        affiliation: '',
        research_areas: [],
        summary: '',
        bio: '',
        email: '',
        avatar_url: '/mentors/shen-dakun/avatar.png',
        homepage_urls: [],
        source_url: '',
        source_status: 'manual_seed',
        last_synced_at: '',
        sync_note: '',
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

