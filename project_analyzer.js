import { promises as fs } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const excludeDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage']);
const excludeExtensions = new Set(['.exe', '.dll', '.so', '.class']);

async function readFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        
        return {
            path: filePath,
            size: stats.size,
            extension: extname(filePath),
            content: content
        };
    } catch (error) {
        console.error(`Error al leer el archivo ${filePath}: ${error.message}`);
        return null;
    }
}

async function scanDirectory(directoryPath, rootPath) {
    const files = [];
    
    try {
        const entries = await fs.readdir(directoryPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = join(directoryPath, entry.name);
            const relativePath = relative(rootPath, fullPath);
            
            // Ignorar directorios excluidos
            if (entry.isDirectory()) {
                if (!excludeDirs.has(entry.name)) {
                    const subDirFiles = await scanDirectory(fullPath, rootPath);
                    files.push(...subDirFiles);
                }
            } else {
                // Ignorar extensiones excluidas
                const fileExtension = extname(entry.name);
                if (!excludeExtensions.has(fileExtension)) {
                    const fileInfo = await readFile(fullPath);
                    if (fileInfo) {
                        fileInfo.path = relativePath; // Usar ruta relativa
                        files.push(fileInfo);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error al escanear el directorio ${directoryPath}: ${error.message}`);
    }
    
    return files;
}

async function analyzeProject(projectPath) {
    try {
        const projectStructure = {
            timestamp: new Date().toISOString(),
            root_path: projectPath,
            files: []
        };

        projectStructure.files = await scanDirectory(projectPath, projectPath);

        // Guardar el resultado en un archivo JSON
        const outputFile = 'project_analysis.json';
        await fs.writeFile(
            outputFile, 
            JSON.stringify(projectStructure, null, 2),
            'utf-8'
        );

        console.log(`Análisis completado. Resultado guardado en ${outputFile}`);
    } catch (error) {
        console.error('Error durante el análisis:', error.message);
    }
}

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ejecutar el análisis usando el directorio actual
analyzeProject(process.cwd())
    .catch(error => console.error('Error en la ejecución:', error.message)); 