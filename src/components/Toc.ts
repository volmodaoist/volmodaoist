// Table of Content
export class Toc {
    private container: HTMLElement;
    private contentContainer: HTMLElement;

    constructor(containerId: string, contentContainerId: string) {
        this.container = document.getElementById(containerId)!;
        this.contentContainer = document.getElementById(contentContainerId)!;
    }

    public render() {
        if (!this.container || !this.contentContainer) return;
        
        this.container.innerHTML = ''; // 清除旧的目录
        
        // 查找 Markdown 渲染出来的标题标签
        const headings = this.contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
            this.container.innerHTML = '<div class="text-muted small">暂无目录</div>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'nav flex-column toc-nav';
        
        headings.forEach((heading, index) => {
            // 如果标题没有 id，给它加上 id，方便锚点跳转
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            // 解析标题级别 (h1 -> 1)
            const level = parseInt(heading.tagName.substring(1));
            const li = document.createElement('li');
            li.className = 'nav-item mb-1';
            
            // 根据标题级别做对应的左侧缩进 (这里将 h1 视作顶层，h2 缩进 1rem 等)
            const indent = Math.max(0, level - 1) * 1;
            li.style.marginLeft = `${indent}rem`;
            
            const a = document.createElement('a');
            a.className = 'nav-link text-secondary py-0 px-0 small text-truncate';
            a.style.display = 'block';
            a.style.maxWidth = '100%';
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            a.title = heading.textContent || '';
            
            // 平滑滚动监听
            a.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth' });
            });
            
            li.appendChild(a);
            ul.appendChild(li);
        });
        
        this.container.appendChild(ul);
    }
}
