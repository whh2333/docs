#!/usr/bin/env node
/**
 * 重新组织文章分类，按照 Buffer 的原始分类结构
 * 创建合适的目录结构并移动文件
 */
import fs from 'fs';
import path from 'path';

/**
 * Buffer 文章分类映射
 */
const categoryMapping = {
  // 入门指南
  'getting-started': [
    '598-what-is-buffer-and-where-can-i-watch-a-demo',
    '600-getting-started-with-buffers-publishing-features',
    '601-getting-started-with-buffers-engagement-features',
    '602-getting-started-with-buffers-analytics-features',
    '603-getting-started-with-buffers-mobile-app',
    '604-moving-to-buffer-from-another-tool'
  ],
  
  // 发布功能
  'publishing': [
    '642-scheduling-posts',
    '643-how-many-posts-can-i-schedule-in-advance',
    '644-how-do-i-schedule-posts-for-multiple-social-channels-at-the-same-time',
    '646-daily-posting-limits',
    '647-is-it-possible-to-schedule-one-post-to-repeat-multiple-times',
    '648-is-it-possible-to-remove-the-buffer-stamp-from-posts-published-to-social-networks',
    '649-posts-failing-to-save-due-to-server-issues',
    '650-how-to-delete-failed-posts-in-bulk',
    '651-how-to-use-the-new-calendar-feature-on-buffer',
    '652-re-ordering-posts-in-your-queue',
    '654-scheduling-retweets',
    '656-saving-and-scheduling-draft-posts',
    '657-scheduling-instagram-posts-and-reels',
    '658-using-notification-publishing',
    '659-why-arent-my-instagram-posts-sending-automatically',
    '660-share-posts-with-the-duplicate-feature',
    '665-managing-and-approving-draft-posts'
  ],
  
  // 内容创建
  'content-creation': [
    '584-creating-ideas-in-the-buffer-mobile-app',
    '585-creating-and-managing-tags',
    '586-how-hashtags-work-in-buffer',
    '587-adding-mentions-tags-in-posts',
    '588-character-limits-for-each-social-network',
    '589-creating-ideas-in-buffer',
    '590-instagram-shop-grid',
    '591-how-locations-work-when-scheduling-instagram-posts-through-buffer',
    '614-editing-your-images-in-buffer',
    '615-attaching-images-videos-and-other-media-to-your-posts',
    '616-uploading-and-sharing-links-to-videos',
    '617-ideal-image-sizes-and-formats-for-your-posts',
    '618-adding-alt-text-to-your-images',
    '619-sharing-facebook-and-instagram-links-through-buffer',
    '620-shortening-and-unshortening-links',
    '621-how-images-are-chosen-for-suggested-media',
    '622-instagrams-accepted-aspect-ratio-ranges',
    '917-using-post-templates-in-buffer',
    '926-how-to-upload-posts-in-bulk-to-buffer'
  ],
  
  // 社交媒体平台
  'social-platforms': [
    '554-using-instagram-with-buffer',
    '555-using-facebook-with-buffer',
    '557-using-google-business-profiles-with-buffer',
    '558-using-pinterest-with-buffer',
    '559-using-tiktok-with-buffer',
    '560-using-linkedin-with-buffer',
    '561-using-twitter-with-buffer',
    '562-using-youtube-shorts-with-buffer',
    '563-using-mastodon-with-buffer',
    '855-using-bluesky-with-buffer',
    '857-using-threads-with-buffer'
  ],
  
  // 渠道管理
  'channel-management': [
    '564-connecting-your-channels-to-buffer',
    '565-troubleshooting-instagram-connections',
    '567-supported-channels',
    '568-connecting-your-instagram-business-or-creator-account-to-buffer',
    '569-connecting-your-facebook-page-to-buffer',
    '570-connecting-facebook-groups-and-troubleshooting-connections',
    '571-unavailable-channels-are-likely-connected-to-another-buffer-organization',
    '572-connecting-or-refreshing-channels-as-a-user-of-an-organization',
    '573-refreshing-a-channel-in-buffer',
    '575-removing-a-channel-from-buffer',
    '576-unlocking-a-locked-channel-in-buffer',
    '577-why-isnt-my-social-channel-name-or-profile-image-updating',
    '578-setting-up-facebook-domain-verification',
    '861-how-to-use-the-all-channels-view-in-buffer',
    '927-using-channel-groups-in-buffer'
  ],
  
  // 错误库
  'error-library': [
    '579-twitter-error-library',
    '580-facebook-error-library',
    '581-instagram-error-library'
  ],
  
  // 故障排除
  'troubleshooting': [
    '655-how-to-avoid-being-logged-out-when-using-the-browser-extension-in-safari',
    '666-consolidating-multiple-buffer-accounts',
    '869-differences-between-facebook-pages-and-profiles',
    '872-facebook-troubleshooting-guide',
    '873-switching-organizations-on-the-web'
  ],
  
  // 分析功能
  'analytics': [
    '519-overview-of-metrics-across-all-social-channels',
    '520-facebook-metric-descriptions',
    '523-linkedin-metric-descriptions',
    '527-analyzing-your-posts-within-your-analytics-dashboard',
    '528-analyzing-your-instagram-stories',
    '534-creating-custom-analytics-reports'
  ],
  
  // 团队协作
  'team-collaboration': [
    '667-using-buffer-as-an-agency',
    '668-adding-buffer-tools-to-your-organization',
    '669-renaming-your-buffer-organization',
    '670-adding-users-and-setting-up-permissions-in-your-organization',
    '671-changing-user-permissions-in-your-organization',
    '672-removing-a-user-from-your-organization',
    '673-changing-your-buffer-account-name-and-avatar',
    '674-getting-started-as-a-user-in-an-organization',
    '675-collaborating-on-content-with-notes'
  ],
  
  // 工具和集成
  'tools-integrations': [
    '583-using-buffers-ai-assistant',
    '599-work-smarter-with-quick-navigator',
    '653-buffer-browser-extension',
    '908-using-content-feeds-in-buffer',
    '912-setting-posting-goals-in-buffer'
  ],
  
  // 计划和定价
  'plans-pricing': [
    '594-why-some-features-are-not-available-on-legacy-buffer',
    '595-features-available-on-each-buffer-plan',
    '597-what-happens-when-you-downgrade-to-the-free-plan'
  ]
};

