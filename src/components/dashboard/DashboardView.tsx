import React, { useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { OperationType, OperationStatus } from '../../types';
import { StatusBadge, TypeBadge } from '../common/Badge';

interface DashboardViewProps {
  onOpenNewOperation: (type?: OperationType) => void;
  onNavigateTab: (tab: any) => void;
  onSelectOperation?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewOperation,
  onNavigateTab,
}) => {
  const { products, operations, locations, categories, kpis, updateOperationStatus, autoCreateReorderReceipt, getLocationName } = useInventory();

  // Dynamic filter states according to PDF spec
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered operations list
  const filteredOperations = useMemo(() => {
    return operations.filter(op => {
      if (filterType !== 'all' && op.type !== filterType) return false;
      if (filterStatus !== 'all' && op.status !== filterStatus) return false;
      if (filterLocation !== 'all' && op.sourceLocationId !== filterLocation && op.destinationLocationId !== filterLocation) {
        return false;
      }
      if (filterCategory !== 'all') {
        const matchesCategory = op.items.some(item => {
          const prod = products.find(p => p.id === item.productId);
          return prod?.category === filterCategory;
        });
        if (!matchesCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = op.reference.toLowerCase().includes(q);
        const matchesPartner = (op.partner || '').toLowerCase().includes(q);
        const matchesItem = op.items.some(i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
        if (!matchesRef && !matchesPartner && !matchesItem) return false;
      }
      return true;
    });
  }, [operations, filterType, filterStatus, filterLocation, filterCategory, searchQuery, products]);

  // Urgent low-stock products
  const criticalItems = useMemo(() => {
    return products.filter(p => p.totalStock <= p.reorderRule.minQuantity);
  }, [products]);

  const handleValidateNow = (opId: string) => {
    const res = updateOperationStatus(opId, 'done');
    if (!res.success && res.error) {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Inventory Operations Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Live Real-Time
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock ledger, pending transfers, dock receipts, and AI-assisted fulfillment.
          </p>
        </div>

        {/* Quick Operation Creation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenNewOperation('receipt')}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>New Receipt</span>
          </button>
          <button
            onClick={() => onOpenNewOperation('delivery')}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>New Delivery</span>
          </button>
          <button
            onClick={() => onOpenNewOperation('internal')}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Internal Transfer</span>
          </button>
          <button
            onClick={() => onOpenNewOperation('adjustment')}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Total Products & Valuation */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.totalProductsCount}</div>
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 -mr-0.5" />
            <span>Valuation: <strong>${kpis.totalInventoryValuation.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* KPI 2: Low Stock / Out of Stock */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white p-4 rounded-xl border border-rose-200 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low / Out of Stock</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {kpis.lowStockItemsCount + kpis.outOfStockItemsCount}
          </div>
          <div className="mt-1 text-xs text-rose-700 flex items-center gap-1 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{kpis.outOfStockItemsCount} out of stock</span>
          </div>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div
          onClick={() => onNavigateTab('receipts')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Receipts</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.pendingReceiptsCount}</div>
          <p className="mt-1 text-xs text-slate-500">Awaiting vendor dock arrival</p>
        </div>

        {/* KPI 4: Pending Deliveries */}
        <div
          onClick={() => onNavigateTab('delivery')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Deliveries</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.pendingDeliveriesCount}</div>
          <p className="mt-1 text-xs text-slate-500">Orders in picking & packing</p>
        </div>

        {/* KPI 5: Internal Transfers Scheduled */}
        <div
          onClick={() => onNavigateTab('internal')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Transfers Scheduled</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.scheduledTransfersCount}</div>
          <p className="mt-1 text-xs text-slate-500">Rack & zone movements</p>
        </div>
      </div>

      {/* Low Stock Alerts Banner (if any) */}
      {criticalItems.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                AI Stockout Alert: {criticalItems.length} Products Require Immediate Replenishment
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {criticalItems.map(p => `${p.name} (${p.totalStock} ${p.uom} left)`).join(' • ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              criticalItems.forEach(item => {
                autoCreateReorderReceipt(item.id, item.reorderRule.targetReorderQuantity);
              });
              alert(`AI has generated ${criticalItems.length} replenishment receipts! Check the Receipts tab.`);
            }}
            className="self-start md:self-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            AI Auto-Replenish All ({criticalItems.length})
          </button>
        </div>
      )}

      {/* Dynamic Filters Section matching Problem Statement */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Dynamic Operational Filters</span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, SKU, supplier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 1. By Document Type */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Document Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Document Types</option>
              <option value="receipt">Receipts (Incoming)</option>
              <option value="delivery">Delivery Orders (Outgoing)</option>
              <option value="internal">Internal Transfers</option>
              <option value="adjustment">Stock Adjustments</option>
            </select>
          </div>

          {/* 2. By Status */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          {/* 3. By Warehouse or Location */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Warehouse / Location</label>
            <select
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. By Product Category */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Product Category</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900">Operations Feed</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {filteredOperations.length} records
            </span>
          </div>

          <button
            onClick={() => onOpenNewOperation('receipt')}
            className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Operation</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Partner / Destination</th>
                <th className="py-3 px-4">From &rarr; To</th>
                <th className="py-3 px-4">Products & Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No operations match the selected dynamic filters.
                  </td>
                </tr>
              ) : (
                filteredOperations.map(op => (
                  <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {op.reference}
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={op.type} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {op.partner || 'Internal Facility'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">{getLocationName(op.sourceLocationId)}</span>
                      <span className="mx-1 text-slate-400">&rarr;</span>
                      <span className="font-semibold text-slate-700">{getLocationName(op.destinationLocationId)}</span>
                    </td>
                    <td className="py-3 px-4">
                      {op.items.map(i => (
                        <div key={i.productId} className="leading-tight">
                          <span className="font-semibold text-slate-800">{i.productName}</span>
                          <span className="text-slate-500 text-[11px] ml-1">
                            ({i.quantity} {i.uom})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={op.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {op.status !== 'done' && op.status !== 'canceled' ? (
                        <button
                          onClick={() => handleValidateNow(op.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-all active:scale-95"
                          title="Validate movement and update inventory ledger"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Validate</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Validated</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
