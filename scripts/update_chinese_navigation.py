#!/usr/bin/env python3
"""
更新 docs.json 中的中文导航配置
添加所有已翻译的帮助中心文章
"""

import json
import os
import glob

def get_chinese_help_center_structure():
    """构建中文帮助中心的导航结构"""
    zh_groups = [
        {
            "group": "快速开始",
            "pages": [
                "zh/index",
                "zh/quickstart",
                "zh/development"
            ]
        },
        {
            "group": "基础",
            "pages": [
                "zh/essentials/markdown",
                "zh/essentials/code",
                "zh/essentials/images",
                "zh/essentials/reusable-snippets",
                "zh/essentials/settings",
                "zh/essentials/navigation"
            ]
        },
        {
            "group": "AI 工具",
            "pages": [
                "zh/ai-tools/cursor",
                "zh/ai-tools/claude-code",
                "zh/ai-tools/windsurf"
            ]
        },
        {
            "group": "API 参考",
            "pages": [
                "zh/api-reference/introduction",
                "zh/api-reference/endpoint/get",
                "zh/api-reference/endpoint/create",
                "zh/api-reference/endpoint/delete",
                "zh/api-reference/endpoint/webhook"
            ]
        },
        {
            "group": "入门指南",
            "pages": [
                "zh/help-center/getting-started",
                "zh/help-center/getting-started/598-what-is-buffer-and-where-can-i-watch-a-demo",
                "zh/help-center/getting-started/600-getting-started-with-buffers-publishing-features",
                "zh/help-center/getting-started/601-getting-started-with-buffers-engagement-features",
                "zh/help-center/getting-started/602-getting-started-with-buffers-analytics-features",
                "zh/help-center/getting-started/603-getting-started-with-buffers-mobile-app",
                "zh/help-center/getting-started/604-moving-to-buffer-from-another-tool"
            ]
        },
        {
            "group": "发布功能",
            "pages": [
                "zh/help-center/publishing",
                "zh/help-center/publishing/642-scheduling-posts",
                "zh/help-center/publishing/643-how-many-posts-can-i-schedule-in-advance",
                "zh/help-center/publishing/644-how-do-i-schedule-posts-for-multiple-social-channels-at-the-same-time",
                "zh/help-center/publishing/646-daily-posting-limits",
                "zh/help-center/publishing/647-is-it-possible-to-schedule-one-post-to-repeat-multiple-times",
                "zh/help-center/publishing/648-is-it-possible-to-remove-the-buffer-stamp-from-posts-published-to-social-networks",
                "zh/help-center/publishing/649-posts-failing-to-save-due-to-server-issues",
                "zh/help-center/publishing/650-how-to-delete-failed-posts-in-bulk",
                "zh/help-center/publishing/651-how-to-use-the-new-calendar-feature-on-buffer",
                "zh/help-center/publishing/652-re-ordering-posts-in-your-queue",
                "zh/help-center/publishing/654-scheduling-retweets",
                "zh/help-center/publishing/656-saving-and-scheduling-draft-posts",
                "zh/help-center/publishing/657-scheduling-instagram-posts-and-reels",
                "zh/help-center/publishing/658-using-notification-publishing",
                "zh/help-center/publishing/659-why-arent-my-instagram-posts-sending-automatically",
                "zh/help-center/publishing/660-share-posts-with-the-duplicate-feature",
                "zh/help-center/publishing/665-managing-and-approving-draft-posts"
            ]
        },
        {
            "group": "内容创建",
            "pages": [
                "zh/help-center/content-creation",
                "zh/help-center/content-creation/584-creating-ideas-in-the-buffer-mobile-app",
                "zh/help-center/content-creation/585-creating-and-managing-tags",
                "zh/help-center/content-creation/586-how-hashtags-work-in-buffer",
                "zh/help-center/content-creation/587-adding-mentions-tags-in-posts",
                "zh/help-center/content-creation/588-character-limits-for-each-social-network",
                "zh/help-center/content-creation/589-creating-ideas-in-buffer",
                "zh/help-center/content-creation/590-instagram-shop-grid",
                "zh/help-center/content-creation/591-how-locations-work-when-scheduling-instagram-posts-through-buffer",
                "zh/help-center/content-creation/614-editing-your-images-in-buffer",
                "zh/help-center/content-creation/615-attaching-images-videos-and-other-media-to-your-posts",
                "zh/help-center/content-creation/616-uploading-and-sharing-links-to-videos",
                "zh/help-center/content-creation/617-ideal-image-sizes-and-formats-for-your-posts",
                "zh/help-center/content-creation/618-adding-alt-text-to-your-images",
                "zh/help-center/content-creation/619-sharing-facebook-and-instagram-links-through-buffer",
                "zh/help-center/content-creation/620-shortening-and-unshortening-links",
                "zh/help-center/content-creation/621-how-images-are-chosen-for-suggested-media",
                "zh/help-center/content-creation/622-instagrams-accepted-aspect-ratio-ranges",
                "zh/help-center/content-creation/917-using-post-templates-in-buffer",
                "zh/help-center/content-creation/926-how-to-upload-posts-in-bulk-to-buffer"
            ]
        },
        {
            "group": "社交平台",
            "pages": [
                "zh/help-center/social-platforms",
                "zh/help-center/social-platforms/554-using-instagram-with-buffer",
                "zh/help-center/social-platforms/555-using-facebook-with-buffer",
                "zh/help-center/social-platforms/557-using-google-business-profiles-with-buffer",
                "zh/help-center/social-platforms/558-using-pinterest-with-buffer",
                "zh/help-center/social-platforms/559-using-tiktok-with-buffer",
                "zh/help-center/social-platforms/560-using-linkedin-with-buffer",
                "zh/help-center/social-platforms/561-using-twitter-with-buffer",
                "zh/help-center/social-platforms/562-using-youtube-shorts-with-buffer",
                "zh/help-center/social-platforms/563-using-mastodon-with-buffer",
                "zh/help-center/social-platforms/855-using-bluesky-with-buffer",
                "zh/help-center/social-platforms/857-using-threads-with-buffer"
            ]
        },
        {
            "group": "渠道管理",
            "pages": [
                "zh/help-center/channel-management",
                "zh/help-center/channel-management/564-connecting-your-channels-to-buffer",
                "zh/help-center/channel-management/565-troubleshooting-instagram-connections",
                "zh/help-center/channel-management/567-supported-channels",
                "zh/help-center/channel-management/568-connecting-your-instagram-business-or-creator-account-to-buffer",
                "zh/help-center/channel-management/569-connecting-your-facebook-page-to-buffer",
                "zh/help-center/channel-management/570-connecting-facebook-groups-and-troubleshooting-connections",
                "zh/help-center/channel-management/571-unavailable-channels-are-likely-connected-to-another-buffer-organization",
                "zh/help-center/channel-management/572-connecting-or-refreshing-channels-as-a-user-of-an-organization",
                "zh/help-center/channel-management/573-refreshing-a-channel-in-buffer",
                "zh/help-center/channel-management/575-removing-a-channel-from-buffer",
                "zh/help-center/channel-management/576-unlocking-a-locked-channel-in-buffer",
                "zh/help-center/channel-management/577-why-isnt-my-social-channel-name-or-profile-image-updating",
                "zh/help-center/channel-management/578-setting-up-facebook-domain-verification",
                "zh/help-center/channel-management/582-working-with-multiple-instagram-accounts",
                "zh/help-center/channel-management/861-how-to-use-the-all-channels-view-in-buffer",
                "zh/help-center/channel-management/927-using-channel-groups-in-buffer"
            ]
        },
        {
            "group": "错误库",
            "pages": [
                "zh/help-center/error-library",
                "zh/help-center/error-library/579-twitter-error-library",
                "zh/help-center/error-library/580-facebook-error-library",
                "zh/help-center/error-library/581-instagram-error-library"
            ]
        },
        {
            "group": "故障排除",
            "pages": [
                "zh/help-center/troubleshooting",
                "zh/help-center/troubleshooting/655-how-to-avoid-being-logged-out-when-using-the-browser-extension-in-safari",
                "zh/help-center/troubleshooting/666-consolidating-multiple-buffer-accounts",
                "zh/help-center/troubleshooting/869-differences-between-facebook-pages-and-profiles",
                "zh/help-center/troubleshooting/872-facebook-troubleshooting-guide",
                "zh/help-center/troubleshooting/873-switching-organizations-on-the-web"
            ]
        },
        {
            "group": "分析功能",
            "pages": [
                "zh/help-center/analytics",
                "zh/help-center/analytics/519-overview-of-metrics-across-all-social-channels",
                "zh/help-center/analytics/520-facebook-metric-descriptions",
                "zh/help-center/analytics/523-linkedin-metric-descriptions",
                "zh/help-center/analytics/527-analyzing-your-posts-within-your-analytics-dashboard",
                "zh/help-center/analytics/528-analyzing-your-instagram-stories",
                "zh/help-center/analytics/534-creating-custom-analytics-reports"
            ]
        },
        {
            "group": "团队协作",
            "pages": [
                "zh/help-center/team-collaboration",
                "zh/help-center/team-collaboration/667-using-buffer-as-an-agency",
                "zh/help-center/team-collaboration/668-adding-buffer-tools-to-your-organization",
                "zh/help-center/team-collaboration/669-renaming-your-buffer-organization",
                "zh/help-center/team-collaboration/670-adding-users-and-setting-up-permissions-in-your-organization",
                "zh/help-center/team-collaboration/671-changing-user-permissions-in-your-organization",
                "zh/help-center/team-collaboration/672-removing-a-user-from-your-organization",
                "zh/help-center/team-collaboration/673-changing-your-buffer-account-name-and-avatar",
                "zh/help-center/team-collaboration/674-getting-started-as-a-user-in-an-organization",
                "zh/help-center/team-collaboration/675-collaborating-on-content-with-notes"
            ]
        },
        {
            "group": "工具和集成",
            "pages": [
                "zh/help-center/tools-integrations",
                "zh/help-center/tools-integrations/583-using-buffers-ai-assistant",
                "zh/help-center/tools-integrations/599-work-smarter-with-quick-navigator",
                "zh/help-center/tools-integrations/653-buffer-browser-extension",
                "zh/help-center/tools-integrations/908-using-content-feeds-in-buffer",
                "zh/help-center/tools-integrations/912-setting-posting-goals-in-buffer"
            ]
        },
        {
            "group": "计划和定价",
            "pages": [
                "zh/help-center/plans-pricing",
                "zh/help-center/plans-pricing/594-why-some-features-are-not-available-on-legacy-buffer",
                "zh/help-center/plans-pricing/595-features-available-on-each-buffer-plan",
                "zh/help-center/plans-pricing/597-what-happens-when-you-downgrade-to-the-free-plan"
            ]
        }
    ]
    
    return zh_groups

