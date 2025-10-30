/**
 * Constantes y utilidades para roles de usuario
 */

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  RESPONSABLE: 'responsable',
  VIEWER: 'viewer',
} as const;

// Tipo para roles
export type Role = typeof ROLES[keyof typeof ROLES];

// Traducciones de roles para UI
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.RESPONSABLE]: 'Responsable',
  [ROLES.VIEWER]: 'Visualizador',
};

// Descripciones de roles
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Control total del sistema',
  [ROLES.RESPONSABLE]: 'Aprueba y rechaza facturas asignadas',
  [ROLES.VIEWER]: 'Solo visualización, sin acciones',
};

// Permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canReject: true,
    canViewAll: true,
    canManageUsers: true,
    canManageProviders: true,
    canConfigureEmail: true,
    canViewUsers: true,
    canViewProviders: true,
    canViewFullUserData: true,
  },
  [ROLES.RESPONSABLE]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: true,
    canReject: true,
    canViewAll: false,
    canManageUsers: false,
    canManageProviders: false,
    canConfigureEmail: false,
    canViewUsers: false,
    canViewProviders: false,
    canViewFullUserData: false,
  },
  [ROLES.VIEWER]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canReject: false,
    canViewAll: true,
    canManageUsers: false,
    canManageProviders: false,
    canConfigureEmail: false,
    canViewUsers: true,           // ⭐ NUEVO: Puede ver usuarios
    canViewProviders: true,        // ⭐ NUEVO: Puede ver proveedores
    canViewFullUserData: false,    // ⭐ NUEVO: NO ve datos sensibles completos
  },
};

/**
 * Obtiene la etiqueta traducida de un rol
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as Role] || role;
}

/**
 * Obtiene la descripción de un rol
 */
export function getRoleDescription(role: string): string {
  return ROLE_DESCRIPTIONS[role as Role] || '';
}

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: string, permission: keyof typeof ROLE_PERMISSIONS.admin): boolean {
  const permissions = ROLE_PERMISSIONS[role as Role];
  return permissions ? permissions[permission] : false;
}
