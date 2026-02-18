# EVO Exit Time Calculator - Changelog

Questo documento traccia le modifiche e gli aggiornamenti attraverso le diverse versioni dello UserScript "EVO Exit Time Calculator".

---

## **Versione 4.3**
* **Data di Rilascio:** 18 Febbraio 2026
* **Autore:** Stefano
* **Modifiche Principali:**
    * **📱 Ottimizzazione Mobile Completa:** Lo script ora include un layout completamente responsive per dispositivi mobile.
    * **Layout Responsive:**
        * Font ingranditi per leggibilità perfetta su smartphone (1.8-2rem per controlli, 2rem bold per valore uscita)
        * Controlli touch-friendly con dimensioni adeguate
        * Adattamento automatico basato su larghezza schermo (<768px), orientamento e tipo di input (touch)
        * Supporto specifico per schermi molto piccoli (≤480px portrait)
    * **Integrazione con EVO - Vista Mobile Cartellino:**
        * Quando usato insieme allo script [EVO - Vista Mobile Cartellino](https://github.com/stefano-salvatore7/evo-mobile-cartellino-test), il widget viene automaticamente integrato nella barra superiore mobile
        * Polling intelligente (200ms) per attendere il container se gli script si caricano in ordine diverso
        * Tutti gli event listener e funzionalità rimangono intatti durante lo spostamento
        * L'orario calcolato appare anche come pillola **⏰ HH:MM** nell'header della card del giorno corrente
    * **Media Queries Avanzate:**
        * `@media (max-width: 1024px) and (orientation: portrait)` - Tablet e smartphone in portrait
        * `@media (max-width: 768px)` - Smartphone in landscape
        * `@media (hover: none) and (pointer: coarse)` - Dispositivi touch indipendentemente dalla risoluzione
        * `@media (max-width: 480px) and (orientation: portrait)` - Schermi molto piccoli
    * **CSS Mobile-Specific:**
        * Container widget: `width: 100%`, `flex-wrap: wrap`, gap aumentato a 1.2rem
        * Select fascia oraria: `font-size: 1.8rem`, `min-width: 10rem`, appearance reset per iOS
        * Switch 7:12/6:01: `font-size: 1.8rem`, `min-width: 9rem`, padding aumentato
        * Box uscita: `font-size: 1.8rem` (label) e `2rem bold` (valore)
        * Pillola tabella: `font-size: 1.6rem`
    * **Compatibilità Garantita:**
        * Testato su Firefox Mobile (Android) e Orion Browser (iOS)
        * Funziona perfettamente sia standalone che integrato con Vista Mobile Cartellino
        * Nessun conflitto con gli altri script EVO (Icona Giorno OK, Icona Pasti, EVO Mobile Plus)

---

## **Versione 4.0**
* **Data di Rilascio:** 24 Gennaio 2026
* **Autore:** Stefano
* **Modifiche Principali:**
    * **🔄 Adattamento Completo al Nuovo HRSuite EVO:** Lo script è stato completamente riscritto per adattarsi all'aggiornamento della piattaforma HRSuite EVO del 24/01/2026, che ha introdotto una nuova struttura HTML per il cartellino presenze.
    * **Nuova Struttura HTML Supportata:** 
        * Il sistema ora utilizza elementi `div.clocking.entry` e `div.clocking.exit` con icone Material Symbols (`arrow_forward` e `arrow_back`) invece dei precedenti badge con testo "E HH:mm" / "U HH:mm".
        * Gli orari sono ora contenuti in `<span class="fw-bold text-black">`.
        * Ogni riga della tabella è identificata dal formato "N giorno" (es. "24 sab").
    * **Filtro per Giorno Corrente:** Implementata una nuova funzione `estraiTimbratureGiornoCorrente()` che:
        * Identifica la riga della tabella corrispondente al giorno corrente basandosi sul numero del giorno.
        * Estrae **solo** le timbrature presenti in quella riga specifica, risolvendo il bug che causava il calcolo su timbrature di giorni precedenti.
    * **Badge nella Tabella Aggiornato:**
        * Il badge dell'orario di uscita calcolato viene ora inserito nella colonna "Orario" (indice 4), **sostituendo** completamente il contenuto esistente (es. "8086").
        * Icona aggiornata da "U" a **➡️** per una migliore identificazione visiva dell'orario di uscita.
    * **Posizionamento UI Migliorato:** Algoritmo di ricerca più robusto per il contenitore dei bottoni, con fallback multipli (`.row.buttons` → `div.row.mb-2` → `div.row` → inserimento dopo bottone "Aggiorna").
    * **Versione Incrementata:** Aggiornamento del numero di versione a **4.0** per riflettere i cambiamenti sostanziali nell'architettura dello script.
    * **Codice Refactoring:** Migliorata la leggibilità e la manutenibilità del codice con funzioni più modulari e commenti aggiornati.

---

## **Versione 3.2**
* **Data di Rilascio:** 26 Luglio 2025
* **Autore:** Stefano
* **Modifiche Principali:**
    * **Ristrutturazione UI Complessa:** L'interfaccia utente è stata completamente ripensata per un design più pulito e funzionale. I bottoni "Ora del Giorno" e "6 ore e 11" sono stati sostituiti da uno **switch toggle compatto** per selezionare la modalità di calcolo (7:12 o 6:01).
    * **Box Uscita Dedicata:** L'orario di uscita calcolato non è più una "pillola" all'interno della tabella EVO, ma è visualizzato in una **box dedicata e compatta** (`"Uscita: HH:mm"`) con uno sfondo grigio chiaro (`#DDD8D8`) e un bordo sottile, posizionata vicino ai controlli principali per una visibilità immediata.
    * **Persistent Mode Selection:** La selezione della modalità di calcolo (7:12 o 6:01) è ora persistente e viene salvata automaticamente.
    * **Posizionamento Migliorato:** Il nuovo blocco UI (`fascia + switch + box uscita`) è ancorato in modo più robusto nella pagina per garantire una visualizzazione coerente.
    * **Consolidamento e Pulizia Codice:** Refactoring significativo del codice per migliorare la leggibilità, la manutenibilità e l'efficienza. Tutte le configurazioni chiave sono ora centralizzate all'inizio dello script.
    * **Aggiornamento del Font:** Il font "Open Sans" è stato mantenuto e applicato in modo più uniforme ai nuovi elementi dell'interfaccia.

---

## **Versione 2.4**
* **Data di Rilascio:** 22 Luglio 2025
* **Autore:** Stefano
* **Modifiche:**
    * **Font Personalizzato:** Introdotto il supporto per il font **"Open Sans"** di Google Fonts. Il font viene ora applicato a tutti gli elementi UI generati dallo script (selettore della fascia, bottoni "Ora del Giorno" e "6 ore e 11", e la pillola dell'orario di uscita) per migliorare l'estetica e la coerenza visiva.
    * **Colori Bottoni Aggiornati:**
        * "Ora del Giorno" (`7h 12m`): Aggiornato a **Dusty Red** (`#bb2e29`).
        * "6 ore e 11" (`6h 1m`): Aggiornato a **Cedar Chest** (`#c85753`).
    * **Miglioramenti Interni:** Aggiunta una classe CSS (`custom-button-container`) al div contenitore dei bottoni e al selettore, e (`custom-exit-time-pill`) allo span dell'orario di uscita per una gestione più robusta dello stile.

---

## **Versione 2.3**
* **Data di Rilascio:** 22 Luglio 2025
* **Autore:** Stefano
* **Modifiche:**
    * **Colori Bottoni Aggiornati:**
        * "Ora del Giorno" (`7h 12m`): Il colore del bottone e della pillola è stato cambiato a **Dusty Red** (`#bb2e29`).
        * "6 ore e 11" (`6h 1m`): Il colore del bottone e della pillola è stato cambiato a **Cedar Chest** (`#c85753`).

---

## **Versione 2.1**
* **Data di Rilascio:** 22 Luglio 2025
* **Autore:** Stefano
* **Modifiche:**
    * **Colore "Ora del Giorno" Aggiornato:** Il bottone "Ora del Giorno" (`7h 12m`) e la rispettiva pillola dell'orario di uscita sono stati modificati al colore **Rosso** (`#dc3545`).
    * **Forzatura Aggiornamento:** Modifica del numero di versione per facilitare l'aggiornamento automatico su Tampermonkey.

---

## **Versione 2.0 (Unificato)**
* **Data di Rilascio:** 22 Luglio 2025
* **Autore:** Stefano
* **Modifiche:**
    * **Unificazione Completa:** Fuso il calcolatore "Ora del Giorno (fascia oraria)" e "6 ore e 11" in un **singolo userscript**. Questo script sostituisce e rende obsoleti tutti i precedenti script separati.
    * **Logica di Ingresso Condivisa:** Entrambi i calcoli (per 7h 12m e 6h 1m di lavoro netto) ora utilizzano il **limite inferiore della fascia oraria selezionata** (ad esempio, il limite inferiore di `07:30`, `08:00`, `08:30`) come orario di ingresso considerato, se la prima timbratura effettiva è antecedente. Se la timbratura è successiva alla fascia, viene usata la timbratura effettiva.
    * **Interfaccia Utente Coerente:**
        * Introdotto un **unico selettore di fascia oraria** persistente, la cui preferenza viene salvata automaticamente.
        * Introdotti **due bottoni dedicati** per l'avvio dei calcoli: "Ora del Giorno" (verde) e "6 ore e 11" (blu).
        * Tutti gli elementi UI (selettore e bottoni) sono posizionati in un unico blocco, affianco ai controlli principali della pagina, con un robusto fallback accanto al bottone "Aggiorna" se il contenitore esatto non viene trovato nel DOM.
    * **Colori Aggiornati:** La "pillola" dell'orario di uscita e il bottone "6 ore e 11" sono ora di colore blu.
    * **Manutenzione Semplificata:** La logica condivisa in un unico script riduce la complessità e facilita futuri aggiornamenti e debug.

---

## **Versioni Pre-Unificazione (Script Separati)**

### **Script: EVO Exit Time Calculator (TEST con Fascia Oraria) - (Versioni più recenti)**

* **Versione 1.27:**
    * **Data di Rilascio:** 22 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:** Correzioni minori alla rilevazione dei badge (gestione del `.tipo`) e all'accuratezza del calcolo dei minuti lavorativi (aggiustato a 432 minuti per 7h 12m).
* **Versione 1.25:**
    * **Data di Rilascio:** 22 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Orario d'Ingresso Flessibile:** Introdotta una condizione per cui se la prima timbratura di ingresso (`E`) è antecedente al limite inferiore della fascia oraria selezionata (es. **07:30** per fascia 07:30-08:30), l'orario di inizio per il calcolo viene comunque fissato a quel limite. Questo assicura che il calcolo dell'uscita non sia influenzato da ingressi troppo anticipati.
        * **Tooltip Dettagliato:** Il tooltip dell'orario di uscita ora mostra sia l'orario di ingresso effettivo che quello considerato (ad esempio, "Entrata effettiva: 07:27 | Entrata considerata: 07:30").
* **Versione 1.24:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Miglioramento Visuale Orario:** L'orario di uscita calcolato viene ora visualizzato all'interno di una "pillola" stilizzata con sfondo **blu** e testo **bianco**, migliorandone leggibilità e integrazione.
* **Versione 1.23:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Sovrascrittura Cella Orario:** Il calcolo dell'orario di uscita sostituisce ora completamente qualsiasi contenuto precedente nella cella di destinazione, garantendo una visualizzazione singola e chiara.
* **Versione 1.22:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Supporto Telelavoro:** Aggiunto il supporto per il parsing dei formati di timbratura specifici per il "Telelavoro" (`E[HH:mm]` e `U[HH:mm]`), oltre al formato standard (`E HH:mm`, `U HH:mm`).
* **Versione 1.21:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:** Nessun cambiamento funzionale significativo rispetto alla v1.19. (Potrebbe essere stata un test o un'etichetta provvisoria).
* **Versione 1.19:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Testo Bottone Aggiornato:** Il testo del bottone per avviare il calcolo è stato modificato da "Calcola uscita oggi" a **"Ora del Giorno"**.
* **Versione 1.18:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Gestione Pausa Minima:** Introdotta una **pausa minima predefinita di 10 minuti**. Se non viene rilevata una pausa U/E o se è inferiore a 10 minuti, vengono comunque considerati 10 minuti. Altrimenti, viene utilizzata la pausa U/E effettiva (se valida).
* **Versione 1.17:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Visibilità Selettiva Bottone:** Il bottone "Ora del Giorno" appare ora **esclusivamente sulla pagina "Cartellino"**.
* **Versione 1.16:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * **Correzioni UI:** Risolti problemi relativi al posizionamento del bottone "Calcola uscita oggi", garantendone l'ancoraggio corretto accanto al bottone "Aggiorna". Aggiunti `stopPropagation()` e `preventDefault()` per migliorare la gestione degli eventi.
* **Versione 1.0 - 1.15:**
    * **Data di Rilascio:** *Date varie (precedenti a Luglio 2025)*
    * **Autore:** Stefano
    * **Modifiche:** Implementazione iniziale del meccanismo di calcolo dell'orario di uscita basato su un turno di 7 ore e 12 minuti. Introduzione e perfezionamento della logica di rilevamento e gestione della pausa tra le timbrature di Uscita (`U`) ed Entrata (`E`). Varie correzioni di bug, ottimizzazioni del codice e miglioramenti della stabilità.

### **Script: EVO Exit Time Calculator (6h 11m) - (Versioni più recenti)**

* **Versione 1.14 (ultima versione separata):**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:**
        * Colore bottone e pillola orario cambiati da viola a blu.
        * Migliorato il posizionamento di fallback: il bottone si posiziona immediatamente accanto ad "Aggiorna" se l'altro script non è attivo, con un margine di 10px a sinistra.
        * Rimozione del margine sinistro quando si posiziona accanto al blocco "Ora del Giorno".
* **Versione 1.13:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:** Migliorata la logica di posizionamento per garantire un posizionamento più rapido e affidabile accanto al blocco "Fascia Oraria + Ora del Giorno" (se l'altro script è attivo) o accanto ad "Aggiorna" (fallback).
* **Versione 1.12:**
    * **Data di Rilascio:** 18 Luglio 2025
    * **Autore:** Stefano
    * **Modifiche:** Introdotta attesa attiva per il posizionamento del bottone accanto al blocco "Ora del Giorno", con fallback su "Aggiorna" dopo timeout.
* **Versione 1.x (versioni iniziali):**
    * **Data di Rilascio:** *Date varie (precedenti a Luglio 2025)*
    * **Autore:** Stefano
    * **Modifiche:** Implementazione iniziale del calcolatore per turni di 6 ore e 11 minuti con logiche di base per il rilevamento delle timbrature e il calcolo dell'orario di uscita.
