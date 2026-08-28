/**
 * Position Privileges Types
 */
export interface MobilePrivilege {
  id: number
  key: string
  name: string
  status: number
}

export interface PositionPrivilege {
  id: number
  position_id: number
  mobile_privilege_id: number
  status: number
}

export interface Position {
  id: number
  name: string
  status: number
}

export interface PositionPrivilegesResponse {
  position: Position
  mobile_privileges: MobilePrivilege[]
  privilege_status: Record<number, number>
}

export interface UpdatePrivilegesPayload {
  privilege: Record<number, number>
}
