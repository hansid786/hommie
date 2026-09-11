const fs = require('fs');
const { execSync } = require('child_process');
const eslintReport = JSON.parse(execSync('npx eslint . --ext .js,.jsx -f json', { encoding: 'utf8' }));
eslintReport.forEach(({ filePath, messages }) => {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let changed = false;
  messages.filter(m => m.ruleId === 'react-hooks/exhaustive-deps').forEach(m => {
    const depMatch = m.message.match(/missing dependency: '(.*?)'/);
    if (!depMatch) return;
    const dep = depMatch[1];
    const lineIdx = m.line - 1;
    const line = lines[lineIdx];
    const arrMatch = line.match(/\[([^\]]*)\]/);
    if (arrMatch) {
      const deps = arrMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      if (!deps.includes(dep)) {
        deps.push(dep);
        lines[lineIdx] = line.replace(/\[.*\]/, `[${deps.join(', ')}]`);
        changed = true;
      }
    }
  });
  if (changed) fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
});

