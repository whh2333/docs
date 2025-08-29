#!/usr/bin/env node

/**
 * 改进的 Buffer 内容抓取脚本
 * 专门针对 Buffer 的 HTML 结构进行优化
 */

import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const BASE = 'https://support.buffer.com';
const OUT = 'import/content-improved.json';
const MAX_ARTICLES = 200;

// Buffer 的主要分类
const CATEGORIES = {
  '4-getting-started': 'Getting Started',
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
  '497-integrations': 'Integrations'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.log(`尝试 ${i + 1} 失败: ${error.message}`);
      if (i < retries - 1) {
        await sleep(1000 * (i + 1));
      }
    }
  }
  throw new Error(`无法获取 ${url}`);
}

function extractArticleContent(html) {
  const $ = load(html);
  
  // 移除不需要的元素
  $('script, style, nav, header, footer, .sidebar, .comments').remove();
  
  // 尝试多种选择器来获取文章内容
  let content = '';
  
  // 方法1: 查找 #fullArticle
  const fullArticle = $('#fullArticle');
  if (fullArticle.length > 0) {
    content = fullArticle.html();
  }
  
  // 方法2: 查找 .article-content
  if (!content) {
    const articleContent = $('.article-content');
    if (articleContent.length > 0) {
      content = articleContent.html();
    }
  }
  
  // 方法3: 查找 main 标签
  if (!content) {
    const main = $('main');
    if (main.length > 0) {
      content = main.html();
    }
  }
  
  // 方法4: 查找 article 标签
  if (!content) {
    const article = $('article');
    if (article.length > 0) {
      content = article.html();
    }
  }
  
  // 如果还是没有内容，尝试获取 body 的主要内容
  if (!content) {
    const body = $('body');
    // 移除导航和页脚
    body.find('nav, header, footer, .navigation, .menu').remove();
    content = body.html();
  }
  
  return content || '';
}

function extractArticleTitle(html) {
  const $ = load(html);
  
  // 尝试多种选择器来获取标题
  let title = '';
  
  // 方法1: 查找 h1.title
  const h1Title = $('h1.title');
  if (h1Title.length > 0) {
    title = h1Title.text().trim();
  }
  
  // 方法2: 查找 title 标签
  if (!title) {
    const titleTag = $('title');
    if (titleTag.length > 0) {
      title = titleTag.text().trim();
    }
  }
  
  // 方法3: 查找第一个 h1
  if (!title) {
    const h1 = $('h1').first();
    if (h1.length > 0) {
      title = h1.text().trim();
    }
  }
  
  return title || 'Untitled Article';
}

function toSlug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-\/_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function crawlBufferArticles() {
  const results = [];
  const visited = new Set();
  
  console.log('🚀 开始抓取 Buffer 文章...');
  
  // 从分类页面开始抓取
  for (const [categoryId, categoryName] of Object.entries(CATEGORIES)) {
    console.log(`📂 抓取分类: ${categoryName} (${categoryId})`);
    
    try {
      const categoryUrl = `${BASE}/category/${categoryId}`;
      const categoryHtml = await fetchWithRetry(categoryUrl);
      const $ = load(categoryHtml);
      
      // 查找分类页面中的文章链接
      const articleLinks = $('a[href*="/article/"]');
      
      for (const link of articleLinks) {
        const href = $(link).attr('href');
        if (!href || visited.has(href)) continue;
        
        const articleUrl = href.startsWith('http') ? href : `${BASE}${href}`;
        visited.add(href);
        
        try {
          console.log(`  📄 抓取文章: ${articleUrl}`);
          
          const articleHtml = await fetchWithRetry(articleUrl);
          const title = extractArticleTitle(articleHtml);
          const content = extractArticleContent(articleHtml);
          
          if (content && content.length > 100) { // 确保内容有足够长度
            const article = {
              url: articleUrl,
              title: title,
              slug: toSlug(title),
              category: categoryName,
              categoryId: categoryId,
              bodyMDX: content,
              language: 'en'
            };
            
            results.push(article);
            console.log(`    ✅ 成功: ${title}`);
            
            // 限制文章数量
            if (results.length >= MAX_ARTICLES) {
              console.log(`🎯 已达到最大文章数量: ${MAX_ARTICLES}`);
              break;
            }
            
            // 避免请求过快
            await sleep(500);
          } else {
            console.log(`    ⚠️  内容太短: ${title}`);
          }
          
        } catch (error) {
          console.log(`    ❌ 抓取失败: ${error.message}`);
        }
      }
      
      // 分类间延迟
      await sleep(1000);
      
    } catch (error) {
      console.log(`❌ 抓取分类失败 ${categoryName}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 抓取完成! 共抓取 ${results.length} 篇文章`);
  
  // 保存结果
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`💾 结果已保存到: ${OUT}`);
  
  return results;
}

// 运行抓取
crawlBufferArticles().catch(console.error);
