const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            // Excluir node_modules y .git
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            // Solo incluir archivos relevantes
            if (['.ts', '.tsx', '.js', '.jsx', '.css', '.html'].includes(path.extname(file))) {
                const content = fs.readFileSync(fullPath, 'utf8');
                arrayOfFiles.push({
                    path: fullPath,
                    content: content
                });
            }
        }
    });

    return arrayOfFiles;
}

// Ejecutar desde la raíz del proyecto
const projectFiles = getAllFiles('.');

// Formatear la salida
const output = projectFiles.map(file => {
    return `
=== ${file.path} ===
${file.content}
`;
}).join('\n');

// Guardar en un archivo
fs.writeFileSync('project-files.txt', output);

console.log('Archivos guardados en project-files.txt'); 