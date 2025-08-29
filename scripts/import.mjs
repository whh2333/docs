#!/usr/bin/env node
/**
 * 基于授权导出的内容，批量生成 MDX 并更新 docs.json 的 navigation.languages。
 *
 * 使用方法：
 *   node scripts/import.mjs import/content.json
 *
 * content.json 字段示例见 import/content.sample.json
 */
import fs from 'fs';
import path from 'path';

/**
 * 安全读取 JSON 文件
 */
function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * 写入文件（确保目录存在）
 */
function writeFileEnsured(targetPath, content) {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf-8');
}

/**
 * 规范化 slug（仅保留字母数字和连字符/下划线）
 */
function normalizeSlug(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_\/]/g, '-')
    .replace(/-+/g, '-');
}

/**
 * 生成 MDX 内容（含 frontmatter）
 */
function createMdx({ title, description, bodyMDX }) {
  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    description ? `description: "${String(description).replace(/"/g, '\\"')}"` : undefined,
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  return `${frontmatter}\n${bodyMDX || ''}\n`;
}

/**
 * 将页面路径添加到 docs.json 的 navigation.languages 对应语言/分组
 */
function addPageToNavigationLanguages(docsJson, { language, groupName, pagePath }) {
  if (!docsJson.navigation) docsJson.navigation = {};
  if (!Array.isArray(docsJson.navigation.languages)) docsJson.navigation.languages = [];

  let langEntry = docsJson.navigation.languages.find((l) => l.language === language);
  if (!langEntry) {
    langEntry = { language, groups: [] };
    docsJson.navigation.languages.push(langEntry);
  }

  if (!Array.isArray(langEntry.groups)) langEntry.groups = [];

  let group = langEntry.groups.find((g) => g.group === groupName);
  if (!group) {
    group = { group: groupName, pages: [] };
    langEntry.groups.push(group);
  }

  if (!Array.isArray(group.pages)) group.pages = [];
  if (!group.pages.includes(pagePath)) {
    group.pages.push(pagePath);
  }
}

function main() {
  const [, , inputPathArg] = process.argv;
  if (!inputPathArg) {
    console.error('用法: node scripts/import.mjs import/content.json');
    process.exit(1);
  }

  const repoRoot = path.resolve(process.cwd());
  const docsRoot = repoRoot; // 本脚本假设在 docs 项目根目录执行
  const contentPath = path.resolve(repoRoot, inputPathArg);
  const docsJsonPath = path.resolve(docsRoot, 'docs.json');

  if (!fs.existsSync(contentPath)) {
    console.error(`找不到内容文件: ${contentPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(docsJsonPath)) {
    console.error(`找不到 docs.json: ${docsJsonPath}`);
    process.exit(1);
  }

  const content = readJson(contentPath);
  const docsJson = readJson(docsJsonPath);

  if (!Array.isArray(content.articles)) {
    console.error('content.json 格式错误：缺少 articles 数组');
    process.exit(1);
  }

  for (const article of content.articles) {
    const language = article.language || 'en'; // en 或 zh
    const groupName = article.groupName || 'Imported';
    // 修改：使用固定的 help-center 路径，避免与 Mintlify 默认路由冲突
    const category = 'help-center';
    const slug = normalizeSlug(article.slug || article.title || 'untitled');
    const title = article.title || slug;
    const description = article.description || '';
    const bodyMDX = article.bodyMDX || '';

    // 输出路径: docs/{language}/help-center/{slug}.mdx
    const relativePagePath = `${language}/${category}/${slug}`;
    const mdxFilePath = path.resolve(docsRoot, `${relativePagePath}.mdx`);

    const mdx = createMdx({ title, description, bodyMDX });
    writeFileEnsured(mdxFilePath, mdx);

    // 写入导航
    addPageToNavigationLanguages(docsJson, {
      language,
      groupName,
      pagePath: relativePagePath,
    });
  }

  // 写回 docs.json（美化缩进 2 空格）
  fs.writeFileSync(docsJsonPath, JSON.stringify(docsJson, null, 2), 'utf-8');

  console.log('导入完成：已写入 MDX 文件并更新 docs.json');
}

main();


