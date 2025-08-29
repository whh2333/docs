#!/usr/bin/env node
/**
 * 最终分类脚本，处理剩余未分类的文件并清理
 */
import fs from 'fs';
import path from 'path';

/**
 * 处理剩余未分类的文件
 */
function handleRemainingFiles() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  const files = fs.readdirSync(helpCenterDir).filter(f => f.endsWith('.mdx'));
  
  console.log('🔍 检查剩余未分类的文件...');
  
  for (const file of files) {
    const filePath = path.join(helpCenterDir, file);
    const slug = file.replace('.mdx', '');
    
    // 跳过已经分类的文件
    if (file === 'index.mdx') continue;
    
    // 根据文件名判断应该放在哪个分类
    let targetCategory = null;
    
    if (slug.includes('instagram') && slug.includes('multiple')) {
      targetCategory = 'channel-management';
    } else if (slug.includes('test')) {
      // 删除测试文件
      fs.unlinkSync(filePath);
      console.log(`🗑️  删除测试文件: ${file}`);
      continue;
    } else {
      // 尝试根据内容判断分类
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('instagram') || content.includes('connection')) {
          targetCategory = 'channel-management';
        } else if (content.includes('error') || content.includes('troubleshoot')) {
          targetCategory = 'troubleshooting';
        } else {
          targetCategory = 'content-creation'; // 默认分类
        }
      } catch (error) {
        targetCategory = 'content-creation'; // 默认分类
      }
    }
    
    if (targetCategory) {
      const targetDir = path.join(helpCenterDir, targetCategory);
      const targetPath = path.join(targetDir, file);
      
      if (fs.existsSync(targetDir)) {
        fs.renameSync(filePath, targetPath);
        console.log(`✅ 移动文件到 ${targetCategory}: ${file}`);
      }
    }
  }
}

/**
 * 更新分类索引页面
 */
function updateCategoryIndexPages() {
  const categories = [
    'getting-started',
    'publishing', 
    'content-creation',
    'social-platforms',
    'channel-management',
    'error-library',
    'troubleshooting',
    'analytics',
    'team-collaboration',
    'tools-integrations',
    'plans-pricing'
  ];
  
  for (const category of categories) {
    const categoryPath = path.join(process.cwd(), 'en/help-center', category);
    const indexPath = path.join(categoryPath, 'index.mdx');
    
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.mdx') && f !== 'index.mdx');
      
      if (files.length > 0) {
        const articleLinks = files.map(file => {
          const slug = file.replace('.mdx', '');
          const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `- [${title}](${slug})`;
        }).join('\n');
        
        const categoryName = category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        const indexContent = `---
title: "${categoryName}"
description: "Buffer ${categoryName} guides and tutorials"
---

# ${categoryName}

Welcome to the ${categoryName} section of Buffer Help Center. Here you'll find comprehensive guides and tutorials to help you get the most out of Buffer.

## Articles in this category

${articleLinks}

---

*Need help with something else? Check out our [main help center](/en/help-center) or [contact support](mailto:hello@buffer.com).*
`;
        
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`✅ 更新分类索引页面: ${category}/index.mdx (${files.length} 篇文章)`);
      }
    }
  }
}

/**
 * 创建主帮助中心索引页面
 */
function createMainHelpCenterIndex() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  const indexPath = path.join(helpCenterDir, 'index.mdx');
  
  const categories = [
    { name: 'Getting Started', slug: 'getting-started', description: 'Learn the basics of Buffer' },
    { name: 'Publishing', slug: 'publishing', description: 'Schedule and manage your posts' },
    { name: 'Content Creation', slug: 'content-creation', description: 'Create engaging content' },
    { name: 'Social Platforms', slug: 'social-platforms', description: 'Connect and manage social accounts' },
    { name: 'Channel Management', slug: 'channel-management', description: 'Manage your connected channels' },
    { name: 'Error Library', slug: 'error-library', description: 'Common error solutions' },
    { name: 'Troubleshooting', slug: 'troubleshooting', description: 'Solve common issues' },
    { name: 'Analytics', slug: 'analytics', description: 'Track your social media performance' },
    { name: 'Team Collaboration', slug: 'team-collaboration', description: 'Work with your team' },
    { name: 'Tools & Integrations', slug: 'tools-integrations', description: 'Enhance Buffer with tools' },
    { name: 'Plans & Pricing', slug: 'plans-pricing', description: 'Choose the right plan' }
  ];
  
  const categoryLinks = categories.map(cat => 
    `- [${cat.name}](/en/help-center/${cat.slug}) - ${cat.description}`
  ).join('\n');
  
  const mainIndexContent = `---
title: "Buffer Help Center"
description: "Complete guide to using Buffer for social media management"
---

# Buffer Help Center

Welcome to the Buffer Help Center! Here you'll find everything you need to know about using Buffer to manage your social media presence effectively.

## Categories

${categoryLinks}

## Quick Start

New to Buffer? Start with our [Getting Started guide](/en/help-center/getting-started) to learn the basics.

## Need Help?

Can't find what you're looking for? [Contact our support team](mailto:hello@buffer.com) and we'll be happy to help!

---

*This help center contains ${categories.length} categories with comprehensive guides and tutorials.*
`;
  
  fs.writeFileSync(indexPath, mainIndexContent, 'utf8');
  console.log('✅ 创建主帮助中心索引页面');
}

/**
 * 显示最终统计信息
 */
function showFinalStats() {
  const categories = [
    'getting-started',
    'publishing', 
    'content-creation',
    'social-platforms',
    'channel-management',
    'error-library',
    'troubleshooting',
    'analytics',
    'team-collaboration',
    'tools-integrations',
    'plans-pricing'
  ];
  
  let totalArticles = 0;
  
  console.log('\n📊 最终分类统计:');
  for (const category of categories) {
    const categoryPath = path.join(process.cwd(), 'en/help-center', category);
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.mdx') && f !== 'index.mdx');
      const count = files.length;
      totalArticles += count;
      console.log(`  - ${category}: ${count} 篇文章`);
    }
  }
  
  console.log(`\n🎯 总计: ${totalArticles} 篇文章分布在 ${categories.length} 个分类中`);
}

function main() {
  console.log('🔄 开始最终分类整理...');
  
  // 处理剩余文件
  handleRemainingFiles();
  
  // 更新分类索引页面
  updateCategoryIndexPages();
  
  // 创建主帮助中心索引页面
  createMainHelpCenterIndex();
  
  // 显示统计信息
  showFinalStats();
  
  console.log('\n🎉 分类整理完成！');
  console.log('📁 所有文章都已按主题分类');
  console.log('📄 每个分类都有索引页面');
  console.log('🏠 主帮助中心页面已创建');
}

main();
