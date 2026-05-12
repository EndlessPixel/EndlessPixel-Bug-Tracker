// ====================== 配置 ======================
const PAGE_SIZE = 10;
let currentPage = 1;
let currentSelectedIndex = null;

// ====================== URL 工具 ======================
function getQuery(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}

function setQuery(key, value) {
    const params = new URLSearchParams(window.location.search);
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    history.replaceState({}, '', '?' + params.toString());
}

// ====================== 分页 ======================
function getPageBugs() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return BUGS.slice(start, end);
}

function getTotalPages() {
    return Math.ceil(BUGS.length / PAGE_SIZE);
}

// ====================== 渲染 ======================
function renderSidebar() {
    const listEl = document.getElementById('bugSidebarList');
    const paginatorEl = document.getElementById('paginator');
    listEl.innerHTML = '';

    const pageBugs = getPageBugs();

    pageBugs.forEach((bug, offset) => {
        const realIndex = (currentPage - 1) * PAGE_SIZE + offset;
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        if (realIndex === currentSelectedIndex) item.classList.add('active');

        item.innerHTML = `
            <div class="item-id">${bug.no} · <span style="color: #535353;">${bug.report_player}</span></div>
            <div class="item-title">${bug.title} · <span class="status-tag status-${bug.status}">${bug.status}</span></div>
        `;

        item.addEventListener('click', () => {
            selectBug(realIndex);
        });

        listEl.appendChild(item);
    });

    // 分页按钮
    const total = getTotalPages();
    paginatorEl.innerHTML = `
        <button ${currentPage <= 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">上一页</button>
        <span>第 ${currentPage} / ${total} 页</span>
        <button ${currentPage >= total ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">下一页</button>
    `;
}

function renderDetail(index) {
    const detailEl = document.getElementById('bugDetailView');
    if (index === null || !BUGS[index]) {
        detailEl.innerHTML = `<div class="placeholder">请选择一个Bug查看详情</div>`;
        return;
    }

    const bug = BUGS[index];
    detailEl.innerHTML = `
        <div class="detail-header">
            <div class="detail-id">EndlessPixel / ${bug.no}</div>
            <h1 class="detail-title">${bug.title}</h1>
        </div>
        <div class="detail-section">
            <div class="info-grid">
                <div class="info-item"><span class="info-label">类型</span><span class="info-value">${bug.type}</span></div>
                <div class="info-item"><span class="info-label">状态</span><span class="info-value"><span class="status-tag status-${bug.status}">${bug.status}</span></span></div>
                <div class="info-item"><span class="info-label">报告玩家</span><span class="info-value">${bug.report_player}</span></div>
                <br>
                <div class="info-item"><span class="info-label">报告时间</span><span class="info-value">${bug.date}</span></div>
                ${bug.fixed_date ? `<div class="info-item"><span class="info-label">修复时间</span><span class="info-value">${bug.fixed_date}</span></div>` : ''}
            </div>
        </div>
        <div class="detail-section">
            <div class="section-title">问题描述</div>
            <div class="detail-desc">${bug.desc}</div>
        </div>
        ${bug.official_message ? `<div class="detail-section">
            <div class="section-title">官方回复</div>
            <div class="detail-desc">${bug.official_message}</div>
        </div>` : ''}
    `;
}

// ====================== 选择 Bug ======================
function selectBug(realIndex) {
    currentSelectedIndex = realIndex;
    const bug = BUGS[realIndex];
    const bugNo = bug.no.replace('#', '');
    setQuery('bug', bugNo);
    renderSidebar();
    renderDetail(realIndex);
}

// ====================== 跳转页面 ======================
function goPage(page) {
    currentPage = Math.max(1, Math.min(getTotalPages(), page));
    setQuery('page', currentPage);
    renderSidebar();
}

// ====================== 从 URL 加载 ======================
function loadFromUrl() {
    // 加载页码
    const page = getQuery('page');
    if (page) currentPage = parseInt(page);

    // 加载选中的Bug
    const bugNo = getQuery('bug');
    if (bugNo) {
        const index = BUGS.findIndex(b => b.no.replace('#', '') === bugNo);
        if (index !== -1) {
            currentSelectedIndex = index;
            currentPage = Math.floor(index / PAGE_SIZE) + 1;
        }
    }

    renderSidebar();
    renderDetail(currentSelectedIndex);
}

// 初始化
window.addEventListener('DOMContentLoaded', loadFromUrl);