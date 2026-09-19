/**
 * Role Mobile Privilege Type Definitions
 * API endpoint: /api/admin/roles/{id}/mobile-privileges
 */

export interface MobilePrivilege {
  id: number
  key: string
  name: string
  has_privilege: boolean
}

export interface RoleMobilePrivilegesResponse {
  role_id: number
  role_name: string
  mobile_privileges: MobilePrivilege[]
}

export interface UpdateMobilePrivilegesPayload {
  mobile_privileges: {
    id: number
    has_privilege: boolean
  }[]
}
