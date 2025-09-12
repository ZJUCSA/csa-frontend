/**
 * 图片处理工具函数
 */

/**
 * 将图片URL转换为API请求URL
 * @param {string} imageUrl - 原始图片URL
 * @returns {string} - 转换后的API URL
 */
export function convertImageUrlToApi(imageUrl) {
    if (!imageUrl) return ''
    
    // 如果是本地上传的图片，转换为API请求
    if (imageUrl.startsWith('/uploads/images/')) {
        // 移除 /uploads/images/ 前缀，保留相对路径
        const relativePath = imageUrl.replace('/uploads/images/', '')
        return `/api/images?name=${encodeURIComponent(relativePath)}`
    }
    
    // 如果已经是API格式，直接返回
    if (imageUrl.startsWith('/api/images')) {
        const relativePath = imageUrl.replace('/api/images', '')
        return `/api/images?name=${encodeURIComponent(relativePath)}`
    }
    
    // 其他情况（外部链接）直接返回
    return imageUrl
}

/**
 * 处理markdown内容中的图片链接
 * @param {string} content - markdown内容
 * @returns {string} - 处理后的内容
 */
export function processMarkdownImages(content) {
    if (!content) return ''
    
    // 匹配markdown图片语法: ![alt](url)
    return content.replace(
        /!\[([^\]]*)\]\(\/uploads\/images\/([^)]+)\)/g,
        (match, alt, path) => {
            return `![${alt}](/api/images?name=${encodeURIComponent(path)})`
        }
    )
}

/**
 * 处理单个图片URL
 * @param {string} imageUrl - 图片URL
 * @returns {string} - 处理后的URL
 */
export function processImageUrl(imageUrl) {
    return convertImageUrlToApi(imageUrl)
}
