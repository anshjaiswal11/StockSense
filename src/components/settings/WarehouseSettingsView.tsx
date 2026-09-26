import React, { useState } from 'react';
import { Warehouse as WarehouseIcon, MapPin, Plus, Box, CheckCircle2 } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const WarehouseSettingsView: React.FC = () => {
  const { warehouses, locations, products, addWarehouse, addLocation } = useInventory();

  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [showAddLocModal, setShowAddLocModal] = useState(false);

  // Form states
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  const [locName, setLocName] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || '');
  const [locCapacity, setLocCapacity] = useState(500);

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whCode) return;
    addWarehouse({
      code: whCode.toUpperCase(),
      name: whName,
      address: whAddress || 'Industrial Zone',
    });
    setWhName('');
    setWhCode('');
    setWhAddress('');
    setShowAddWhModal(false);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName || !locWarehouseId) return;
    addLocation({
      name: locName,
      warehouseId: locWarehouseId,
      type: 'internal',
      capacity: Number(locCapacity),
    });
    setLocName('');
    setShowAddLocModal(false);
  };

  // Calculate items stored in each location
  const getLocationStockCount = (locId: string) => {
    return products.reduce((acc, p) => acc + (p.stockPerLocation[locId] || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <WarehouseIcon className="w-5 h-5 text-emerald-600" />
            Warehouse & Location Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-warehouse hierarchies, storage zones, racks, and capacity utilization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddLocModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone / Rack</span>
          </button>
          <button
            onClick={() => setShowAddWhModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {warehouses.map(wh => {
          const whLocations = locations.filter(l => l.warehouseId === wh.id);
          const totalCapacity = whLocations.reduce((acc, l) => acc + (l.capacity || 0), 0);
          const currentOccupancy = whLocations.reduce((acc, l) => acc + getLocationStockCount(l.id), 0);
          const utilization = totalCapacity > 0 ? Math.min(100, Math.round((currentOccupancy / totalCapacity) * 100)) : 0;

          return (
            <div key={wh.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                      {wh.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{wh.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.address}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">Occupancy</span>
                  <div className="text-lg font-black text-slate-900">{utilization}%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      utilization > 85 ? 'bg-rose-500' : utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${utilization}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>{currentOccupancy} units stored</span>
                  <span>{totalCapacity} total capacity</span>
                </div>
              </div>

              {/* Locations / Racks Grid */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Active Bins & Racks ({whLocations.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {whLocations.map(loc => {
                    const count = getLocationStockCount(loc.id);
                    const cap = loc.capacity || 500;
                    const pct = Math.min(100, Math.round((count / cap) * 100));

                    return (
                      <div
                        key={loc.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{loc.name}</span>
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Stored: <strong className="text-slate-800 font-mono">{count}</strong></span>
                          <span>Cap: {cap}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Warehouse Modal */}
      {showAddWhModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Warehouse</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new operational distribution hub or factory warehouse.</p>

            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH3, SOUTH-HUB"
                  value={whCode}
                  onChange={e => setWhCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Fulfillment Depot"
                  value={whName}
                  onChange={e => setWhName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Enterprise Blvd, Sector 9"
                  value={whAddress}
                  onChange={e => setWhAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="mt-5 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWhModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Location / Storage Rack</h3>
            <p className="text-xs text-slate-500 mb-4">Define internal bins, shelving racks, or staging bays.</p>

            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to Warehouse *</label>
                <select
                  value={locWarehouseId}
                  onChange={e => setLocWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Rack Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rack C (Finished Packaged Goods)"
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Unit Capacity</label>
                <input
                  type="number"
                  min="50"
                  value={locCapacity}
                  onChange={e => setLocCapacity(parseInt(e.target.value, 10) || 500)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="mt-5 flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
