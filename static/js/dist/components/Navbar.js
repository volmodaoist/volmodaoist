import { loadConfig } from '@/utils/config.js';
export class Navbar {
    constructor(configPath = 'contents/config.yml') {
        this.configPath = configPath;
    }
    async init() {
        this.setupScrollSpy();
        this.setupResponsiveToggler();
        await this.applyConfig();
    }
    setupScrollSpy() {
        // 在主导航元素上激活 Bootstrap 的 scrollspy（滚动监听）
        const mainNav = document.body.querySelector('#mainNav');
        if (mainNav) {
            new bootstrap.ScrollSpy(document.body, {
                target: '#mainNav',
                offset: 74,
            });
        }
    }
    setupResponsiveToggler() {
        // 当切换按钮可见时，折叠响应式导航栏
        const navbarToggler = document.body.querySelector('.navbar-toggler');
        if (!navbarToggler)
            return;
        const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
        responsiveNavItems.forEach((responsiveNavItem) => {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    navbarToggler.click();
                }
            });
        });
    }
    async applyConfig() {
        // 获取 Yaml 里面的配置，渲染解析于页面之上
        const config = await loadConfig(this.configPath);
        Object.keys(config).forEach(key => {
            try {
                const el = document.getElementById(key);
                if (el) {
                    el.innerHTML = config[key];
                }
            }
            catch (err) {
                console.log(`未知的 ID 和值: ${key}, ${config[key]}`);
            }
        });
    }
}
