#!/usr/bin/env node
/**
 * 重新组织导航结构，为每个分类创建独立的组
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
 * 重新组织 docs.json
 */
function reorganizeDocsJson() {
  const docsJsonPath = path.join(process.cwd(), 'docs.json');
  
  if (!fs.existsSync(docsJsonPath)) {
    console.error('找不到 docs.json 文件');
    return;
  }
  
  const docsJson = JSON.parse(fs.readFileSync(docsJsonPath, 'utf8'));
  
  // 查找英语语言配置
  const englishLanguage = docsJson.navigation.languages.find(lang => lang.language === 'en');
  
  if (!englishLanguage || !englishLanguage.groups) {
    console.error('找不到英语语言配置');
    return;
  }
  
  // 移除现有的 Help Center 组
  englishLanguage.groups = englishLanguage.groups.filter(group => group.group !== 'Help Center');
  
  // 为每个分类创建独立的组
  for (const [categoryName, categoryDir] of Object.entries(newCategories)) {
    const articles = getArticlesInCategory(categoryDir);
    
    if (articles.length > 0) {
      // 创建分类组
      const categoryGroup = {
        group: categoryName,
        pages: []
      };
      
      // 添加分类索引页面
      categoryGroup.pages.push(`en/help-center/${categoryDir}`);
      
      // 添加该分类下的所有文章
      articles.forEach(articlePath => {
        categoryGroup.pages.push(articlePath);
      });
      
      // 添加到导航中
      englishLanguage.groups.push(categoryGroup);
      
      console.log(`✅ 创建分类组: ${categoryName} (${articles.length} 篇文章)`);
    }
  }
  
  // 保存更新后的文件
  fs.writeFileSync(docsJsonPath, JSON.stringify(docsJson, null, 2), 'utf8');
  console.log('✅ 已更新 docs.json');
  
  return englishLanguage.groups;
}

function main() {
  console.log('🔄 开始重新组织导航结构...');
  
  // 重新组织 docs.json
  const groups = reorganizeDocsJson();
  
  console.log('\n🎉 导航结构重新组织完成！');
  console.log('📁 每个分类现在都有独立的导航组');
  
  // 显示统计信息
  if (groups) {
    console.log(`\n📊 统计信息:`);
    console.log(`  - 总组数: ${groups.length}`);
    
    for (const group of groups) {
      if (group.group !== 'Getting started' && group.group !== 'Essentials' && group.group !== 'AI tools' && group.group !== 'API reference') {
        console.log(`  - ${group.group}: ${group.pages.length - 1} 篇文章`);
      }
    }
  }
  
  console.log('\n🚀 现在可以重新启动 Mintlify 开发服务器');
  console.log('📝 每个分类都会在左侧导航中显示为独立的组');
}

main();
