// Build the diary index from Markdown files; reuse the site's bundled parsers.
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('../static/js/js-yaml.min.js');
const marked = require('../static/js/marked.min.js');

const root = path.resolve(__dirname, '..');

function frontMatter(source, file) {
    source = source.replace(/^\uFEFF/, '');
    if (!/^---(?:\r?\n|$)/.test(source)) return { metadata: {}, body: source };
    const match = source.match(/^---\r?\n(?:([\s\S]*?)\r?\n)?(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/);
    if (!match) throw new Error(`${file}: Markdown 头部的元数据缺少结束标记 ---`);
    const metadata = yaml.load(match[1] || '', { schema: yaml.JSON_SCHEMA }) ?? {};
    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
        throw new Error(`${file}: 头部元数据必须是键值对象`);
    }
    return { metadata, body: source.slice(match[0].length) };
}

function stringField(metadata, key, file) {
    if (metadata[key] === undefined) return '';
    if (typeof metadata[key] !== 'string') throw new Error(`${file}: ${key} 必须是文本`);
    return metadata[key].trim();
}

function plainText(tokens = []) {
    return tokens.map(token => {
        if (token.type === 'image' || token.type === 'html') return '';
        if (token.type === 'br') return ' ';
        return token.tokens ? plainText(token.tokens) : token.text ?? '';
    }).join('').replace(/&(?:amp|lt|gt|quot|apos|#39);/g, entity => ({
        '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'",
    })[entity]).replace(/\s+/g, ' ').trim();
}

function entryFor(filePath, directory) {
    const file = path.relative(directory, filePath).split(path.sep).join('/');
    const { metadata, body } = frontMatter(fs.readFileSync(filePath, 'utf8'), file);
    if (metadata.draft !== undefined && typeof metadata.draft !== 'boolean') {
        throw new Error(`${file}: draft 必须是 true 或 false`);
    }
    if (metadata.draft === true) return null;

    const tokens = marked.lexer(body.replace(/<!--[\s\S]*?-->/g, ''));
    const heading = tokens.find(token => token.type === 'heading' && token.depth === 1);
    const filename = path.basename(file, path.extname(file));
    const title = stringField(metadata, 'title', file) || (heading && plainText(heading.tokens)) || filename;
    const date = stringField(metadata, 'date', file) || filename.match(/^\d{4}-\d{2}-\d{2}(?=$|[-_ ])/)?.[0] || '';
    if (date) {
        const parsed = new Date(`${date}T00:00:00Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
            throw new Error(`${file}: date 必须是有效的 YYYY-MM-DD 日期`);
        }
    }

    const tags = metadata.tags ?? [];
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) {
        throw new Error(`${file}: tags 必须是文本数组，例如 [科研, 生活]`);
    }
    const paragraph = tokens.filter(token => token.type === 'paragraph')
        .map(token => plainText(token.tokens)).find(text => text.length > 0) || '';
    const description = stringField(metadata, 'description', file) || Array.from(paragraph).slice(0, 140).join('');
    return { title, date, description, tags: [...new Set(tags.map(tag => tag.trim()).filter(Boolean))], file };
}

function markdownFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        if (entry.name.startsWith('.')) return [];
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) return markdownFiles(filePath);
        return entry.isFile() && /\.md$/i.test(entry.name) ? [filePath] : [];
    });
}

function main() {
    if (process.argv.length > 4) throw new Error('用法：node scripts/generate-note-index.cjs [日记目录] [索引文件]');
    const directory = path.resolve(process.argv[2] || path.join(root, 'contents/notes'));
    const output = path.resolve(process.argv[3] || path.join(root, 'contents/notes.json'));
    const entries = markdownFiles(directory).map(file => entryFor(file, directory)).filter(Boolean);
    entries.sort((a, b) => {
        if (a.date !== b.date) return a.date > b.date ? -1 : 1;
        return a.file < b.file ? -1 : a.file > b.file ? 1 : 0;
    });
    const json = JSON.stringify(entries, null, 2) + '\n';
    if (fs.existsSync(output) && fs.readFileSync(output, 'utf8') === json) {
        console.log(`日记索引未变化（日记数量: ${entries.length} ）`);
        return;
    }
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const temporary = `${output}.tmp-${process.pid}`;
    try {
        fs.writeFileSync(temporary, json, 'utf8');
        fs.renameSync(temporary, output);
    } finally {
        if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
    console.log(`已生成 ${path.relative(root, output)} 日记数量:（${entries.length} ）`);
}

try {
    main();
} catch (error) {
    console.error(`生成日记索引失败：${error.message}`);
    process.exitCode = 1;
}
