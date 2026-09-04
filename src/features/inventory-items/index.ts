/**
 * Inventory Items Feature (Legacy)
 * Re-exported from unified inventory module for backwards compatibility
 */

// Re-export from unified inventory module
export * from '@/features/inventory/api/inventory-api'

// Legacy exports for backwards compatibility
export { InventoryPage } from './components/inventory-page'
export { BarcodeScanner } from './components/barcode-scanner'
export { InventoryTable } from './components/inventory-table'
export { useInventoryStore } from './store/inventory-items-store'
export { inventoryApi } from './api/inventory-items-api'

// Legacy types re-export
export type {
  InventoryItem,
  InventoryFilters,
  InventoryItemSummary,
  MoveItemPayload,
  ReturnItemPayload,
  UpdateStatusPayload,
} from '@/features/inventory/api/inventory-api'
