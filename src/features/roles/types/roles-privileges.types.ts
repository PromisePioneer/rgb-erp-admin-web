/**
 * Role Privilege Type Definitions
 * API endpoint: /api/admin/roles/{id}/privileges
 */

export interface PrivilegeChild {
  id: number
  name: string
  feature: string | null
  has_privilege: boolean
}

export interface PrivilegeGroup {
  id: number
  name: string
  has_privilege: boolean
  children: PrivilegeChild[]
}

export interface RolePrivilegesResponse {
  role_id: number
  role_name: string
  privileges: PrivilegeGroup[]
}

export interface UpdatePrivilegesPayload {
  privileges: {
    id: number
    has_privilege: boolean
  }[]
}
