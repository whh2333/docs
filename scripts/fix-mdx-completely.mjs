#!/usr/bin/env node
/**
 * 完全修复 MDX 文件的所有问题
 */
import fs from 'fs';
import path from 'path';

/**
 * 修复单个 MDX 文件的所有问题
 */
function fixMdxFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;
    
    // 1. 修复标题中的引号问题
    const titleRegex = /title:\s*"([^"]*)"\s*\n/;
    const titleMatch = content.match(titleRegex);
    
    if (titleMatch) {
      const title = titleMatch[1];
      // 检查标题中是否有未转义的引号
      if (title.includes('"') && !title.includes('\\"')) {
        const fixedTitle = title.replace(/"/g, '\\"');
        content = content.replace(
          titleRegex,
          `title: "${fixedTitle}"\n`
        );
        fixed = true;
        console.log(`  - 修复标题引号: ${title.substring(0, 50)}...`);
      }
    }
    
    // 2. 修复描述中的引号问题
    const descRegex = /description:\s*"([^"]*)"\s*\n/;
    const descMatch = content.match(descRegex);
    
    if (descMatch) {
      const desc = descMatch[1];
      if (desc.includes('"') && !desc.includes('\\"')) {
        const fixedDesc = desc.replace(/"/g, '\\"');
        content = content.replace(
          descRegex,
          `description: "${fixedDesc}"\n`
        );
        fixed = true;
        console.log(`  - 修复描述引号: ${desc.substring(0, 50)}...`);
      }
    }
    
    // 3. 修复内容中的特殊字符和格式问题
    // 移除可能导致解析错误的特殊字符
    const originalContent = content;
    
    // 修复内容中的特殊引号
    content = content.replace(/[""]/g, '"');
    content = content.replace(/['']/g, "'");
    
    // 修复内容中的特殊破折号
    content = content.replace(/–/g, '-');
    content = content.replace(/—/g, '--');
    
    // 修复内容中的省略号
    content = content.replace(/…/g, '...');
    
    // 修复内容中的特殊空格
    content = content.replace(/\u00A0/g, ' ');
    
    // 确保 frontmatter 格式正确
    if (!content.includes('---\n\n')) {
      content = content.replace('---\n', '---\n\n');
      fixed = true;
    }
    
    // 4. 修复内容中的 HTML 标签问题
    // 移除可能导致解析错误的 HTML 标签
    content = content.replace(/<[^>]*>/g, (match) => {
      // 保留安全的标签
      if (match.match(/^(<br\s*\/?>|<hr\s*\/?>|<strong>|<\/strong>|<em>|<\/em>|<code>|<\/code>)$/)) {
        return match;
      }
      // 移除其他 HTML 标签
      return '';
    });
    
    // 5. 修复内容中的特殊表达式
    // 移除可能导致 acorn 解析错误的表达式
    content = content.replace(/\{[^}]*\}/g, (match) => {
      // 如果包含特殊字符，替换为普通文本
      if (match.includes('!') || match.includes('@') || match.includes('#')) {
        return match.replace(/[!@#]/g, '');
      }
      return match;
    });
    
    if (content !== originalContent) {
      fixed = true;
      console.log(`  - 修复内容格式问题`);
    }
    
    if (fixed) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归处理目录下的所有 MDX 文件
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  let fixedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (item.endsWith('.mdx')) {
      console.log(`🔍 检查文件: ${item}`);
      if (fixMdxFile(fullPath)) {
        fixedCount++;
        console.log(`✅ 修复完成: ${item}`);
      }
    }
  }
  
  return fixedCount;
}

/**
 * 主要修复逻辑
 */
function main() {
  console.log('🔧 开始完全修复 MDX 文件...');
  
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  console.log(`📁 处理目录: ${helpCenterDir}`);
  
  const fixedCount = processDirectory(helpCenterDir);
  
  console.log(`\n🎉 修复完成！共修复了 ${fixedCount} 个文件`);
  
  if (fixedCount > 0) {
    console.log('📝 现在可以重新启动 Mintlify 开发服务器');
    console.log('🚀 运行命令: npx mintlify dev');
  } else {
    console.log('✨ 没有发现需要修复的文件');
  }
  
  console.log('\n💡 如果仍有问题，请检查具体的错误信息');
}

main();
