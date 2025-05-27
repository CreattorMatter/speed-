import { configureStore } from '@reduxjs/toolkit';
import posterReducer from './features/poster/posterSlice';

// Importaremos los reducers aquí cuando los creemos
// import posterReducer from './features/poster/posterSlice';

export const store = configureStore({
  reducer: {
    poster: posterReducer,
    // Aquí agregarás tus otros slices de estado en el futuro
  },
});

// Inferir los tipos `RootState` y `AppDispatch` del propio store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;