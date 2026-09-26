import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  MapPin,
  AlertTriangle,
  QrCode,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product, UnitOfMeasure } from '../../types';

export const ProductListView: React.FC = () => {
  const {
    products,
    categories,
    locations,
    addProduct,
    updateProduct,
    deleteProduct,
    autoCreateReorderReceipt,
    getLocationName,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedLocationBreakdown, setSelectedLocationBreakdown] = useState<Product | null>(null);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<Product | null>(null);

  // New/Edit Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: categories[0] || 'Raw Materials',
    uom: 'Units' as UnitOfMeasure,
    description: '',
    unitCost: 10,
    initialStock: 0,
    initialLocationId: 'loc-main-store',
    minQuantity: 10,
    maxQuantity: 100,
    targetReorderQuantity: 50,
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (stockFilter === 'low' && (p.totalStock > p.reorderRule.minQuantity || p.totalStock === 0)) return false;
      if (stockFilter === 'out' && p.totalStock > 0) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategory, stockFilter, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: categories[0] || 'Raw Materials',
      uom: 'Units',
      description: '',
      unitCost: 25,
      initialStock: 20,
      initialLocationId: 'loc-main-store',
      minQuantity: 15,
      maxQuantity: 150,
      targetReorderQuantity: 60,
    });
    setShowProductModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      uom: p.uom,
      description: p.description || '',
      unitCost: p.unitCost,
      initialStock: p.totalStock,
      initialLocationId: 'loc-main-store',
      minQuantity: p.reorderRule.minQuantity,
      maxQuantity: p.reorderRule.maxQuantity,
      targetReorderQuantity: p.reorderRule.targetReorderQuantity,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        uom: formData.uom,
        description: formData.description,
        unitCost: Number(formData.unitCost),
        reorderRule: {
          minQuantity: Number(formData.minQuantity),
          maxQuantity: Number(formData.maxQuantity),
          targetReorderQuantity: Number(formData.targetReorderQuantity),
        },
      });
    } else {
      addProduct({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        uom: formData.uom,
        description: formData.description,
        unitCost: Number(formData.unitCost),
        initialStock: Number(formData.initialStock),
        initialLocationId: formData.initialLocationId,
        stockPerLocation: {},
        reorderRule: {
          minQuantity: Number(formData.minQuantity),
          maxQuantity: Number(formData.maxQuantity),
          targetReorderQuantity: Number(formData.targetReorderQuantity),
        },
        barcode: `890${Math.floor(1000000 + Math.random() * 9000000)}`,
      });
    }
    setShowProductModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Product Management & Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage SKUs, unit of measures, reordering triggers, and real-time bin allocation.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Condition */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'low' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                stockFilter === 'out' ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-500'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">SKU / Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th className="py-3.5 px-4">Total Stock</th>
                <th className="py-3.5 px-4">Reordering Buffer</th>
                <th className="py-3.5 px-4">Locations</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.totalStock === 0;
                  const isLowStock = product.totalStock > 0 && product.totalStock <= product.reorderRule.minQuantity;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {product.sku}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{product.description || 'No description'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {product.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        ${product.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-black text-sm ${
                              isOutOfStock
                                ? 'text-rose-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {product.totalStock} {product.uom}
                          </span>
                          {isOutOfStock && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                              OUT
                            </span>
                          )}
                          {isLowStock && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        <div>Min: <strong className="text-slate-700">{product.reorderRule.minQuantity}</strong> {product.uom}</div>
                        <div>Target: <strong className="text-slate-700">{product.reorderRule.targetReorderQuantity}</strong> {product.uom}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedLocationBreakdown(product)}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>View Bins</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {/* 1-Click AI Replenish if low */}
                        {(isLowStock || isOutOfStock) && (
                          <button
                            onClick={() => {
                              autoCreateReorderReceipt(product.id, product.reorderRule.targetReorderQuantity);
                              alert(`Created replenishment receipt for ${product.name}! Check Receipts.`);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="AI Auto-Replenish"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Barcode shelf label */}
                        <button
                          onClick={() => setSelectedBarcodeProduct(product)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Generate Barcode / Shelf Tag"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${product.name}?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Availability per Location Modal */}
      {selectedLocationBreakdown && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedLocationBreakdown.name}</h3>
                <p className="text-xs text-slate-500 font-mono">SKU: {selectedLocationBreakdown.sku}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                Total: {selectedLocationBreakdown.totalStock} {selectedLocationBreakdown.uom}
              </span>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Physical Location Breakdown
            </h4>

            <div className="space-y-2">
              {Object.entries(selectedLocationBreakdown.stockPerLocation).map(([locId, qty]) => {
                const name = getLocationName(locId);
                return (
                  <div key={locId} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {qty} {selectedLocationBreakdown.uom}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLocationBreakdown(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode & Shelf Label Modal */}
      {selectedBarcodeProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">{selectedBarcodeProduct.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {selectedBarcodeProduct.sku}</p>

            {/* Simulated Barcode */}
            <div className="my-6 p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl inline-block">
              <div className="h-14 flex items-center justify-center gap-1">
                {[4, 2, 6, 1, 3, 5, 2, 7, 3, 1, 4, 6, 2, 5, 1, 3, 6, 2, 4, 1, 5].map((w, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${w}px` }}
                    className="h-full bg-slate-900"
                  />
                ))}
              </div>
              <div className="mt-2 font-mono text-xs font-bold text-slate-800 tracking-widest">
                *{selectedBarcodeProduct.barcode}*
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                {selectedBarcodeProduct.category} • {selectedBarcodeProduct.uom}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Print Label
              </button>
              <button
                onClick={() => setSelectedBarcodeProduct(null)}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Product Form Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingProduct ? 'Edit Product' : 'Create New Inventory Product'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure product details, category, unit of measure, and automated reordering thresholds.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Steel Rods (10mm)"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STL-ROD-010"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit of Measure (UoM)</label>
                  <select
                    value={formData.uom}
                    onChange={e => setFormData({ ...formData, uom: e.target.value as UnitOfMeasure })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Units">Units</option>
                    <option value="kg">kg</option>
                    <option value="m">m (Meters)</option>
                    <option value="Liters">Liters</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Rolls">Rolls</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                {!editingProduct && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Initial Opening Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialStock}
                        onChange={e => setFormData({ ...formData, initialStock: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Initial Storage Bin</label>
                      <select
                        value={formData.initialLocationId}
                        onChange={e => setFormData({ ...formData, initialLocationId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                      >
                        {locations.filter(l => l.type === 'internal').map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of product specs or handling rules..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Reordering Rules Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated Reordering Rules</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Min Stock Buffer</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minQuantity}
                      onChange={e => setFormData({ ...formData, minQuantity: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Max Stock Cap</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxQuantity}
                      onChange={e => setFormData({ ...formData, maxQuantity: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Reorder Target Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.targetReorderQuantity}
                      onChange={e => setFormData({ ...formData, targetReorderQuantity: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
