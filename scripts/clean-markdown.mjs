#!/usr/bin/env node
/**
 * 彻底清理 Markdown 文件中的剩余 HTML 标签
 * 确保完全符合标准 Markdown 格式
 */
import fs from 'fs';
import path from 'path';

/**
 * 彻底清理 HTML 标签
 */
function cleanHtmlTags(content) {
  let cleaned = content;
  
  // 移除所有剩余的 HTML 标签
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // 清理多余的空白字符
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * 清理单个 MDX 文件
 */
function cleanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 提取 frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!frontmatterMatch) {
      console.log(`⚠️  跳过 ${filePath}: 没有找到 frontmatter`);
      return false;
    }
    
    const frontmatter = frontmatterMatch[1];
    const markdownContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    
    // 清理 HTML 标签
    const cleanedContent = cleanHtmlTags(markdownContent);
    
    // 重新组合文件
    const newContent = `---\n${frontmatter}\n---\n\n${cleanedContent}`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 已清理: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 清理失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归清理目录下的所有 MDX 文件
 */
function cleanFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  let cleanedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      cleanedCount += cleanFiles(fullPath);
    } else if (file.endsWith('.mdx')) {
      if (cleanFile(fullPath)) {
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

function main() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  console.log('🧹 开始彻底清理 HTML 标签...');
  const cleanedCount = cleanFiles(helpCenterDir);
  console.log(`\n🎉 清理完成！共清理了 ${cleanedCount} 个文件`);
  console.log('📝 所有文章现在都是纯 Markdown 格式');
}

main();
