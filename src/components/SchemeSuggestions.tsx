import React from 'react';
import { Search, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface SchemeSuggestionsProps {
  schemes: string[];
  onSelect: (scheme: string) => void;
  onLoadData: () => void;
  isDataLoading: boolean;
}

export default function SchemeSuggestions({
  schemes,
  onSelect,
  onLoadData,
  isDataLoading
}: SchemeSuggestionsProps) {
  return (
    <div className="w-80 h-full bg-zinc-950 border-l border-zinc-800 flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Schemes</h3>
        <button 
          onClick={onLoadData}
          disabled={isDataLoading}
          className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-all disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isDataLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {schemes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-700">
            <Search size={24} />
          </div>
          <p className="text-sm text-zinc-600">No data loaded yet. Click refresh to scrape schemes.</p>
          <button
            onClick={onLoadData}
            disabled={isDataLoading}
            className="text-xs font-bold text-zinc-400 hover:text-zinc-100 underline underline-offset-4"
          >
            {isDataLoading ? "Loading..." : "Load Data Now"}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {schemes.map((scheme, i) => (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={scheme}
              onClick={() => onSelect(scheme)}
              className="w-full text-left p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-zinc-300 group-hover:text-white font-medium truncate">{scheme}</span>
                <ExternalLink size={12} className="text-zinc-600 group-hover:text-zinc-400 shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight mb-2">Pro Tip</p>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Try asking: "What are the eligibility criteria for {schemes[0] || 'PM Kisan'}?"
        </p>
      </div>
    </div>
  );
}
