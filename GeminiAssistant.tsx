import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Mic, MicOff } from 'lucide-react';
import { Client, CalendarEvent } from '../types';

interface GeminiAssistantProps {
  clients: Client[];
  events: CalendarEvent[];
  currentDate: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function GeminiAssistant({ clients, events, currentDate }: GeminiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente intelligente. Posso aiutarti a gestire il tuo calendario, analizzare le statistiche e rispondere a domande sui tuoi clienti e impegni.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Inizializza Web Speech API per il riconoscimento vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'it-IT';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Il riconoscimento vocale non è supportato dal tuo browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const getContextData = () => {
    const monthEvents = events.filter(e => e.date.startsWith(currentDate.substring(0, 7)));
    const totalHours = monthEvents.reduce((sum, e) => sum + e.hours, 0);
    const clientStats = clients.map(c => ({
      name: c.name,
      events: events.filter(e => e.clientId === c.id).length,
      hours: events.filter(e => e.clientId === c.id).reduce((sum, e) => sum + e.hours, 0)
    }));

    return {
      currentDate,
      totalClients: clients.length,
      totalEvents: events.length,
      monthEvents: monthEvents.length,
      monthHours: totalHours,
      clients: clientStats
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = getContextData();
      const systemPrompt = `Sei un assistente intelligente per la gestione del tempo e del lavoro. 
      L'utente ha ${context.totalClients} clienti e ${context.totalEvents} eventi registrati.
      Questo mese ci sono ${context.monthEvents} eventi per un totale di ${context.monthHours} ore.
      Rispondi in modo conciso e utile in italiano. Puoi analizzare dati, dare consigli e rispondere a domande.`;

      // Usa l'API Gemini se disponibile, altrimenti simula una risposta
      const apiKey = (window as any).process?.env?.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
      
      let assistantMessage = '';

      if (apiKey) {
        // Chiamata reale all'API Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nContesto: ${JSON.stringify(context)}\n\nDomanda: ${userMessage}`
              }]
            }]
          })
        });

        const data = await response.json();
        assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Scusa, non ho potuto elaborare la richiesta.';
      } else {
        // Risposte simulate intelligenti
        assistantMessage = generateSmartResponse(userMessage, context);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Errore:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSmartResponse = (question: string, context: any): string => {
    const q = question.toLowerCase();

    if (q.includes('quant') && (q.includes('ore') || q.includes('tempo'))) {
      return `Questo mese hai lavorato ${context.monthHours} ore in totale, distribuite su ${context.monthEvents} eventi.`;
    }
    if (q.includes('client')) {
      const topClient = context.clients.reduce((max: any, c: any) => c.hours > (max?.hours || 0) ? c : max, null);
      return topClient 
        ? `Hai ${context.totalClients} clienti attivi. Il cliente con più ore lavorate è ${topClient.name} con ${topClient.hours} ore.`
        : `Hai ${context.totalClients} clienti registrati.`;
    }
    if (q.includes('statistiche') || q.includes('analisi')) {
      return `Ecco un riepilogo: ${context.totalClients} clienti, ${context.totalEvents} eventi totali, di cui ${context.monthEvents} questo mese per ${context.monthHours} ore.`;
    }
    if (q.includes('produttiv') || q.includes('performance')) {
      const avgDaily = context.monthEvents > 0 ? (context.monthHours / context.monthEvents * 8 / 8).toFixed(1) : 0;
      return `La tua produttività media è di circa ${avgDaily} giorni lavorativi equivalenti questo mese.`;
    }
    if (q.includes('consiglio') || q.includes('suggerimento')) {
      return 'Ti consiglio di mantenere un equilibrio tra modalità in sede e smart working. Controlla regolarmente le statistiche per ottimizzare il tuo tempo!';
    }

    return 'Sono qui per aiutarti! Puoi chiedermi informazioni sui tuoi clienti, statistiche del lavoro, analisi delle ore, o consigli sulla gestione del tempo.';
  };

  return (
    <>
      {/* Pulsante floating */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full shadow-2xl shadow-purple-500/40 flex items-center justify-center text-white z-30 active:scale-90 transition-all"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shrink-0">
            <div>
              <h2 className="text-xl font-black text-white">Assistente AI</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gemini Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 bg-slate-900 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-3xl ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-900/50 text-slate-100 border border-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 safe-bottom">
            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                className={`p-4 rounded-2xl transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-900 text-slate-400'
                }`}
                disabled={isLoading}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Chiedi qualcosa..."
                className="flex-1 bg-slate-900 text-white px-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-4 bg-brand-600 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
