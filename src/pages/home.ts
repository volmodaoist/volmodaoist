import { Navbar } from '@/components/Navbar.js';
import { SearchBar } from '@/components/SearchBar.js';
import { Footer } from '@/components/Footer.js';

const CONTENT_INCLUDES_DIR = 'contents/includes/';
const SECTION_NAMES = ['home', 'publications', 'awards', 'projects'];

window.addEventListener('DOMContentLoaded', async () => {
    // 初始化导航栏和 YAML 配置加载
    const navbar = new Navbar('contents/config.yml');
    await navbar.init();

    // 初始化全局吸顶搜索栏组件
    const searchBar = new SearchBar({ redirectUrl: 'pages/notes.html' });
    searchBar.init();

    // 配置 Marked 库
    marked.use({ mangle: false, headerIds: false });

    // 通过 Marked 获取 markdown 并且渲染
    const renderMarkdown = async (forceRefresh: boolean = false) => {
        // 如果是强制刷新操作，我们需要记录当前的时间戳作为最新的"版本号"
        if (forceRefresh) {
            const currentTimestamp = new Date().getTime().toString();
            localStorage.setItem('content_version', currentTimestamp);
        }
        
        // 获取本地存储中的版本号，以决定我们拉取哪个版本的文件
        const version = localStorage.getItem('content_version');

        SECTION_NAMES.forEach(async (name) => {
            try {
                // 构建请求的 URL，如果存在版本号则附加在最后
                let requestUrl = `${CONTENT_INCLUDES_DIR}${name}.md`;
                if (version) {
                    requestUrl = `${requestUrl}?v=${version}`;
                }

                // 构建 fetch 请求的选项
                let fetchOptions: RequestInit = {};
                if (forceRefresh) {
                    // 当用户明确要求强制刷新时，我们需要给浏览器下达不使用缓存的指令
                    // reload 会强制浏览器重新发起网络请求，即使缓存中已存在
                    fetchOptions.cache = 'reload';
                }

                // 发起请求并渲染
                const response = await fetch(requestUrl, fetchOptions);
                if (!response.ok) {
                    throw new Error(`无法加载 ${name}.md`);
                }
                
                const markdown = await response.text();
                const html = marked.parse(markdown);
                
                const element = document.getElementById(`${name}-md`);
                if (element) {
                    element.innerHTML = html;
                }
            } catch (error) {
                console.error(error);
            }
        });
    };

    // 默认加载
    await renderMarkdown(false);

    // 渲染 Footer 组件
    const footer = new Footer('footer-container');
    footer.render();

    // 暴露全局刷新方法给按键调用
    (window as any).forceRefreshContent = async () => {
        await renderMarkdown(true);
        // 可以加一个小提示或动画反馈
        console.log("内容已强制刷新");
    };
});
