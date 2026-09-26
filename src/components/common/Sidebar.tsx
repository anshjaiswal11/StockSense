import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  TrendingUp,
  ScanLine,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'receipts'
  | 'delivery'
  | 'internal'
  | 'adjustments'
  | 'history'
  | 'warehouses'
  | 'ai_forecast'
  | 'scanner';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { kpis, operations } = useInventory();

  const pendingRcpt = operations.filter(o => o.type === 'receipt' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;
  const pendingDel = operations.filter(o => o.type === 'delivery' && (o.status === 'draft' || o.status === 'waiting' || o.status === 'ready')).length;

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: 'CATALOG',
      items: [
        {
          id: 'products' as NavTab,
          label: 'Products',
          icon: Package,
          badge: kpis.lowStockItemsCount > 0 ? `${kpis.lowStockItemsCount} Low` : null,
          badgeColor: 'bg-rose-100 text-rose-700',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'receipts' as NavTab,
          label: 'Receipts (In)',
          icon: ArrowDownToLine,
          badge: pendingRcpt > 0 ? pendingRcpt : null,
          badgeColor: 'bg-emerald-100 text-emerald-800',
        },
        {
          id: 'delivery' as NavTab,
          label: 'Delivery Orders (Out)',
          icon: ArrowUpFromLine,
          badge: pendingDel > 0 ? pendingDel : null,
          badgeColor: 'bg-indigo-100 text-indigo-800',
        },
        {
          id: 'internal' as NavTab,
          label: 'Internal Transfers',
          icon: ArrowLeftRight,
          badge: null,
        },
        {
          id: 'adjustments' as NavTab,
          label: 'Inventory Adjustment',
          icon: SlidersHorizontal,
          badge: null,
        },
        {
          id: 'history' as NavTab,
          label: 'Move History (Ledger)',
          icon: History,
          badge: null,
        },
      ],
    },
    {
      title: 'INTELLIGENCE & TOOLS',
      items: [
        {
          id: 'ai_forecast' as NavTab,
          label: 'AI Demand Forecaster',
          icon: TrendingUp,
          badge: 'AI Smart',
          badgeColor: 'bg-emerald-500 text-white animate-pulse',
        },
        {
          id: 'scanner' as NavTab,
          label: 'Barcode & QR Scanner',
          icon: ScanLine,
          badge: null,
        },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        {
          id: 'warehouses' as NavTab,
          label: 'Warehouses & Locations',
          icon: Warehouse,
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-slate-800 select-none">
      <div className="py-5 px-3 overflow-y-auto space-y-6">
        {navSections.map(section => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[11px] font-bold text-slate-300 tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          item.badgeColor || 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status card at sidebar bottom */}
      <div className="p-3 m-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 font-medium">Double-Entry Ledger</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Odoo-grade inventory state synchronization active.
        </p>
      </div>
    </aside>
  );
};
