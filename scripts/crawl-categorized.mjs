#!/usr/bin/env node
/**
 * 按 Buffer 原始分类结构抓取文章，输出分类化的 import/content-categorized.json
 * 用法：node scripts/crawl-categorized.mjs --out import/content-categorized.json
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

const BASE = 'https://support.buffer.com';
const OUT = getArg('out', 'import/content-categorized.json');
const MAX_PAGES = Number(getArg('max', '5000'));
const LANGUAGE = getArg('lang', 'en');
const SLEEP_MS = Number(getArg('sleep', '300'));

// Buffer 的原始分类映射
const CATEGORIES = {
  '4-getting-started': 'Getting Started',
  '500-buffer-social-network-guides': 'Buffer Social Network Guides',
  '12-channel-management': 'Channel Management',
  '495-creating-posts': 'Creating Posts',
  '496-managing-media': 'Managing Media',
  '13-scheduling-and-publishing': 'Scheduling Posts',
  '499-team-collaboration': 'Team Collaboration',
  '6-analytics': 'Analyzing Your Data',
  '501-engaging-with-comments': 'Engaging with Comments',
  '11-account-and-billing': 'Account Settings',
  '15-billing': 'Billing',
  '14-start-page': 'Start Page Landing Page',
  '16-mobile-app': 'Mobile App',
  '497-integrations': 'Integrations',
  '498-buffer-best-practices': 'Buffer Best Practices'
};

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
  const $ = load(html);
  $('nav, header, footer, script, style').remove();
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (href && href.startsWith('/')) $(a).attr('href', normalizeUrl(href));
  });
  return $.root().text().trim() ? $.html('main').trim() || $.html('article').trim() || $.html('body').trim() : '';
}

function getCategoryFromUrl(url) {
  for (const [catId, catName] of Object.entries(CATEGORIES)) {
    if (url.includes(`/category/${catId}`)) {
      return { id: catId, name: catName };
    }
  }
  return { id: 'general', name: 'General' };
}

async function crawlByCategory() {
  const origin = new URL(BASE).origin;
  const visited = new Set();
  const queue = [BASE, ...Object.keys(CATEGORIES).map(id => `${BASE}/category/${id}`)];
  const results = new Map(); // 按分类组织结果
  
  // 初始化分类
  Object.values(CATEGORIES).forEach(catName => {
    results.set(catName, []);
  });

  let count = 0;
  
  while (queue.length && count < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    
    try {
      const html = await fetchText(url);
      const $ = load(html);
      
      const links = [];
      $('a[href]').each((_, a) => {
        const href = $(a).attr('href') || '';
        let abs = '';
        if (href.startsWith('http')) abs = href;
        else if (href.startsWith('/')) abs = origin + href;
        else abs = new URL(href, url).toString();

        if (!abs.startsWith(origin)) return;
        if (/\.(png|jpe?g|gif|svg|webp|ico|pdf|zip|gz|mp4|mp3|webm)$/i.test(abs)) return;
        abs = abs.split('#')[0];
        
        // 收集文章链接
        if (abs.includes('/article/')) {
          links.push(abs);
        }

        if (!visited.has(abs)) queue.push(abs);
      });

      // 处理收集到的文章链接
      for (const articleUrl of links) {
        try {
          const articleHtml = await fetchText(articleUrl);
          const $article = load(articleHtml);
          const title = $article('h1').first().text().trim();
          if (!title) continue;
          
          const body = htmlToMdx(articleHtml);
          const category = getCategoryFromUrl(url);
          const slug = toSlug(title);
          
          const article = {
            language: LANGUAGE,
            groupName: category.name,
            category: category.id,
            slug,
            title,
            description: '',
            bodyMDX: body,
            sourceUrl: articleUrl
          };
          
          if (results.has(category.name)) {
            results.get(category.name).push(article);
          }
          
          count++;
          if (count % 10 === 0) console.log(`已抓取 ${count} 篇...`);
        } catch (e) {
          console.warn(`抓取文章失败: ${articleUrl} -> ${e.message}`);
        }
      }

      await sleep(SLEEP_MS);
    } catch (e) {
      console.warn(`抓取失败: ${url} -> ${e.message}`);
      await sleep(SLEEP_MS);
    }
  }

  // 转换为导入格式
  const out = { articles: [] };
  for (const [catName, articles] of results) {
    out.articles.push(...articles);
  }

  const outPath = path.resolve(process.cwd(), OUT);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
  
  console.log(`抓取完成，按分类组织：`);
  for (const [catName, articles] of results) {
    console.log(`  ${catName}: ${articles.length} 篇`);
  }
  console.log(`总计: ${out.articles.length} 篇 => ${outPath}`);
}

crawlByCategory();
