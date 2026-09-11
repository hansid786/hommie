const fs = require('fs');
const { execSync } = require('child_process');
const eslintReport = JSON.parse(execSync('npx eslint . --ext .js,.jsx -f json', { encoding: 'utf8' }));
eslintReport.forEach(({ filePath, messages }) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  messages.filter(m => m.ruleId === 'no-unused-vars').forEach(m => {
    const match = m.message.match(/'([^']+)' is imported here/);
    if (!match) return;
    const name = match[1];
    const importRegex = new RegExp(`(import\\s+\\{[^}]*?)\\b${name}\\b\\s*,?\\s*([^}]*\\}\\s+from\\s+['"][^'"]+['"];?)`, 'g');
    content = content.replace(importRegex, (full, start, end) => {
      const newImport = `${start}${end}`.replace(/,\s*,/g, ',').replace(/\{,\s*/g, '{').replace(/,\s*\}/g, '}');
      changed = true;
      return newImport;
    });
  });
  content = content.replace(/import\s+\{\s*\}\s+from\s+['"][^'"]+['"];?\n/g, () => (changed = true, ''));
  if (changed) fs.writeFileSync(filePath, content, 'utf8');
});

