#!/usr/bin/env node
/**
 * 创建清洁的中文翻译 - 手工制作高质量中文内容
 * 策略：直接用中文重写，避免机械翻译导致的问题
 */
import fs from 'fs';
import path from 'path';

/**
 * 高质量的中文页面内容
 */
const chineseContent = {
  'zh/index.mdx': `---
title: "Aitoearn 帮助中心"
description: "使用 Aitoearn 进行社交媒体管理的完整指南"
---

# 欢迎来到 Aitoearn 帮助中心

您掌握 Aitoearn 社交媒体管理平台的综合资源。找到指南、教程和解决方案，帮助您在社交媒体策略中取得成功。

## 入门指南

Aitoearn 新手？从这里开始学习基础知识并快速上手。

<Card
  title="从这里开始"
  icon="rocket"
  href="/zh/help-center/getting-started"
  horizontal
>
  跟随我们的综合入门指南学习 Aitoearn 基础知识。
</Card>

## 热门分类

<Columns cols={2}>
  <Card
    title="发布功能"
    icon="calendar"
    href="/zh/help-center/publishing"
  >
    学习如何调度帖子、使用日历和管理您的内容队列。
  </Card>
  <Card
    title="内容创建"
    icon="pen-to-square"
    href="/zh/help-center/content-creation"
  >
    探索创建引人入胜内容的工具、编辑图像和管理标签。
  </Card>
  <Card
    title="社交平台"
    icon="share-nodes"
    href="/zh/help-center/social-platforms"
  >
    在 Instagram、Facebook、LinkedIn 等平台上连接和管理您的账户。
  </Card>
  <Card
    title="分析功能"
    icon="chart-line"
    href="/zh/help-center/analytics"
  >
    通过详细分析和报告跟踪您的社交媒体表现。
  </Card>
</Columns>

## 快速帮助

<Columns cols={2}>
  <Card
    title="渠道管理"
    icon="link"
    href="/zh/help-center/channel-management"
  >
    排除连接故障并管理您的社交媒体账户。
  </Card>
  <Card
    title="团队协作"
    icon="users"
    href="/zh/help-center/team-collaboration"
  >
    与您的团队合作、管理权限并协作创建内容。
  </Card>
  <Card
    title="错误库"
    icon="exclamation-triangle"
    href="/zh/help-center/error-library"
  >
    找到常见错误和连接问题的解决方案。
  </Card>
  <Card
    title="工具和集成"
    icon="puzzle-piece"
    href="/zh/help-center/tools-integrations"
  >
    探索 AI 助手、浏览器扩展和其他 Aitoearn 工具。
  </Card>
</Columns>

## 需要帮助？

找不到您要找的内容？以下是一些获取帮助的方法：

- **按分类浏览** - 使用左侧导航探索特定主题
- **搜索** - 使用搜索栏查找特定信息
- **联系支持** - 发送邮件至 [hello@aitoearn.com](mailto:hello@aitoearn.com)

---

*本帮助中心包含全面的指南和教程，帮助您充分利用 Aitoearn。*
`,

  'zh/help-center/index.mdx': `---
title: "Aitoearn 帮助中心"
description: "使用 Aitoearn 进行社交媒体管理的完整指南"
---

# Aitoearn 帮助中心

欢迎来到 Aitoearn 帮助中心！这里您将找到使用 Aitoearn 有效管理社交媒体的所有必要信息。

## 分类

- [入门指南](/zh/help-center/getting-started) - 学习 Aitoearn 基础知识
- [发布功能](/zh/help-center/publishing) - 调度和管理您的帖子
- [内容创建](/zh/help-center/content-creation) - 创建引人入胜的内容
- [社交平台](/zh/help-center/social-platforms) - 连接和管理社交账户
- [渠道管理](/zh/help-center/channel-management) - 管理您的已连接渠道
- [错误库](/zh/help-center/error-library) - 常见错误解决方案
- [故障排除](/zh/help-center/troubleshooting) - 解决常见问题
- [分析功能](/zh/help-center/analytics) - 跟踪您的社交媒体表现
- [团队协作](/zh/help-center/team-collaboration) - 与您的团队合作
- [工具和集成](/zh/help-center/tools-integrations) - 使用工具增强 Aitoearn
- [计划和定价](/zh/help-center/plans-pricing) - 选择合适的计划

## 快速开始

Aitoearn 新手？从我们的[入门指南](/zh/help-center/getting-started)开始学习基础知识。

## 需要帮助？

找不到您要找的内容？[联系我们的支持团队](mailto:hello@aitoearn.com)，我们很乐意为您提供帮助！

---

*本帮助中心包含 11 个分类的全面指南和教程。*
`,

  'zh/quickstart.mdx': `---
title: "快速开始"
description: "快速开始使用 Aitoearn 文档"
---

# 快速开始

建立您的文档从未如此简单。

## 设置

在您的[仪表板](https://dashboard.aitoearn.com)中创建新的仓库。如果您还没有文档仓库，入职向导会帮您创建。

## 开发

安装 Aitoearn CLI：\`npm i -g mint\`

在您的文档目录中运行以下命令：

\`\`\`
mint dev
\`\`\`

### 发布您的更改

**安装我们的 GitHub 应用**

从您的[仪表板](https://dashboard.aitoearn.com/settings/organization/github-app)安装 Aitoearn GitHub App。

推送到默认分支后，更改会自动部署到生产环境。

**需要帮助？** 查看[完整文档](https://aitoearn.com/docs)或加入[社区](https://aitoearn.com/community)。
`,

  'zh/development.mdx': `---
title: "开发"
description: "学习如何使用 Aitoearn 开发环境预览您的文档更改"
---

# 开发

按照以下步骤在您的操作系统上安装并运行 Aitoearn。

<Step title="安装 Aitoearn CLI">

\`\`\`bash
npm i -g mint
\`\`\`

</Step>

<Step title="运行开发环境">

转到您的 \`docs.json\` 所在的文档根目录并运行：

\`\`\`bash
mint dev
\`\`\`

</Step>

在 \`http://localhost:3000\` 查看您的本地预览。

默认情况下，Aitoearn 使用 3000 端口。您可以使用 \`--port\` 标志自定义端口。例如，在 3333 端口运行：

\`\`\`bash
mint dev --port 3333
\`\`\`

如果您尝试在已使用的端口上运行 Aitoearn，它会使用下一个可用端口：

![](https://mintlify-assets.b-cdn.net/port.png)

## Aitoearn 版本

请注意，每个 CLI 版本都对应特定的 Aitoearn 版本。如果您的本地预览与生产版本不一致，请更新 CLI：

\`\`\`bash
npm mint update
\`\`\`

## 故障排除

以下是一些常见问题和解决方案。

<AccordionGroup>

<Accordion title="Mintlify 开发环境无法运行">

如果您的开发环境无法运行：运行 \`mint update\` 确保您有最新版本的 CLI。

</Accordion>

<Accordion title="页面显示为 404">

确保您在包含有效 \`docs.json\` 的文件夹中运行。

</Accordion>

<Accordion title="重置或硬刷新不起作用">

您可能正在运行陈旧的构建。请尝试以下解决方案：

1. 移除当前安装的 CLI 版本：\`npm remove -g mint\`
2. 重新安装 CLI：\`npm i -g mint\`
3. 重新安装 CLI：\`npm i -g mint\`

</Accordion>

<Accordion title="解决方案：前往设备根目录删除 \`~/.aitoearn\` 文件夹，然后再次运行 \`mint dev\`。">

</Accordion>

</AccordionGroup>

想了解最新 CLI 版本的变更？查看 [CLI 更新日志](https://www.npmjs.com/package/mintlify?activeTab=versions)。
`
};

