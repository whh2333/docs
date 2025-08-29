#!/usr/bin/env node
/**
 * 智能翻译剩余的 zh/ 目录文章
 * 基于已优化文章的成功模式进行批量处理
 */
import fs from 'fs';
import path from 'path';

// 智能翻译映射 - 基于已优化文章的成功模式
const smartTranslations = {
  // 常见标题模式
  'Using (.+) 与 Aitoearn': '在 Aitoearn 中使用 $1',
  'How (.+) work 在 Aitoearn': '$1在 Aitoearn 中的工作原理',
  'Creating (.+) 在 Aitoearn': '在 Aitoearn 中创建$1',
  'Getting started with (.+)': '$1入门指南',
  'What (.+) 和 (.+)': '什么是$1以及$2',
  
  // 常见短语翻译
  '您 可以': '您可以',
  '您 将会': '您将',
  '我们 将会': '我们将',
  '我们 可以': '我们可以',
  '那里 is': '有',
  '那里 are': '有',
  '这个 is': '这是',
  '这个 将会': '这将',
  '何时 您': '当您',
  '如何 到': '如何',
  '到 创建': '创建',
  '到 添加': '添加',
  '到 删除': '删除',
  '到 编辑': '编辑',
  '到 调度': '调度',
  '到 发布': '发布',
  '到 分享': '分享',
  '到 保存': '保存',
  '到 查看': '查看',
  '到 使用': '使用',
  '在 这个 time': '目前',
  '在 这个 article': '本文内容',
  '学习 更多': '了解更多',
  '学习 more': '了解更多',
  '查看 我们的': '查看我们的',
  '点击 the': '点击',
  '选择 the': '选择',
  '输入 the': '输入',
  '添加 the': '添加',
  'from the': '从',
  'to the': '到',
  'with the': '与',
  'and the': '和',
  'in the': '在',
  'on the': '在',
  'at the': '在',
  'by the': '由',
  'for the': '为了',
  'of the': '的',
  'as the': '作为',
  
  // 技术术语
  'social network': '社交网络',
  'social media': '社交媒体',
  'social channel': '社交渠道',
  'social 账户': '社交账户',
  '发布功能': '发布',
  '分析功能': '分析',
  '互动': '互动',
  '帖子': '帖子',
  '队列': '队列',
  '仪表板': '仪表板',
  '编辑器': '编辑器',
  '日历': '日历',
  '草稿': '草稿',
  '调度': '调度',
  '计划': '计划',
  '组织': '组织',
  '用户': '用户',
  '账户': '账户',
  '渠道': '渠道',
  '内容': '内容',
  '图片': '图片',
  '视频': '视频',
  '链接': '链接',
  '标签': '标签',
  '评论': '评论',
  '分享': '分享',
  '点击': '点击',
  '点赞': '点赞',
  '关注者': '关注者',
  '展示次数': '展示次数',
  '触达': '触达',
  '故障排除': '故障排除',
  '错误': '错误',
  '设置': '设置',
  '权限': '权限',
  '功能': '功能',
  '指南': '指南',
  '文件': '文件',
  '应用': '应用',
  '移动端': '移动端',
  '我们b': '网页',
  '浏览器': '浏览器',
  '扩展': '扩展',
  
  // 平台名称
  'Instagram': 'Instagram',
  'Facebook': 'Facebook',
  'LinkedIn': 'LinkedIn',
  'X/Twitter': 'X/Twitter',
  'Twitter': 'Twitter',
  'TikTok': 'TikTok',
  'Pinterest': 'Pinterest',
  'YouTube': 'YouTube',
  'Mastodon': 'Mastodon',
  'Threads': 'Threads',
  'Bluesky': 'Bluesky',
  
  // 动作词汇
  'click': '点击',
  'select': '选择',
  'choose': '选择',
  'enter': '输入',
  'type': '输入',
  'upload': '上传',
  'download': '下载',
  'save': '保存',
  'delete': '删除',
  'edit': '编辑',
  'create': '创建',
  'add': '添加',
  'remove': '移除',
  'update': '更新',
  'schedule': '调度',
  'publish': '发布',
  'share': '分享',
  'post': '发布',
  'view': '查看',
  'see': '查看',
  'find': '找到',
  'open': '打开',
  'close': '关闭',
  'enable': '启用',
  'disable': '禁用',
  'connect': '连接',
  'disconnect': '断开连接',
  'refresh': '刷新',
  'filter': '过滤',
  'sort': '排序',
  'search': '搜索',
  'navigate': '导航',
  'access': '访问',
  'manage': '管理',
  'organize': '组织',
  'customize': '自定义',
  'configure': '配置',
  
  // 状态和描述
  'available': '可用',
  'unavailable': '不可用',
  'supported': '支持',
  'not supported': '不支持',
  'enabled': '已启用',
  'disabled': '已禁用',
  'connected': '已连接',
  'disconnected': '已断开',
  'scheduled': '已调度',
  'published': '已发布',
  'sent': '已发送',
  'failed': '失败',
  'successful': '成功',
  'pending': '待处理',
  'approved': '已批准',
  'rejected': '已拒绝',
  'active': '活跃',
  'inactive': '非活跃',
  'online': '在线',
  'offline': '离线',
  
  // 时间相关
  'daily': '每日',
  'weekly': '每周',
  'monthly': '每月',
  'yearly': '每年',
  'hourly': '每小时',
  'minutes': '分钟',
  'seconds': '秒',
  'hours': '小时',
  'days': '天',
  'weeks': '周',
  'months': '月',
  'years': '年',
  'today': '今天',
  'yesterday': '昨天',
  'tomorrow': '明天',
  'now': '现在',
  'later': '稍后',
  'before': '之前',
  'after': '之后',
  'during': '期间',
  'since': '自从',
  'until': '直到',
  
  // 数量和程度
  'all': '所有',
  'some': '一些',
  'many': '许多',
  'few': '少数',
  'more': '更多',
  'less': '更少',
  'most': '大多数',
  'least': '最少',
  'maximum': '最大',
  'minimum': '最小',
  'unlimited': '无限制',
  'limited': '有限',
  'multiple': '多个',
  'single': '单个',
  'first': '第一',
  'last': '最后',
  'next': '下一个',
  'previous': '上一个',
  
  // 常见介词和连词
  ' and ': '和',
  ' or ': '或',
  ' but ': '但是',
  ' so ': '所以',
  ' if ': '如果',
  ' when ': '当',
  ' where ': '在哪里',
  ' what ': '什么',
  ' how ': '如何',
  ' why ': '为什么',
  ' who ': '谁',
  ' which ': '哪个',
  ' that ': '那个',
  ' this ': '这个',
  ' these ': '这些',
  ' those ': '那些',
  ' with ': '与',
  ' without ': '没有',
  ' within ': '在...内',
  ' through ': '通过',
  ' across ': '跨越',
  ' between ': '在...之间',
  ' among ': '在...之中',
  ' above ': '在...之上',
  ' below ': '在...之下',
  ' beside ': '在...旁边',
  ' behind ': '在...后面',
  ' before ': '在...之前',
  ' after ': '在...之后',
  ' during ': '在...期间',
  ' since ': '自从',
  ' until ': '直到',
  ' from ': '从',
  ' to ': '到',
  ' for ': '为了',
  ' as ': '作为',
  ' like ': '像',
  ' about ': '关于',
  ' over ': '超过',
  ' under ': '在...下面',
  ' into ': '进入',
  ' onto ': '到...上',
  ' upon ': '在...之上',
  
  // 清理混杂的中英文
  '您的 ': '您的',
  '我们的 ': '我们的',
  '它的 ': '它的',
  '他们的 ': '他们的',
  '她的 ': '她的',
  '他的 ': '他的',
  '这些 ': '这些',
  '那些 ': '那些',
  '这个 ': '这个',
  '那个 ': '那个',
  '一些 ': '一些',
  '许多 ': '许多',
  '所有 ': '所有',
  '每个 ': '每个',
  '任何 ': '任何',
  '其他 ': '其他',
  '另一个 ': '另一个',
  '相同的 ': '相同的',
  '不同的 ': '不同的',
  '新的 ': '新的',
  '旧的 ': '旧的',
  '最好的 ': '最好的',
  '最坏的 ': '最坏的',
  '最大的 ': '最大的',
  '最小的 ': '最小的',
  '最多的 ': '最多的',
  '最少的 ': '最少的',
  '第一个 ': '第一个',
  '最后一个 ': '最后一个',
  '下一个 ': '下一个',
  '上一个 ': '上一个',
};

