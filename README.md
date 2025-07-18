# EVO Exit Time Calculator

Questo script Tampermonkey/Greasemonkey è progettato per il sistema di gestione delle presenze EVO (usato su `personale-unibo.hrgpi.it`). Calcola automaticamente l'orario di uscita previsto per la giornata corrente, tenendo conto delle timbrature e dell'eventuale pausa.

**(Versione Script: 1.17)**

## Caratteristiche

* **Calcolo Orario di Uscita:** Determina l'orario di uscita necessario per completare le 7 ore e 12 minuti di lavoro.
* **Gestione Pausa Pranzo:** Calcola e include nel totale lavorato la durata della pausa pranzo (ultima "U" seguita dalla prima "E").
* **Iniezione Diretta:** Visualizza l'orario calcolato direttamente nella tabella delle timbrature del giorno.
* **Posizionamento Intuitivo:** Il bottone "Calcola uscita oggi" è posizionato strategicamente accanto al bottone "Aggiorna".
* **Apparizione Condizionale:** Il bottone appare **esclusivamente sulla pagina "Cartellino"** per garantire il corretto funzionamento e evitare la comparsa su altre sezioni del portale EVO.

## Installazione

Per installare e utilizzare questo script, segui questi passaggi:

1.  **Installa un'estensione per Userscript:** Se non l'hai già fatto, installa un'estensione nel tuo browser che supporti gli Userscript. Le più popolari sono:
    * [**Tampermonkey**](https://www.tampermonkey.net/) (Consigliato per Chrome, Edge, Safari, Opera, Firefox)
    * [**Greasemonkey**](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Per Firefox)

2.  **Installa lo Script:**
    Clicca sul seguente link. L'estensione Userscript che hai installata ti chiederà di confermare l'installazione dello script.

    [**Clicca qui per installare EVO Exit Time Calculator**](https://raw.githubusercontent.com/stefano-salvatore7/evo-exit-time-calc/main/evo-exit-time-calculator.user.js)

## Utilizzo

Una volta installato, lo script si attiverà automaticamente quando visiterai la pagina delle timbrature EVO su `https://personale-unibo.hrgpi.it/*`.

1.  Naviga alla pagina delle timbrature (assicurati che sia la pagina "Cartellino").
2.  Trova il bottone "Calcola uscita oggi" posizionato accanto al bottone "Aggiorna".
3.  Clicca su "Calcola uscita oggi" per visualizzare l'orario di uscita calcolato per il giorno corrente nella tabella.

## Contributi (Facoltativo)

Se desideri contribuire a migliorare questo script, sentiti libero di aprire una "Issue" o proporre una "Pull Request" sul repository GitHub.

---

*Sviluppato con l'assistenza di Gemini.*
