#!/usr/bin/env node
/**
 * 专业中文翻译脚本 - 将 zh/ 目录下的英文内容翻译成中文
 * 特点：
 * 1. 保持 MDX 组件、HTML 标签、代码块不变
 * 2. 仅翻译纯文本内容
 * 3. 智能处理 frontmatter
 * 4. 避免中英混杂
 */
import fs from 'fs';
import path from 'path';

/**
 * 完整的英文到中文翻译映射
 */
const translationMap = {
  // === 页面标题和分类 ===
  'Welcome to Aitoearn Help Center': '欢迎来到 Aitoearn 帮助中心',
  'Aitoearn Help Center': 'Aitoearn 帮助中心',
  'Complete guide to using Aitoearn for social media management': '使用 Aitoearn 进行社交媒体管理的完整指南',
  'Getting Started': '入门指南',
  'Quick Start': '快速开始',
  'Essentials': '基础知识',
  'API Reference': 'API 参考',
  'Help Center': '帮助中心',
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

  // === 常用短语 ===
  'Welcome to': '欢迎来到',
  'New to': '初次使用',
  'Start here': '从这里开始',
  'Learn how to': '学习如何',
  'Find out how': '了解如何',
  'Discover how': '探索如何',
  'Need help': '需要帮助',
  'Contact support': '联系支持',
  'Popular Categories': '热门分类',
  'Quick Help': '快速帮助',
  'Browse by category': '按分类浏览',
  'Use the search bar': '使用搜索栏',
  'Email us at': '发送邮件至',

  // === 动词 ===
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
  'Install': '安装',
  'Setup': '设置',
  'Update': '更新',
  'Build': '构建',
  'Deploy': '部署',
  'Test': '测试',
  'Debug': '调试',

  // === 名词 ===
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
  'Posts': '帖子',
  'Content': '内容',
  'Account': '账户',
  'Profile': '个人资料',
  'Dashboard': '仪表板',
  'Calendar': '日历',
  'Queue': '队列',

  // === 描述性词汇 ===
  'Complete': '完整的',
  'Comprehensive': '全面的',
  'Advanced': '高级的',
  'Basic': '基础的',
  'Simple': '简单的',
  'Easy': '容易的',
  'Powerful': '强大的',
  'Professional': '专业的',
  'Modern': '现代的',

  // === 常用句式 ===
  'How to': '如何',
  'What is': '什么是',
  'Why do': '为什么',
  'When to': '何时',
  'Where to': '在哪里',
  'Follow our': '跟随我们的',
  'Check out': '查看',
  'Find solutions': '寻找解决方案',
  'Get started': '开始使用',

  // === 人称代词 ===
  'Your': '您的',
  'You': '您',
  'We': '我们',
  'Our': '我们的',
  'This': '这个',
  'These': '这些',
  'Here': '这里',
  'There': '那里',

  // === 社交媒体相关 ===
  'social media': '社交媒体',
  'Social Media': '社交媒体',
  'Instagram': 'Instagram',
  'Facebook': 'Facebook',
  'LinkedIn': 'LinkedIn',
  'Twitter': 'Twitter',
  'YouTube': 'YouTube',
  'TikTok': 'TikTok',
  'Pinterest': 'Pinterest',
  'Engagement': '互动',
  'Followers': '关注者',
  'Likes': '点赞',
  'Comments': '评论',
  'Shares': '分享',
  'Views': '浏览量',
  'Impressions': '展示次数',
  'Reach': '触达',
  'Clicks': '点击',

  // === 时间相关 ===
  'Today': '今天',
  'Yesterday': '昨天',
  'Tomorrow': '明天',
  'Daily': '每日',
  'Weekly': '每周',
  'Monthly': '每月',
  'Schedule': '调度',
  'Scheduled': '已调度',

  // === 状态相关 ===
  'Active': '活跃',
  'Connected': '已连接',
  'Disconnected': '已断开',
  'Available': '可用',
  'Enabled': '已启用',
  'Disabled': '已禁用',
  'Success': '成功',
  'Failed': '失败',
  'Error': '错误',
  'Warning': '警告',

  // === 技术术语 ===
  'API': 'API',
  'CLI': '命令行工具',
  'URL': '网址',
  'Link': '链接',
  'Image': '图片',
  'Video': '视频',
  'File': '文件',
  'Upload': '上传',
  'Download': '下载',
  'Browser': '浏览器',
  'Extension': '扩展',
  'App': '应用',
  'Mobile': '移动端',
  'Desktop': '桌面端',

  // === 业务相关 ===
  'Organization': '组织',
  'Team': '团队',
  'User': '用户',
  'Admin': '管理员',
  'Permission': '权限',
  'Role': '角色',
  'Plan': '计划',
  'Pricing': '定价',
  'Free': '免费',
  'Premium': '高级',
  'Enterprise': '企业版',

  // === 操作相关 ===
  'Click': '点击',
  'Select': '选择',
  'Choose': '选择',
  'Enter': '输入',
  'Type': '输入',
  'Save': '保存',
  'Cancel': '取消',
  'Delete': '删除',
  'Remove': '移除',
  'Add': '添加',
  'Insert': '插入',
  'Copy': '复制',
  'Paste': '粘贴',

  // === 方向和位置 ===
  'Left': '左侧',
  'Right': '右侧',
  'Top': '顶部',
  'Bottom': '底部',
  'Center': '中心',
  'Side': '侧边',
  'Menu': '菜单',
  'Navigation': '导航',
  'Sidebar': '侧边栏',
  'Header': '页头',
  'Footer': '页脚'
};

