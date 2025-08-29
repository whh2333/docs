#!/usr/bin/env node
/**
 * 修复 MDX 文件的语法错误
 * 主要修复标题中的引号问题和内容格式问题
 */
import fs from 'fs';
import path from 'path';

/**
 * 修复单个 MDX 文件
 */
function fixMdxFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // 修复标题中的引号问题
    const titleMatch = content.match(/title:\s*"([^"]*)"\s*\n/);
    if (titleMatch) {
      const title = titleMatch[1];
      // 转义标题中的引号
      const fixedTitle = title.replace(/"/g, '\\"');
      if (fixedTitle !== title) {
        content = content.replace(
          /title:\s*"[^"]*"\s*\n/,
          `title: "${fixedTitle}"\n`
        );
        fixed = true;
      }
    }
    
    // 修复描述中的引号问题
    const descMatch = content.match(/description:\s*"([^"]*)"\s*\n/);
    if (descMatch) {
      const desc = descMatch[1];
      // 转义描述中的引号
      const fixedDesc = desc.replace(/"/g, '\\"');
      if (fixedDesc !== desc) {
        content = content.replace(
          /description:\s*"[^"]*"\s*\n/,
          `description: "${fixedDesc}"\n`
        );
        fixed = true;
      }
    }
    
    // 修复内容中的特殊字符问题
    // 移除可能导致解析错误的特殊字符
    content = content.replace(/[^\x00-\x7F]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code > 127) {
        return `&#${code};`;
      }
      return char;
    });
    
    // 确保 frontmatter 格式正确
    if (!content.includes('---\n\n')) {
      content = content.replace('---\n', '---\n\n');
      fixed = true;
    }
    
    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 修复文件: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归修复目录下的所有 MDX 文件
 */
function fixMdxFilesInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const items = fs.readdirSync(dirPath);
  let fixedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += fixMdxFilesInDirectory(fullPath);
    } else if (item.endsWith('.mdx')) {
      if (fixMdxFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

/**
 * 主要修复逻辑
 */
function main() {
  console.log('🔧 开始修复 MDX 语法错误...');
  
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  const fixedCount = fixMdxFilesInDirectory(helpCenterDir);
  
  console.log(`\n🎉 修复完成！共修复了 ${fixedCount} 个文件`);
  
  if (fixedCount > 0) {
    console.log('📝 现在可以重新启动 Mintlify 开发服务器');
  } else {
    console.log('✨ 没有发现需要修复的文件');
  }
}

main();
