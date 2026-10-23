import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { OpenGateListing } from '../api/types';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { EmptyState } from '../components/common/EmptyState';
import { DoorOpen, MapPin, Navigation, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { formatLocal } from '../lib/format';

export const OpenGatePage: React.FC = () => {
  const [listings, setListings] = useState<OpenGateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [handoutQty, setHandoutQty] = useState<Record<string, number>>({});
  const [recordingId, setRecordingId] = useState<string | null>(null);

  const loadListings = () => {
    setLoading(true);
    api.listOpenGate().then((list) => {
      setListings(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleRecordHandout = async (listingId: string) => {
    const qty = handoutQty[listingId] || 1;
    setRecordingId(listingId);
    try {
      await api.recordHandout(listingId, qty);
      setHandoutQty((prev) => ({ ...prev, [listingId]: 1 }));
      loadListings();
    } finally {
      setRecordingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Open Gate (Walk-In Aid Distribution)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Direct walk-in distribution centers where recipients and emergency helpers collect supplies on site.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading Open Gate listings...</div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No active Open Gate distributions"
          description="Donors can activate walk-in mode for bulk emergency food or whenever delivery volunteers are constrained."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((l) => {
            const currentHandout = handoutQty[l.id] || 1;
            const isClosed = l.status === 'CLOSED' || l.remainingQty <= 0;
            const pct = Math.round(((l.totalQty - l.remainingQty) / l.totalQty) * 100);

            return (
              <div key={l.id} className="bg-white dark:bg-[#161C23] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isClosed
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                    }`}>
                      {l.status}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{l.venue}</h3>
                  </div>
                  <CountdownTimer expiryUtc={l.closesAtUtc} />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>Venue Location: {l.venue}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Window: {formatLocal(l.opensAtUtc, 'p')} – {formatLocal(l.closesAtUtc, 'p')}
                  </div>
                </div>

                {/* Remaining Quantity Progress */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    <span>Stock Distribution</span>
                    <span className="text-purple-700 dark:text-purple-400">{l.remainingQty} of {l.totalQty} {l.unit} remaining</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${100 - pct}%` }} className="h-full bg-purple-600 transition-all" />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold block mb-0.5">Instructions:</span>
                  {l.instructions}
                </div>

                {/* Handout Recorder */}
                {!isClosed ? (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Record Handout:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHandoutQty((p) => ({ ...p, [l.id]: Math.max(1, currentHandout - 5) }))}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-sm font-bold w-12 text-center">{currentHandout}</span>
                      <button
                        onClick={() => setHandoutQty((p) => ({ ...p, [l.id]: Math.min(l.remainingQty, currentHandout + 5) }))}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRecordHandout(l.id)}
                        disabled={recordingId === l.id}
                        className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                      >
                        {recordingId === l.id ? 'Recording...' : 'Record'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 text-center text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    Distribution window has ended.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
