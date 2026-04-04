import { Navbar } from '../components/Navbar.js';

interface Note {
    title: string;
    date: string;
    description: string;
    tags: string[];
    file: string;
}

const NOTES_DIR = '../contents/notes/';
const NOTES_INDEX_FILE = '../contents/notes.json';
let notesData: Note[] = [];

window.addEventListener('DOMContentLoaded', async () => {
    // 初始化导航栏（调整 config 路径，因为 notes.html 现在在 pages/ 下面）
    const navbar = new Navbar('../contents/config.yml');
    await navbar.init();

    // 配置 Marked 库
    marked.use({ mangle: false, headerIds: false });

    // 获取并解析笔记索引文件
    try {
        const response = await fetch(NOTES_INDEX_FILE);
        if (!response.ok) {
            throw new Error("无法加载 notes.json");
        }
        notesData = await response.json();
        renderNotesList(notesData);
    } catch (error) {
        console.error(error);
        const listEl = document.getElementById('notes-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="alert alert-warning">
                    没有找到任何笔记。请先创建 <code>contents/notes.json</code> 并在 <code>contents/notes/</code> 中添加 Markdown 文件。
                </div>
            `;
        }
    }

    // 搜索功能（结合标题、标签、描述逻辑进行匹配）
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('keyup', (e: Event) => {
            const query = (e.target as HTMLInputElement).value.toLowerCase();
            filterNotes(query);
        });
    }

    // 绑定"返回"按钮
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.addEventListener('click', showNotesList);
    }
});

// 根据关键词过滤笔记列表
function filterNotes(query: string) {
    let filtered = [];
    // 增加显式的按标签搜索能力，例如输入 'tag:blog'
    if (query.startsWith('tag:')) {
        const tagQuery = query.split(':')[1].trim();
        filtered = notesData.filter(note => 
            (note.tags || []).some(tag => tag.toLowerCase().includes(tagQuery))
        );
    } else {
        filtered = notesData.filter(note => 
            note.title.toLowerCase().includes(query) || 
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query))) ||
            (note.description && note.description.toLowerCase().includes(query))
        );
    }
    renderNotesList(filtered);
}

// 绑定在 window 上，使得 HTML 里的 onclick 事件能够直接调用
(window as any).openNote = async function(filename: string) {
    document.getElementById('notes-list-view')!.style.display = 'none';
    const detailView = document.getElementById('note-detail-view')!;
    const contentBody = document.getElementById('note-content-body')!;
    const btnBack = document.getElementById('btn-back')!;
    
    detailView.style.display = 'block';
    contentBody.style.display = 'block';
    btnBack.style.display = 'inline-block';
    contentBody.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div></div>';

    // 异步拉取并渲染具体的 markdown 文件
    try {
        const response = await fetch(NOTES_DIR + filename);
        if (!response.ok) throw new Error("文件未找到");
        const markdown = await response.text();
        const html = marked.parse(markdown);
        contentBody.innerHTML = html;
        
        // 渲染数学公式
        if (typeof MathJax !== 'undefined' && MathJax.typeset) {
            MathJax.typeset();
        }
    } catch (error) {
        console.error(error);
        contentBody.innerHTML = `<div class="alert alert-danger">加载笔记报错: ${filename}</div>`;
    }
};

// 暴露标签点击搜索方法到全局
(window as any).searchByTag = function(tag: string, event: Event) {
    event.stopPropagation(); // 阻止事件冒泡，避免点击标签时打开笔记
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) {
        searchInput.value = `tag:${tag}`;
        filterNotes(`tag:${tag}`);
    }
};

// 显示笔记列表视图（隐藏详情）
function showNotesList() {
    document.getElementById('notes-list-view')!.style.display = 'block';
    document.getElementById('note-detail-view')!.style.display = 'none';
    document.getElementById('note-content-body')!.innerHTML = '';
}

// 将笔记渲染到页面 DOM 结构中
function renderNotesList(notes: Note[]) {
    const listContainer = document.getElementById('notes-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (notes.length === 0) {
        listContainer.innerHTML = '<div class="col-12"><p class="text-muted">没有找到匹配的笔记。</p></div>';
        return;
    }

    notes.forEach(note => {
        const tagsHtml = (note.tags || []).map(tag => 
            `<span class="badge bg-secondary me-1 tag-clickable" onclick="searchByTag('${tag}', event)">${tag}</span>`
        ).join('');
        
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4'; 
        card.innerHTML = `
            <div class="card note-card shadow-sm h-100" onclick="openNote('${note.file}')">
                <div class="card-body">
                    <h5 class="card-title text-primary">${note.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted small">${note.date || ''}</h6>
                    <p class="card-text small">${note.description || '暂无简介'}</p>
                    <div class="tags-container mt-2">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}
