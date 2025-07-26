# EVO Exit Time Calculator

Questo script Tampermonkey/Greasemonkey è progettato per il sistema di gestione delle presenze EVO (usato su `https://personale-unibo.hrgpi.it/`). Calcola automaticamente l'orario di uscita previsto per la giornata corrente, tenendo conto delle timbrature, dell'eventuale pausa e della fascia oraria di ingresso desiderata.

**(Versione Script: 3.0 - Ufficiale)**

## Caratteristiche

* **Calcolo Flessibile dell'Orario di Uscita tramite Switch:**
    * **Per 7 ore e 12 minuti (7:12):** Determina l'orario di uscita necessario per completare le 7 ore e 12 minuti di lavoro **nette**, a cui viene aggiunta la pausa.
    * **Per 6 ore e 1 minuto (6:01):** Determina l'orario di uscita necessario per completare le 6 ore e 1 minuto di lavoro **nette**, a cui viene aggiunta la pausa.
    * La modalità di calcolo (7:12 o 6:01) può essere selezionata tramite un **switch toggle compatto** e la tua scelta viene **salvata automaticamente** e ricaricata alla visita successiva della pagina.
* **Gestione Fascia Oraria di Ingresso:**
    * Include un **selettore a discesa** che permette di scegliere la fascia oraria desiderata per l'ingresso (`07:30 - 08:30`, `08:00 - 09:00`, `08:30 - 09:30`).
    * L'orario di ingresso considerato per entrambi i calcoli sarà il **maggiore** tra la prima timbratura di ingresso effettiva e il limite inferiore della fascia oraria selezionata.
    * La preferenza della fascia oraria viene **salvata automaticamente** e ricaricata alla visita successiva della pagina.
* **Gestione Timbrature Flessibile:** Supporta sia il formato standard `E HH:mm` / `U HH:mm` che il formato "Telelavoro" `E[HH:mm]` / `U[HH:mm]`.
* **Gestione Pausa Pranzo:** Calcola e include nel totale lavorato la durata della pausa pranzo (ultima "U" seguita dalla prima "E"). Aggiunge una pausa predefinita di **10 minuti** se non rilevata o troppo breve (utilizza il valore maggiore tra la pausa effettiva e i 10 minuti).
* **Visualizzazione Orario di Uscita Dedicata:** L'orario di uscita calcolato viene visualizzato in una **box dedicata e compatta** (`"Uscita: HH:mm"`) con uno sfondo grigio chiaro e un bordo sottile, posizionata in un blocco UI riorganizzato. L'orario è anche inserito come "pillola" nella cella della tabella EVO, sovrascrivendo qualsiasi contenuto precedente dello script.
* **Posizionamento Intuitivo:** Il selettore della fascia oraria, lo switch per la modalità di calcolo e la box dell'orario di uscita sono posizionati strategicamente in un **unico blocco UI compatto**, vicino ai controlli principali della pagina (come il bottone "Aggiorna").
* **Apparizione Condizionale:** Gli elementi UI dello script appaiono **esclusivamente sulla pagina "Cartellino"** del portale, evitando la loro visualizzazione su altre sezioni non pertinenti.
* **Miglioramento Estetico:** Il font **"Open Sans"** è ora applicato in modo uniforme a tutti gli elementi UI generati dallo script per una migliore estetica e coerenza visiva.

## Installazione e Aggiornamenti Automatici

Per installare lo script e assicurarti che si aggiorni automaticamente dal repository GitHub, segui i passaggi per il tuo browser:

### 1. Installare l'estensione Tampermonkey

Se non l'hai già fatto, installa l'estensione Tampermonkey nel tuo browser:

