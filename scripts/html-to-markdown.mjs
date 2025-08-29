#!/usr/bin/env node
/**
 * 将 HTML 格式的文章转换为标准 Markdown 格式
 * 适用于 Mintlify 文档系统
 */
import fs from 'fs';
import path from 'path';

/**
 * HTML 到 Markdown 的转换规则
 */
function htmlToMarkdown(html) {
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
 * 转换单个 MDX 文件
 */
function convertFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取 frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!frontmatterMatch) {
      console.log(`⚠️  跳过 ${filePath}: 没有找到 frontmatter`);
      return false;
    }
    
    const frontmatter = frontmatterMatch[1];
    const htmlContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    
    // 转换为 Markdown
    const markdownContent = htmlToMarkdown(htmlContent);
    
    // 重新组合文件
    const newContent = `---\n${frontmatter}\n---\n\n${markdownContent}`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 已转换: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 转换失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归转换目录下的所有 MDX 文件
 */
function convertFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  let convertedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      convertedCount += convertFiles(fullPath);
    } else if (file.endsWith('.mdx')) {
      if (convertFile(fullPath)) {
        convertedCount++;
      }
    }
  }
  
  return convertedCount;
}

function main() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  console.log('🔄 开始将 HTML 转换为 Markdown...');
  const convertedCount = convertFiles(helpCenterDir);
  console.log(`\n🎉 转换完成！共转换了 ${convertedCount} 个文件`);
}

main();
