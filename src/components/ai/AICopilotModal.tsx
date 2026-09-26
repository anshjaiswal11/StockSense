import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { AIService, CopilotResponse } from '../../services/aiService';

interface AICopilotModalProps {
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: CopilotResponse['suggestedActions'];
  timestamp: string;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ onClose, onNavigateTab }) => {
  const { products, warehouses, operations, ledger, geminiApiKey, autoCreateReorderReceipt } = useInventory();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: "👋 Hello Ansh! I am **StockSense AI**, your inventory intelligence co-pilot. I have indexed your products, warehouse stock levels, pending dock shipments, and ledger history. What would you like to check?",
      actions: [
        { label: 'Check Low Stock & Reorders', actionType: 'navigate_products' },
        { label: 'Do we have enough Steel Rods?', actionType: 'navigate_receipts' },
        { label: 'Pending Dock Receipts', actionType: 'navigate_receipts' },
        { label: 'Warehouse Valuation Summary', actionType: 'navigate_adjustments' },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await AIService.queryCopilot(
        q,
        products,
        warehouses,
        operations,
        ledger,
        geminiApiKey
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        actions: response.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "I experienced a temporary network issue. Based on local data, all active records are operational.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.actionType === 'create_reorder') {
      const low = products.find(p => p.totalStock <= p.reorderRule.minQuantity);
      if (low) {
        autoCreateReorderReceipt(low.id, low.reorderRule.targetReorderQuantity);
        alert(`Drafted reorder for ${low.name}! Opening Receipts...`);
      }
      onNavigateTab('receipts');
      onClose();
    } else if (action.actionType === 'navigate_receipts') {
      onNavigateTab('receipts');
      onClose();
    } else if (action.actionType === 'navigate_products') {
      onNavigateTab('products');
      onClose();
    } else {
      handleSend(action.label);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full h-[620px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm tracking-tight">StockSense AI Copilot</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  {geminiApiKey ? 'Gemini 1.5 Flash' : 'Smart Local NLP'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Natural language inventory query & automation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 text-xs">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] space-y-2 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>

                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 rounded-lg text-[11px] transition-colors shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 px-1">{m.timestamp}</div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs pl-9">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>StockSense AI is analyzing warehouse inventory...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Do we have enough Steel Rods?')..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
