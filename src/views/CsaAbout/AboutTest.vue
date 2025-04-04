<script setup>
import { onMounted, ref } from 'vue'

// 配置机器人
const difyChatbotConfig = {
  token: 'oH7pXrt6ygJkbryN',
  baseUrl: 'http://10.202.160.156'
}

const isLoading = ref(false)
const loadError = ref(null)

onMounted(() => {
  // 在组件挂载后设置配置并加载脚本
  window.difyChatbotConfig = difyChatbotConfig
  isLoading.value = true

  try {
    const script = document.createElement('script')
    script.src = 'http://10.202.160.156/embed.min.js'
    script.id = 'oH7pXrt6ygJkbryN'
    script.defer = true

    script.onload = () => {
      console.log('机器人脚本加载成功')
      isLoading.value = false
    }

    script.onerror = (error) => {
      console.error('机器人脚本加载失败:', error)
      // 尝试发送一个测试请求来检查服务器状态
      fetch('http://10.202.160.156/embed.min.js')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status} ${response.statusText}`)
          }
          return response.text()
        })
        .then(() => {
          loadError.value = '脚本可以访问但加载失败，可能是浏览器安全策略限制'
        })
        .catch(fetchError => {
          console.error('测试请求失败:', fetchError)
          if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
            loadError.value = '无法连接到服务器，请检查服务器是否正常运行, 或者对应脚本是否真的存在'
          } else {
            loadError.value = `服务器连接错误: ${fetchError.message}`
          }
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    document.body.appendChild(script)
  } catch (error) {
    console.error('机器人初始化失败:', error)
    loadError.value = '机器人初始化失败'
    isLoading.value = false
  }
})
</script>

<template>
  <section id="test" class="section">
    <div class="content-wrapper">
      <h2>可展开机器人测试</h2>
      <div v-if="isLoading" class="loading-status">正在加载机器人...</div>
      <div v-if="loadError" class="error-message">{{ loadError }}</div>

      <h2>iframe机器人测试</h2>
      <iframe
        src="http://10.202.160.156/chat/oH7pXrt6ygJkbryN"
        style="width: 100%; height: 100%; min-height: 700px"
        frameborder="0"
        allow="microphone">
      </iframe>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 2rem 0;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-status {
  color: #666;
  margin-top: 1rem;
}

.error-message {
  color: #dc2626;
  margin-top: 1rem;
}
</style>

<style>
/* 机器人样式配置 */
#dify-chatbot-bubble-button {
  background-color: #1C64F2 !important;
}

#dify-chatbot-bubble-window {
  width: 24rem !important;
  height: 40rem !important;
}
</style>
