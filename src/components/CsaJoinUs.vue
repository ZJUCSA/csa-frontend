<script setup>
const show = ref(false)
</script>

<template>
    <Dialog v-model:visible="show" modal header="加入我们" class="join-dialog">
        <div class="join-dialog__content">
            <img src="../assets/miniapp.jpg" class="join-dialog__qr" />
        </div>
    </Dialog>

    <div class="join-us-page">
        <div class="join-us-panel">
            <h1 class="join-us-title animate-pulse">加入我们</h1>
            <p class="join-us-lead">
                成为改变世界的一份力量。我们正在寻找充满激情、富有创造力的人才。
            </p>
            <p class="join-us-copy">一起创造未来，实现梦想！</p>
            <button @click="show = true" class="join-us-button">立即加入</button>
        </div>
    </div>
</template>

<style scoped>
.join-us-page {
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6rem 1rem calc(4rem + var(--page-footer-gap));
    background:
        radial-gradient(circle at top center, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0) 32%),
        linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.join-us-panel {
    width: min(100%, 40rem);
    padding: 2.75rem;
    border-radius: 28px;
    background: rgba(var(--bg-surface-rgb), 0.88);
    border: 1px solid rgba(102, 126, 234, 0.1);
    box-shadow: 0 24px 56px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(20px);
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.join-us-title {
    margin: 0 0 1rem;
    font-size: clamp(2.25rem, 3vw, 3rem);
    font-weight: 800;
    color: var(--text-primary);
}

.join-us-lead {
    margin: 0 0 1rem;
    font-size: 1.15rem;
    line-height: 1.8;
    color: var(--text-primary);
}

.join-us-copy {
    margin: 0 0 2rem;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-secondary);
}

.join-us-button {
    width: 100%;
    min-height: 3rem;
    border: none;
    border-radius: 999px;
    padding: 0.85rem 1.5rem;
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
    color: #ffffff;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, filter 0.2s ease;
}

.join-us-button:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
}

.join-us-button:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.22);
    outline-offset: 3px;
}

.join-dialog__content {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0 0.75rem;
}

.join-dialog__qr {
    width: min(16rem, 100%);
    height: auto;
    border-radius: 20px;
    border: 1px solid var(--border-color);
}

:global(.dark) .join-us-page {
    background:
        radial-gradient(circle at top center, rgba(96, 165, 250, 0.14) 0%, rgba(96, 165, 250, 0) 34%),
        linear-gradient(180deg, #0f172a 0%, #172335 28%, #1b2738 100%);
}

:global(.dark) .join-us-panel {
    background: rgba(23, 35, 53, 0.9);
    border-color: rgba(148, 163, 184, 0.14);
    box-shadow: 0 28px 60px rgba(2, 6, 23, 0.26);
}

:deep(.join-dialog.p-dialog) {
    background: var(--bg-surface);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 22px 48px rgba(15, 23, 42, 0.16);
}

:deep(.join-dialog .p-dialog-header) {
    background: transparent;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
}

:deep(.join-dialog .p-dialog-content) {
    background: transparent;
    color: var(--text-primary);
}

:global(.dark) :deep(.join-dialog.p-dialog) {
    background: #1b2738;
    border-color: rgba(148, 163, 184, 0.14);
    box-shadow: 0 28px 56px rgba(2, 6, 23, 0.34);
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

@media (max-width: 768px) {
    .join-us-page {
        padding: 5rem 1rem calc(3rem + var(--page-footer-gap));
    }

    .join-us-panel {
        padding: 2rem 1.5rem;
        border-radius: 24px;
    }

    .join-us-lead {
        font-size: 1rem;
    }
}
</style>