* **[Tampermonkey per Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)**
* **[Tampermonkey per Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpbldmmepgdkmfapfmccmocdkf)**
* **[Tampermonkey per Firefox](https://addons.mozilla.org/it/firefox/addon/tampermonkey/)** (o Greasemonkey se preferisci)

### 2. **DISABILITA/ELIMINA EVENTUALE VECCHIO SCRIPT (IMPORTANTE!)**

Prima di installare questa versione 3.0, è **FONDAMENTALE** che tu disabiliti o elimini qualsiasi versione precedente di "EVO Exit Time Calculator" (incluse le versioni "Unificate" e quelle separate "6h 11m") che potrebbero essere ancora presenti nella tua dashboard di Tampermonkey. Lasciarli attivi potrebbe causare conflitti e comportamenti imprevedibili.

* `EVO Exit Time Calculator (Unificato)`
* `EVO Exit Time Calculator (6h 11m)`

### 3. Configurazione del Browser (Importante per l'esecuzione)

Per consentire l'esecuzione corretta dello script, potrebbero essere necessari alcuni passaggi di configurazione nel tuo browser:

#### Per Google Chrome:

1.  Apri Chrome e digita `chrome://extensions/` nella barra degli indirizzi, poi premi Invio.
2.  In alto a destra, attiva la **"Modalità sviluppatore"** (interruttore).
3.  Individua Tampermonkey nell'elenco delle estensioni.
4.  Clicca su **"Dettagli"** sotto Tampermonkey.
5.  Assicurati che l'opzione **"Consenti script utente"** sia attiva.
6.  Assicurati che l'opzione **"Consenti l'accesso agli URL del file"** sia attiva.

#### Per Microsoft Edge:

1.  Apri Edge e digita `edge://extensions/` nella barra degli indirizzi, poi premi Invio.
2.  In alto a destra, attiva la **"Modalità sviluppatore"** (interruttore). Potrebbe comparire un avviso di sicurezza nella parte superiore del browser; è normale quando si usa questa modalità.
3.  Individua Tampermonkey nell'elenco delle estensioni.
4.  Clicca su **"Dettagli"** sotto Tampermonkey.
5.  Assicurati che l'opzione **"Consenti estensioni da altri archivi"** sia attiva.
6.  **Assicurati che l'opzione "Consenti l'accesso agli URL del file" sia attiva.**

### 4. Installazione dello Script per Aggiornamenti Automatici

Ora che il tuo browser è configurato e i vecchi script sono stati disabilitati, puoi installare lo script:

[**Clicca qui per installare/aggiornare EVO Exit Time Calculator**](https://raw.githubusercontent.com/stefano-salvatore7/evo-exit-time-calc/main/evo-exit-time-calculator.user.js)

* Dopo aver cliccato, Tampermonkey (o Greasemonkey) ti mostrerà il codice dello script e ti chiederà di **"Installa"** (se è la prima volta) o **"Aggiorna"** (se stai aggiornando una versione precedente). Conferma l'azione.

### 5. Verifica Aggiornamenti Automatici (Tampermonkey)

Una volta installato tramite il link RAW, Tampermonkey dovrebbe gestire automaticamente gli aggiornamenti. Puoi verificare le impostazioni:

* Clicca sull'icona di Tampermonkey nel tuo browser e seleziona **"Dashboard"**.
* Trova "EVO Exit Time Calculator" nell'elenco.
* Verifica che la casella "Controlla aggiornamenti" sia spuntata. L'URL di aggiornamento dovrebbe essere corretto (quello RAW che hai usato per l'installazione).
* Tampermonkey controllerà periodicamente il repository per nuove versioni e ti notificherà se è disponibile un aggiornamento. Puoi anche forzare un controllo cliccando sull'icona delle frecce circolari (Aggiorna) accanto al nome dello script.

## Utilizzo

Una volta installato, lo script si attiverà automaticamente quando visiterai la pagina delle timbrature EVO su `https://personale-unibo.hrgpi.it/*`.

1.  Naviga alla pagina delle timbrature (assicurati che sia la pagina "Cartellino").
2.  Troverai un **selettore a discesa** per la "Linea oraria" e uno **switch toggle** ("7:12" / "6:01") posizionati strategicamente, insieme a una **box compatta per l'orario di uscita**, sotto al bottone "Aggiorna".
3.  **Seleziona la fascia oraria** desiderata dal selettore e la **modalità di calcolo** desiderata (7:12 o 6:01) tramite lo switch.
4.  L'orario di uscita calcolato apparirà automaticamente nella box dedicata e anche come "pillola" nella tabella in corrispondenza della data corrente.

## Contributi (Facoltativo)

Se desideri contribuire a migliorare questo script, sentiti libero di aprire una "Issue" o proporre una "Pull Request" sul repository GitHub.

## Log delle Versioni

Per un riepilogo dettagliato delle modifiche e delle funzionalità introdotte in ogni versione dello script, consulta il file [CHANGELOG.md](CHANGELOG.md) nel repository.

---
