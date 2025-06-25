// Exportar el sistema anterior (legacy)
export { PosterEditor } from './PosterEditor';
export { PreviewArea } from './Editor/PreviewArea';

// Exportar el nuevo sistema dinámico V3
export { PosterEditorV3 } from './PosterEditorV3';
export { PreviewAreaV3 } from './Editor/PreviewAreaV3';
export { BuilderTemplateRenderer } from './Editor/Renderers/BuilderTemplateRenderer';

// Exportar servicios relacionados
export { posterTemplateService } from '../../../../services/posterTemplateService';
export type { PosterFamilyData, PosterTemplateData } from '../../../../services/posterTemplateService'; 