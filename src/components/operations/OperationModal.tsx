import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { OperationType, UnitOfMeasure } from '../../types';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';

interface OperationModalProps {
  initialType?: OperationType;
  onClose: () => void;
}

export const OperationModal: React.FC<OperationModalProps> = ({ initialType = 'receipt', onClose }) => {
  const { products, locations, createOperation } = useInventory();

  const [type, setType] = useState<OperationType>(initialType);
  const [partner, setPartner] = useState(
    initialType === 'receipt'
      ? 'Apex Steel Industries'
      : initialType === 'delivery'
      ? 'Metro Workspace Solutions'
      : initialType === 'adjustment'
      ? 'Physical Audit Team'
      : 'Internal Logistics'
  );
  
  // Set default locations based on type
  const [sourceLocationId, setSourceLocationId] = useState(() => {
    if (initialType === 'receipt') return 'loc-vendors';
    if (initialType === 'delivery') return 'loc-dispatch';
    if (initialType === 'internal') return 'loc-main-store';
    return 'loc-prod-rack'; // adjustment
  });

  const [destinationLocationId, setDestinationLocationId] = useState(() => {
    if (initialType === 'receipt') return 'loc-main-store';
    if (initialType === 'delivery') return 'loc-customers';
    if (initialType === 'internal') return 'loc-prod-rack';
    return 'loc-loss'; // adjustment
  });

  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      uom: products[0]?.uom || ('Units' as UnitOfMeasure),
      quantity: 10,
      countedQuantity: 10,
    },
  ]);

  const handleTypeChange = (newType: OperationType) => {
    setType(newType);
    if (newType === 'receipt') {
      setSourceLocationId('loc-vendors');
      setDestinationLocationId('loc-main-store');
      setPartner('Apex Steel Industries');
    } else if (newType === 'delivery') {
      setSourceLocationId('loc-dispatch');
      setDestinationLocationId('loc-customers');
      setPartner('Metro Workspace Solutions');
    } else if (newType === 'internal') {
      setSourceLocationId('loc-main-store');
      setDestinationLocationId('loc-prod-rack');
      setPartner('Internal Transfer');
    } else if (newType === 'adjustment') {
      setSourceLocationId('loc-prod-rack');
      setDestinationLocationId('loc-loss');
      setPartner('Physical Count Discrepancy');
    }
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    setItems(prev => {
      const next = [...prev];
      const recordedInLoc = prod.stockPerLocation[sourceLocationId] || 0;
      next[index] = {
        ...next[index],
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        uom: prod.uom,
        countedQuantity: recordedInLoc,
      };
      return next;
    });
  };

  const handleAddItem = () => {
    const prod = products[0];
    if (!prod) return;
    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        uom: prod.uom,
        quantity: 5,
        countedQuantity: prod.stockPerLocation[sourceLocationId] || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent, validateImmediate: boolean) => {
    e.preventDefault();

    const formattedItems = items.map(item => {
      if (type === 'adjustment') {
        const prod = products.find(p => p.id === item.productId);
        const recorded = prod?.stockPerLocation[sourceLocationId] || 0;
        const variance = item.countedQuantity - recorded;
        return {
          ...item,
          quantity: Math.abs(variance),
          countedQuantity: item.countedQuantity,
          variance,
        };
      }
      return {
        ...item,
        pickedQuantity: validateImmediate ? item.quantity : 0,
      };
    });

    createOperation({
      type,
      partner,
      sourceLocationId,
      destinationLocationId,
      notes,
      status: validateImmediate ? 'done' : 'ready',
      responsibleUser: 'Ansh Jaiswal (Manager)',
      items: formattedItems,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Create Stock Operation
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Select operation category and configure line items according to Odoo IMS workflow.
        </p>

        {/* Operation Type Switcher */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleTypeChange('receipt')}
            className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              type === 'receipt'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4 mb-1 text-emerald-600" />
            <span>Receipt (In)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('delivery')}
            className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              type === 'delivery'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowUpFromLine className="w-4 h-4 mb-1 text-indigo-600" />
            <span>Delivery (Out)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('internal')}
            className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              type === 'internal'
                ? 'bg-amber-50 text-amber-800 border-amber-500 ring-2 ring-amber-500/20'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 mb-1 text-amber-600" />
            <span>Internal Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('adjustment')}
            className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
              type === 'adjustment'
                ? 'bg-purple-50 text-purple-800 border-purple-500 ring-2 ring-purple-500/20'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 mb-1 text-purple-600" />
            <span>Adjustment</span>
          </button>
        </div>

        <form className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                {type === 'receipt'
                  ? 'Vendor / Supplier'
                  : type === 'delivery'
                  ? 'Customer / Recipient'
                  : 'Operation Description / Reason'}
              </label>
              <input
                type="text"
                required
                value={partner}
                onChange={e => setPartner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Source Location</label>
              <select
                value={sourceLocationId}
                onChange={e => setSourceLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Destination Location</label>
              <select
                value={destinationLocationId}
                onChange={e => setDestinationLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">Operation Line Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const prod = products.find(p => p.id === item.productId);
                const recordedInLoc = prod?.stockPerLocation[sourceLocationId] || 0;

                return (
                  <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={e => handleProductSelect(index, e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded-md bg-white text-xs font-semibold"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                      {type === 'adjustment' && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Current Recorded: <strong className="text-slate-800">{recordedInLoc} {item.uom}</strong>
                        </div>
                      )}
                    </div>

                    {type === 'adjustment' ? (
                      <div className="w-32">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Physical Count</label>
                        <input
                          type="number"
                          min="0"
                          value={item.countedQuantity}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setItems(prev => {
                              const next = [...prev];
                              next[index].countedQuantity = val;
                              return next;
                            });
                          }}
                          className="w-full p-1.5 border border-slate-200 rounded-md bg-white font-mono"
                        />
                      </div>
                    ) : (
                      <div className="w-28">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10) || 1;
                            setItems(prev => {
                              const next = [...prev];
                              next[index].quantity = val;
                              return next;
                            });
                          }}
                          className="w-full p-1.5 border border-slate-200 rounded-md bg-white font-mono"
                        />
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Shipping Reference</label>
            <input
              type="text"
              placeholder="e.g. PO-9812, Bill of Lading, Damaged during transit..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={e => handleSubmit(e, false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Save as Ready
            </button>
            <button
              type="button"
              onClick={e => handleSubmit(e, true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Validate & Apply Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
