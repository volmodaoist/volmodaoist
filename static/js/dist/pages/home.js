import { Navbar } from '@/components/Navbar.js';
import { SearchBar } from '@/components/SearchBar.js';
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
    const renderMarkdown = async (forceRefresh = false) => {
        SECTION_NAMES.forEach(async (name) => {
            try {
                // 如果是强制刷新，加上时间戳绕过缓存
                const cacheBuster = forceRefresh ? `?t=${new Date().getTime()}` : '';
                const response = await fetch(`${CONTENT_INCLUDES_DIR}${name}.md${cacheBuster}`);
                if (!response.ok)
                    throw new Error(`无法加载 ${name}.md`);
                const markdown = await response.text();
                const html = marked.parse(markdown);
                const element = document.getElementById(`${name}-md`);
                if (element) {
                    element.innerHTML = html;
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    };
    // 默认加载
    await renderMarkdown(false);
    // 暴露全局刷新方法给按键调用
    window.forceRefreshContent = async () => {
        await renderMarkdown(true);
        // 可以加一个小提示或动画反馈
        console.log("内容已强制刷新");
    };
});
