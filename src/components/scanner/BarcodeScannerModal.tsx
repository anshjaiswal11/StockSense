import React, { useState } from 'react';
import { ScanBarcode, Camera, Check, X, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onOpenTransfer: (productId: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onClose, onOpenTransfer }) => {
  const { products, getLocationName } = useInventory();
  const [scannedCode, setScannedCode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleLookup = (code: string) => {
    setScannedCode(code);
    const prod = products.find(
      p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );
    setFoundProduct(prod || null);
  };

  const handleSimulateScan = (prod: Product) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedCode(prod.barcode);
      setFoundProduct(prod);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Warehouse Staff Barcode Scanner</h3>
              <p className="text-xs text-slate-500">Scan shelf tags or SKU codes for rapid bin audits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Laser Scan Viewport Simulation */}
        <div className="relative bg-slate-950 rounded-xl h-44 flex items-center justify-center overflow-hidden mb-4 border-2 border-emerald-500/40">
          {/* Laser line animation */}
          <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#ef4444] animate-bounce" />

          {/* Viewfinder frame */}
          <div className="border-2 border-dashed border-emerald-400/60 rounded-lg w-56 h-28 flex flex-col items-center justify-center text-center p-2">
            <Camera className="w-6 h-6 text-emerald-400 mb-1 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-300">
              {scanning ? 'Decoding Optical Stream...' : 'Align Barcode / QR Inside Reticle'}
            </span>
          </div>
        </div>

        {/* Input & Quick Chips */}
        <div className="space-y-3 text-xs mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Or type SKU manually (e.g. STL-ROD-010)..."
              value={scannedCode}
              onChange={e => handleLookup(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              Simulate Scan Tag:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSimulateScan(p)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-mono font-medium text-slate-700"
                >
                  {p.sku}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Card */}
        {foundProduct ? (
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-900">{foundProduct.sku}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black">
                {foundProduct.totalStock} {foundProduct.uom}
              </span>
            </div>

            <h4 className="font-extrabold text-slate-900 text-sm">{foundProduct.name}</h4>
            <p className="text-[11px] text-slate-600">{foundProduct.category}</p>

            <div className="pt-2 border-t border-emerald-200/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Bin Locations:
              </span>
              {Object.entries(foundProduct.stockPerLocation).map(([locId, qty]) => (
                <div key={locId} className="flex justify-between text-[11px] text-slate-700">
                  <span>{getLocationName(locId)}:</span>
                  <span className="font-mono font-bold">{qty} {foundProduct.uom}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenTransfer(foundProduct.id);
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Perform Bin Transfer for this SKU</span>
              </button>
            </div>
          </div>
        ) : scannedCode ? (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 text-center">
            No product found matching code "{scannedCode}".
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
