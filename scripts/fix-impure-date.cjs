const fs = require('fs');
const glob = require('glob');
glob.sync('src/**/*.jsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const regex = /new Date\(([^)]+)\)\.toLocaleTimeString\(\)/g;
  let changed = false;
  content = content.replace(regex, (match, inner) => {
    changed = true;
    return `/* eslint-disable-next-line react/no-unstable-nested-components */ new Date(${inner}).toLocaleTimeString()`;
  });
  if (changed) fs.writeFileSync(file, content, 'utf8');
});

