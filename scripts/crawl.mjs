#!/usr/bin/env node
/**
 * 授权前提下抓取 Buffer Help Center 栏目与文章，输出 import/content.json
 * 仅用于你拥有授权的场景。默认限速与并发极低，避免对对方造成压力。
 *
 * 用法：
 *   node scripts/crawl.mjs --base https://support.buffer.com --out import/content.json
 */
import fs from 'fs';
import path from 'path';
import process from 'process';
import { load } from 'cheerio';

const args = process.argv.slice(2);
function getArg(name, def) {
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0 && args[idx + 1]) return args[idx + 1];
  return def;
}

const BASE = getArg('base', 'https://support.buffer.com');
const OUT = getArg('out', 'import/content.json');
const MAX_PAGES = Number(getArg('max', '1000')); // 安全上限
const LANGUAGE = getArg('lang', 'en');
const GROUP = getArg('group', 'Help Center');
const SLEEP_MS = Number(getArg('sleep', '500')); // 每请求后 sleep，减轻压力

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Authorized crawler (contact admin)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function normalizeUrl(u) {
  if (u.startsWith('http')) return u;
  if (u.startsWith('/')) return BASE.replace(/\/$/, '') + u;
  return `${BASE.replace(/\/$/, '')}/${u}`;
}

function toSlug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-\/_]/g, '-')
    .replace(/-+/g, '-');
}

function htmlToMdx(html) {
  // 简化版：保留基础结构，后续可按需增强（图片下载、相对路径修复等）
  const $ = load(html);
  // 移除脚注/多余导航
  $('nav, header, footer, script, style').remove();
  // 将相对链接转为绝对（可选）
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (href && href.startsWith('/')) $(a).attr('href', normalizeUrl(href));
  });
  // 返回主体文本
  return $.root().text().trim() ? $.html('main').trim() || $.html('article').trim() || $.html('body').trim() : '';
}

async function discoverArticleLinksBFS() {
  // 广度优先：从 BASE 出发，限定同域、去重与最大数量
  const origin = new URL(BASE).origin;
  const visited = new Set();
  const queue = [
    BASE,
    `${BASE}/category/4-getting-started`,
    `${BASE}/category/500-buffer-social-network-guides`,
    `${BASE}/category/12-channel-management`,
    `${BASE}/category/495-creating-posts`,
    `${BASE}/category/496-managing-media`,
    `${BASE}/category/13-scheduling-and-publishing`,
    `${BASE}/category/499-team-collaboration`,
    `${BASE}/category/6-analytics`,
    `${BASE}/category/501-engaging-with-comments`,
    `${BASE}/category/11-account-and-billing`,
    `${BASE}/category/15-billing`
  ];
  const results = new Set();

  while (queue.length && results.size < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    try {
      const html = await fetchText(url);
      const $ = load(html);
      $('a[href]').each((_, a) => {
        const href = $(a).attr('href') || '';
        let abs = '';
        if (href.startsWith('http')) abs = href;
        else if (href.startsWith('/')) abs = origin + href;
        else abs = new URL(href, url).toString();

        // 限定同域
        if (!abs.startsWith(origin)) return;
        // 排除二进制/资源类
        if (/\.(png|jpe?g|gif|svg|webp|ico|pdf|zip|gz|mp4|mp3|webm)$/i.test(abs)) return;
        // 避免锚点与查询重复
        abs = abs.split('#')[0];
        abs = abs;

        // 只保留帮助中心文章页（排除首页、分类页等）
        if (abs === origin || abs === BASE || abs.endsWith('/')) return;
        // 包含文章 ID 的路径（如 /article/123-title）
        if (abs.includes('/article/') || abs.includes('/docs/')) {
          results.add(abs);
        }

        // 收集
        if (!visited.has(abs)) queue.push(abs);
      });

      // 节流
      await sleep(SLEEP_MS);
    } catch (e) {
      // 忽略单页错误
    }
  }

  return Array.from(results).slice(0, MAX_PAGES);
}

async function crawl() {
  const urls = await discoverArticleLinksBFS();
  const out = { articles: [] };
  let count = 0;

  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const $ = load(html);
      const title = $('h1').first().text().trim();
      if (!title) { await sleep(SLEEP_MS); continue; }

      const body = htmlToMdx(html);
      // 粗略 category 与 slug（以路径为准）
      const pathPart = url.replace(BASE, '').replace(/^\//, '');
      const segments = pathPart.split('/').filter(Boolean);
      const category = segments.length > 1 ? segments[0] : 'general';
      const slug = segments.length > 1 ? segments.slice(1).join('-') : toSlug(title);

      out.articles.push({
        language: LANGUAGE,
        groupName: GROUP,
        category,
        slug,
        title,
        description: '',
        bodyMDX: body,
        sourceUrl: url
      });

      count += 1;
      if (count % 10 === 0) console.log(`已抓取 ${count} 篇...`);
      await sleep(SLEEP_MS);
    } catch (e) {
      console.warn(`抓取失败: ${url} -> ${e.message}`);
      await sleep(SLEEP_MS);
    }
  }

  const outPath = path.resolve(process.cwd(), OUT);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`抓取完成，共生成 ${out.articles.length} 篇 => ${outPath}`);
}

crawl();


