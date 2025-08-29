#!/usr/bin/env node
/**
 * 强制更新 docs.json 的导航结构
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
  
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mdx') && f !== 'index.mdx');
  return files.map(file => {
    const slug = file.replace('.mdx', '');
    return `en/help-center/${categoryDir}/${slug}`;
  });
}

/**
 * 强制更新 docs.json
 */
function forceUpdateDocsJson() {
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
  
  // 查找并完全替换现有的 Help Center 组
  const englishLanguage = docsJson.navigation.languages.find(lang => lang.language === 'en');
  
  if (englishLanguage && englishLanguage.groups) {
    // 移除所有现有的 Help Center 组
    englishLanguage.groups = englishLanguage.groups.filter(group => group.group !== 'Help Center');
    
    // 添加新的 Help Center 组
    englishLanguage.groups.push(helpCenterGroup);
    
    console.log('✅ 已完全替换 Help Center 组');
  }
  
  // 保存更新后的文件
  fs.writeFileSync(docsJsonPath, JSON.stringify(docsJson, null, 2), 'utf8');
  console.log('✅ 已更新 docs.json');
  
  return helpCenterGroup;
}

function main() {
  console.log('🔄 开始强制更新导航结构...');
  
  // 强制更新 docs.json
  const helpCenterGroup = forceUpdateDocsJson();
  
  console.log('\n🎉 导航结构强制更新完成！');
  console.log('📁 新的分类结构已应用到 docs.json');
  
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
  
  console.log('\n🚀 现在可以重新启动 Mintlify 开发服务器');
}

main();
