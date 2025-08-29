#!/usr/bin/env node
/**
 * 批量替换所有文件中的 Mintlify 为 Aitoearn
 */
import fs from 'fs';
import path from 'path';

/**
 * 替换单个文件中的 Mintlify 为 Aitoearn
 */
function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = false;
    
    // 替换各种形式的 Mintlify
    const replacements = [
      { from: 'Mintlify', to: 'Aitoearn' },
      { from: 'mintlify', to: 'aitoearn' },
      { from: 'MINTLIFY', to: 'AITOEARN' },
      { from: 'Mintlify Starter Kit', to: 'Aitoearn Starter Kit' },
      { from: 'mintlify-docs', to: 'aitoearn-docs' },
      { from: 'mintlify.com', to: 'aitoearn.com' },
      { from: 'dashboard.mintlify.com', to: 'dashboard.aitoearn.com' },
      { from: 'starter.mintlify.com', to: 'starter.aitoearn.com' },
      { from: 'sandbox.mintlify.com', to: 'sandbox.aitoearn.com' },
      { from: 'hi@mintlify.com', to: 'hi@aitoearn.com' },
      { from: 'x.com/mintlify', to: 'x.com/aitoearn' },
      { from: 'github.com/mintlify', to: 'github.com/aitoearn' },
      { from: 'linkedin.com/company/mintlify', to: 'linkedin.com/company/aitoearn' }
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
 * 递归处理目录下的所有文件
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  let replacedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git 目录
      if (item === 'node_modules' || item === '.git') {
        continue;
      }
      replacedCount += processDirectory(fullPath);
    } else if (item.endsWith('.mdx') || item.endsWith('.md') || item.endsWith('.json')) {
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
  console.log('🔄 开始批量替换 Mintlify 为 Aitoearn...');
  
  const docsRoot = process.cwd();
  console.log(`📁 处理目录: ${docsRoot}`);
  
  const replacedCount = processDirectory(docsRoot);
  
  console.log(`\n🎉 替换完成！共处理了 ${replacedCount} 个文件`);
  
  if (replacedCount > 0) {
    console.log('📝 现在可以重新启动开发服务器查看效果');
    console.log('🚀 运行命令: npx mintlify dev');
  } else {
    console.log('✨ 没有发现需要替换的文件');
  }
  
  console.log('\n💡 替换内容包括:');
  console.log('  - Mintlify → Aitoearn');
  console.log('  - mintlify → aitoearn');
  console.log('  - MINTLIFY → AITOEARN');
  console.log('  - mintlify.com → aitoearn.com');
  console.log('  - dashboard.mintlify.com → dashboard.aitoearn.com');
  console.log('  - hi@mintlify.com → hi@aitoearn.com');
}

main();
