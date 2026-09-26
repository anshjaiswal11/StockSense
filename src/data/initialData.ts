import { Warehouse, Product, StockOperation, StockMoveLedger, WarehouseLocation } from '../types';

export const INITIAL_LOCATIONS: WarehouseLocation[] = [
  // Virtual locations for Double-Entry
  { id: 'loc-vendors', warehouseId: 'wh-virtual', name: 'Partner Locations / Vendors', type: 'vendor' },
  { id: 'loc-customers', warehouseId: 'wh-virtual', name: 'Partner Locations / Customers', type: 'customer' },
  { id: 'loc-loss', warehouseId: 'wh-virtual', name: 'Virtual / Inventory Adjustments & Loss', type: 'loss' },
  
  // Physical Locations in Main Warehouse (WH1)
  { id: 'loc-main-store', warehouseId: 'wh-1', name: 'Main Store', type: 'internal', capacity: 1500 },
  { id: 'loc-prod-rack', warehouseId: 'wh-1', name: 'Production Rack', type: 'internal', capacity: 800 },
  { id: 'loc-rack-a', warehouseId: 'wh-1', name: 'Rack A (Raw Materials)', type: 'internal', capacity: 600 },
  { id: 'loc-rack-b', warehouseId: 'wh-1', name: 'Rack B (Components)', type: 'internal', capacity: 600 },
  { id: 'loc-dispatch', warehouseId: 'wh-1', name: 'Dispatch Bay', type: 'internal', capacity: 400 },
  
  // Physical Locations in Central Depot (WH2)
  { id: 'loc-wh2-zone1', warehouseId: 'wh-2', name: 'Central Depot - Bulk Zone', type: 'internal', capacity: 2000 },
  { id: 'loc-wh2-zone2', warehouseId: 'wh-2', name: 'Central Depot - Fast Pick', type: 'internal', capacity: 1000 },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH1',
    name: 'Main Manufacturing Warehouse',
    address: 'Plot 42, Industrial Zone A, Tech Park',
    locations: INITIAL_LOCATIONS.filter(l => l.warehouseId === 'wh-1'),
  },
  {
    id: 'wh-2',
    code: 'WH2',
    name: 'Central Distribution Depot',
    address: 'Sector 18, Logistics Hub North',
    locations: INITIAL_LOCATIONS.filter(l => l.warehouseId === 'wh-2'),
  },
];

export const INITIAL_CATEGORIES = [
  'Raw Materials',
  'Finished Goods',
  'Structural Steel',
  'Hardware & Fasteners',
  'Office Furniture',
  'Electronics',
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_OPERATIONS: StockOperation[] = [];

export const INITIAL_LEDGER: StockMoveLedger[] = [];