def verify_files_exist(pages):
    """验证文件是否存在"""
    missing_files = []
    for page in pages:
        if isinstance(page, list):
            missing_files.extend(verify_files_exist(page))
        elif isinstance(page, dict) and 'pages' in page:
            missing_files.extend(verify_files_exist(page['pages']))
        else:
            file_path = f"{page}.mdx"
            if not os.path.exists(file_path):
                missing_files.append(file_path)
    return missing_files

def update_docs_json():
    """更新 docs.json 文件"""
    print("🔧 更新 docs.json 中的中文导航配置")
    
    # 读取现有配置
    with open('docs.json', 'r', encoding='utf-8') as f:
        docs_config = json.load(f)
    
    # 获取中文导航结构
    zh_groups = get_chinese_help_center_structure()
    
    # 验证文件存在性
    print("🔍 验证中文文件存在性...")
    all_pages = []
    for group in zh_groups:
        all_pages.extend(group['pages'])
    
    missing_files = verify_files_exist(all_pages)
    if missing_files:
        print(f"⚠️  发现 {len(missing_files)} 个缺失的文件：")
        for file in missing_files[:10]:  # 只显示前10个
            print(f"   - {file}")
        if len(missing_files) > 10:
            print(f"   ... 还有 {len(missing_files) - 10} 个文件")
    
    # 更新中文语言配置
    for lang_config in docs_config['navigation']['languages']:
        if lang_config['language'] == 'zh':
            lang_config['groups'] = zh_groups
            break
    
    # 备份原文件
    with open('docs.json.backup', 'w', encoding='utf-8') as f:
        json.dump(docs_config, f, indent=2, ensure_ascii=False)
    
    # 写入更新的配置
    with open('docs.json', 'w', encoding='utf-8') as f:
        json.dump(docs_config, f, indent=2, ensure_ascii=False)
    
    print("✅ docs.json 更新完成")
    print(f"📋 中文导航包含 {len(zh_groups)} 个分组")
    print(f"📄 总共 {len(all_pages)} 个页面")
    print("💾 原文件已备份为 docs.json.backup")
    
    if missing_files:
        print(f"\n⚠️  注意：有 {len(missing_files)} 个文件不存在，可能需要检查")
    
    print("\n✨ 现在可以访问完整的中文文档了！")
    print("🔗 访问地址：http://localhost:3000/zh")

if __name__ == "__main__":
    update_docs_json()
