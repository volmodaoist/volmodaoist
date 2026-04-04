export interface SearchBarOptions {
    /** 配置主页回车后跳转的地址，如 'pages/notes.html' */
    redirectUrl?: string;
    /** 配置笔记页实时搜索的过滤回调函数 */
    onSearch?: (query: string) => void;
}

export class SearchBar {
    private inputElement: HTMLInputElement | null = null;
    private redirectUrl?: string;
    private onSearch?: (query: string) => void;

    constructor(options: SearchBarOptions = {}) {
        this.redirectUrl = options.redirectUrl;
        this.onSearch = options.onSearch;
    }

    public init() {
        this.render();
        this.bindEvents();
    }

    /** 动态向 DOM 中注入搜索栏 HTML，保证全站只有一份 HTML 源码 */
    private render() {
        const container = document.getElementById('nav-search-container');
        if (!container) return; // 只有在有这个占位符的页面才会渲染
        
        // 动态设置占位符文案
        const placeholder = this.redirectUrl 
            ? "Search (Press Enter)..." 
            : "Search by title, tag...";

        container.innerHTML = `
            <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0 transition-all"><i class="bi bi-search"></i></span>
                <input type="text" id="global-search-input" class="form-control border-start-0 transition-all" style="box-shadow: none;" placeholder="${placeholder}">
            </div>
        `;
        
        this.inputElement = document.getElementById('global-search-input') as HTMLInputElement;
    }

    private bindEvents() {
        if (!this.inputElement) return;

        // 如果是带参数跳转过来的，自动解析 URL 中的 search 参数并触发过滤
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            this.inputElement.value = searchParam;
            if (this.onSearch) {
                this.onSearch(searchParam);
            }
        }

        // 监听键盘输入
        this.inputElement.addEventListener('keyup', (e: KeyboardEvent) => {
            const query = this.inputElement!.value.trim().toLowerCase();

            // 如果当前在笔记页，支持实时搜索过滤
            if (this.onSearch) {
                this.onSearch(query);
            }

            // 如果当前在主页配置了跳转链接，监听回车事件进行跳转
            if (this.redirectUrl && e.key === 'Enter') {
                if (query) {
                    window.location.href = `${this.redirectUrl}?search=${encodeURIComponent(query)}`;
                } else {
                    window.location.href = this.redirectUrl;
                }
            }
        });
    }

    /** 供外部直接设置输入框的值并触发回调的方法（例如点击 Tag） */
    public setValue(val: string) {
        if (this.inputElement) {
            this.inputElement.value = val;
            if (this.onSearch) {
                this.onSearch(val.toLowerCase());
            }
        }
    }

    /** 获取当前的输入值 */
    public getValue(): string {
        return this.inputElement ? this.inputElement.value : '';
    }
}
