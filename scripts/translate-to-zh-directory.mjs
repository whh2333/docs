#!/usr/bin/env node
/**
 * 将英文文档翻译成中文并放到zh目录中
 */
import fs from 'fs';
import path from 'path';

/**
 * 英文到中文的翻译映射
 */
const translations = {
  // 基础词汇
  'Welcome to': '欢迎来到',
  'Getting Started': '入门指南',
  'Essentials': '基础知识',
  'API Reference': 'API 参考',
  'Help Center': '帮助中心',
  'Quick Start': '快速开始',
  'Development': '开发指南',
  'Publishing': '发布功能',
  'Content Creation': '内容创建',
  'Social Platforms': '社交平台',
  'Channel Management': '渠道管理',
  'Error Library': '错误库',
  'Troubleshooting': '故障排除',
  'Analytics': '分析功能',
  'Team Collaboration': '团队协作',
  'Tools & Integrations': '工具和集成',
  'Plans & Pricing': '计划和定价',
  
  // 常用动词
  'Learn': '学习',
  'Create': '创建',
  'Manage': '管理',
  'Connect': '连接',
  'Schedule': '调度',
  'Publish': '发布',
  'Edit': '编辑',
  'Share': '分享',
  'Track': '跟踪',
  'Analyze': '分析',
  'Configure': '配置',
  'Customize': '自定义',
  
  // 常用名词
  'Guide': '指南',
  'Tutorial': '教程',
  'Documentation': '文档',
  'Features': '功能',
  'Settings': '设置',
  'Configuration': '配置',
  'Examples': '示例',
  'Resources': '资源',
  'Support': '支持',
  'Help': '帮助',
  'Overview': '概述',
  'Introduction': '介绍',
  
  // 技术词汇
  'Install': '安装',
  'Setup': '设置',
  'Run': '运行',
  'Start': '启动',
  'Stop': '停止',
  'Update': '更新',
  'Deploy': '部署',
  'Build': '构建',
  'Test': '测试',
  'Debug': '调试',
  
  // 描述性词汇
  'Complete': '完整',
  'Comprehensive': '全面',
  'Advanced': '高级',
  'Basic': '基础',
  'Simple': '简单',
  'Easy': '容易',
  'Powerful': '强大',
  'Flexible': '灵活',
  'Professional': '专业',
  'Modern': '现代',
  
  // 更多常用词汇
  'Your': '您的',
  'You': '您',
  'We': '我们',
  'Our': '我们的',
  'This': '这个',
  'That': '那个',
  'These': '这些',
  'Those': '那些',
  'Here': '这里',
  'There': '那里',
  'How to': '如何',
  'What is': '什么是',
  'Why': '为什么',
  'When': '何时',
  'Where': '哪里',
  'Which': '哪个',
  'Can': '可以',
  'Will': '将会',
  'Should': '应该',
  'Could': '可能',
  'Would': '将会',
  'May': '可能',
  'Might': '可能',
  
  // 社交媒体相关
  'Instagram': 'Instagram',
  'Facebook': 'Facebook',
  'LinkedIn': 'LinkedIn',
  'Twitter': 'Twitter',
  'YouTube': 'YouTube',
  'TikTok': 'TikTok',
  'Pinterest': 'Pinterest',
  'Posts': '帖子',
  'Post': '帖子',
  'Story': '故事',
  'Reel': '短视频',
  'Profile': '个人资料',
  'Account': '账户',
  'Followers': '关注者',
  'Following': '关注中',
  'Likes': '点赞',
  'Comments': '评论',
  'Shares': '分享',
  'Engagement': '互动',
  'Reach': '触达',
  'Impressions': '展示次数',
  'Clicks': '点击',
  'Views': '观看次数',
  
  // 时间相关
  'Today': '今天',
  'Yesterday': '昨天',
  'Tomorrow': '明天',
  'Week': '周',
  'Month': '月',
  'Year': '年',
  'Daily': '每日',
  'Weekly': '每周',
  'Monthly': '每月',
  'Yearly': '每年',
  'Morning': '早上',
  'Afternoon': '下午',
  'Evening': '晚上',
  'Night': '晚上',
  
  // 状态相关
  'Active': '活跃',
  'Inactive': '非活跃',
  'Online': '在线',
  'Offline': '离线',
  'Available': '可用',
  'Unavailable': '不可用',
  'Enabled': '已启用',
  'Disabled': '已禁用',
  'Connected': '已连接',
  'Disconnected': '已断开',
  'Success': '成功',
  'Failed': '失败',
  'Error': '错误',
  'Warning': '警告',
  'Info': '信息'
};

