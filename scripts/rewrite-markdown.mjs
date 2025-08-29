#!/usr/bin/env node
/**
 * 基于原始抓取内容重写所有文章为标准的 Markdown 格式
 * 适用于 Mintlify 文档系统
 */
import fs from 'fs';
import path from 'path';

/**
 * 将 HTML 内容转换为标准 Markdown
 */
function htmlToMarkdown(html) {
  if (!html) return '';
  
  let markdown = html;
  
  // 移除 <article> 标签
  markdown = markdown.replace(/<article[^>]*>|<\/article>/g, '');
  
  // 转换标题
  markdown = markdown.replace(/<h1[^>]*>([^<]+)<\/h1>/g, '# $1');
  markdown = markdown.replace(/<h2[^>]*>([^<]+)<\/h2>/g, '## $1');
  markdown = markdown.replace(/<h3[^>]*>([^<]+)<\/h3>/g, '### $1');
  markdown = markdown.replace(/<h4[^>]*>([^<]+)<\/h4>/g, '#### $1');
  markdown = markdown.replace(/<h5[^>]*>([^<]+)<\/h5>/g, '##### $1');
  markdown = markdown.replace(/<h6[^>]*>([^<]+)<\/h6>/g, '###### $1');
  
  // 转换段落
  markdown = markdown.replace(/<p[^>]*>([^<]+)<\/p>/g, '\n$1\n');
  
  // 转换链接
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)');
  
  // 转换粗体和斜体
  markdown = markdown.replace(/<strong>([^<]+)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>([^<]+)<\/b>/g, '**$1**');
  markdown = markdown.replace(/<em>([^<]+)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>([^<]+)<\/i>/g, '*$1*');
  
  // 转换列表
  markdown = markdown.replace(/<ul[^>]*>|<\/ul>/g, '');
  markdown = markdown.replace(/<ol[^>]*>|<\/ol>/g, '');
  markdown = markdown.replace(/<li[^>]*>([^<]+)<\/li>/g, '- $1');
  
  // 转换表格
  markdown = markdown.replace(/<table[^>]*>/g, '');
  markdown = markdown.replace(/<\/table>/g, '\n');
  markdown = markdown.replace(/<thead[^>]*>|<\/thead>/g, '');
  markdown = markdown.replace(/<tbody[^>]*>|<\/tbody>/g, '');
  markdown = markdown.replace(/<tr[^>]*>/g, '| ');
  markdown = markdown.replace(/<\/tr>/g, ' |\n');
  markdown = markdown.replace(/<td[^>]*>([^<]*)<\/td>/g, '$1 | ');
  markdown = markdown.replace(/<th[^>]*>([^<]*)<\/th>/g, '$1 | ');
  
  // 转换换行
  markdown = markdown.replace(/<br[^>]*>/g, '\n');
  
  // 转换水平线
  markdown = markdown.replace(/<hr[^>]*>/g, '---\n');
  
  // 转换代码块
  markdown = markdown.replace(/<code[^>]*>([^<]+)<\/code>/g, '`$1`');
  markdown = markdown.replace(/<pre[^>]*>([^<]+)<\/pre>/g, '```\n$1\n```');
  
  // 转换引用
  markdown = markdown.replace(/<blockquote[^>]*>([^<]+)<\/blockquote>/g, '> $1');
  
  // 转换图片
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/g, '![$1]($2)');
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, '![]($1)');
  
  // 转换 div 和 span
  markdown = markdown.replace(/<div[^>]*>([^<]*)<\/div>/g, '$1');
  markdown = markdown.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
  
  // 转换表格中的特殊字符
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  
  // 清理多余的空白字符
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  markdown = markdown.replace(/\s+/g, ' ');
  markdown = markdown.trim();
  
  return markdown;
}

/**
 * 重写单个 MDX 文件
 */
function rewriteFile(filePath, articleData) {
  try {
    // 基于原始内容重写
    const markdownContent = htmlToMarkdown(articleData.bodyMDX);
    
    // 创建新的 frontmatter
    const frontmatter = `---
title: "${articleData.title}"
description: "${articleData.description || ''}"
---`;
    
    // 重新组合文件
    const newContent = `${frontmatter}\n\n${markdownContent}`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 已重写: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 重写失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 主要的重写逻辑
 */
function main() {
  // 读取原始抓取的内容
  const contentPath = path.join(process.cwd(), 'import', 'content.json');
  if (!fs.existsSync(contentPath)) {
    console.error('找不到 import/content.json 文件');
    process.exit(1);
  }
  
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  const articles = content.articles || [];
  
  console.log(`📚 找到 ${articles.length} 篇文章需要重写`);
  
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  let rewrittenCount = 0;
  
  // 遍历每篇文章
  for (const article of articles) {
    const slug = article.slug;
    const filePath = path.join(helpCenterDir, `${slug}.mdx`);
    
    if (fs.existsSync(filePath)) {
      if (rewriteFile(filePath, article)) {
        rewrittenCount++;
      }
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log(`\n🎉 重写完成！共重写了 ${rewrittenCount} 个文件`);
  console.log(`📁 所有文章现在都使用标准的 Markdown 格式`);
}

main().catch(console.error);
