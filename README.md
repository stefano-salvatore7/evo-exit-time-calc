# EVO Exit Time Calculator

Questo script Tampermonkey/Greasemonkey è progettato per il sistema di gestione delle presenze EVO (usato su `personale-unibo.hrgpi.it`). Calcola automaticamente l'orario di uscita previsto per la giornata corrente, tenendo conto delle timbrature e dell'eventuale pausa.

**(Versione Script: 1.19)**

## Caratteristiche

* **Calcolo Orario di Uscita:** Determina l'orario di uscita necessario per completare le 7 ore e 12 minuti di lavoro.
* **Gestione Pausa Pranzo:** Calcola e include nel totale lavorato la durata della pausa pranzo (ultima "U" seguita dalla prima "E"). Aggiunge una pausa predefinita di 10 minuti se non rilevata o troppo breve (utilizza il valore maggiore tra la pausa effettiva e i 10 minuti).
* **Iniezione Diretta:** Visualizza l'orario calcolato direttamente nella tabella delle timbrature del giorno.
* **Posizionamento Intuitivo:** Il bottone "**Ora del Giorno**" è posizionato strategicamente accanto al bottone "Aggiorna".
* **Apparizione Condizionale:** Il bottone appare **esclusivamente sulla pagina "Cartellino"** per garantire il corretto funzionamento e evitare la comparsa su altre sezioni del portale EVO.

## Installazione e Aggiornamenti Automatici

Per installare e assicurarti che lo script si aggiorni automaticamente dal repository GitHub, segui questi passaggi:

1.  **Installa un'estensione per Userscript:** Se non l'hai già fatto, installa un'estensione nel tuo browser che supporti gli Userscript. Le più popolari e consigliate sono:
    * [**Tampermonkey**](https://www.tampermonkey.net/) (Consigliato per Chrome, Edge, Safari, Opera, Firefox)
    * [**Greasemonkey**](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Per Firefox)

2.  **Installa lo Script per gli Aggiornamenti Automatici:**
    Clicca sul seguente link. L'estensione Userscript che hai installato (es. Tampermonkey) ti reindirizzerà a una pagina di installazione/conferma. **È fondamentale installare lo script tramite questo link RAW diretto** affinché l'estensione possa monitorare gli aggiornamenti futuri.

    [**Clicca qui per installare/aggiornare EVO Exit Time Calculator**](https://raw.githubusercontent.com/stefano-salvatore7/evo-exit-time-calc/main/evo-exit-time-calculator.user.js)

    * Dopo aver cliccato, Tampermonkey (o Greasemonkey) ti mostrerà il codice dello script e ti chiederà di **"Installa"** (se è la prima volta) o **"Aggiorna"** (se stai aggiornando una versione precedente). Conferma l'azione.

3.  **Configurazione Aggiornamenti Automatici (Tampermonkey):**
    Una volta installato tramite il link RAW, Tampermonkey dovrebbe gestire automaticamente gli aggiornamenti. Puoi verificare le impostazioni:
    * Clicca sull'icona di Tampermonkey nel tuo browser e seleziona **"Dashboard"**.
    * Trova "EVO Exit Time Calculator" nell'elenco.
    * Verifica che la casella "Controlla aggiornamenti" sia spuntata. L'URL di aggiornamento dovrebbe essere corretto (quello RAW che hai usato per l'installazione).
    * Tampermonkey controllerà periodicamente il repository per nuove versioni e ti notificherà se è disponibile un aggiornamento. Puoi anche forzare un controllo cliccando sull'icona delle frecce circolari (Aggiorna) accanto al nome dello script.

## Utilizzo

Una volta installato, lo script si attiverà automaticamente quando visiterai la pagina delle timbrature EVO su `https://personale-unibo.hrgpi.it/*`.

1.  Naviga alla pagina delle timbrature (assicurati che sia la pagina "Cartellino").
2.  Trova il bottone "**Ora del Giorno**" posizionato accanto al bottone "Aggiorna".
3.  Clicca su "**Ora del Giorno**" per visualizzare l'orario di uscita calcolato per il giorno corrente nella tabella.

## Contributi (Facoltativo)

Se desideri contribuire a migliorare questo script, sentiti libero di aprire una "Issue" o proporre una "Pull Request" sul repository GitHub.

## Log delle Versioni

Per un riepilogo delle modifiche e delle funzionalità introdotte in ogni versione dello script, consulta il file [CHANGELOG.md](CHANGELOG.md) nel repository.

---

*Sviluppato con l'assistenza di Gemini.*