/**
 * 翻译文本内容
 */
function translateText(text) {
  let translated = text;
  
  // 应用翻译映射
  for (const [english, chinese] of Object.entries(translations)) {
    // 使用单词边界来避免部分匹配
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, chinese);
  }
  
  return translated;
}

/**
 * 翻译单个文件
 */
function translateFile(enFilePath, zhFilePath) {
  try {
    // 确保中文目录存在
    const zhDir = path.dirname(zhFilePath);
    if (!fs.existsSync(zhDir)) {
      fs.mkdirSync(zhDir, { recursive: true });
    }
    
    let content = fs.readFileSync(enFilePath, 'utf8');
    
    // 翻译标题和描述
    content = content.replace(/title: "([^"]+)"/g, (match, title) => {
      return `title: "${translateText(title)}"`;
    });
    
    content = content.replace(/description: "([^"]+)"/g, (match, desc) => {
      return `description: "${translateText(desc)}"`;
    });
    
    // 翻译正文内容（保持HTML标签和MDX组件不变）
    // 只翻译纯文本内容
    const lines = content.split('\n');
    const translatedLines = lines.map(line => {
      // 跳过frontmatter、HTML标签、MDX组件等
      if (line.startsWith('---') || 
          line.startsWith('<') || 
          line.startsWith('import') ||
          line.startsWith('export') ||
          line.includes('{/*') ||
          line.includes('*/}') ||
          line.includes('href=') ||
          line.includes('icon=') ||
          line.includes('cols=') ||
          line.includes('horizontal')) {
        return line;
      }
      
      // 翻译普通文本行
      return translateText(line);
    });
    
    const translatedContent = translatedLines.join('\n');
    
    // 写入中文文件
    fs.writeFileSync(zhFilePath, translatedContent, 'utf8');
    console.log(`✅ 翻译完成: ${path.relative(process.cwd(), zhFilePath)}`);
    return true;
    
  } catch (error) {
    console.error(`❌ 翻译失败 ${enFilePath}: ${error.message}`);
    return false;
  }
}

/**
 * 递归处理目录
 */
function processDirectory(enDir, zhDir) {
  if (!fs.existsSync(enDir)) return 0;
  
  const items = fs.readdirSync(enDir);
  let translatedCount = 0;
  
  for (const item of items) {
    const enPath = path.join(enDir, item);
    const zhPath = path.join(zhDir, item);
    const stat = fs.statSync(enPath);
    
    if (stat.isDirectory()) {
      translatedCount += processDirectory(enPath, zhPath);
    } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
      if (translateFile(enPath, zhPath)) {
        translatedCount++;
      }
    }
  }
  
  return translatedCount;
}

/**
 * 主要翻译逻辑
 */
function main() {
  console.log('🔄 开始将英文文档翻译成中文并放到zh目录...');
  
  const docsRoot = process.cwd();
  const enDir = path.join(docsRoot, 'en');
  const zhDir = path.join(docsRoot, 'zh');
  
  if (!fs.existsSync(enDir)) {
    console.error('❌ 未找到 en 目录');
    return;
  }
  
  console.log(`📁 英文目录: ${enDir}`);
  console.log(`📁 中文目录: ${zhDir}`);
  
  const translatedCount = processDirectory(enDir, zhDir);
  
  console.log(`\n🎉 翻译完成！共处理了 ${translatedCount} 个文件`);
  
  if (translatedCount > 0) {
    console.log('📝 所有中文文档已保存到 zh 目录');
    console.log('💡 注意：这是基础翻译，建议人工审核和优化');
  } else {
    console.log('✨ 没有发现需要翻译的文件');
  }
}

main();
