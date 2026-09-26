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
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { OperationType, OperationStatus, StockOperation } from '../../types';
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
  const [selectedOperation, setSelectedOperation] = useState<StockOperation | null>(null);

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

  const handleValidate = (opId: string) => {
    const res = updateOperationStatus(opId, 'done');
    if (!res.success && res.error) {
      alert(res.error);
    }
  };

  const handleAdvanceStatus = (op: StockOperation) => {
    let nextStatus: OperationStatus = 'ready';
    if (op.status === 'draft') nextStatus = 'waiting';
    else if (op.status === 'waiting') nextStatus = 'ready';
    else if (op.status === 'ready') nextStatus = 'done';

    const res = updateOperationStatus(op.id, nextStatus);
    if (!res.success && res.error) {
      alert(res.error);
    }
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
      title: 'Incoming Stock Receipts',
      desc: 'Used when items arrive from vendors. Increases warehouse stock automatically upon validation.',
      icon: ArrowDownToLine,
      color: 'text-emerald-600',
    },
    delivery: {
      title: 'Outgoing Delivery Orders',
      desc: 'Used when stock leaves the warehouse for customer shipment. Pick, pack, and validate decreases.',
      icon: ArrowUpFromLine,
      color: 'text-indigo-600',
    },
    internal: {
      title: 'Internal Stock Transfers',
      desc: 'Move stock between locations (e.g. Main Store -> Production Rack). Total stock remains constant.',
      icon: ArrowLeftRight,
      color: 'text-amber-600',
    },
    adjustments: {
      title: 'Physical Inventory Adjustments',
      desc: 'Fix mismatches between recorded stock and physical count. System auto-logs variances to ledger.',
      icon: SlidersHorizontal,
      color: 'text-purple-600',
    },
    history: {
      title: 'Move History & Stock Ledger',
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
              className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>AI OCR Packing Slip</span>
            </button>
          )}

          {currentTab === 'history' ? (
            <button
              onClick={exportLedgerToCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger (CSV)</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenNewOperation(activeOpType)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create {activeOpType.charAt(0).toUpperCase() + activeOpType.slice(1)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
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

        {currentTab !== 'history' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        )}
      </div>

      {/* Move History / Ledger View */}
      {currentTab === 'history' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Product & SKU</th>
                  <th className="py-3.5 px-4">From Location</th>
                  <th className="py-3.5 px-4">To Location</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 font-sans text-xs">
                      No stock move ledger records found.
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{l.reference}</td>
                      <td className="py-3 px-4 font-sans uppercase font-bold text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            l.operationType === 'receipt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.operationType === 'delivery'
                              ? 'bg-indigo-100 text-indigo-800'
                              : l.operationType === 'internal'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {l.operationType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-800">{l.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{l.sku}</div>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">{l.sourceLocationName}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{l.destinationLocationName}</td>
                      <td className="py-3 px-4 text-right font-black">
                        <span
                          className={
                            l.quantity > 0
                              ? 'text-emerald-600'
                              : l.quantity < 0
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }
                        >
                          {l.quantity > 0 ? `+${l.quantity}` : l.quantity} {l.uom}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">{l.responsibleUser}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Regular Operations List (Receipts, Deliveries, Transfers, Adjustments) */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">
                    {activeOpType === 'receipt'
                      ? 'Supplier'
                      : activeOpType === 'delivery'
                      ? 'Customer'
                      : 'Description'}
                  </th>
                  <th className="py-3.5 px-4">Source Location</th>
                  <th className="py-3.5 px-4">Destination Location</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      No {activeOpType} records found.
                    </td>
                  </tr>
                ) : (
                  filteredOps.map(op => (
                    <tr
                      key={op.id}
                      onClick={() => setSelectedOperation(op)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {op.reference}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {op.partner || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{getLocationName(op.sourceLocationId)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{getLocationName(op.destinationLocationId)}</td>
                      <td className="py-3.5 px-4">
                        {op.items.map(i => (
                          <div key={i.productId} className="leading-tight">
                            <span className="font-semibold text-slate-800">{i.productName}</span>
                            <span className="text-slate-500 ml-1">
                              ({op.type === 'adjustment' && i.variance !== undefined ? (
                                <strong className={i.variance < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                                  {i.variance > 0 ? `+${i.variance}` : i.variance} {i.uom}
                                </strong>
                              ) : (
                                `${i.quantity} ${i.uom}`
                              )})
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(op.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={op.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        {op.status !== 'done' && op.status !== 'canceled' ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleAdvanceStatus(op)}
                              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all flex items-center gap-1"
                              title="Advance operation status"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleValidate(op.id)}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all shadow-xs flex items-center gap-1"
                              title="Validate stock movement"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Validate</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Complete</span>
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

      {/* Operation Detail Modal */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  {selectedOperation.type} Operation
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedOperation.reference}</h3>
              </div>
              <StatusBadge status={selectedOperation.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Partner / Entity</span>
                  <span className="font-semibold text-slate-800">{selectedOperation.partner || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsible</span>
                  <span className="font-semibold text-slate-800">{selectedOperation.responsibleUser}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Source Location</span>
                  <span className="font-semibold text-slate-800">{getLocationName(selectedOperation.sourceLocationId)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Destination Location</span>
                  <span className="font-semibold text-slate-800">{getLocationName(selectedOperation.destinationLocationId)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Line Items</h4>
                <div className="space-y-1.5">
                  {selectedOperation.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 bg-white">
                      <div>
                        <div className="font-bold text-slate-800">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right font-bold text-slate-900">
                        {item.quantity} {item.uom}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOperation.notes && (
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 text-[11px]">
                  <strong>Notes:</strong> {selectedOperation.notes}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedOperation(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Close
                </button>

                {selectedOperation.status !== 'done' && (
                  <button
                    onClick={() => {
                      handleValidate(selectedOperation.id);
                      setSelectedOperation(null);
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                  >
                    Validate (Done)
                  </button>
                )}
              </div>
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
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessOCR}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
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
