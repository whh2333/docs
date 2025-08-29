#!/usr/bin/env node
/**
 * 修复中文翻译脚本 - 解决中英混杂问题
 * 特点：
 * 1. 更智能的句子级翻译
 * 2. 完整的短语替换
 * 3. 避免部分单词替换导致的混杂
 */
import fs from 'fs';
import path from 'path';

/**
 * 完整的句子和短语翻译映射
 */
const sentenceTranslations = {
  // === 首页核心句子 ===
  'Complete guide to using Aitoearn for social media management': '使用 Aitoearn 进行社交媒体管理的完整指南',
  'Your comprehensive resource for mastering Aitoearn\'s social media management platform': '您掌握 Aitoearn 社交媒体管理平台的综合资源',
  'Find guides, tutorials, and solutions to help you succeed with your social media strategy': '找到指南、教程和解决方案，帮助您在社交媒体策略中取得成功',
  'New to Aitoearn? Start here to learn the basics and get up and running quickly': 'Aitoearn 新手？从这里开始学习基础知识并快速上手',
  'Follow our comprehensive getting started guide to learn Aitoearn basics': '跟随我们的综合入门指南学习 Aitoearn 基础知识',
  'Learn how to schedule posts, use the calendar, and manage your content queue': '学习如何调度帖子、使用日历和管理您的内容队列',
  'Discover tools for creating engaging content, editing images, and managing tags': '探索创建引人入胜内容的工具、编辑图像和管理标签',
  'Connect and manage your accounts on Instagram, Facebook, LinkedIn, and more': '在 Instagram、Facebook、LinkedIn 等平台上连接和管理您的账户',
  'Track your social media performance with detailed analytics and reports': '通过详细分析和报告跟踪您的社交媒体表现',
  'Troubleshoot connections and manage your social media accounts': '排除连接故障并管理您的社交媒体账户',
  'Work with your team, manage permissions, and collaborate on content': '与您的团队合作、管理权限并协作创建内容',
  'Find solutions to common errors and connection issues': '找到常见错误和连接问题的解决方案',
  'Explore AI assistant, browser extensions, and other Aitoearn tools': '探索 AI 助手、浏览器扩展和其他 Aitoearn 工具',
  'Can\'t find what you\'re looking for? Here are some ways to get help': '找不到您要找的内容？以下是一些获取帮助的方法',
  'Use the left navigation to explore specific topics': '使用左侧导航探索特定主题',
  'Use the search bar to find specific information': '使用搜索栏查找特定信息',
  'This help center contains comprehensive guides and tutorials to help you get the most out of Aitoearn': '本帮助中心包含全面的指南和教程，帮助您充分利用 Aitoearn',

  // === 常用短语和表达 ===
  'Popular Categories': '热门分类',
  'Quick Help': '快速帮助',
  'Need Help': '需要帮助',
  'Contact support': '联系支持',
  'Browse by category': '按分类浏览',
  'Email us at': '发送邮件至',
  'Start here': '从这里开始',
  'Get started': '开始使用',
  'Learn more': '了解更多',
  'Find out more': '了解更多',
  'Read more': '阅读更多',
  'See more': '查看更多',

  // === 技术相关 ===
  'social media management': '社交媒体管理',
  'content queue': '内容队列',
  'browser extensions': '浏览器扩展',
  'getting started guide': '入门指南',
  'user permissions': '用户权限',
  'team collaboration': '团队协作',
  'error solutions': '错误解决方案',
  'analytics and reports': '分析和报告',
  'left navigation': '左侧导航',
  'search bar': '搜索栏',
  'specific topics': '特定主题',
  'specific information': '特定信息',

  // === 平台相关 ===
  'social media platform': '社交媒体平台',
  'social media accounts': '社交媒体账户',
  'social media performance': '社交媒体表现',
  'social media strategy': '社交媒体策略',
  'Instagram, Facebook, LinkedIn': 'Instagram、Facebook、LinkedIn',
};

/**
 * 单词级翻译映射（仅在没有匹配到句子时使用）
 */
