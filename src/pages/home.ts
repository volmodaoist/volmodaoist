import { Navbar } from '../components/Navbar.js';

const CONTENT_INCLUDES_DIR = 'contents/includes/';
const SECTION_NAMES = ['home', 'publications', 'awards', 'projects'];

window.addEventListener('DOMContentLoaded', async () => {
    // 初始化导航栏和 YAML 配置加载
    const navbar = new Navbar('contents/config.yml');
    await navbar.init();

    // 配置 Marked 库
    marked.use({ mangle: false, headerIds: false });

    // 通过 Marked 获取 markdown 并且渲染
    SECTION_NAMES.forEach(async (name) => {
        try {
            const response = await fetch(`${CONTENT_INCLUDES_DIR}${name}.md`);
            if (!response.ok) throw new Error(`无法加载 ${name}.md`);
            
            const markdown = await response.text();
            const html = marked.parse(markdown);
            
            const element = document.getElementById(`${name}-md`);
            if (element) {
                element.innerHTML = html;
            }

            // MathJax 公式渲染
            if (typeof MathJax !== 'undefined' && MathJax.typeset) {
                MathJax.typeset();
            }
        } catch (error) {
            console.error(error);
        }
    });
});
