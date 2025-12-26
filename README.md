# 📊 Gestionale PRO - Time Management App

Una moderna Progressive Web App per la gestione professionale del tempo, clienti e fatturazione.

## ✨ Caratteristiche

- 📅 **Calendario Interattivo**: Gestisci i tuoi impegni con un calendario mensile intuitivo
- 👥 **Gestione Clienti**: Traccia clienti, tariffe giornaliere e contratti
- 📈 **Statistiche Avanzate**: Visualizza grafici e analytics dettagliati
- 🤖 **Assistente AI**: Assistente intelligente con riconoscimento vocale (Gemini)
- 🎨 **Design Moderno**: UI ispirata a Samsung S25 Ultra con tema dark
- 💾 **Backup/Restore**: Esporta e importa i tuoi dati
- 📤 **Export ICS**: Esporta il calendario in formato iCalendar
- 📱 **PWA Ready**: Installabile come app mobile

## 🚀 Installazione Locale

### Prerequisiti
- Node.js 18+ 

### Setup

1. **Installa le dipendenze**
\`\`\`bash
npm install
\`\`\`

2. **Configura l'API Gemini** (opzionale, per l'assistente AI)
   - Vai su [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crea una chiave API
   - Modifica il file \`.env.local\` e inserisci la tua chiave:
   \`\`\`
   VITE_GEMINI_API_KEY=tua_chiave_qui
   \`\`\`

3. **Avvia l'app in modalità sviluppo**
\`\`\`bash
npm run dev
\`\`\`

4. **Build per produzione**
\`\`\`bash
npm run build
\`\`\`

## 🎯 Funzionalità Principali

### 📅 Calendario
- Visualizzazione mensile con navigazione
- Aggiunta rapida eventi
- Indicatori visivi per cliente
- Modalità lavoro: Sede / Smart Working
- Ore configurabili per evento

### 👥 Gestione Clienti
- Tipologia: P.IVA o Società
- Tariffa giornaliera personalizzata
- Tracciamento giorni contrattati
- Colori personalizzati
- Statistiche per cliente

### 📊 Analytics
- Ore totali e giorni lavorati
- Fatturato mensile
- Produttività
- Distribuzione modalità lavoro
- Grafici interattivi (Recharts)

### 🤖 Assistente AI
- Risposte intelligenti sui tuoi dati
- Riconoscimento vocale (Web Speech API)
- Analisi statistiche
- Consigli personalizzati

### 💾 Backup & Export
- Backup completo in JSON
- Import dati
- Export calendario in formato ICS

## 🛠️ Stack Tecnologico

- **Frontend**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Date**: date-fns
- **Icons**: Lucide React
- **AI**: Google Gemini API

## 📱 Installazione come PWA

1. Apri l'app nel browser (Chrome/Safari)
2. Clicca su "Installa app" o "Aggiungi a Home"
3. L'app sarà disponibile come applicazione nativa

## 🔒 Privacy e Dati

- I dati sono salvati solo nel localStorage del browser
- Nessun server esterno (eccetto API Gemini se abilitata)
- Backup completamente locale
- Controllo totale sui tuoi dati

## 🐛 Troubleshooting

### L'assistente AI non funziona
- Verifica di aver impostato \`VITE_GEMINI_API_KEY\` in \`.env.local\`
- L'app funziona anche senza API key con risposte simulate

### Il riconoscimento vocale non funziona
- Verifica di essere su HTTPS o localhost
- Controlla i permessi del microfono
- Compatibile solo con Chrome/Edge

### Problemi con il calendario
- Pulisci il localStorage: \`localStorage.clear()\`
- Importa un backup precedente

## 📄 Licenza

MIT License - Sentiti libero di usare e modificare!

---

Creato con ❤️ usando React + Vite + TailwindCSS
