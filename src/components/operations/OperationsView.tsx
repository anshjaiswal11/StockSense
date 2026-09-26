import React, { useState, useMemo } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Plus,
  Search,
  Download,
  CheckCircle2,
  FileText,
  Sparkles,
  Printer,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  X,
  Trash2,
  Calendar,
  User as UserIcon,
  MapPin,
  Building
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { OperationType, OperationStatus, StockOperation, OperationItem, UnitOfMeasure } from '../../types';
import { StatusBadge } from '../common/Badge';
import { AIService } from '../../services/aiService';

interface OperationsViewProps {
  currentTab: 'receipts' | 'delivery' | 'internal' | 'adjustments' | 'history';
  onOpenNewOperation: (type: OperationType) => void;
}

export const OperationsView: React.FC<OperationsViewProps> = ({ currentTab, onOpenNewOperation }) => {
  const {
    products,
    operations,
    ledger,
    updateOperationStatus,
    exportLedgerToCSV,
    getLocationName,
    createOperation,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list'); // Diagram: "click on kanban or list icon to toggle view"
  const [selectedOperation, setSelectedOperation] = useState<StockOperation | null>(null);

  // Detail Modal Form state (matching Screen 2 in Excalidraw diagram)
  const [editItems, setEditItems] = useState<OperationItem[]>([]);
  const [editPartner, setEditPartner] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editResponsible, setEditResponsible] = useState('');

  // AI OCR Packing slip state
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrText, setOcrText] = useState(
    `PACKING SLIP / INVOICE #INV-8831
Vendor: Apex Steel Industries Ltd.
Destination: Main Store (WH1)
----------------------------------------
Item: Steel Rods (10mm) | SKU: STL-ROD-010 | Qty: 50 kg
Item: Aluminum Sheet 2mm | SKU: MET-ALU-002 | Qty: 20 units`
  );

  const activeOpType: OperationType =
    currentTab === 'receipts'
      ? 'receipt'
      : currentTab === 'delivery'
      ? 'delivery'
      : currentTab === 'internal'
      ? 'internal'
      : 'adjustment';

  // Filtered operations
  const filteredOps = useMemo(() => {
    return operations
      .filter(o => o.type === activeOpType)
      .filter(o => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesRef = o.reference.toLowerCase().includes(q);
          const matchesPartner = (o.partner || '').toLowerCase().includes(q);
          const matchesItem = o.items.some(i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
          return matchesRef || matchesPartner || matchesItem;
        }
        return true;
      });
  }, [operations, activeOpType, statusFilter, search]);

  // Filtered ledger for History tab
  const filteredLedger = useMemo(() => {
    return ledger.filter(l => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l.reference.toLowerCase().includes(q) ||
          l.productName.toLowerCase().includes(q) ||
          l.sku.toLowerCase().includes(q) ||
          l.sourceLocationName.toLowerCase().includes(q) ||
          l.destinationLocationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ledger, search]);

  const handleOpenDetail = (op: StockOperation) => {
    setSelectedOperation(op);
    setEditItems([...op.items]);
    setEditPartner(op.partner || '');
    setEditDate(op.scheduledDate || op.createdAt.split('T')[0]);
    setEditResponsible(op.responsibleUser || 'Warehouse Staff');
  };

  const handleValidate = (opId: string) => {
    const res = updateOperationStatus(opId, 'done');
    if (!res.success && res.error) {
      alert(res.error);
    } else {
      setSelectedOperation(null);
    }
  };

  const handleAdvanceStatus = (op: StockOperation) => {
    let nextStatus: OperationStatus = 'ready';
    if (op.status === 'draft') {
      nextStatus = op.type === 'delivery' ? 'waiting' : 'ready';
    } else if (op.status === 'waiting') {
      nextStatus = 'ready';
    } else if (op.status === 'ready') {
      nextStatus = 'done';
    }

    const res = updateOperationStatus(op.id, nextStatus);
    if (!res.success && res.error) {
      alert(res.error);
    } else if (selectedOperation && selectedOperation.id === op.id) {
      setSelectedOperation({ ...selectedOperation, status: nextStatus });
    }
  };

  const handleCancelOperation = (opId: string) => {
    const res = updateOperationStatus(opId, 'canceled');
    if (res.success) {
      setSelectedOperation(null);
    }
  };

  const handleAddProductLine = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setEditItems(prev => [
      ...prev,
      {
        productId: firstProd.id,
        productName: firstProd.name,
        sku: firstProd.sku,
        uom: firstProd.uom,
        quantity: 1,
      },
    ]);
  };

  const handleProcessOCR = () => {
    const parsed = AIService.parsePackingSlip(ocrText, products);
    if (parsed.length === 0) {
      alert('Could not match any products in catalog from the text.');
      return;
    }

    createOperation({
      type: 'receipt',
      partner: 'Apex Steel Industries (OCR Inbound)',
      contact: '+91 9876543210',
      scheduledDate: new Date().toISOString().split('T')[0],
      sourceLocationId: 'loc-vendors',
      destinationLocationId: 'loc-main-store',
      status: 'ready',
      notes: 'Auto-extracted from Vendor Packing Slip using AI OCR',
      responsibleUser: 'AI OCR Agent',
      items: parsed.map(p => ({
        productId: p.productId,
        productName: p.productName,
        sku: p.sku,
        uom: p.uom as any,
        quantity: p.quantity,
      })),
    });

    setShowOCRModal(false);
    alert(`Successfully generated incoming receipt with ${parsed.length} line items from AI OCR!`);
  };

  // Section Headers
  const tabTitles = {
    receipts: {
      title: 'Receipts',
      desc: 'Used when items arrive from vendors. Increases warehouse stock automatically upon validation.',
      icon: ArrowDownToLine,
      color: 'text-emerald-600',
    },
    delivery: {
      title: 'Delivery',
      desc: 'Used when stock leaves the warehouse for customer shipment. Pick, pack, and validate decreases.',
      icon: ArrowUpFromLine,
      color: 'text-indigo-600',
    },
    internal: {
      title: 'Internal Transfers',
      desc: 'Move stock between locations (e.g. Main Store -> Production Rack). Total stock remains constant.',
      icon: ArrowLeftRight,
      color: 'text-amber-600',
    },
    adjustments: {
      title: 'Adjustments',
      desc: 'Fix mismatches between recorded stock and physical count. System auto-logs variances to ledger.',
      icon: SlidersHorizontal,
      color: 'text-purple-600',
    },
    history: {
      title: 'Move History',
      desc: 'Immutable double-entry inventory audit trail tracking every movement across all facilities.',
      icon: History,
      color: 'text-slate-800',
    },
  };

  const currentInfo = tabTitles[currentTab];
  const TabIcon = currentInfo.icon;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TabIcon className={`w-5 h-5 ${currentInfo.color}`} />
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentInfo.desc}</p>
        </div>

        <div className="flex items-center space-x-2">
          {currentTab === 'receipts' && (
            <button
              onClick={() => setShowOCRModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>AI OCR Slip</span>
            </button>
          )}

          {currentTab === 'history' ? (
            <button
              onClick={exportLedgerToCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger (CSV)</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenNewOperation(activeOpType)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter, Search & View Toggle Bar (Matching Excalidraw: List / Kanban toggle) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reference, partner, SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          {currentTab !== 'history' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="waiting">Waiting</option>
                <option value="ready">Ready</option>
                <option value="done">Done</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          )}

          {/* List View / Kanban View Toggle (Diagram: List/Kanban icon button) */}
          {currentTab !== 'history' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200" title="Toggle List / Kanban View">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View (Default)"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- 1. MOVE HISTORY TABLE (Matching diagram: right_move_history.png) ---------------- */}
      {currentTab === 'history' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-sans text-xs">
                      No stock move history records found.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{l.reference}</td>
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        {new Date(l.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-800">
                        {l.productName}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">{l.sourceLocationName}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{l.destinationLocationName}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {l.quantity > 0 ? `+${l.quantity}` : l.quantity} {l.uom}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Done
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ---------------- 2. KANBAN VIEW (Columns: Draft, Waiting, Ready, Done) ---------------- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['draft', 'waiting', 'ready', 'done'] as OperationStatus[]).map(status => {
            const opsInStatus = filteredOps.filter(o => o.status === status);
            return (
              <div key={status} className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 capitalize">
                    {status}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {opsInStatus.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {opsInStatus.map(op => (
                    <div
                      key={op.id}
                      onClick={() => handleOpenDetail(op)}
                      className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900">{op.reference}</span>
                        <StatusBadge status={op.status} />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate mb-1">
                        {op.partner || 'Internal Operation'}
                      </p>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>{op.items.length} Product line(s)</span>
                        <span>{op.scheduledDate || op.createdAt.split('T')[0]}</span>
                      </div>
                    </div>
                  ))}
                  {opsInStatus.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No records
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ---------------- 3. LIST VIEW (Matching diagram: bottom_center_receipts.png & bottom_right_deliveries.png) ---------------- */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Schedule Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No {activeOpType} records found.
                    </td>
                  </tr>
                ) : (
                  filteredOps.map(op => (
                    <tr
                      key={op.id}
                      onClick={() => handleOpenDetail(op)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {op.reference}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {op.type === 'receipt'
                          ? op.partner || 'Supplier / Vendor'
                          : getLocationName(op.sourceLocationId)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {op.type === 'delivery'
                          ? op.partner || 'Customer'
                          : getLocationName(op.destinationLocationId)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {op.contact || (op.partner ? `${op.partner.toLowerCase().replace(/[\s.]/g, '')}@partner.com` : '+91 9876543210')}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {op.scheduledDate || op.createdAt.split('T')[0]}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={op.status} />
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        {op.status !== 'done' && op.status !== 'canceled' && (
                          <button
                            onClick={() => handleAdvanceStatus(op)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-all cursor-pointer"
                          >
                            {op.status === 'ready' ? 'Validate' : 'Advance'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- 4. DETAILED FORM VIEW MODAL (Matching Screen 2 in Excalidraw) ---------------- */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Top Bar: New | Receipt / Delivery & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Operation
                </span>
                <span className="text-slate-300">|</span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedOperation.type === 'receipt'
                    ? 'Receipt'
                    : selectedOperation.type === 'delivery'
                    ? 'Delivery'
                    : selectedOperation.type.toUpperCase()}
                </h3>
                <span className="font-mono text-sm text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedOperation.reference}
                </span>
              </div>
              <button
                onClick={() => setSelectedOperation(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pipeline Pill (Draft -> Waiting -> Ready -> Done) */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200 mb-6">
              {/* Action Buttons: Validate, Print, Cancel (Directly from diagram) */}
              <div className="flex items-center space-x-2">
                {selectedOperation.status !== 'done' && (
                  <button
                    onClick={() => handleValidate(selectedOperation.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Validate
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                {selectedOperation.status !== 'done' && selectedOperation.status !== 'canceled' && (
                  <button
                    onClick={() => handleCancelOperation(selectedOperation.id)}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-medium text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Status Arrow Pipeline */}
              <div className="flex items-center space-x-1 text-[11px] font-bold">
                <span className={`px-2.5 py-1 rounded-lg ${selectedOperation.status === 'draft' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
                  Draft
                </span>
                <span className="text-slate-300">&rarr;</span>
                {selectedOperation.type === 'delivery' && (
                  <>
                    <span className={`px-2.5 py-1 rounded-lg ${selectedOperation.status === 'waiting' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
                      Waiting
                    </span>
                    <span className="text-slate-300">&rarr;</span>
                  </>
                )}
                <span className={`px-2.5 py-1 rounded-lg ${selectedOperation.status === 'ready' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
                  Ready
                </span>
                <span className="text-slate-300">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${selectedOperation.status === 'done' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
                  Done
                </span>
              </div>
            </div>

            {/* Header Fields Section (Matching diagram) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Receive From / Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {selectedOperation.type === 'receipt' ? 'Receive From (Vendor)' : 'Delivery Address (Customer)'}
                </label>
                <input
                  type="text"
                  value={editPartner}
                  onChange={e => setEditPartner(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Schedule Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Responsible */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Responsible
                </label>
                <input
                  type="text"
                  value={editResponsible}
                  onChange={e => setEditResponsible(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Operation Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operation Type
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedOperation.type.toUpperCase()}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 capitalize"
                />
              </div>
            </div>

            {/* Products Table (Columns: Product, Quantity, + Add a product) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Products
                </h4>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Product</th>
                      <th className="py-2.5 px-4 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          {item.productName}
                          <span className="text-slate-400 font-mono text-[10px] ml-2">({item.sku})</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">
                          {item.quantity} {item.uom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add a product button (Diagram: "Add a product") */}
              {selectedOperation.status !== 'done' && (
                <button
                  type="button"
                  onClick={handleAddProductLine}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a product</span>
                </button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Created: {new Date(selectedOperation.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedOperation(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI OCR Modal */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Packing Slip / Delivery Note OCR</h3>
                <p className="text-xs text-slate-500">Paste delivery slip text to extract and draft incoming receipt</p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={7}
                value={ocrText}
                onChange={e => setOcrText(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
              <p className="text-[11px] text-slate-500">
                The AI will match product names and SKUs from your catalog and detect quantities automatically.
              </p>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowOCRModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessOCR}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Parse & Generate Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
