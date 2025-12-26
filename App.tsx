
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, BarChart2, Plus, Download, Upload, X, Database, ChevronLeft, ChevronRight, MapPin, Laptop, Settings } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns';
import it from 'date-fns/locale/it';
import { Client, CalendarEvent, ViewType, WorkMode } from './types';
import { ClientManager } from './components/ClientManager';
import { StatsPanel } from './components/StatsPanel';
import { GeminiAssistant } from './components/GeminiAssistant';

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Cliente Demo', type: 'SocietÃ ', dailyRate: 350, totalDaysContracted: 20, color: '#0ea5e9' },
];

export default function App() {
  const [view, setView] = useState<ViewType>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('gtl_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('gtl_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<Partial<CalendarEvent>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem('gtl_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('gtl_events', JSON.stringify(events)); }, [events]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }) 
  });

  const triggerFeedback = () => {
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const saveEvent = () => {
    if (!modalEvent.clientId || !modalEvent.date) return;
    triggerFeedback();
    const newEvent = { 
      ...modalEvent, 
      id: modalEvent.id || crypto.randomUUID(),
      mode: modalEvent.mode || WorkMode.ON_SITE,
      hours: modalEvent.hours || 8
    } as CalendarEvent;

    setEvents(prev => {
      const filtered = prev.filter(e => e.id !== newEvent.id);
      return [...filtered, newEvent];
    });
    setIsModalOpen(false);
  };

  const exportBackup = () => {
    const data = { clients, events };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gtl_${format(new Date(), 'yyyyMMdd')}.json`;
    a.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.clients && data.events) {
          setClients(data.clients);
          setEvents(data.events);
          alert('Dati importati!');
        }
      } catch { alert('File non valido'); }
    };
    reader.readAsText(file);
  };

  const exportICS = () => {
    const currentMonthEvents = events.filter(e => isSameMonth(parseISO(e.date), currentDate));
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\n";
    currentMonthEvents.forEach(ev => {
      const c = clients.find(cl => cl.id === ev.clientId);
      const d = ev.date.replace(/-/g, '');
      ics += `BEGIN:VEVENT\nSUMMARY:${c?.name || 'Lavoro'}\nDTSTART;VALUE=DATE:${d}\nDTEND;VALUE=DATE:${d}\nEND:VEVENT\n`;
    });
    ics += "END:VCALENDAR";
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendario_${format(currentDate, 'MMMM_yyyy', { locale: it })}.ics`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen bg-black select-none">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shrink-0">
        <div>
           <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
             {view === 'calendar' ? format(currentDate, 'MMMM', { locale: it }) : 
              view === 'clients' ? 'Clienti' : 'Analisi'}
           </h1>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(currentDate, 'yyyy')}</p>
        </div>
        <div className="flex gap-2">
           {view === 'calendar' && (
             <button onClick={exportICS} className="p-2 bg-slate-900 rounded-full text-brand-400">
               <Download size={20} />
             </button>
           )}
           <button onClick={() => setIsDataModalOpen(true)} className="p-2 bg-slate-900 rounded-full text-slate-400">
             <Settings size={20} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {view === 'calendar' && (
          <div className="p-2">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex gap-4">
                <button onClick={() => setCurrentDate(addMonths(currentDate, -1))} className="p-1 text-slate-500"><ChevronLeft/></button>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 text-slate-500"><ChevronRight/></button>
              </div>
              <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="text-xs font-bold text-brand-400 uppercase">Oggi</button>
            </div>
            <div className="grid grid-cols-7 gap-1 bg-slate-900/50 p-1 rounded-2xl">
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(d => <div key={d} className="text-[10px] font-black text-slate-600 text-center py-2">{d}</div>)}
              {calendarDays.map(day => {
                const dayEvs = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));
                const isSel = isSameDay(day, selectedDate);
                const isCurr = isSameMonth(day, currentDate);
                return (
                  <div 
                    key={day.toISOString()} 
                    onClick={() => { setSelectedDate(day); triggerFeedback(); }}
                    className={`aspect-square relative rounded-xl flex flex-col items-center justify-center transition-all ${isSel ? 'bg-brand-600 scale-95 shadow-lg shadow-brand-500/20' : 'bg-slate-950/40'} ${!isCurr ? 'opacity-20' : ''}`}
                  >
                    <span className={`text-xs font-bold ${isSel ? 'text-white' : isToday(day) ? 'text-brand-400' : 'text-slate-400'}`}>{format(day, 'd')}</span>
                    <div className="flex gap-0.5 mt-1">
                      {dayEvs.map(e => (
                        <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: clients.find(c => c.id === e.clientId)?.color }}></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 px-4 space-y-3">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Impegni del {format(selectedDate, 'd MMMM', {locale: it})}</h3>
               {events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 ? (
                 <button 
                  onClick={() => { setModalEvent({ date: format(selectedDate, 'yyyy-MM-dd'), clientId: clients[0]?.id }); setIsModalOpen(true); }}
                  className="w-full py-4 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 font-bold text-sm flex items-center justify-center gap-2"
                 >
                   <Plus size={18}/> AGGIUNGI LAVORO
                 </button>
               ) : (
                 events.filter(e => e.date === format(selectedDate, 'yyyy-MM-dd')).map(ev => {
                   const c = clients.find(cl => cl.id === ev.clientId);
                   return (
                     <div key={ev.id} onClick={() => { setModalEvent(ev); setIsModalOpen(true); }} className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-10 rounded-full" style={{ backgroundColor: c?.color }}></div>
                           <div>
                              <p className="font-bold text-white">{c?.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold flex gap-2">
                                {ev.mode === WorkMode.SMART_WORKING ? <Laptop size={10}/> : <MapPin size={10}/>} {ev.hours} ORE
                              </p>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-700"/>
                     </div>
                   );
                 })
               )}
            </div>
          </div>
        )}
        {view === 'clients' && <ClientManager clients={clients} setClients={setClients} events={events} />}
        {view === 'stats' && <StatsPanel clients={clients} events={events} currentDate={currentDate} />}
      </main>

      {/* Modals e navigazione rimangono come nel design precedente ma con stile S25 Ultra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-2">
          <div className="bg-slate-900 w-full max-w-md rounded-[40px] p-8 border border-slate-800 space-y-6 mb-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Dettaglio Giorno</h3>
                <button onClick={() => setIsModalOpen(false)}><X/></button>
             </div>
             <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-3xl">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Cliente</label>
                  <select value={modalEvent.clientId} onChange={e => setModalEvent({...modalEvent, clientId: e.target.value})} className="w-full bg-transparent font-bold text-white outline-none">
                    {clients.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-3xl">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">Ore</label>
                    <input type="number" value={modalEvent.hours || 8} onChange={e => setModalEvent({...modalEvent, hours: Number(e.target.value)})} className="w-full bg-transparent font-bold text-white outline-none"/>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-3xl">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block">ModalitÃ </label>
                    <select value={modalEvent.mode} onChange={e => setModalEvent({...modalEvent, mode: e.target.value as WorkMode})} className="w-full bg-transparent font-bold text-white outline-none uppercase text-xs">
                      <option value={WorkMode.ON_SITE} className="bg-slate-900">Sede</option>
                      <option value={WorkMode.SMART_WORKING} className="bg-slate-900">Smart</option>
                    </select>
                  </div>
                </div>
                <button onClick={saveEvent} className="w-full bg-brand-600 py-5 rounded-[28px] font-black text-white shadow-xl shadow-brand-500/20 active:scale-95 transition-all">SALVA</button>
                {modalEvent.id && (
                  <button onClick={() => { setEvents(prev => prev.filter(e => e.id !== modalEvent.id)); setIsModalOpen(false); }} className="w-full text-red-500 font-bold text-xs uppercase py-2">Elimina</button>
                )}
             </div>
          </div>
        </div>
      )}

      {isDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6">
          <div className="bg-slate-900 w-full max-w-xs rounded-[40px] p-6 border border-slate-800 space-y-4 text-center">
             <Database size={40} className="mx-auto text-brand-500 mb-2"/>
             <h3 className="font-bold">Backup Dati</h3>
             <button onClick={exportBackup} className="w-full py-4 bg-slate-800 rounded-2xl font-bold flex items-center justify-center gap-2">
               <Download size={18}/> Esporta .JSON
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-slate-800 rounded-2xl font-bold flex items-center justify-center gap-2">
               <Upload size={18}/> Importa Backup
             </button>
             <input type="file" ref={fileInputRef} onChange={importBackup} className="hidden" accept=".json"/>
             <button onClick={() => setIsDataModalOpen(false)} className="text-slate-500 text-xs font-bold uppercase pt-4">Chiudi</button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-900 px-8 py-4 flex justify-between items-center safe-bottom z-40">
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 ${view === 'calendar' ? 'text-brand-400' : 'text-slate-600'}`}>
          <Calendar size={24} />
          <span className="text-[10px] font-black uppercase">Home</span>
        </button>
        <div className="relative -top-8">
           <button 
             onClick={() => { setModalEvent({ date: format(selectedDate, 'yyyy-MM-dd'), clientId: clients[0]?.id }); setIsModalOpen(true); triggerFeedback(); }}
             className="w-16 h-16 bg-brand-600 rounded-full shadow-2xl shadow-brand-500/40 flex items-center justify-center text-white active:scale-90 transition-transform"
           >
             <Plus size={32} />
           </button>
        </div>
        <button onClick={() => setView('clients')} className={`flex flex-col items-center gap-1 ${view === 'clients' ? 'text-brand-400' : 'text-slate-600'}`}>
          <Users size={24} />
          <span className="text-[10px] font-black uppercase">Clienti</span>
        </button>
        <button onClick={() => setView('stats')} className={`flex flex-col items-center gap-1 ${view === 'stats' ? 'text-brand-400' : 'text-slate-600'}`}>
          <BarChart2 size={24} />
          <span className="text-[10px] font-black uppercase">Dati</span>
        </button>
      </nav>

      <GeminiAssistant clients={clients} events={events} currentDate={format(currentDate, 'yyyy-MM-dd')} />
    </div>
  );
}
