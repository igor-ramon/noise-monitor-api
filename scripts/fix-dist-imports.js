import fs from 'fs';
import path from 'path';

function fixImports(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      content = content.replace(/from\s+['"](\..*?)['"]/g, (match, importPath) => {
        const resolvedPath = path.resolve(path.dirname(fullPath), importPath);

        try {
          const stats = fs.statSync(resolvedPath);

          if (stats.isDirectory()) {
            return `from '${importPath}/index.js'`;
          } else if (stats.isFile()) {
            return `from '${importPath}.js'`;
          }
        } catch (err) {
          return `from '${importPath}.js'`;
        }

        return match;
      });

      fs.writeFileSync(fullPath, content, 'utf-8');
    }
  }
}

fixImports(path.resolve('dist'));
