# EVO Exit Time Calculator

Questo script Tampermonkey/Greasemonkey è progettato per il sistema di gestione delle presenze EVO (usato su `https://personale-unibo.hrgpi.it/`). Calcola automaticamente l'orario di uscita previsto per la giornata corrente, tenendo conto delle timbrature, dell'eventuale pausa e della propria linea oraria.

**(Versione Script: 4.3)**

## Caratteristiche

* **Calcolo Flessibile dell'Orario di Uscita tramite Switch:**
    * **Per 7 ore e 12 minuti (7:12):** Determina l'orario di uscita necessario per completare le 7 ore e 12 minuti di lavoro **nette**, a cui viene aggiunta la pausa.
    * **Per 6 ore e 1 minuto (6:01):** Determina l'orario di uscita necessario per completare le 6 ore e 1 minuto di lavoro **nette**, a cui viene aggiunta la pausa.
    * La modalità di calcolo (7:12 o 6:01) può essere selezionata tramite un **switch toggle compatto** e la tua scelta viene **salvata automaticamente** e ricaricata alla visita successiva della pagina.
* **Gestione Fascia Oraria di Ingresso:**
    * Include un **selettore a discesa** che permette di scegliere la fascia oraria desiderata per l'ingresso (`07:30 - 08:30`, `08:00 - 09:00`, `08:30 - 09:30`).
    * L'orario di ingresso considerato per entrambi i calcoli sarà il **maggiore** tra la prima timbratura di ingresso effettiva e il limite inferiore della fascia oraria selezionata.
    * La preferenza della fascia oraria viene **salvata automaticamente** e ricaricata alla visita successiva della pagina.
