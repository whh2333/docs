#!/usr/bin/env node
/**
 * 修复 MDX 文件中的 HTML 语法错误
 * 主要修复：
 * 1. 未闭合的 <img> 标签
 * 2. 未闭合的 <li> 标签
 * 3. 不匹配的标签
 * 4. 其他 HTML 语法问题
 */
import fs from 'fs';
import path from 'path';

/**
 * 修复 HTML 内容中的常见问题
 */
function fixHtmlContent(content) {
  let fixed = content;
  
  // 修复 frontmatter 格式问题 - 确保 frontmatter 和内容之间有换行
  fixed = fixed.replace(/---\s*title:\s*"([^"]+)"\s*---\s*/, '---\ntitle: "$1"\n---\n\n');
  
  // 修复未闭合的 <img> 标签
  fixed = fixed.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
  
  // 修复未闭合的 <br> 标签
  fixed = fixed.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
  
  // 修复未闭合的 <hr> 标签
  fixed = fixed.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');
  
  // 修复未闭合的 <input> 标签
  fixed = fixed.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
  
  // 修复未闭合的 <meta> 标签
  fixed = fixed.replace(/<meta([^>]*?)(?<!\/)>/g, '<meta$1 />');
  
  // 修复未闭合的 <link> 标签
  fixed = fixed.replace(/<link([^>]*?)(?<!\/)>/g, '<link$1 />');
  
  // 修复 <p> 标签内的 <img> 问题 - 移除包裹的 <p> 标签
  fixed = fixed.replace(/<p[^>]*>\s*<img([^>]*?)\/>\s*<\/p>/g, '<img$1 />');
  
  // 修复 <p> 标签内的 <br> 问题
  fixed = fixed.replace(/<p[^>]*>\s*<br[^>]*?\/>\s*<\/p>/g, '<br />');
  
  // 修复未闭合的 <li> 标签 - 在下一个标签前添加 </li>
  fixed = fixed.replace(/<li([^>]*)>([^<]*?)(?=<(?!\/li>)[^>]*>)/g, '<li$1>$2</li>');
  
  // 修复表格中的 <br> 标签
  fixed = fixed.replace(/<td[^>]*>\s*<br[^>]*?\/>\s*<\/td>/g, '<td></td>');
  
  // 修复 <figure> 标签内的 <img> 问题
  fixed = fixed.replace(/<figure[^>]*>\s*<img([^>]*?)\/>\s*<\/figure>/g, '<img$1 />');
  
  // 清理多余的空白字符
  fixed = fixed.replace(/\s+/g, ' ');
  
  return fixed;
}

/**
 * 修复单个 MDX 文件
 */
function fixMdxFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixHtmlContent(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  无需修复: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归修复目录下的所有 MDX 文件
 */
function fixMdxFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += fixMdxFiles(fullPath);
    } else if (file.endsWith('.mdx')) {
      if (fixMdxFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

function main() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  console.log('🔧 开始修复 MDX 文件...');
  const fixedCount = fixMdxFiles(helpCenterDir);
  console.log(`\n🎉 修复完成！共修复了 ${fixedCount} 个文件`);
}

main();
