import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  Warehouse,
  StockOperation,
  StockMoveLedger,
  WarehouseLocation,
  DashboardKPIs,
  OperationType,
  OperationStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_OPERATIONS,
  INITIAL_LEDGER,
  INITIAL_CATEGORIES,
} from '../data/initialData';

interface InventoryContextType {
  products: Product[];
  warehouses: Warehouse[];
  locations: WarehouseLocation[];
  operations: StockOperation[];
  ledger: StockMoveLedger[];
  categories: string[];
  kpis: DashboardKPIs;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'totalStock'> & { initialLocationId?: string; initialStock?: number }) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Warehouse & Location actions
  addWarehouse: (wh: Omit<Warehouse, 'id' | 'locations'>) => void;
  addLocation: (loc: Omit<WarehouseLocation, 'id'>) => void;
  // Operations actions
  createOperation: (op: Omit<StockOperation, 'id' | 'reference' | 'createdAt'>) => string;
  updateOperationStatus: (id: string, status: OperationStatus, userName?: string) => { success: boolean; error?: string };
  deleteOperation: (id: string) => void;
  // Quick AI helper actions
  autoCreateReorderReceipt: (productId: string, quantity: number, supplierName?: string) => string;
  resetDemoData: () => void;
  exportLedgerToCSV: () => void;
  getLocationName: (locationId: string) => string;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('stocksense_products');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(p => p.id === 'prod-1' || p.id === 'prod-2' || p.id === 'prod-3')) {
        localStorage.removeItem('stocksense_products');
        localStorage.removeItem('stocksense_operations');
        localStorage.removeItem('stocksense_ledger');
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('stocksense_warehouses');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [locations, setLocations] = useState<WarehouseLocation[]>(() => {
    const saved = localStorage.getItem('stocksense_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [operations, setOperations] = useState<StockOperation[]>(() => {
    const saved = localStorage.getItem('stocksense_operations');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(o => o.id === 'op-rcpt-001' || o.id === 'op-out-001')) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const [ledger, setLedger] = useState<StockMoveLedger[]>(() => {
    const saved = localStorage.getItem('stocksense_ledger');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.some(l => l.id === 'ledger-001' || l.id === 'ledger-002')) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('stocksense_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('stocksense_gemini_key') || '';
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('stocksense_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('stocksense_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('stocksense_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('stocksense_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem('stocksense_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('stocksense_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('stocksense_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  // Dynamic KPIs calculated in real-time
  const kpis: DashboardKPIs = useMemo(() => {
    const totalProductsCount = products.length;
    const totalInventoryValuation = products.reduce((acc, p) => acc + (p.totalStock * p.unitCost), 0);
    const lowStockItemsCount = products.filter(p => p.totalStock > 0 && p.totalStock <= p.reorderRule.minQuantity).length;
    const outOfStockItemsCount = products.filter(p => p.totalStock === 0).length;
    const pendingReceiptsCount = operations.filter(o => o.type === 'receipt' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;
    const pendingDeliveriesCount = operations.filter(o => o.type === 'delivery' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;
    const scheduledTransfersCount = operations.filter(o => o.type === 'internal' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;

    return {
      totalProductsCount,
      totalInventoryValuation,
      lowStockItemsCount,
      outOfStockItemsCount,
      pendingReceiptsCount,
      pendingDeliveriesCount,
      scheduledTransfersCount,
    };
  }, [products, operations]);

  const getLocationName = (locationId: string): string => {
    const loc = locations.find(l => l.id === locationId);
    return loc ? loc.name : locationId;
  };

  // Add Product
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'totalStock'> & { initialLocationId?: string; initialStock?: number }) => {
    const id = `prod-${Date.now()}`;
    const initialQty = Number(productData.initialStock) || 0;
    const locId = productData.initialLocationId || 'loc-main-store';

    const stockPerLoc = { ...productData.stockPerLocation };
    if (initialQty > 0) {
      stockPerLoc[locId] = (stockPerLoc[locId] || 0) + initialQty;
    }

    const newProduct: Product = {
      ...productData,
      id,
      totalStock: initialQty,
      stockPerLocation: stockPerLoc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    // If initial stock > 0, log an initial receipt move in ledger
    if (initialQty > 0) {
      const ref = `WH/IN/${String(operations.length + 1).padStart(4, '0')}`;
      const newLedger: StockMoveLedger = {
        id: `ledger-${Date.now()}`,
        reference: ref,
        operationId: `op-init-${id}`,
        operationType: 'receipt',
        productId: id,
        productName: newProduct.name,
        sku: newProduct.sku,
        uom: newProduct.uom,
        quantity: initialQty,
        sourceLocationId: 'loc-vendors',
        sourceLocationName: 'Initial Opening Balance',
        destinationLocationId: locId,
        destinationLocationName: getLocationName(locId),
        timestamp: new Date().toISOString(),
        responsibleUser: 'System Initializer',
      };
      setLedger(prev => [newLedger, ...prev]);
    }
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
          // Recalculate totalStock from locations
          const totalStock = Object.values(updated.stockPerLocation).reduce((a, b) => a + (Number(b) || 0), 0);
          return { ...updated, totalStock };
        }
        return p;
      })
    );
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Add Warehouse
  const addWarehouse = (whData: Omit<Warehouse, 'id' | 'locations'>) => {
    const id = `wh-${Date.now()}`;
    const defaultLocation: WarehouseLocation = {
      id: `loc-${id}-main`,
      warehouseId: id,
      name: `${whData.name} - General Storage`,
      type: 'internal',
      capacity: 1000,
    };

    const newWh: Warehouse = {
      ...whData,
      id,
      locations: [defaultLocation],
    };

    setWarehouses(prev => [...prev, newWh]);
    setLocations(prev => [...prev, defaultLocation]);
  };

  // Add Location
  const addLocation = (locData: Omit<WarehouseLocation, 'id'>) => {
    const id = `loc-${Date.now()}`;
    const newLoc: WarehouseLocation = { ...locData, id };
    setLocations(prev => [...prev, newLoc]);
    setWarehouses(prev =>
      prev.map(wh => {
        if (wh.id === locData.warehouseId) {
          return { ...wh, locations: [...wh.locations, newLoc] };
        }
        return wh;
      })
    );
  };

  // Generate Reference Number
  const generateRef = (type: OperationType): string => {
    const prefixMap: Record<OperationType, string> = {
      receipt: 'WH/IN',
      delivery: 'WH/OUT',
      internal: 'WH/INT',
      adjustment: 'WH/ADJ',
    };
    const count = operations.filter(o => o.type === type).length + 1;
    return `${prefixMap[type]}/${String(count).padStart(4, '0')}`;
  };

  // Create Operation
  const createOperation = (opData: Omit<StockOperation, 'id' | 'reference' | 'createdAt'>): string => {
    const id = `op-${Date.now()}`;
    const reference = generateRef(opData.type);
    const newOp: StockOperation = {
      ...opData,
      id,
      reference,
      createdAt: new Date().toISOString(),
    };

    setOperations(prev => [newOp, ...prev]);

    // If status is immediately set to 'done' (e.g. instant validation)
    if (newOp.status === 'done') {
      executeStockMovement(newOp);
    }

    return id;
  };

  // Execute Double-Entry Stock Movement
  const executeStockMovement = (op: StockOperation, user = 'Operator') => {
    const now = new Date().toISOString();
    const newLedgerEntries: StockMoveLedger[] = [];

    setProducts(prevProducts => {
      const nextProducts = [...prevProducts];

      op.items.forEach(item => {
        const prodIndex = nextProducts.findIndex(p => p.id === item.productId);
        if (prodIndex === -1) return;

        const prod = { ...nextProducts[prodIndex] };
        const locStock = { ...prod.stockPerLocation };

        if (op.type === 'receipt') {
          // Increase stock at destination location
          const qty = item.pickedQuantity ?? item.quantity;
          locStock[op.destinationLocationId] = (locStock[op.destinationLocationId] || 0) + qty;
          prod.stockPerLocation = locStock;
          prod.totalStock = Object.values(locStock).reduce((a, b) => a + (Number(b) || 0), 0);
          prod.updatedAt = now;

          newLedgerEntries.push({
            id: `ledger-${Date.now()}-${item.productId}`,
            reference: op.reference,
            operationId: op.id,
            operationType: op.type,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            quantity: qty,
            sourceLocationId: op.sourceLocationId,
            sourceLocationName: getLocationName(op.sourceLocationId),
            destinationLocationId: op.destinationLocationId,
            destinationLocationName: getLocationName(op.destinationLocationId),
            timestamp: now,
            responsibleUser: user,
          });
        } else if (op.type === 'delivery') {
          // Decrease stock from source location
          const qty = item.pickedQuantity ?? item.quantity;
          const currentQty = locStock[op.sourceLocationId] || 0;
          locStock[op.sourceLocationId] = Math.max(0, currentQty - qty);
          prod.stockPerLocation = locStock;
          prod.totalStock = Object.values(locStock).reduce((a, b) => a + (Number(b) || 0), 0);
          prod.updatedAt = now;

          newLedgerEntries.push({
            id: `ledger-${Date.now()}-${item.productId}`,
            reference: op.reference,
            operationId: op.id,
            operationType: op.type,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            quantity: -qty,
            sourceLocationId: op.sourceLocationId,
            sourceLocationName: getLocationName(op.sourceLocationId),
            destinationLocationId: op.destinationLocationId,
            destinationLocationName: getLocationName(op.destinationLocationId),
            timestamp: now,
            responsibleUser: user,
          });
        } else if (op.type === 'internal') {
          // Transfer from source to destination location: Total stock is unchanged!
          const qty = item.quantity;
          const sourceCurrent = locStock[op.sourceLocationId] || 0;
          locStock[op.sourceLocationId] = Math.max(0, sourceCurrent - qty);
          locStock[op.destinationLocationId] = (locStock[op.destinationLocationId] || 0) + qty;
          prod.stockPerLocation = locStock;
          prod.totalStock = Object.values(locStock).reduce((a, b) => a + (Number(b) || 0), 0);
          prod.updatedAt = now;

          newLedgerEntries.push({
            id: `ledger-${Date.now()}-${item.productId}`,
            reference: op.reference,
            operationId: op.id,
            operationType: op.type,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            quantity: qty,
            sourceLocationId: op.sourceLocationId,
            sourceLocationName: getLocationName(op.sourceLocationId),
            destinationLocationId: op.destinationLocationId,
            destinationLocationName: getLocationName(op.destinationLocationId),
            timestamp: now,
            responsibleUser: user,
          });
        } else if (op.type === 'adjustment') {
          // Physical inventory adjustment: variance = counted - recorded
          const counted = item.countedQuantity ?? item.quantity;
          const current = locStock[op.sourceLocationId] || 0;
          const variance = counted - current;

          locStock[op.sourceLocationId] = counted;
          prod.stockPerLocation = locStock;
          prod.totalStock = Object.values(locStock).reduce((a, b) => a + (Number(b) || 0), 0);
          prod.updatedAt = now;

          newLedgerEntries.push({
            id: `ledger-${Date.now()}-${item.productId}`,
            reference: op.reference,
            operationId: op.id,
            operationType: op.type,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            uom: prod.uom,
            quantity: variance,
            sourceLocationId: op.sourceLocationId,
            sourceLocationName: getLocationName(op.sourceLocationId),
            destinationLocationId: op.destinationLocationId,
            destinationLocationName: getLocationName(op.destinationLocationId),
            timestamp: now,
            responsibleUser: user,
          });
        }

        nextProducts[prodIndex] = prod;
      });

      return nextProducts;
    });

    if (newLedgerEntries.length > 0) {
      setLedger(prev => [...newLedgerEntries, ...prev]);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore in tests
    }
  };

  // Update Operation Status
  const updateOperationStatus = (id: string, newStatus: OperationStatus, userName = 'Ansh Jaiswal (Manager)') => {
    const op = operations.find(o => o.id === id);
    if (!op) return { success: false, error: 'Operation not found' };

    if (op.status === 'done' && newStatus !== 'done') {
      return { success: false, error: 'Cannot modify an already validated (Done) operation.' };
    }

    // Check stock availability if validating delivery
    if (newStatus === 'done' && op.type === 'delivery') {
      for (const item of op.items) {
        const prod = products.find(p => p.id === item.productId);
        const availableInLoc = prod?.stockPerLocation[op.sourceLocationId] || 0;
        const requested = item.pickedQuantity ?? item.quantity;
        if (availableInLoc < requested) {
          return {
            success: false,
            error: `Insufficient stock for "${item.productName}" at ${getLocationName(op.sourceLocationId)}. Required: ${requested}, Available: ${availableInLoc}`,
          };
        }
      }
    }

    // Update operation status
    setOperations(prev =>
      prev.map(o => {
        if (o.id === id) {
          return {
            ...o,
            status: newStatus,
            validatedAt: newStatus === 'done' ? new Date().toISOString() : o.validatedAt,
            responsibleUser: userName || o.responsibleUser,
          };
        }
        return o;
      })
    );

    // If transitioned to Done, execute the inventory moves
    if (newStatus === 'done' && op.status !== 'done') {
      executeStockMovement(op, userName);
    }

    return { success: true };
  };

  // Delete Operation
  const deleteOperation = (id: string) => {
    setOperations(prev => prev.filter(o => o.id !== id));
  };

  // AI Reorder helper
  const autoCreateReorderReceipt = (productId: string, quantity: number, supplierName = 'Apex Global Supply'): string => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return '';

    const newOpId = createOperation({
      type: 'receipt',
      partner: supplierName,
      sourceLocationId: 'loc-vendors',
      destinationLocationId: 'loc-main-store',
      status: 'waiting',
      notes: `AI-Recommended replenishment order. Min buffer: ${prod.reorderRule.minQuantity} ${prod.uom}`,
      responsibleUser: 'StockSense AI Agent',
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          uom: prod.uom,
          quantity: quantity > 0 ? quantity : prod.reorderRule.targetReorderQuantity,
        },
      ],
    });

    return newOpId;
  };

  // Export Ledger to CSV
  const exportLedgerToCSV = () => {
    const headers = ['Reference', 'Operation', 'Date', 'SKU', 'Product Name', 'Quantity', 'UoM', 'Source Location', 'Destination Location', 'User'];
    const rows = ledger.map(l => [
      `"${l.reference}"`,
      `"${l.operationType.toUpperCase()}"`,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.sku}"`,
      `"${l.productName.replace(/"/g, '""')}"`,
      l.quantity,
      `"${l.uom}"`,
      `"${l.sourceLocationName}"`,
      `"${l.destinationLocationName}"`,
      `"${l.responsibleUser}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to default data
  const resetDemoData = () => {
    localStorage.removeItem('stocksense_products');
    localStorage.removeItem('stocksense_warehouses');
    localStorage.removeItem('stocksense_locations');
    localStorage.removeItem('stocksense_operations');
    localStorage.removeItem('stocksense_ledger');
    localStorage.removeItem('stocksense_categories');

    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setLocations(INITIAL_LOCATIONS);
    setOperations(INITIAL_OPERATIONS);
    setLedger(INITIAL_LEDGER);
    setCategories(INITIAL_CATEGORIES);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        warehouses,
        locations,
        operations,
        ledger,
        categories,
        kpis,
        geminiApiKey,
        setGeminiApiKey,
        addProduct,
        updateProduct,
        deleteProduct,
        addWarehouse,
        addLocation,
        createOperation,
        updateOperationStatus,
        deleteOperation,
        autoCreateReorderReceipt,
        resetDemoData,
        exportLedgerToCSV,
        getLocationName,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
