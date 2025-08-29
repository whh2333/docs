#!/usr/bin/env node
/**
 * 更新 docs.json 的导航结构，反映新的分类组织
 */
import fs from 'fs';
import path from 'path';

/**
 * 新的分类结构
 */
const newCategories = {
  'Getting Started': 'getting-started',
  'Publishing': 'publishing',
  'Content Creation': 'content-creation',
  'Social Platforms': 'social-platforms',
  'Channel Management': 'channel-management',
  'Error Library': 'error-library',
  'Troubleshooting': 'troubleshooting',
  'Analytics': 'analytics',
  'Team Collaboration': 'team-collaboration',
  'Tools & Integrations': 'tools-integrations',
  'Plans & Pricing': 'plans-pricing'
};

/**
 * 获取分类下的所有文章
 */
function getArticlesInCategory(categoryDir) {
  const fullPath = path.join(process.cwd(), 'en/help-center', categoryDir);
  if (!fs.existsSync(fullPath)) return [];
  
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mdx'));
  return files.map(file => {
    const slug = file.replace('.mdx', '');
    return `en/help-center/${categoryDir}/${slug}`;
  });
}

/**
 * 更新 docs.json
 */
function updateDocsJson() {
  const docsJsonPath = path.join(process.cwd(), 'docs.json');
  
  if (!fs.existsSync(docsJsonPath)) {
    console.error('找不到 docs.json 文件');
    return;
  }
  
  const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, 'utf8'));
  
  // 创建新的 Help Center 组
  const helpCenterGroup = {
    group: 'Help Center',
    pages: []
  };
  
  // 为每个分类添加页面
  for (const [categoryName, categoryDir] of Object.entries(newCategories)) {
    const articles = getArticlesInCategory(categoryDir);
    
    if (articles.length > 0) {
      // 添加分类标题
      helpCenterGroup.pages.push({
        page: 'en/help-center/' + categoryDir,
        display: categoryName
      });
      
      // 添加该分类下的所有文章
      articles.forEach(articlePath => {
        helpCenterGroup.pages.push(articlePath);
      });
    }
  }
  
  // 查找并替换现有的 Help Center 组
  let found = false;
  const englishLanguage = docsJson.navigation.languages.find(lang => lang.language === 'en');
  
  if (englishLanguage && englishLanguage.groups) {
    for (let i = 0; i < englishLanguage.groups.length; i++) {
      const group = englishLanguage.groups[i];
      if (group.group === 'Help Center') {
        englishLanguage.groups[i] = helpCenterGroup;
        found = true;
        break;
      }
    }
    
    // 如果没有找到，添加到末尾
    if (!found) {
      englishLanguage.groups.push(helpCenterGroup);
    }
  }
  
  // 保存更新后的文件
  fs.writeFileSync(docsJsonPath, JSON.stringify(docsJson, null, 2), 'utf8');
  console.log('✅ 已更新 docs.json');
  
  return helpCenterGroup;
}

/**
 * 创建分类索引页面
 */
function createCategoryIndexPages() {
  for (const [categoryName, categoryDir] of Object.entries(newCategories)) {
    const categoryPath = path.join(process.cwd(), 'en/help-center', categoryDir);
    const indexPath = path.join(categoryPath, 'index.mdx');
    
    if (!fs.existsSync(indexPath)) {
      const articles = getArticlesInCategory(categoryDir);
      const articleLinks = articles.map(articlePath => {
        const slug = articlePath.split('/').pop();
        const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `- [${title}](${slug})`;
      }).join('\n');
      
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
      console.log(`✅ 创建分类索引页面: ${categoryDir}/index.mdx`);
    }
  }
}

function main() {
  console.log('🔄 开始更新导航结构...');
  
  // 更新 docs.json
  const helpCenterGroup = updateDocsJson();
  
  // 创建分类索引页面
  createCategoryIndexPages();
  
  console.log('\n🎉 导航结构更新完成！');
  console.log('📁 新的分类结构已应用到 docs.json');
  console.log('📄 每个分类都有对应的索引页面');
  
  // 显示统计信息
  if (helpCenterGroup) {
    console.log(`\n📊 统计信息:`);
    console.log(`  - 总分类数: ${Object.keys(newCategories).length}`);
    console.log(`  - 总文章数: ${helpCenterGroup.pages.length - Object.keys(newCategories).length}`);
    
    for (const [categoryName, categoryDir] of Object.entries(newCategories)) {
      const articles = getArticlesInCategory(categoryDir);
      console.log(`  - ${categoryName}: ${articles.length} 篇文章`);
    }
  }
}

main();
