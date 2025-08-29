// 🚨 DEPRECATED: usePermissions hook movido a PermissionsContext.tsx
// Este archivo se mantiene solo para compatibilidad temporal
// Importar desde '../contexts/PermissionsContext' en su lugar

export { 
  usePermissions,
  useHasPermission,
  useHasPermissions,
  useUserGroups,
  useCanViewAllGroups,
  usePermissionsByCategory 
} from '../contexts/PermissionsContext';
