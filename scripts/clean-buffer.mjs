#!/usr/bin/env node

/**
 * 清理 docs.json 中的所有 Buffer 相关内容
 */

import fs from 'fs';
import path from 'path';

const docsPath = path.join(process.cwd(), 'docs.json');

// 读取 docs.json
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

// 递归清理对象中的 Buffer 相关内容
function cleanBufferContent(obj) {
  if (Array.isArray(obj)) {
    return obj.filter(item => {
      if (typeof item === 'string') {
        return !item.toLowerCase().includes('buffer');
      }
      return cleanBufferContent(item);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        if (!value.toLowerCase().includes('buffer')) {
          cleaned[key] = value;
        }
      } else {
        const cleanedValue = cleanBufferContent(value);
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  return obj;
}

// 清理 navigation.languages 中的 Buffer 相关内容
if (docs.navigation && docs.navigation.languages) {
  docs.navigation.languages = docs.navigation.languages.map(lang => {
    if (lang.groups) {
      lang.groups = lang.groups.filter(group => {
        // 过滤掉包含 "Buffer" 的组
        if (group.group && group.group.toLowerCase().includes('buffer')) {
          return false;
        }
        
        // 过滤掉包含 "buffer" 的页面路径
        if (group.pages) {
          group.pages = group.pages.filter(page => {
            return !page.toLowerCase().includes('buffer');
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
const cleanedDocs = cleanBufferContent(docs);

// 写回文件
fs.writeFileSync(docsPath, JSON.stringify(cleanedDocs, null, 2));

console.log('✅ 已清理 docs.json 中的所有 Buffer 相关内容');
console.log('📝 清理完成，文件已保存');