const wordTranslations = {
  // === 基础词汇 ===
  'Welcome': '欢迎',
  'Guide': '指南',
  'Tutorial': '教程',
  'Help': '帮助',
  'Support': '支持',
  'Learn': '学习',
  'Create': '创建',
  'Manage': '管理',
  'Connect': '连接',
  'Track': '跟踪',
  'Explore': '探索',
  'Discover': '探索',
  'Find': '查找',
  'Search': '搜索',
  'Browse': '浏览',
  'Getting Started': '入门指南',
  'Content Creation': '内容创建',
  'Social Platforms': '社交平台',
  'Channel Management': '渠道管理',
  'Error Library': '错误库',
  'Troubleshooting': '故障排除',
  'Analytics': '分析功能',
  'Team Collaboration': '团队协作',
  'Tools & Integrations': '工具和集成',
  'Plans & Pricing': '计划和定价',

  // === 技术词汇 ===
  'comprehensive': '全面的',
  'detailed': '详细的',
  'specific': '特定的',
  'common': '常见的',
  'engaging': '引人入胜的',
  'professional': '专业的',
  'advanced': '高级的',
  'basic': '基础的',

  // === 常用词汇 ===
  'your': '您的',
  'you': '您',
  'our': '我们的',
  'we': '我们',
  'this': '这个',
  'here': '这里',
  'more': '更多',
  'with': '与',
  'and': '和',
  'or': '或',
  'for': '用于',
  'to': '到',
  'in': '在',
  'on': '在',
  'at': '在',
};

/**
 * 智能翻译文本
 */
function smartTranslate(text) {
  let result = text;
  
  // 1. 首先尝试完整句子翻译
  for (const [english, chinese] of Object.entries(sentenceTranslations)) {
    if (result.includes(english)) {
      result = result.replace(new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), chinese);
    }
  }
  
  // 2. 然后进行单词级翻译（只对未翻译的部分）
  for (const [english, chinese] of Object.entries(wordTranslations)) {
    // 使用单词边界确保完整单词匹配
    const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, chinese);
  }
  
  return result;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let inFrontmatter = false;
    let frontmatterEnded = false;
    
    const processedLines = lines.map((line, index) => {
      // 处理 frontmatter
      if (line.trim() === '---') {
        if (index === 0) {
          inFrontmatter = true;
        } else if (inFrontmatter) {
          inFrontmatter = false;
          frontmatterEnded = true;
        }
        return line;
      }
      
      // 在 frontmatter 中，只翻译 title 和 description
      if (inFrontmatter) {
        if (line.startsWith('title:') || line.startsWith('description:')) {
          return line.replace(/"([^"]+)"/g, (match, content) => {
            return `"${smartTranslate(content)}"`;
          });
        }
        return line;
      }
      
      // 跳过代码块、HTML 标签、组件等
      if (line.trim().startsWith('```') || 
          line.trim().startsWith('<') || 
          line.includes('import ') ||
          line.includes('export ') ||
          line.includes('href=') ||
          line.includes('icon=') ||
          line.includes('cols=') ||
          line.includes('horizontal')) {
        return line;
      }
      
      // 翻译正文内容
      return smartTranslate(line);
    });
    
    const processedContent = processedLines.join('\n');
    
    if (processedContent !== content) {
      fs.writeFileSync(filePath, processedContent, 'utf8');
      console.log(`✅ 修复完成: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归处理目录
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const items = fs.readdirSync(dirPath);
  let count = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
      if (processFile(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 开始修复中文翻译，解决中英混杂问题...');
  console.log('📋 修复策略:');
  console.log('  - 优先进行句子级完整翻译');
  console.log('  - 避免部分单词替换');
  console.log('  - 保持技术术语和组件不变');
  console.log('  - 确保翻译自然流畅\n');
  
  const zhDir = path.join(process.cwd(), 'zh');
  
  if (!fs.existsSync(zhDir)) {
    console.error('❌ zh/ 目录不存在');
    return;
  }
  
  const fixedCount = processDirectory(zhDir);
  
  console.log(`\n🎉 修复完成！`);
  console.log(`📊 统计信息:`);
  console.log(`  - 修复文件数: ${fixedCount}`);
  console.log(`  - 句子翻译数: ${Object.keys(sentenceTranslations).length}`);
  console.log(`  - 单词翻译数: ${Object.keys(wordTranslations).length}`);
  
  if (fixedCount > 0) {
    console.log('\n✨ 下一步:');
    console.log('  1. 重新启动开发服务器');
    console.log('  2. 检查中文页面显示效果');
    console.log('  3. 验证翻译质量和可读性');
  }
}

main();

