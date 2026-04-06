export class Footer {
    constructor(containerId = 'footer-container') {
        this.containerId = containerId;
    }
    render() {
        const container = document.getElementById(this.containerId);
        if (!container)
            return;
        const currentYear = new Date().getFullYear();
        container.innerHTML = `
            <footer class="bg-bottom text-center py-5">
                <div class="container px-5">
                    <div class="text-white-50 small">
                        <div id="copyright-text" class="mb-2">© Taoist ${currentYear}. All Rights Reserved.</div>
                        <a id="github-link" href="https://github.com/volmodaoist">Github</a>
                        <span class="mx-1">&middot;</span>
                        <a id="license-link" href="https://github.com/senli1073/senli1073.github.io/blob/main/LICENSE">License</a>
                        <span class="mx-1">&middot;</span>
                        <a href="javascript:void(0);" onclick="window.forceRefreshContent && window.forceRefreshContent()" title="强制刷新网页内容" class="text-white-50 text-decoration-none">
                            <i class="bi bi-arrow-clockwise"></i> Refresh Cache
                        </a>
                    </div>
                </div>
            </footer>
        `;
    }
}
