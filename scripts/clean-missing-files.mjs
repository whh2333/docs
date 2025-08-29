#!/usr/bin/env node

/**
 * 清理 docs.json 中所有不存在的文件引用
 */

import fs from 'fs';
import path from 'path';

const docsPath = path.join(process.cwd(), 'docs.json');

// 读取 docs.json
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

// 检查文件是否存在
function fileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath + '.mdx');
  return fs.existsSync(fullPath);
}

// 递归清理对象中不存在的文件引用
function cleanMissingFiles(obj) {
  if (Array.isArray(obj)) {
    return obj.filter(item => {
      if (typeof item === 'string') {
        // 如果是文件路径，检查文件是否存在
        if (item.startsWith('en/') || item.startsWith('zh/')) {
          return fileExists(item);
        }
        return true;
      }
      return cleanMissingFiles(item);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        cleaned[key] = value;
      } else {
        const cleanedValue = cleanMissingFiles(value);
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  return obj;
}

// 清理 navigation.languages 中不存在的文件引用
if (docs.navigation && docs.navigation.languages) {
  docs.navigation.languages = docs.navigation.languages.map(lang => {
    if (lang.groups) {
      lang.groups = lang.groups.filter(group => {
        // 过滤掉包含不存在的页面路径的组
        if (group.pages) {
          group.pages = group.pages.filter(page => {
            return fileExists(page);
          });
        }
        
        // 如果组中没有页面，也过滤掉
        return group.pages && group.pages.length > 0;
      });
    }
    return lang;
  });
}

// 清理整个文档对象
const cleanedDocs = cleanMissingFiles(docs);

// 写回文件
fs.writeFileSync(docsPath, JSON.stringify(cleanedDocs, null, 2));

console.log('✅ 已清理 docs.json 中所有不存在的文件引用');
console.log('📝 清理完成，文件已保存');
