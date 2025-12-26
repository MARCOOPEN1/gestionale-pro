import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, User } from 'lucide-react';
import { Client, CalendarEvent } from '../types';

interface ClientManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  events: CalendarEvent[];
}

export function ClientManager({ clients, setClients, events }: ClientManagerProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

  const startEdit = (client?: Client) => {
    if (client) {
      setFormData(client);
      setIsEditing(client.id);
    } else {
      setFormData({
        name: '',
        type: 'Società',
        dailyRate: 0,
        totalDaysContracted: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      setIsEditing('new');
    }
  };

  const saveClient = () => {
    if (!formData.name || !formData.dailyRate) return;
    
    const client: Client = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      type: formData.type || 'Società',
      dailyRate: Number(formData.dailyRate),
      totalDaysContracted: Number(formData.totalDaysContracted || 0),
      color: formData.color || colors[0],
      vatNumber: formData.vatNumber
    };

    setClients(prev => {
      const filtered = prev.filter(c => c.id !== client.id);
      return [...filtered, client];
    });
    setIsEditing(null);
    setFormData({});
  };

  const deleteClient = (id: string) => {
    if (confirm('Eliminare questo cliente? Gli eventi associati verranno mantenuti.')) {
      setClients(prev => prev.filter(c => c.id !== id));
      setIsEditing(null);
    }
  };

  const getClientStats = (clientId: string) => {
    const clientEvents = events.filter(e => e.clientId === clientId);
    const totalHours = clientEvents.reduce((sum, e) => sum + e.hours, 0);
    const totalDays = totalHours / 8;
    return { totalHours, totalDays };
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => startEdit()}
        className="w-full py-4 bg-brand-600 rounded-3xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
      >
        <Plus size={20} /> NUOVO CLIENTE
      </button>

      <div className="space-y-3">
        {clients.map(client => {
          const stats = getClientStats(client.id);
          const isActive = isEditing === client.id;

          return (
            <div key={client.id} className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden">
              {!isActive ? (
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-12 rounded-full" style={{ backgroundColor: client.color }}></div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{client.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold">
                          {client.type === 'Società' ? <Building2 size={10} /> : <User size={10} />}
                          <span>{client.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(client)}
                        className="p-2 bg-slate-800 rounded-full text-slate-400"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="p-2 bg-slate-800 rounded-full text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-950/50 p-3 rounded-2xl">
                      <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Tariffa/Giorno</p>
                      <p className="font-black text-brand-400">€{client.dailyRate}</p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl">
                      <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Giorni Lavorati</p>
                      <p className="font-black text-white">{stats.totalDays.toFixed(1)}</p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl">
                      <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Totale Ore</p>
                      <p className="font-black text-white">{stats.totalHours}h</p>
                    </div>
                  </div>

                  {client.totalDaysContracted > 0 && (
                    <div className="mt-3 bg-slate-950/50 p-3 rounded-2xl">
                      <div className="flex justify-between text-[10px] font-bold mb-2">
                        <span className="text-slate-600 uppercase">Progresso Contratto</span>
                        <span className="text-brand-400">{((stats.totalDays / client.totalDaysContracted) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((stats.totalDays / client.totalDaysContracted) * 100, 100)}%`,
                            backgroundColor: client.color
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="bg-slate-950 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Nome Cliente</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-transparent font-bold text-white outline-none"
                      placeholder="Es. Acme Corp"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-4 rounded-2xl">
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Tipo</label>
                      <select
                        value={formData.type || 'Società'}
                        onChange={e => setFormData({ ...formData, type: e.target.value as Client['type'] })}
                        className="w-full bg-transparent font-bold text-white outline-none"
                      >
                        <option value="Società" className="bg-slate-900">Società</option>
                        <option value="PIVA" className="bg-slate-900">P.IVA</option>
                      </select>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl">
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Tariffa/Giorno</label>
                      <input
                        type="number"
                        value={formData.dailyRate || ''}
                        onChange={e => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                        className="w-full bg-transparent font-bold text-white outline-none"
                        placeholder="350"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Giorni Contrattati (opzionale)</label>
                    <input
                      type="number"
                      value={formData.totalDaysContracted || ''}
                      onChange={e => setFormData({ ...formData, totalDaysContracted: Number(e.target.value) })}
                      className="w-full bg-transparent font-bold text-white outline-none"
                      placeholder="20"
                    />
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Colore</label>
                    <div className="flex gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'scale-110 ring-2 ring-white' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveClient}
                      className="flex-1 bg-brand-600 py-4 rounded-2xl font-black text-white"
                    >
                      SALVA
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="px-6 py-4 bg-slate-800 rounded-2xl font-bold text-slate-400"
                    >
                      ANNULLA
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
