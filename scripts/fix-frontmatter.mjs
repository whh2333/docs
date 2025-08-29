#!/usr/bin/env node
/**
 * 修复 MDX 文件的 frontmatter 格式
 */
import fs from 'fs';
import path from 'path';

function fixFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 修复 frontmatter 格式
    const fixed = content.replace(
      /---\s*title:\s*"([^"]+)"\s*---\s*/,
      '---\ntitle: "$1"\n---\n\n'
    );
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}: ${error.message}`);
    return false;
  }
}

function main() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  const files = fs.readdirSync(helpCenterDir).filter(f => f.endsWith('.mdx'));
  
  let fixedCount = 0;
  for (const file of files) {
    const filePath = path.join(helpCenterDir, file);
    if (fixFrontmatter(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 修复完成！共修复了 ${fixedCount} 个文件`);
}

main();
