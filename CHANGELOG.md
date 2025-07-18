### **EVO Exit Time Calculator - Log delle Versioni**

---

**Versione 1.24**
* **Data di Rilascio:** 18 Luglio 2025
* **Autore:** Stefano
* **Modifiche:** **Miglioramento visuale dell'orario calcolato nella cella.** L'orario viene ora visualizzato all'interno di una "pillola" con sfondo blu e testo bianco, per una maggiore leggibilità e coerenza visiva con i bottoni.

---

**Versione 1.23**
* **Data di Rilascio:** 18 Luglio 2025
* **Autore:** Stefano
* **Modifiche:** Implementata la **sovrascrittura completa della cella orario**. Quando si clicca sul bottone "Ora del Giorno", l'orario calcolato (per 7h 12m) sostituisce qualsiasi contenuto precedente nella cella, garantendo una visualizzazione singola e chiara. Aggiornate le descrizioni.

---

**Versione 1.22**
* **Data di Rilascio:** 18 Luglio 2025
* **Autore:** Stefano
* **Modifiche:** Migliorato il parsing degli orari per supportare sia `E HH:mm` che `E[HH:mm]` (modalità telelavoro).

---

**Versione 1.21**
* **Modifiche:** Nessun cambiamento funzionale rispetto alla v1.19.

---

**Versione 1.19**
* **Modifiche:** Testo del bottone modificato da "Calcola uscita oggi" a "Ora del Giorno".

---

**Versione 1.18**
* **Modifiche:** Implementata pausa minima predefinita di 10 minuti. Utilizza 10 minuti se non c'è pausa U/E o se è inferiore a 10 minuti; altrimenti, usa la pausa U/E effettiva (se valida).

---

**Versione 1.17**
* **Modifiche:** Il bottone appare ora solo sulla pagina "Cartellino" (basato su `div.title-label` con testo "Cartellino").
---

**Versione 1.16**
* **Modifiche:** Risolto problema di posizionamento del bottone "Calcola uscita oggi"; aggiunti `stopPropagation()` e `preventDefault()` per evitare conflitti di eventi.

---

**Versione 1.0 - 1.15**
* **Modifiche:** Implementazione iniziale del calcolo orario e della gestione pausa (U/E). Correzioni e ottimizzazioni varie.







**Versione 1.22**
* **Modifiche:** Aggiunto supporto per il formato timbrature "Telelavoro" (`E[HH:mm]`, `U[HH:mm]`) oltre al formato standard. Migliorata la robustezza del parsing delle timbrature.

---
