import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Euro, Calendar } from 'lucide-react';
import { Client, CalendarEvent, WorkMode } from '../types';
import { format, parseISO, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import it from 'date-fns/locale/it';

interface StatsPanelProps {
  clients: Client[];
  events: CalendarEvent[];
  currentDate: Date;
}

export function StatsPanel({ clients, events, currentDate }: StatsPanelProps) {
  const monthEvents = events.filter(e => isSameMonth(parseISO(e.date), currentDate));

  // Statistiche totali del mese
  const totalHours = monthEvents.reduce((sum, e) => sum + e.hours, 0);
  const totalDays = totalHours / 8;
  const smartWorkingHours = monthEvents.filter(e => e.mode === WorkMode.SMART_WORKING).reduce((sum, e) => sum + e.hours, 0);
  const onSiteHours = monthEvents.filter(e => e.mode === WorkMode.ON_SITE).reduce((sum, e) => sum + e.hours, 0);

  // Fatturato per cliente
  const clientRevenue = clients.map(client => {
    const clientEvents = monthEvents.filter(e => e.clientId === client.id);
    const hours = clientEvents.reduce((sum, e) => sum + e.hours, 0);
    const days = hours / 8;
    const revenue = days * client.dailyRate;
    return {
      name: client.name,
      revenue,
      hours,
      days,
      color: client.color
    };
  }).filter(c => c.revenue > 0);

  const totalRevenue = clientRevenue.reduce((sum, c) => sum + c.revenue, 0);

  // Dati per il grafico a barre (ore per cliente)
  const chartData = clientRevenue.map(c => ({
    name: c.name.length > 10 ? c.name.substring(0, 10) + '...' : c.name,
    ore: c.hours,
    fill: c.color
  }));

  // Dati per il grafico a torta (distribuzione modalità di lavoro)
  const workModeData = [
    { name: 'In Sede', value: onSiteHours, color: '#0ea5e9' },
    { name: 'Smart Working', value: smartWorkingHours, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  // Giorni lavorativi nel mese
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const workDays = allDays.filter(day => {
    const dayOfWeek = day.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Escludi weekend
  }).length;

  const workedDays = new Set(monthEvents.map(e => e.date)).size;
  const productivity = workDays > 0 ? (workedDays / workDays) * 100 : 0;

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Cards statistiche principali */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-4 rounded-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-brand-200" />
            <p className="text-[10px] font-bold text-brand-200 uppercase">Ore Totali</p>
          </div>
          <p className="text-3xl font-black text-white">{totalHours}</p>
          <p className="text-xs text-brand-200 mt-1">{totalDays.toFixed(1)} giorni</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Euro size={16} className="text-green-200" />
            <p className="text-[10px] font-bold text-green-200 uppercase">Fatturato</p>
          </div>
          <p className="text-3xl font-black text-white">€{totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-green-200 mt-1">questo mese</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-purple-200" />
            <p className="text-[10px] font-bold text-purple-200 uppercase">Giorni Lavorati</p>
          </div>
          <p className="text-3xl font-black text-white">{workedDays}</p>
          <p className="text-xs text-purple-200 mt-1">su {workDays} disponibili</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-3xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-200" />
            <p className="text-[10px] font-bold text-orange-200 uppercase">Produttività</p>
          </div>
          <p className="text-3xl font-black text-white">{productivity.toFixed(0)}%</p>
          <p className="text-xs text-orange-200 mt-1">rispetto ai giorni lavorativi</p>
        </div>
      </div>

      {/* Fatturato per cliente */}
      <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Fatturato per Cliente</h3>
        <div className="space-y-3">
          {clientRevenue.map(client => (
            <div key={client.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-10 rounded-full" style={{ backgroundColor: client.color }}></div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{client.name}</p>
                  <p className="text-[10px] text-slate-500">{client.days.toFixed(1)} giorni · {client.hours}h</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-brand-400">€{client.revenue.toFixed(0)}</p>
                <p className="text-[10px] text-slate-500">{((client.revenue / totalRevenue) * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grafico ore per cliente */}
      {chartData.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Ore per Cliente</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="ore" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribuzione modalità di lavoro */}
      {workModeData.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Modalità di Lavoro</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="40%" height={120}>
              <PieChart>
                <Pie
                  data={workModeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {workModeData.map(mode => (
                <div key={mode.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mode.color }}></div>
                    <p className="text-sm font-bold text-white">{mode.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{mode.value}h</p>
                    <p className="text-[10px] text-slate-500">{((mode.value / totalHours) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messaggio se non ci sono dati */}
      {monthEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-600 font-bold">Nessun evento registrato</p>
          <p className="text-xs text-slate-700 mt-2">Aggiungi eventi al calendario per vedere le statistiche</p>
        </div>
      )}
    </div>
  );
}
