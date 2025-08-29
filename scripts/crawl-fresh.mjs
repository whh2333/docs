#!/usr/bin/env node
/**
 * 重新抓取 Buffer 帮助中心的原始内容
 * 获取干净、完整的内容用于重写 Markdown
 */
import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';

/**
 * 带重试的 HTTP 请求
 */
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`重试 ${i + 1}/${retries}: ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * 从 HTML 中提取文章内容
 */
function extractArticleContent(html) {
  const $ = load(html);
  
  // 尝试多种选择器来获取文章内容
  let content = '';
  
  // 方法1: 查找 article 标签
  const article = $('article[id="fullArticle"]');
  if (article.length > 0) {
    content = article.html();
  } else {
    // 方法2: 查找主要内容区域
    const mainContent = $('.article-content, .post-content, .entry-content, main');
    if (mainContent.length > 0) {
      content = mainContent.html();
    } else {
      // 方法3: 查找包含标题和内容的区域
      const title = $('h1.title, h1, .title').first();
      if (title.length > 0) {
        const titleParent = title.parent();
        content = titleParent.html();
      }
    }
  }
  
  if (!content) {
    console.log('⚠️  无法提取文章内容');
    return null;
  }
  
  return content;
}

/**
 * 清理 HTML 内容，保留基本结构
 */
function cleanHtmlContent(html) {
  if (!html) return '';
  
  // 移除脚本和样式
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 移除不必要的属性，保留基本结构
  html = html.replace(/\s+class="[^"]*"/g, '');
  html = html.replace(/\s+id="[^"]*"/g, '');
  html = html.replace(/\s+style="[^"]*"/g, '');
  
  // 清理多余的空白
  html = html.replace(/\s+/g, ' ');
  html = html.trim();
  
  return html;
}

/**
 * 抓取单个文章
 */
async function scrapeArticle(url, title) {
  try {
    console.log(`📖 抓取: ${title}`);
    const html = await fetchWithRetry(url);
    const content = extractArticleContent(html);
    
    if (!content) {
      return null;
    }
    
    const cleanedContent = cleanHtmlContent(content);
    
    return {
      title,
      url,
      content: cleanedContent,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ 抓取失败 ${title}: ${error.message}`);
    return null;
  }
}

/**
 * 主要的抓取逻辑
 */
async function main() {
  // Buffer 帮助中心的主要分类页面
  const categoryUrls = [
    'https://support.buffer.com/',
    'https://support.buffer.com/category/publishing/',
    'https://support.buffer.com/category/analytics/',
    'https://support.buffer.com/category/engagement/',
    'https://support.buffer.com/category/team/',
    'https://support.buffer.com/category/integrations/',
    'https://support.buffer.com/category/account/',
    'https://support.buffer.com/category/channels/'
  ];
  
  const articles = [];
  
  for (const categoryUrl of categoryUrls) {
    try {
      console.log(`\n🔍 抓取分类页面: ${categoryUrl}`);
      const html = await fetchWithRetry(categoryUrl);
      const $ = load(html);
      
      // 查找文章链接
      const articleLinks = $('a[href*="/article/"]');
      
      articleLinks.each((i, link) => {
        const href = $(link).attr('href');
        const title = $(link).text().trim();
        
        if (href && title && href.includes('/article/')) {
          const fullUrl = href.startsWith('http') ? href : `https://support.buffer.com${href}`;
          
          // 避免重复
          if (!articles.find(a => a.url === fullUrl)) {
            articles.push({
              title,
              url: fullUrl,
              pending: true
            });
          }
        }
      });
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ 抓取分类页面失败 ${categoryUrl}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 找到 ${articles.length} 篇文章`);
  
  // 抓取每篇文章的内容
  const results = [];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const result = await scrapeArticle(article.url, article.title);
    
    if (result) {
      results.push(result);
    }
    
    // 添加延迟
    if (i < articles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // 保存结果
  const outputPath = path.join(process.cwd(), 'import', 'fresh-content.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  
  console.log(`\n🎉 抓取完成！共抓取了 ${results.length} 篇文章`);
  console.log(`📁 结果已保存到: ${outputPath}`);
}

main().catch(console.error);
