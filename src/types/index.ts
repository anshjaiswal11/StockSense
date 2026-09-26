export type Role = 'inventory_manager' | 'warehouse_staff';

export type OperationType = 'receipt' | 'delivery' | 'internal' | 'adjustment';

export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';

export type UnitOfMeasure = 'Units' | 'kg' | 'm' | 'Liters' | 'Boxes' | 'Rolls';

export interface LocationStock {
  locationId: string;
  quantity: number;
}

export interface ReorderRule {
  minQuantity: number;
  maxQuantity: number;
  targetReorderQuantity: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  uom: UnitOfMeasure;
  description?: string;
  unitCost: number;
  totalStock: number;
  stockPerLocation: Record<string, number>; // locationId -> qty
  reorderRule: ReorderRule;
  barcode: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  name: string; // e.g. "Main Store", "Production Rack", "Rack A", "Rack B", "Dispatch Bay"
  type: 'internal' | 'vendor' | 'customer' | 'loss';
  capacity?: number;
}

export interface Warehouse {
  id: string;
  code: string; // e.g. "WH1", "CENTRAL"
  name: string;
  address: string;
  locations: WarehouseLocation[];
}

export interface OperationItem {
  productId: string;
  productName: string;
  sku: string;
  uom: UnitOfMeasure;
  quantity: number;
  pickedQuantity?: number;
  countedQuantity?: number; // for adjustments
  variance?: number; // for adjustments: counted - recorded
}

export interface StockOperation {
  id: string;
  reference: string; // e.g. WH/IN/0001, WH/OUT/0002, WH/INT/0003, WH/ADJ/0004
  type: OperationType;
  partner?: string; // Supplier name for receipts, Customer for delivery
  contact?: string; // Partner contact phone / email
  scheduledDate?: string; // Scheduled date (YYYY-MM-DD)
  sourceLocationId: string;
  destinationLocationId: string;
  items: OperationItem[];
  status: OperationStatus;
  notes?: string;
  createdAt: string;
  validatedAt?: string;
  responsibleUser: string;
}

export interface StockMoveLedger {
  id: string;
  reference: string;
  operationId: string;
  operationType: OperationType;
  productId: string;
  productName: string;
  sku: string;
  uom: UnitOfMeasure;
  quantity: number;
  sourceLocationId: string;
  sourceLocationName: string;
  destinationLocationId: string;
  destinationLocationName: string;
  timestamp: string;
  responsibleUser: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  loginId?: string;
  phoneNumber?: string;
  role: Role;
  avatar?: string;
}

export interface UserAccount {
  id: string;
  loginId: string;       // 6-12 chars, unique
  email: string;         // unique in database
  phoneNumber: string;   // unique in database
  name: string;
  password: string;      // stored securely
  role: Role;
  createdAt: string;
  phoneVerified: boolean;
}


export interface DashboardKPIs {
  totalProductsCount: number;
  totalInventoryValuation: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  scheduledTransfersCount: number;
}

export interface AIInsight {
  id: string;
  type: 'stockout_risk' | 'anomaly' | 'reorder_suggestion' | 'optimization';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  productId?: string;
  productName?: string;
  recommendedAction?: string;
  daysRemaining?: number;
  suggestedQty?: number;
  createdAt: string;
}