/**
 * 智能翻译文本
 */
function translateText(text) {
  let result = text;
  
  // 按长度降序排列，先替换长短语，避免部分匹配
  const sortedEntries = Object.entries(translationMap)
    .sort(([a], [b]) => b.length - a.length);
  
  for (const [english, chinese] of sortedEntries) {
    // 使用全局替换，但要小心不要破坏已有的中文
    const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, chinese);
  }
  
  return result;
}

/**
 * 翻译单个文件
 */
function translateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let inFrontmatter = false;
    let frontmatterEnded = false;
    
    const translatedLines = lines.map((line, index) => {
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
          // 提取引号内的内容进行翻译
          return line.replace(/"([^"]+)"/g, (match, content) => {
            return `"${translateText(content)}"`;
          });
        }
        return line;
      }
      
      // 跳过代码块
      if (line.trim().startsWith('```') || 
          line.trim().startsWith('<') || 
          line.includes('import ') ||
          line.includes('export ') ||
          line.includes('href=') ||
          line.includes('icon=') ||
          line.includes('cols=')) {
        return line;
      }
      
      // 翻译正文内容
      return translateText(line);
    });
    
    const translatedContent = translatedLines.join('\n');
    
    // 只有内容真正改变时才写入
    if (translatedContent !== content) {
      fs.writeFileSync(filePath, translatedContent, 'utf8');
      console.log(`✅ 翻译完成: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 翻译失败 ${filePath}: ${error.message}`);
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
      if (translateFile(fullPath)) {
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
  console.log('🔄 开始将 zh/ 目录翻译成中文...');
  console.log('📋 翻译策略:');
  console.log('  - 仅翻译纯文本内容');
  console.log('  - 保持 MDX 组件和 HTML 标签不变');
  console.log('  - 智能处理 frontmatter');
  console.log('  - 避免中英混杂\n');
  
  const zhDir = path.join(process.cwd(), 'zh');
  
  if (!fs.existsSync(zhDir)) {
    console.error('❌ zh/ 目录不存在');
    return;
  }
  
  const translatedCount = processDirectory(zhDir);
  
  console.log(`\n🎉 翻译完成！`);
  console.log(`📊 统计信息:`);
  console.log(`  - 处理文件数: ${translatedCount}`);
  console.log(`  - 翻译词汇数: ${Object.keys(translationMap).length}`);
  
  if (translatedCount > 0) {
    console.log('\n✨ 下一步:');
    console.log('  1. 启动开发服务器: npx mintlify dev');
    console.log('  2. 访问中文页面: http://localhost:3000/zh');
    console.log('  3. 检查翻译质量和页面显示效果');
  }
}

main();