* **Ottimizzazione Mobile (Novità v4.3):**
    * **Layout responsive** per smartphone e tablet
    * **Font grandi e leggibili** (1.8-2rem) su dispositivi mobile
    * **Controlli touch-friendly** con dimensioni adeguate
    * **Integrazione perfetta** con lo script [EVO - Vista Mobile Cartellino](https://github.com/stefano-salvatore7/evo-mobile-cartellino-test)
* **Compatibilità con il Nuovo HRSuite EVO (Gennaio 2026):**
    * Lo script è stato completamente adattato alla nuova struttura HTML introdotta con l'aggiornamento del 24/01/2026.
    * Supporta la nuova interfaccia con elementi `div.clocking.entry` e `div.clocking.exit` con icone Material Symbols.
    * Rilevamento intelligente delle timbrature basato sulla riga del giorno corrente, evitando conflitti con giorni precedenti.
* **Gestione Timbrature Flessibile:** Identifica automaticamente le timbrature di entrata e uscita dalla nuova struttura HTML della piattaforma.
* **Gestione Pausa Pranzo:** Calcola e include nel totale lavorato la durata della pausa pranzo (ultima "U" seguita dalla prima "E"). Aggiunge una pausa predefinita di **10 minuti** se non rilevata o troppo breve (utilizza il valore maggiore tra la pausa effettiva e i 10 minuti).
* **Visualizzazione Orario di Uscita Doppia:** 
    * L'orario di uscita calcolato viene visualizzato in una **box dedicata e compatta** (`"Uscita: HH:mm"`) con uno sfondo grigio chiaro e un bordo sottile, posizionata nel blocco UI in alto.
    * L'orario viene anche inserito come **badge rosso con icona ➡️** nella colonna "Orario" della tabella, sostituendo il contenuto esistente (es. "8086").
* **Posizionamento Intuitivo:** Il selettore della fascia oraria, lo switch per la modalità di calcolo e la box dell'orario di uscita sono posizionati strategicamente in un **unico blocco UI compatto**, vicino ai controlli principali della pagina (come il bottone "Aggiorna").
* **Apparizione Condizionale:** Gli elementi UI dello script appaiono **esclusivamente sulla pagina "Cartellino"** del portale, evitando la loro visualizzazione su altre sezioni non pertinenti.
* **Miglioramento Estetico:** Il font **"Open Sans"** è applicato in modo uniforme a tutti gli elementi UI generati dallo script per una migliore estetica e coerenza visiva.

## Installazione e Aggiornamenti Automatici

Per installare lo script e assicurarti che si aggiorni automaticamente dal repository GitHub, segui i passaggi per il tuo browser:

### 1. Installare l'estensione [Tampermonkey](https://www.tampermonkey.net/)

Se non l'hai già fatto, installa l'estensione Tampermonkey nel tuo browser:

* **[Tampermonkey per Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)**
* **[Tampermonkey per Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)**
* **[Tampermonkey per Firefox](https://addons.mozilla.org/it/firefox/addon/tampermonkey/)** (o Greasemonkey se preferisci)

**📱 Per dispositivi mobile:**
* **Android:** Firefox Mobile + Tampermonkey
* **iOS:** Orion Browser + Tampermonkey

### 2. **DISABILITA/ELIMINA EVENTUALE VECCHIO SCRIPT (IMPORTANTE!)**

Prima di installare questa versione 4.3, è **FONDAMENTALE** che tu disabiliti o elimini qualsiasi versione precedente di "EVO Exit Time Calculator" (incluse le versioni 3.x e 4.0-4.2) che potrebbero essere ancora presenti nella tua dashboard di Tampermonkey. Lasciarli attivi potrebbe causare conflitti.

* `EVO Exit Time Calculator` (versioni 3.2 e precedenti)
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

### Su Desktop

1.  Naviga alla pagina delle timbrature (assicurati che sia la pagina "Cartellino").
2.  Troverai un **selettore a discesa** per la "Linea oraria" e uno **switch toggle** ("7:12" / "6:01") posizionati strategicamente, insieme a una **box compatta per l'orario di uscita**, vicino al bottone "Aggiorna".
3.  **Seleziona la fascia oraria** desiderata dal selettore e la **modalità di calcolo** desiderata (7:12 o 6:01) tramite lo switch.
4.  L'orario di uscita calcolato apparirà automaticamente nella box dedicata in alto e come badge rosso **➡️ HH:mm** nella colonna "Orario" della tabella in corrispondenza della data corrente.

### Su Mobile (Novità v4.3)

**Vista Mobile Nativa:**
Se usi il browser mobile (<768px o dispositivo touch), il widget si adatta automaticamente:
* Font grandi e leggibili (1.8-2rem)
* Controlli touch-friendly con dimensioni adeguate
* Layout responsive che si adatta alla larghezza dello schermo

**Vista Mobile Cartellino (con EVO - Vista Mobile Cartellino):**
Se hai installato anche lo script [EVO - Vista Mobile Cartellino](https://github.com/stefano-salvatore7/evo-mobile-cartellino-test):
* Il widget viene **automaticamente integrato** nella barra superiore della vista mobile
* Appare sotto l'etichetta "⏱ Orario uscita"
* L'orario calcolato viene mostrato anche come **pillola ⏰ HH:MM** nell'header della card del giorno corrente
* Tutti gli event listener e funzionalità rimangono intatti

**Nessuna configurazione richiesta!** Gli script si rilevano e integrano automaticamente.

## Compatibilità con Altri Script EVO

✅ **Perfettamente compatibile con:**

* **[EVO - Vista Mobile Cartellino](https://github.com/stefano-salvatore7/evo-mobile-cartellino-test)** 📱  
  *Trasforma il cartellino in card mobile ottimizzate. Il widget Exit Time Calculator viene integrato automaticamente nella barra superiore.*

* **[EVO Mobile Plus](https://github.com/stefano-salvatore7/EVOPlus-Mobile)** 🏠  
  *Ottimizza Dashboard/Home, Marcatempo Virtuale e Timbrature Mancanti per mobile.*

* **[EVO Icona Giorno OK](https://github.com/stefano-salvatore7/evo-icon-day-ok)** ✅  
  *Inserisce icona di verifica sulle giornate complete.*

* **[EVO Icona Pasti e Conteggio Ticket](https://github.com/stefano-salvatore7/icona_piadina)** 🫓  
  *Sostituisce "1" con icona piadina e calcola totale ticket mensili.*

Tutti questi script possono essere usati insieme senza conflitti!

## Novità Versione 4.3

La versione 4.3 introduce l'ottimizzazione mobile:

* ✅ **Layout responsive completo** per smartphone e tablet
* ✅ **Font ingranditi** (1.8-2rem) su dispositivi mobile
* ✅ **Controlli touch-friendly** con dimensioni adeguate per tap precisi
* ✅ **Integrazione automatica** con EVO - Vista Mobile Cartellino
* ✅ **Media queries intelligenti** basate su larghezza, orientamento e tipo di input
* ✅ **Supporto schermi piccoli** (≤480px) con font proporzionati

### Versione 4.2 e precedenti

* ✅ **Compatibilità totale** con l'aggiornamento HRSuite del 24/01/2026
* ✅ **Rilevamento accurato** delle timbrature solo del giorno corrente
* ✅ **Badge con icona ➡️** nella colonna "Orario" della tabella
* ✅ **Algoritmo di posizionamento** migliorato con fallback multipli
* ✅ **Codice completamente refactorizzato** per maggiore manutenibilità

## Contributi

Se desideri contribuire a migliorare questo script, sentiti libero di aprire una "Issue" o proporre una "Pull Request" sul repository GitHub.

## Log delle Versioni

Per un riepilogo dettagliato delle modifiche e delle funzionalità introdotte in ogni versione dello script, consulta il file [CHANGELOG.md](CHANGELOG.md) nel repository.

---

**Repository:** [evo-exit-time-calc](https://github.com/stefano-salvatore7/evo-exit-time-calc)  
**Autore:** Stefano  
**Licenza:** Open Source (libero uso, modifica e distribuzione)
