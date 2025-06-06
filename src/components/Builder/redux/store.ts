import { configureStore } from '@reduxjs/toolkit';
import builderReducer from './builderSlice';
import templatesReducer from './templatesSlice';
import assetsReducer from './assetsSlice';
import organizationReducer from './organizationSlice';
import aiReducer from './aiSlice';

// ====================================
// CONFIGURACIÓN DEL STORE
// ====================================

export const store = configureStore({
  reducer: {
    builder: builderReducer,
    templates: templatesReducer,
    assets: assetsReducer,
    organization: organizationReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas actions que contienen datos no serializables
        ignoredActions: [
          'assets/uploadAsset/pending',
          'assets/uploadAsset/fulfilled',
          'ai/generateContent/pending',
          'ai/generateContent/fulfilled',
        ],
        // Ignorar estos paths en el estado que pueden contener datos no serializables
        ignoredPaths: [
          'assets.uploads',
          'ai.generations.input.image',
          'ai.generations.output.image',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ====================================
// TIPOS
// ====================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ====================================
// HOOKS TIPADOS
// ====================================

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ====================================
// INICIALIZACIÓN DE DATOS MOCK
// ====================================

// Función para poblar el store con datos de ejemplo
export const initializeMockData = () => {
  // Esta función se puede llamar para poblar el store con datos de prueba
  // En una aplicación real, esto vendría del servidor
  
  return {
    // Datos de organización mock
    organization: {
      id: 'org-demo',
      name: 'supermercado-demo',
      displayName: 'Supermercado Demo'
    },
    
    // Usuario mock
    user: {
      id: 'user-1',
      email: 'admin@supermercado.com',
      firstName: 'Admin',
      lastName: 'Demo',
      roles: ['admin']
    },
    
    // Templates mock
    templates: [
      {
        id: 'template-1',
        name: 'Oferta Especial',
        category: 'promociones',
        thumbnail: '/templates/oferta-especial.jpg'
      }
    ],
    
    // Assets mock
    assets: [
      {
        id: 'asset-1',
        name: 'Logo Principal',
        type: 'logo',
        url: '/assets/logo-principal.svg'
      }
    ]
  };
};

export default store; 