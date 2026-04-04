import { loadConfig } from '@/utils/config.js';

export class Navbar {
    private configPath: string;

    constructor(configPath: string = 'contents/config.yml') {
        this.configPath = configPath;
    }

    public async init() {
        this.setupScrollSpy();
        this.setupResponsiveToggler();
        await this.applyConfig();
    }

    private setupScrollSpy() {
        // 在主导航元素上激活 Bootstrap 的 scrollspy（滚动监听）
        const mainNav = document.body.querySelector('#mainNav');
        if (mainNav) {
            new bootstrap.ScrollSpy(document.body, {
                target: '#mainNav',
                offset: 74,
            });
        }
    }

    private setupResponsiveToggler() {
        // 当切换按钮可见时，折叠响应式导航栏
        const navbarToggler = document.body.querySelector('.navbar-toggler') as HTMLElement;
        if (!navbarToggler) return;

        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.forEach((responsiveNavItem: HTMLElement) => {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    navbarToggler.click();
                }
            });
        });
    }

    private async applyConfig() {
        // 获取 Yaml 里面的配置，渲染解析于页面之上
        const config = await loadConfig(this.configPath);
        Object.keys(config).forEach(key => {
            try {
                const el = document.getElementById(key);
                if (el) {
                    el.innerHTML = config[key];
                }
            } catch (err) {
                console.log(`未知的 ID 和 val: ${key}, ${config[key]}`);
            }
        });
    }
}
