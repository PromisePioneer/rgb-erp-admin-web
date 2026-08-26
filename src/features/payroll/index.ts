/**
 * Payroll Feature Module
 * Exports all payroll-related types, API, store, and components
 */

// Types
export * from './types/payroll.types'

// API
export { payrollApi } from './api/payroll-api'

// Store
export { usePayrollStore } from './store/payroll-store'

// Components
export { PayrollTable } from './components/payroll-table'
export { PayrollGenerateDialog } from './components/payroll-generate-dialog'
export { PayrollPayslipModal } from './components/payroll-payslip-modal'
