#!/usr/bin/env node
/**
 * 批量替换所有文件中的 Buffer 为 Aitoearn
 */
import fs from 'fs';
import path from 'path';

/**
 * 替换单个文件中的 Buffer 为 Aitoearn
 */
function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = false;
    
    // 替换各种形式的 Buffer
    const replacements = [
      { from: 'Buffer', to: 'Aitoearn' },
      { from: 'buffer', to: 'aitoearn' },
      { from: 'BUFFER', to: 'AITOEARN' },
      { from: 'Buffer Help Center', to: 'Aitoearn Help Center' },
      { from: 'Buffer 帮助中心', to: 'Aitoearn 帮助中心' },
      { from: 'buffer.com', to: 'aitoearn.com' },
      { from: 'hello@buffer.com', to: 'hello@aitoearn.com' },
      { from: 'analyze.buffer.com', to: 'analyze.aitoearn.com' },
      { from: 'support.buffer.com', to: 'support.aitoearn.com' },
      { from: 'buffer.helpscoutdocs.com', to: 'aitoearn.helpscoutdocs.com' },
      { from: 'share.buffer.com', to: 'share.aitoearn.com' }
    ];
    
    for (const replacement of replacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        replaced = true;
      }
    }
    
    if (replaced) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 替换完成: ${path.basename(filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 替换失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归处理目录下的所有 MDX 文件
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  let replacedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      replacedCount += processDirectory(fullPath);
    } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
      if (replaceInFile(fullPath)) {
        replacedCount++;
      }
    }
  }
  
  return replacedCount;
}

/**
 * 主要替换逻辑
 */
function main() {
  console.log('🔄 开始批量替换 Buffer 为 Aitoearn...');
  
  const docsRoot = process.cwd();
  console.log(`📁 处理目录: ${docsRoot}`);
  
  const replacedCount = processDirectory(docsRoot);
  
  console.log(`\n🎉 替换完成！共处理了 ${replacedCount} 个文件`);
  
  if (replacedCount > 0) {
    console.log('📝 现在可以重新启动 Mintlify 开发服务器查看效果');
    console.log('🚀 运行命令: npx mintlify dev');
  } else {
    console.log('✨ 没有发现需要替换的文件');
  }
  
  console.log('\n💡 替换内容包括:');
  console.log('  - Buffer → Aitoearn');
  console.log('  - buffer → aitoearn');
  console.log('  - BUFFER → AITOEARN');
  console.log('  - buffer.com → aitoearn.com');
  console.log('  - hello@buffer.com → hello@aitoearn.com');
}

main();
