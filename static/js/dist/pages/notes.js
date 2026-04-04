import { Navbar } from '@/components/Navbar.js';
import { SearchBar } from '@/components/SearchBar.js';
const NOTES_DIR = '../contents/notes/';
const NOTES_INDEX_FILE = '../contents/notes.json';
let notesData = [];
let searchBar;
// 分页配置
const PAGE_SIZE = 9;
let currentFilteredNotes = [];
let currentPage = 1;
window.addEventListener('DOMContentLoaded', async () => {
    // 初始化导航栏（调整 config 路径，因为 notes.html 现在在 pages/ 下面）
    const navbar = new Navbar('../contents/config.yml');
    await navbar.init();
    // 配置 Marked 三方库
    marked.use({ mangle: false, headerIds: false });
    // 初始化搜索组件 (注册过滤回调函数), 如果用户在笔记详情页搜索，自动退回列表页
    searchBar = new SearchBar({
        onSearch: (query) => {
            filterNotes(query);
            showNotesList();
        }
    });
    // 获取并解析笔记索引文件
    try {
        const response = await fetch(NOTES_INDEX_FILE);
        if (!response.ok) {
            throw new Error("无法加载 notes.json");
        }
        notesData = await response.json();
        // 数据准备好后初始化搜索组件，它会自动把 URL 参数取出来触发一次过滤
        searchBar.init();
        // 如果没有 URL 预设的搜索词，展示全量
        if (!searchBar.getValue()) {
            currentFilteredNotes = notesData;
            currentPage = 1;
            renderNotesList();
        }
    }
    catch (error) {
        console.error(error);
        const listEl = document.getElementById('notes-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
                    <h4 class="mt-3 text-muted">当前还没有任何笔记</h4>
                    <p class="text-muted">（你可以随时在 contents/notes 目录下开始创作）</p>
                </div>
            `;
        }
    }
    // 绑定"返回"按钮
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.addEventListener('click', showNotesList);
    }
});
// 根据关键词过滤笔记列表
function filterNotes(query) {
    let filtered = [];
    // 增加显式的按标签搜索能力，例如输入 'tag:blog'
    if (query.startsWith('tag:')) {
        const tagQuery = query.split(':')[1].trim();
        filtered = notesData.filter(note => (note.tags || []).some(tag => tag.toLowerCase().includes(tagQuery)));
    }
    else {
        filtered = notesData.filter(note => note.title.toLowerCase().includes(query) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query))) ||
            (note.description && note.description.toLowerCase().includes(query)));
    }
    currentFilteredNotes = filtered;
    currentPage = 1; // 重新搜索后重置为第一页
    renderNotesList();
}
// 绑定在 window 上，使得 HTML 里的 onclick 事件能够直接调用
window.openNote = async function (filename) {
    document.getElementById('notes-list-view').style.display = 'none';
    const detailView = document.getElementById('note-detail-view');
    const contentBody = document.getElementById('note-content-body');
    const btnBack = document.getElementById('btn-back');
    detailView.style.display = 'block';
    contentBody.style.display = 'block';
    btnBack.style.display = 'inline-block';
    contentBody.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div></div>';
    // 异步拉取并渲染具体的 markdown 文件
    try {
        const response = await fetch(NOTES_DIR + filename);
        if (!response.ok)
            throw new Error("文件未找到");
        const markdown = await response.text();
        const html = marked.parse(markdown);
        contentBody.innerHTML = html;
        // 渲染数学公式
        if (typeof MathJax !== 'undefined' && MathJax.typeset) {
            MathJax.typeset();
        }
    }
    catch (error) {
        console.error(error);
        contentBody.innerHTML = `<div class="alert alert-danger">加载笔记报错: ${filename}</div>`;
    }
};
// 暴露标签点击搜索方法到全局
window.searchByTag = function (tag, event) {
    event.stopPropagation(); // 阻止事件冒泡，避免点击标签时打开笔记
    if (searchBar) {
        searchBar.setValue(`tag:${tag}`);
    }
};
// 显示笔记列表视图（隐藏详情）
function showNotesList() {
    document.getElementById('notes-list-view').style.display = 'block';
    document.getElementById('note-detail-view').style.display = 'none';
    document.getElementById('note-content-body').innerHTML = '';
    // 如果想要在返回列表时也重绘一遍（防止DOM异常被清空），可以调用 renderNotesList()，通常不需要。
}
// 暴露分页切换方法到全局
window.changePage = function (page) {
    currentPage = page;
    renderNotesList();
    // 切换分页后自动滚到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
// 将笔记渲染到页面 DOM 结构中
function renderNotesList() {
    const listContainer = document.getElementById('notes-list');
    const paginationContainer = document.getElementById('notes-pagination');
    if (!listContainer)
        return;
    listContainer.innerHTML = '';
    if (paginationContainer)
        paginationContainer.innerHTML = '';
    const notes = currentFilteredNotes;
    if (notes.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                <h5 class="mt-3 text-muted">没有找到匹配的笔记</h5>
            </div>
        `;
        return;
    }
    // 计算分页
    const totalPages = Math.ceil(notes.length / PAGE_SIZE);
    // 防止当前页越界
    if (currentPage > totalPages)
        currentPage = totalPages;
    if (currentPage < 1)
        currentPage = 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedNotes = notes.slice(startIndex, endIndex);
    paginatedNotes.forEach(note => {
        const tagsHtml = (note.tags || []).map(tag => `<span class="badge bg-secondary me-1 tag-clickable" onclick="searchByTag('${tag}', event)">${tag}</span>`).join('');
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
    // 渲染分页 UI
    if (paginationContainer && totalPages > 1) {
        let paginationHtml = `<ul class="pagination justify-content-center">`;
        // Prev button
        paginationHtml += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
            </li>
        `;
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <button class="page-link" onclick="changePage(${i})">${i}</button>
                </li>
            `;
        }
        // Next button
        paginationHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
            </li>
        `;
        paginationHtml += `</ul>`;
        paginationContainer.innerHTML = paginationHtml;
    }
}