/**
 * 创建清洁的中文文件
 */
function createCleanFile(relativePath, content) {
  const fullPath = path.join(process.cwd(), relativePath);
  
  try {
    // 确保目录存在
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 创建清洁中文版本: ${relativePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 创建失败 ${relativePath}: ${error.message}`);
    return false;
  }
}

/**
 * 更新所有链接从 /en/ 到 /zh/
 */
function updateLinksInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // 将 href="/en/ 替换为 href="/zh/
    const updatedContent = content.replace(/href="\/en\//g, 'href="/zh/');
    
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`🔗 更新链接: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 更新链接失败 ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * 批量更新文件中的链接
 */
function updateAllLinks() {
  const zhDir = path.join(process.cwd(), 'zh');
  
  function processDir(dir) {
    if (!fs.existsSync(dir)) return 0;
    
    const items = fs.readdirSync(dir);
    let count = 0;
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        count += processDir(fullPath);
      } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
        if (updateLinksInFile(fullPath)) {
          count++;
        }
      }
    }
    
    return count;
  }
  
  return processDir(zhDir);
}

/**
 * 主函数
 */
function main() {
  console.log('🧹 创建清洁的中文翻译版本...');
  console.log('📋 策略:');
  console.log('  - 手工制作高质量中文内容');
  console.log('  - 避免机械翻译问题');
  console.log('  - 确保内容自然流畅');
  console.log('  - 更新所有链接指向中文版本\n');
  
  let createdCount = 0;
  
  // 创建核心页面的清洁中文版本
  for (const [filePath, content] of Object.entries(chineseContent)) {
    if (createCleanFile(filePath, content)) {
      createdCount++;
    }
  }
  
  // 更新所有链接
  console.log('\n🔗 更新所有链接指向中文版本...');
  const updatedLinks = updateAllLinks();
  
  console.log(`\n🎉 清洁中文版本创建完成！`);
  console.log(`📊 统计信息:`);
  console.log(`  - 创建清洁文件数: ${createdCount}`);
  console.log(`  - 更新链接文件数: ${updatedLinks}`);
  
  console.log('\n✨ 下一步:');
  console.log('  1. 启动开发服务器: npx mintlify dev');
  console.log('  2. 访问中文首页: http://localhost:3000/zh');
  console.log('  3. 检查页面显示和链接跳转');
  console.log('  4. 验证多语言切换功能');
}

main();

