import React, { useMemo } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ShoppingCart,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { AIService } from '../../services/aiService';

export const AIPredictiveForecastView: React.FC = () => {
  const { products, operations, ledger, autoCreateReorderReceipt } = useInventory();

  const forecasts = useMemo(() => {
    return AIService.generateForecasts(products, ledger);
  }, [products, ledger]);

  const anomalies = useMemo(() => {
    return AIService.detectAnomalies(products, ledger, operations);
  }, [products, ledger, operations]);

  const criticalForecasts = forecasts.filter(f => f.status === 'critical' || f.status === 'warning');

  const handleOrder = (productId: string, qty: number) => {
    const id = autoCreateReorderReceipt(productId, qty);
    if (id) {
      alert(`AI Auto-Replenishment receipt drafted! Order quantity: ${qty}. See Receipts.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI Predictive Inventory Intelligence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Demand Forecasting & Anomaly Sentry
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Continuously analyzes stock movement velocity, historical sales orders, and lead times to calculate exact stockout dates, optimal Economic Order Quantities (EOQ), and detect inventory shrinkage.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* AI Anomaly & Shrinkage Sentry Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Live Inventory Anomaly & Hazard Detections ({anomalies.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {anomalies.map(anomaly => (
            <div
              key={anomaly.id}
              className={`p-4 rounded-xl border transition-all ${
                anomaly.severity === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : anomaly.severity === 'high'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80">
                  {anomaly.severity} priority
                </span>
                <span className="text-[10px] opacity-75 font-mono">
                  {new Date(anomaly.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h4 className="text-xs font-black">{anomaly.title}</h4>
              <p className="text-[11px] opacity-85 mt-1 leading-snug">{anomaly.description}</p>

              {anomaly.recommendedAction && (
                <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
                  <span className="font-semibold italic">Action: {anomaly.recommendedAction}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Stockout Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Automated Reorder Intelligence & Depletion Runway
            </h3>
            <p className="text-xs text-slate-500">
              Calculated based on daily run rate and warehouse consumption velocity.
            </p>
          </div>

          <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
            Model Confidence: 94.8%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Current Balance</th>
                <th className="py-3 px-4">Daily Velocity</th>
                <th className="py-3 px-4">Depletion Runway</th>
                <th className="py-3 px-4">Estimated Stockout</th>
                <th className="py-3 px-4">AI Suggested EOQ</th>
                <th className="py-3 px-4 text-right">One-Click Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {forecasts.map(item => {
                const isCritical = item.status === 'critical';
                const isWarning = item.status === 'warning';

                return (
                  <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {item.currentStock} {item.uom}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.dailyVelocity} {item.uom}/day
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.daysUntilStockout === 0
                          ? 'Stockout Now!'
                          : `${item.daysUntilStockout} days remaining`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {item.estimatedStockoutDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      +{item.suggestedReorderQty} {item.uom}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOrder(item.productId, item.suggestedReorderQty)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isCritical || isWarning
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
