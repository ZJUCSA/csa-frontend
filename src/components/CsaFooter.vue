<template>
    <footer id="bottom-footer" class="footer">
        <div class="footer-content">
            <div class="footer-row footer-title">
                <span>浙江大学学生网络空间安全协会</span>
                <span>地址: 浙江大学紫金港校区蒙民伟楼226室</span>
            </div>
            <div class="footer-row footer-legal">
                <span>© {{ new Date().getFullYear() }} 浙江大学</span>
                <span>浙ICP备05074421号-1</span>
                <span>浙公网安备33010602010295</span>
            </div>
        </div>
    </footer>
</template>

<style>
.footer {
    width: 100%;
    flex-shrink: 0;
    z-index: 100;
    background: var(--bg-surface);
    border-top: 2px solid var(--border-color);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.footer-content {
    text-align: center;
    padding: 1rem;
}

.footer-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
}

.footer-row:last-child {
    margin-bottom: 0;
}

.footer-title {
    font-weight: bold;
}

.footer-legal {
    font-weight: 500;
}

.footer span {
    color: var(--text-primary);
}
</style>
