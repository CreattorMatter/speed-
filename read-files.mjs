import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = join(dirPath, file);
        
        if (statSync(fullPath).isDirectory()) {
            // Excluir node_modules y .git
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            // Solo incluir archivos relevantes
            if (['.ts', '.tsx', '.js', '.jsx', '.css', '.html'].includes(extname(file))) {
                const content = readFileSync(fullPath, 'utf8');
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
writeFileSync('project-files.txt', output);

console.log('Archivos guardados en project-files.txt'); 