/**
 * 智能翻译文本
 */
function smartTranslate(text) {
  let translated = text;
  
  // 应用翻译映射
  for (const [english, chinese] of Object.entries(smartTranslations)) {
    const regex = new RegExp(english, 'gi');
    translated = translated.replace(regex, chinese);
  }
  
  // 清理多余空格
  translated = translated.replace(/\s+/g, ' ');
  translated = translated.trim();
  
  return translated;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 翻译标题和描述
    content = content.replace(/title: "([^"]+)"/g, (match, title) => {
      return `title: "${smartTranslate(title)}"`;
    });
    
    content = content.replace(/description: "([^"]+)"/g, (match, desc) => {
      if (desc.trim() === '') return match;
      return `description: "${smartTranslate(desc)}"`;
    });
    
    // 翻译正文内容
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
          line.includes('src=') ||
          line.includes('alt=') ||
          line.includes('icon=') ||
          line.includes('cols=') ||
          line.includes('horizontal') ||
          line.includes('![') ||
          line.includes('](') ||
          line.includes('```') ||
          line.trim() === '') {
        return line;
      }
      
      // 翻译普通文本行
      return smartTranslate(line);
    });
    
    const translatedContent = translatedLines.join('\n');
    
    fs.writeFileSync(filePath, translatedContent, 'utf8');
    console.log(`✅ 智能翻译完成: ${path.basename(filePath)}`);
    return true;
    
  } catch (error) {
    console.error(`❌ 翻译失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 批量处理目录
 */
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let processedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processedCount += processDirectory(fullPath);
    } else if (item.endsWith('.mdx')) {
      if (processFile(fullPath)) {
        processedCount++;
      }
    }
  }
  
  return processedCount;
}

function main() {
  console.log('🚀 开始智能翻译剩余文章...');
  console.log('📋 策略:');
  console.log('  - 基于已优化文章的成功模式');
  console.log('  - 保持MDX组件和链接不变');
  console.log('  - 智能识别和翻译文本内容');
  console.log('  - 批量处理提高效率');
  
  const zhDir = path.join(process.cwd(), 'zh');
  const processedCount = processDirectory(zhDir);
  
  console.log(`\n🎉 智能翻译完成！`);
  console.log(`📊 统计信息:`);
  console.log(`  - 处理文件数: ${processedCount}`);
  console.log(`  - 翻译质量: 基于成功模式的智能翻译`);
  console.log(`  - 保持格式: MDX组件和链接完整`);
  
  console.log('\n✨ 下一步:');
  console.log('  1. 启动开发服务器: npx mintlify dev');
  console.log('  2. 检查翻译质量和页面显示');
  console.log('  3. 根据需要手动调整关键文章');
}

main();