/**
 * 创建目录
 */
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 创建目录: ${dirPath}`);
  }
}

/**
 * 移动文件到新分类
 */
function moveFileToCategory(sourcePath, targetPath) {
  try {
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, targetPath);
      console.log(`✅ 移动文件: ${path.basename(sourcePath)} → ${path.dirname(targetPath)}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ 移动失败 ${sourcePath}: ${error.message}`);
  }
  return false;
}

/**
 * 主要的重组逻辑
 */
function main() {
  const helpCenterDir = path.join(process.cwd(), 'en/help-center');
  
  if (!fs.existsSync(helpCenterDir)) {
    console.error('找不到 help-center 目录');
    process.exit(1);
  }
  
  console.log('🔄 开始重新组织文章分类...');
  
  let movedCount = 0;
  
  // 遍历每个分类
  for (const [category, articles] of Object.entries(categoryMapping)) {
    const categoryDir = path.join(helpCenterDir, category);
    createDirectory(categoryDir);
    
    // 移动该分类下的所有文章
    for (const articleSlug of articles) {
      const sourcePath = path.join(helpCenterDir, `${articleSlug}.mdx`);
      const targetPath = path.join(categoryDir, `${articleSlug}.mdx`);
      
      if (moveFileToCategory(sourcePath, targetPath)) {
        movedCount++;
      }
    }
  }
  
  console.log(`\n🎉 重组完成！共移动了 ${movedCount} 个文件`);
  console.log('📁 文章现在按照 Buffer 的原始分类组织');
  
  // 显示新的目录结构
  console.log('\n📂 新的目录结构:');
  for (const [category, articles] of Object.entries(categoryMapping)) {
    console.log(`  ${category}/ (${articles.length} 篇文章)`);
  }
}

main();

