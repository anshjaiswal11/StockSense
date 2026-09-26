import React, { useState } from 'react';
import { 
  Warehouse as WarehouseIcon, 
  MapPin, 
  Plus, 
  Box, 
  CheckCircle2, 
  Database, 
  RefreshCw,
  Server
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { getCustomMongoUri, setCustomMongoUri, testMongoConnection } from '../../services/mongoService';

export const WarehouseSettingsView: React.FC = () => {
  const { 
    warehouses, 
    locations, 
    products, 
    operations, 
    ledger, 
    addWarehouse, 
    addLocation, 
    syncWithMongoDB, 
    mongoConnected 
  } = useInventory();

  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [showAddLocModal, setShowAddLocModal] = useState(false);

  // Form states
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  const [locName, setLocName] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || '');
  const [locCapacity, setLocCapacity] = useState(500);

  // MongoDB state
  const [mongoUriInput, setMongoUriInput] = useState(() => getCustomMongoUri());
  const [isSyncing, setIsSyncing] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleSaveMongoUri = () => {
    setCustomMongoUri(mongoUriInput);
    setSyncStatusMsg({
      type: 'success',
      text: mongoUriInput.trim() ? 'MongoDB URI saved locally.' : 'MongoDB URI cleared (using server environment variables).',
    });
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setSyncStatusMsg(null);
    try {
      const res = await testMongoConnection(mongoUriInput);
      setSyncStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Failed to test MongoDB connection',
      });
    } finally {
      setTestingConn(false);
    }
  };

  const handleSyncMongo = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncWithMongoDB();
      setSyncStatusMsg({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        text: err.message || 'Failed to sync with MongoDB',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculate items stored in each location
  const getLocationStockCount = (locId: string) => {
    return products.reduce((acc, p) => acc + (p.stockPerLocation[locId] || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
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
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone / Rack</span>
          </button>
          <button
            onClick={() => setShowAddWhModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Warehouse</span>
          </button>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map(wh => {
          const whLocations = locations.filter(l => l.warehouseId === wh.id);
          const totalStockInWh = whLocations.reduce((sum, l) => sum + getLocationStockCount(l.id), 0);

          return (
            <div key={wh.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {wh.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">
                    {totalStockInWh} Total Items
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {wh.address}
                </p>
              </div>

              {/* Racks & Locations */}
              <div className="p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Internal Zones & Racks ({whLocations.length})
                </h4>

                <div className="space-y-2">
                  {whLocations.map(loc => {
                    const currentStock = getLocationStockCount(loc.id);
                    const cap = loc.capacity || 500;
                    const percent = Math.min(100, Math.round((currentStock / cap) * 100));

                    return (
                      <div key={loc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold text-slate-800">{loc.name}</span>
                          <span className="font-mono text-slate-500">
                            {currentStock} / {cap} ({percent}%)
                          </span>
                        </div>
                        {/* Utilization Bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 90 ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Hub ID: {wh.id}</span>
                <span className="text-emerald-700 font-bold">Operational Hub</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MongoDB Database Configuration & Cloud Sync */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              MongoDB Database & Cloud Synchronization
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Persist all warehouse products, operations, ledger moves, and user accounts into MongoDB database <code className="font-mono text-slate-700">stocksense</code>.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              mongoConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              <span className={`w-2 h-2 rounded-full ${mongoConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{mongoConnected ? 'MongoDB Connected' : 'Local / Standalone'}</span>
            </span>
            <button
              onClick={handleSyncMongo}
              disabled={isSyncing}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync to MongoDB Now'}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              MongoDB Connection String (Optional / Atlas URI)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/stocksense"
                value={mongoUriInput}
                onChange={e => setMongoUriInput(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleSaveMongoUri}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Save URI
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testingConn}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                {testingConn ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to use the server environment variable <code className="text-slate-600 font-mono">MONGODB_URI</code> configured on Vercel.
            </p>
          </div>

          {syncStatusMsg && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              syncStatusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {syncStatusMsg.text}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Products Collection</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{products.length} Docs</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Operations Collection</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{operations.length} Docs</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Ledger Moves</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{ledger.length} Docs</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Warehouses & Bins</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{warehouses.length} Hubs / {locations.length} Bins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      {showAddWhModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add New Warehouse</h3>
            <p className="text-xs text-slate-500 mb-4">Register a new physical facility or distribution depot.</p>

            <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Regional Hub"
                  value={whName}
                  onChange={e => setWhName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH3"
                  value={whCode}
                  onChange={e => setWhCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Freight Lane, South Logistics District"
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
                  Create Facility
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
