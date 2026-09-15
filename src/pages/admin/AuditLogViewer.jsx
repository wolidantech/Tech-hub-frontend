import { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { useLMS } from '../../context/LMSContext';

export default function AuditLogViewer() {
  const { auditLogs } = useLMS();
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${l.action} ${l.actorEmail} ${l.entityType} ${l.entityId}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="font-bold text-xl flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-400" /> Audit Logs</h2>
          <p className="text-sm text-white/50 mt-1">Every sensitive admin action is recorded. Showing last 500.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action, actor..." type="search" autoComplete="off" enterKeyHint="search" className="h-11 w-full sm:w-[280px] rounded-full glass pl-10 pr-4 text-sm" />
        </div>
      </div>

      <div className="glass rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.03] text-[11px] tracking-widest text-white/40">
              <tr><th className="text-left p-4">Time</th><th className="text-left p-4">Actor</th><th className="text-left p-4">Action</th><th className="text-left p-4">Entity</th><th className="text-left p-4">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 100).map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 text-xs text-white/50 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-4"><div className="font-bold text-xs">{l.actorName}</div><div className="text-[11px] text-white/40 font-mono">{l.actorEmail}</div></td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 font-mono text-[11px] font-bold">{l.action}</span></td>
                  <td className="p-4 text-xs font-mono text-white/60">{l.entityType}:{String(l.entityId).slice(0, 18)}</td>
                  <td className="p-4 text-[11px] text-white/40 font-mono max-w-[220px] truncate">{JSON.stringify(l.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-12 text-center text-white/40 text-sm">No audit entries yet. Admin actions will appear here.</div>}
        </div>
      </div>
    </div>
  );
}
