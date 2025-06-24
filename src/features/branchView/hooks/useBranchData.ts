// =====================================
// BRANCH VIEW - DATA HOOK
// =====================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { AssignedPoster, BranchUser } from '../types';
import { branchService } from '../services/branchService';

export const useBranchData = () => {
  const [user, setUser] = useState<BranchUser | null>(null);
  const [posters, setPosters] = useState<AssignedPoster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const branchUser = branchService.getMockBranchUser();
      setUser(branchUser);
      
      const assignedPosters = await branchService.getAssignedPostersForBranch(branchUser.branchId);
      setPosters(assignedPosters);
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido';
      setError(errorMessage);
      toast.error('No se pudieron cargar los datos de la sucursal.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const updatePosterStatus = useCallback(async (posterId: string, status: 'viewed' | 'printed') => {
    try {
      const success = await branchService.updatePosterStatus(posterId, status);
      if (success) {
        setPosters(prevPosters =>
          prevPosters.map(p =>
            p.id === posterId ? { ...p, status: status } : p
          )
        );
        toast.success(`Cartel marcado como ${status === 'printed' ? 'impreso' : 'visto'}.`);
      } else {
        throw new Error('No se pudo actualizar el estado del cartel.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al actualizar estado.';
      toast.error(errorMessage);
    }
  }, []);

  const downloadPosterFile = useCallback((poster: AssignedPoster) => {
    // Lógica de descarga
    toast(`Iniciando descarga de "${poster.name}"...`);
    // Simular que se marca como visto al descargar
    if (poster.status === 'pending') {
      updatePosterStatus(poster.id, 'viewed');
    }
  }, [updatePosterStatus]);

  const markAsPrinted = useCallback((poster: AssignedPoster) => {
    updatePosterStatus(poster.id, 'printed');
  }, [updatePosterStatus]);

  return {
    user,
    posters,
    isLoading,
    error,
    actions: {
      downloadPosterFile,
      markAsPrinted,
    },
    refreshData: fetchInitialData,
  };
}; 