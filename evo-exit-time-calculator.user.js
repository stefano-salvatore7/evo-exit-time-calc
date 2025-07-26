// ==UserScript==
// @name          EVO Exit Time Calculator
// @namespace     https://unibo.it/
// @version       3.0
// @description   Calcola e mostra l'orario di uscita su Personale Unibo (Sistema EVO). Include selettore fascia e switch 7:12/6:01.
// @author        Stefano
// @match         https://personale-unibo.hrgpi.it/*
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    // --- Definizione di tutte le costanti chiave all'inizio dello scope principale ---
    const FASCE_ORARIE = {
        '07:30 - 08:30': '07:30',
        '08:00 - 09:00': '08:00',
        '08:30 - 09:30': '08:30'
    };
    const DEFAULT_FASCIA = '07:30 - 08:30';

    const STORAGE_KEY_FASCIA = 'evoExitTime_selectedFascia';
    const STORAGE_KEY_CALC_MODE = 'evoExitTime_calcMode';

    // Colori per i bottoni e le pillole
    const COLOR_PRIMARY_ACTIVE = "#bb2e29"; // Dusty Red - Colore principale per attiva
    const COLOR_INACTIVE_BACKGROUND = "#ffffff"; // Sfondo bianco per il contenitore dello switch
    const COLOR_INACTIVE_TEXT = "#333333"; // Testo grigio scuro per il segmento inattivo
    const COLOR_SWITCH_BORDER = "#ffffff"; // Colore del bordino interno dello switch (bianco)

    // Colori per la compact box
    const COLOR_COMPACT_BOX_BACKGROUND = "#DDD8D8"; // Sfondo grigio molto chiaro
    const COLOR_COMPACT_BOX_TEXT = "#333333"; // Testo grigio scuro/nero
    const COLOR_COMPACT_BOX_VALUE = "#333333"; // Valore dell'orario in grigio scuro/nero

    // Calcolo Tipi
    const CALC_MODE_SEVEN_TWELVE = {
        key: 'sevenTwelve',
        textShort: '7:12',
        minutes: 432, // 7 ore e 12 minuti
        color: COLOR_PRIMARY_ACTIVE,
        logType: "7h 12m"
    };

    const CALC_MODE_SIX_ONE = {
        key: 'sixOne',
        textShort: '6:01',
        minutes: 361, // 6 ore e 1 minuto
        color: COLOR_PRIMARY_ACTIVE,
        logType: "6h 1m"
    };

    const CALC_MODES_SWITCH = {
        [CALC_MODE_SEVEN_TWELVE.key]: CALC_MODE_SEVEN_TWELVE,
        [CALC_MODE_SIX_ONE.key]: CALC_MODE_SIX_ONE
    };

    const DEFAULT_CALC_MODE_KEY_SWITCH = CALC_MODE_SEVEN_TWELVE.key;

    // Definiamo il simbolo/testo per l'uscita
    const EXIT_LABEL = "Uscita:";

    // --- Fine Definizione Costanti ---


    /**
     * Inietta il CSS per importare e applicare il font Open Sans e per gli stili dell'UI.
     */
    function injectOpenSansAndUI_CSS() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

            /* Applica Open Sans a tutti gli elementi nel container dei nostri elementi UI */
            #evoCalculatorContainer *,
            #evoCalculatorContainer {
                font-family: 'Open Sans', sans-serif !important;
            }

            /* Nuovo contenitore principale con bordo e sfondo trasparente */
            #evoCalculatorContainer {
                border: 1px solid #e0e0e0; /* Bordo grigio chiaro */
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
                margin-bottom: 15px;
                background-color: transparent; /* Sfondo trasparente */
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                display: flex; /* Flexbox per allineare i gruppi orizzontalmente */
                align-items: flex-start; /* Allinea in alto gli elementi flex */
                gap: 15px; /* Spazio tra i gruppi principali (fascia+switch, e box uscita) */
                flex-wrap: wrap; /* Permette agli elementi di andare a capo se lo spazio non basta */
                width: fit-content; /* Il container si adatta alla larghezza del contenuto */
            }

            /* Contenitore per le label */
            .evo-label {
                font-size: 13px;
                font-weight: 600; /* Semibold */
                color: #555;
                margin-bottom: 5px; /* Spazio sotto la label e sopra l'elemento */
                white-space: nowrap; /* Evita che la label vada a capo */
            }

            /* Contenitore per ogni gruppo (label + input/box) */
            .evo-group-wrapper {
                display: flex;
                flex-direction: column; /* Stack label sopra input */
                align-items: center; /* Centra orizzontalmente label e input/box */
            }

            /* Regolazione per la larghezza del gruppo che contiene Fascia e Switch per allineare la label "Linea oraria" */
            .evo-group-wrapper.linea-oraria {
                max-width: fit-content; /* Impedisce che si espanda troppo */
            }

            /* Contenitore per gli elementi di controllo (fascia + switch) - ora all'interno di .evo-group-wrapper */
            .evo-controls-inner {
                display: flex;
                align-items: center;
                gap: 7px; /* Il gap specifico richiesto tra fascia e switch */
            }

            /* Stili per il selettore fascia oraria */
            #fasciaOrariaSelector {
                padding: 8px;
                border-radius: 5px;
                border: 1px solid #ccc;
                font-size: 14px;
                background-color: white;
                cursor: pointer;
                width: 130px;
                height: 37.7667px;
                box-sizing: border-box;
            }

            /* Stili per il contenitore dello switch */
            .calc-mode-switch {
                display: flex;
                position: relative;
                border: 1px solid #ccc;
                border-radius: 6px;
                overflow: hidden;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                background-color: ${COLOR_INACTIVE_BACKGROUND};
                box-sizing: border-box;
                padding: 3px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                width: 144px;
                height: 37.7667px;
            }

            /* Cursore scorrevole interno (il "pomello") */
            .calc-mode-slider {
                position: absolute;
                top: 3px;
                height: calc(100% - 6px); /* Altezza 100% - 2*padding_top/bottom del parent */
                width: calc(50% - 6px); /* Larghezza 50% - 2*padding_left/right del parent */
                background-color: ${COLOR_PRIMARY_ACTIVE};
                border-radius: inherit;
                transition: left 0.2s ease;
                z-index: 1;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }

            /* Posizioni del cursore per 2 stati */
            .calc-mode-slider.pos-0 {
                left: 3px; /* Posizione iniziale a sinistra, rispetto al padding di 3px del parent */
            }
            .calc-mode-slider.pos-1 {
                left: calc(100% - (50% - 6px) - 3px);
            }

            /* Stili per i singoli segmenti (le 'etichette' statiche) all'interno dello switch */
            .calc-mode-switch-segment {
                flex: 1;
                padding: 0 5px;
                line-height: calc(37.7667px - 6px);
                text-align: center;
                white-space: nowrap;
                z-index: 2;
                position: relative;
                color: ${COLOR_INACTIVE_TEXT};
                transition: color 0.2s ease;
            }

            /* Colore del testo quando il segmento è "attivo" (cioè il cursore è sotto di esso) */
            .calc-mode-switch-segment.active-text {
                color: ${COLOR_SWITCH_BORDER};
            }

            /* Stili per la pillola dell'orario di uscita calcolato */
            .custom-exit-time-pill {
                background-color: ${COLOR_PRIMARY_ACTIVE};
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                display: inline-block;
                white-space: nowrap; /* Mantenuto per prevenire il wrapping */
            }

            /* Stili per la nuova box compatta con l'orario di uscita */
            #compactExitTimeBox {
                background-color: ${COLOR_COMPACT_BOX_BACKGROUND}; /* Grigio chiaro DDD8D8 */
                color: ${COLOR_COMPACT_BOX_TEXT}; /* Nero */
                width: 118.7px;
                height: 37.8px;
                box-sizing: border-box;
                padding: 8px 12px;
                border-radius: 5px;
                border: 1px solid #ccc; /* Bordo grigio */
                font-size: 14px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }

            #compactExitTimeBox .value {
                color: ${COLOR_COMPACT_BOX_VALUE}; /* Nero */
            }

            /* Stile per il testo/simbolo di uscita nella box */
            #compactExitTimeBox .exit-label {
                font-size: 14px;
                font-weight: bold;
                line-height: 1;
                vertical-align: middle;
                color: ${COLOR_COMPACT_BOX_TEXT}; /* Nero */
            }
        `;
        document.head.appendChild(style);
        console.log("Stili Open Sans, UI, toggle slider, compact box, labels e container iniettati (v3.0).");
    }

    /**
     * Converte una stringa oraria (HH:mm) in minuti totali dalla mezzanotte.
     * @param {string} t - L'orario in formato "HH:mm".
     * @returns {number} Il numero totale di minuti.
     */
    function timeToMinutes(t) {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }

    /**
     * Converte un numero totale di minuti dalla mezzanotte in una stringa oraria (HH:mm).
     * @param {number} mins - Il numero totale di minuti.
     * @returns {string} L'orario in formato "HH:mm".
     */
    function minutesToTime(mins) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        return `${h}:${m}`;
    }

    /**
     * Funzione generica per calcolare l'orario di uscita previsto.
     * @param {string} fasciaSelezionataKey - La chiave della fascia oraria selezionata (es. '07:30 - 08:30').
     * @param {number} minutiLavorativiNetti - I minuti di lavoro netto richiesti (es. 432 per 7h12m, 361 per 6h1m).
     * @param {string} displayColor - Il colore esadecimale per la pillola dell'orario di uscita nella tabella.
     * @param {string} calcoloTipo - Stringa per i log (es. "7h 12m", "6h 11m").
     */
    function calcolaOrarioDiUscita(fasciaSelezionataKey, minutiLavorativiNetti, displayColor, calcoloTipo) {
        const limiteIngressoMinuti = timeToMinutes(FASCE_ORARIE[fasciaSelezionataKey]);
        console.log(`--- Avvio calcolo (${calcoloTipo} - Ufficiale v3.0). Fascia selezionata: ${fasciaSelezionataKey}. Limite ingresso: ${FASCE_ORARIE[fasciaSelezionataKey]} ---`);

        const oggi = new Date();
        const giornoOggi = String(oggi.getDate());
        console.log(`Giorno corrente: ${giornoOggi}`);

        const righeTabella = document.querySelectorAll('table tr');
        let righeDelGiorno = [];
        let foundTodayRow = false;

        for (const riga of righeTabella) {
            const primaCella = riga.querySelector("td");
            if (primaCella) {
                const testoPrimaCella = primaCella.textContent.trim();

                if (testoPrimaCella === giornoOggi) {
                    foundTodayRow = true;
                    righeDelGiorno.push(riga);
                }
                else if (foundTodayRow && testoPrimaCella === "") {
                    righeDelGiorno.push(riga);
                }
                else if (foundTodayRow && testoPrimaCella !== "") {
                    break;
                }
            }
        }

        console.log(`Righe trovate per il giorno ${giornoOggi}:`, righeDelGiorno.length, righeDelGiorno);
        if (righeDelGiorno.length === 0) {
            console.warn("⚠️ Nessuna riga trovata per il giorno corrente.");
            if (compactExitTimeBox) {
                compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">N/A</span>`;
            }
            return;
        }

        const badgeList = [];
        for (const riga of righeDelGiorno) {
            const possibleBadgeElements = riga.querySelectorAll("span[class*='badge-success'], span[class*='badge-danger'], div[class*='badge-success'], div[class*='badge-danger']");

            possibleBadgeElements.forEach(badge => {
                const orarioTesto = badge.textContent.trim();
                let tipo = null;
                let orario = null;

                const matchStandard = orarioTesto.match(/^(E|U)\s(\d{2}:\d{2})$/);
                const matchTelelavoro = orarioTesto.match(/^(E|U)\[(\d{2}:\d{2})\]$/);

                if (matchStandard) {
                    tipo = matchStandard[1];
                    orario = matchStandard[2];
                } else if (matchTelelavoro) {
                    tipo = matchTelelavoro[1];
                    orario = matchTelelavoro[2];
                }

                if (tipo && orario) {
                    badgeList.push({
                        tipo: tipo,
                        orario: orario,
                        originalElement: badge
                    });
                }
            });
        }

        badgeList.sort((a, b) => timeToMinutes(a.orario) - timeToMinutes(b.orario));

        console.log("Badge rilevati (e ordinati cronologicamente):", badgeList);

        if (badgeList.length === 0) {
            console.warn("⚠️ Nessun badge E/U trovato per il giorno corrente.");
            if (compactExitTimeBox) {
                compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">N/A</span>`;
            }
            return;
        }

        const entrataInizialeObj = badgeList.find(b => b.tipo === "E");
        if (!entrataInizialeObj) {
            console.warn("⚠️ Nessuna timbratura di ENTRATA ('E') trovata.");
            if (compactExitTimeBox) {
                compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">N/A</span>`;
            }
            return;
        }

        let entrataInizialeEffettiva = entrataInizialeObj.orario;
        let entrataInizialeConsiderataMinuti = timeToMinutes(entrataInizialeEffettiva);

        if (entrataInizialeConsiderataMinuti < limiteIngressoMinuti) {
            console.log(`Entrata (${entrataInizialeEffettiva}) antecedente al limite della fascia (${minutesToTime(limiteIngressoMinuti)}). Sarà considerata dalle ${minutesToTime(limiteIngressoMinuti)}.`);
            entrataInizialeConsiderataMinuti = limiteIngressoMinuti;
        } else {
             console.log(`Entrata iniziale rilevata: ${entrataInizialeEffettiva}`);
        }

        const entrataInizialeVisualizzata = minutesToTime(entrataInizialeConsiderataMinuti);

        let pausaInizio = null;
        let pausaFine = null;
        let lastUIndex = -1;
        const PAUSA_MINIMA_PREDEFINITA = 10;
        let pausaConsiderata = 0;

        for (let i = badgeList.length - 1; i >= 0; i--) {
            if (badgeList[i].tipo === "U") {
                lastUIndex = i;
                pausaInizio = badgeList[i].orario;
                break;
            }
        }

        // Questo blocco andrebbe rivisto se si vuole supportare U-E più complessa. Per ora la logica precedente bastava.
        // Se pausaInizio è stato trovato, cerchiamo un'Entrata successiva
        if (pausaInizio) {
            for (let i = lastUIndex + 1; i < badgeList.length; i++) {
                if (badgeList[i].tipo === "E") {
                    pausaFine = badgeList[i].orario;
                    break;
                }
            }
        }
        
        if (pausaInizio && pausaFine) {
            const minutiPausaReale = timeToMinutes(pausaFine) - timeToMinutes(pausaInizio);
            if (minutiPausaReale > 0 && minutiPausaReale < 180) { // Limitiamo a pause "ragionevoli" per evitare errori di timbratura
                pausaConsiderata = Math.max(PAUSA_MINIMA_PREDEFINITA, minutiPausaReale);
                console.log(`Pausa considerata: ${pausaConsiderata} minuti (max tra reale e predefinita).`);
            } else {
                pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
                console.log(`Pausa reale non valida o troppo lunga, usando pausa predefinita: ${pausaConsiderata} minuti.`);
            }
        } else {
            pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
            console.log(`Nessuna pausa U-E valida trovata, usando pausa predefinita: ${pausaConsiderata} minuti.`);
        }

        const minutiLavorativiTotali = minutiLavorativiNetti + pausaConsiderata;

        const uscitaPrevistaMinuti = entrataInizialeConsiderataMinuti + minutiLavorativiTotali;
        const uscitaPrevista = minutesToTime(uscitaPrevistaMinuti);

        console.log(`Calcolo finale (${calcoloTipo}): ${entrataInizialeVisualizzata} (entrata considerata) + ${minutiLavorativiTotali} minuti (lavoro base + pausa) = ${uscitaPrevista}`);

        // 1. Aggiorna l'orario nella cella EVO originale (se esiste)
        const celle = righeDelGiorno[0].querySelectorAll("td");
        if (celle.length >= 8) {
            const cellaOrario = celle[7];
            cellaOrario.innerHTML = '';
            const displaySpan = document.createElement('span');
            displaySpan.textContent = `U ${uscitaPrevista}`;
            displaySpan.classList.add('custom-exit-time-pill');

            cellaOrario.appendChild(displaySpan);
            cellaOrario.title = `Tipo: ${calcoloTipo} | Fascia: ${fasciaSelezionataKey} | Entrata effettiva: ${entrataInizialeEffettiva} | Entrata considerata: ${entrataInizialeVisualizzata} | ${minutiLavorativiNetti} minuti (netti) + ${pausaConsiderata} minuti (pausa)`;
            console.log(`Orario ${displaySpan.textContent} (${calcoloTipo}) inserito nella cella EVO.`);
        } else {
            console.warn(`⚠️ Non ci sono abbastanza celle nella prima riga per inserire l'orario di uscita (${calcoloTipo}) nella tabella EVO.`);
        }

        // 2. Aggiorna la nuova box compatta
        if (compactExitTimeBox) {
            compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">${uscitaPrevista}</span>`;
            compactExitTimeBox.title = `Orario di uscita calcolato con ${calcoloTipo}. Clicca per modificare la fascia o il calcolo.`;
        }

        console.log(`--- Fine calcolo per oggi (${calcoloTipo}) ---`);
    }

    let fasciaSelect = null;
    let sevenTwelveSegment = null;
    let sixOneSegment = null;
    let sliderElement = null;
    let compactExitTimeBox = null;

    let currentActiveModeKeySwitch = null;

    /**
     * Aggiorna lo stato visivo dello switch (7:12 / 6:01) e ricalcola l'orario di uscita.
     * @param {string} modeKey - La chiave della modalità di calcolo da attivare ('sevenTwelve' o 'sixOne').
     */
    function setActiveSwitchSegment(modeKey) {
        currentActiveModeKeySwitch = modeKey;
        GM_setValue(STORAGE_KEY_CALC_MODE, modeKey);
        console.log(`Modalità di calcolo attiva dello switch salvata: ${modeKey}`);

        if (sevenTwelveSegment) sevenTwelveSegment.classList.remove('active-text');
        if (sixOneSegment) sixOneSegment.classList.remove('active-text');

        let modeToCalculate = CALC_MODES_SWITCH[modeKey];

        if (modeKey === CALC_MODE_SEVEN_TWELVE.key) {
            if (sliderElement) {
                sliderElement.classList.remove('pos-1');
                sliderElement.classList.add('pos-0');
            }
            if (sevenTwelveSegment) sevenTwelveSegment.classList.add('active-text');
        } else if (modeKey === CALC_MODE_SIX_ONE.key) {
            if (sliderElement) {
                sliderElement.classList.remove('pos-0');
                sliderElement.classList.add('pos-1');
            }
            if (sixOneSegment) sixOneSegment.classList.add('active-text');
        }

        if (fasciaSelect && modeToCalculate) {
            calcolaOrarioDiUscita(fasciaSelect.value, modeToCalculate.minutes, modeToCalculate.color, modeToCalculate.logType);
        }
    }


    const waitForPageElements = setInterval(() => {
        const cartellinoTitle = document.querySelector('div.title-label');
        const isCartellinoPage = cartellinoTitle && cartellinoTitle.textContent.includes('Cartellino');
        const timeTable = document.querySelector('table');
        const updateButton = document.getElementById("firstFocus");

        if (isCartellinoPage && timeTable && updateButton) {
            clearInterval(waitForPageElements);
            injectOpenSansAndUI_CSS();

            const existingButtonsDiv = updateButton.closest('.row.buttons, div.row.mb-2');

            currentActiveModeKeySwitch = GM_getValue(STORAGE_KEY_CALC_MODE, DEFAULT_CALC_MODE_KEY_SWITCH);

            // Nuovo contenitore principale che avvolge tutto
            const evoCalculatorContainer = document.createElement('div');
            evoCalculatorContainer.id = 'evoCalculatorContainer';

            // --- Gruppo "Linea oraria" (Label + Selettore Fascia + Switch) ---
            const lineaOrariaGroupWrapper = document.createElement('div');
            lineaOrariaGroupWrapper.classList.add('evo-group-wrapper', 'linea-oraria');

            const lineaOrariaLabel = document.createElement('div');
            lineaOrariaLabel.classList.add('evo-label');
            lineaOrariaLabel.textContent = 'Linea oraria';
            lineaOrariaGroupWrapper.appendChild(lineaOrariaLabel);

            const evoControlsInner = document.createElement('div'); // Contenitore per fascia e switch
            evoControlsInner.classList.add('evo-controls-inner');


            // 1. Selettore Fascia Oraria
            fasciaSelect = document.createElement('select');
            fasciaSelect.id = 'fasciaOrariaSelector';
            for (const key in FASCE_ORARIE) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                fasciaSelect.appendChild(option);
            }
            const savedFascia = GM_getValue(STORAGE_KEY_FASCIA, DEFAULT_FASCIA);
            fasciaSelect.value = savedFascia;
            fasciaSelect.addEventListener('change', (e) => {
                GM_setValue(STORAGE_KEY_FASCIA, e.target.value);
                console.log(`Fascia oraria salvata: ${e.target.value}`);
                let modeToCalculate = CALC_MODES_SWITCH[currentActiveModeKeySwitch];
                calcolaOrarioDiUscita(fasciaSelect.value, modeToCalculate.minutes, modeToCalculate.color, modeToCalculate.logType);
            });
            evoControlsInner.appendChild(fasciaSelect);

            // 2. Toggle Switch (7:12 / 6:01)
            const calcModeSwitch = document.createElement('div');
            calcModeSwitch.classList.add('calc-mode-switch');
            evoControlsInner.appendChild(calcModeSwitch);

            sliderElement = document.createElement('span');
            sliderElement.classList.add('calc-mode-slider');
            calcModeSwitch.appendChild(sliderElement);

            sevenTwelveSegment = document.createElement('span');
            sevenTwelveSegment.textContent = CALC_MODE_SEVEN_TWELVE.textShort;
            sevenTwelveSegment.classList.add('calc-mode-switch-segment');
            sevenTwelveSegment.addEventListener('click', () => setActiveSwitchSegment(CALC_MODE_SEVEN_TWELVE.key));
            calcModeSwitch.appendChild(sevenTwelveSegment);

            sixOneSegment = document.createElement('span');
            sixOneSegment.textContent = CALC_MODE_SIX_ONE.textShort;
            sixOneSegment.classList.add('calc-mode-switch-segment');
            sixOneSegment.addEventListener('click', () => setActiveSwitchSegment(CALC_MODE_SIX_ONE.key));
            calcModeSwitch.appendChild(sixOneSegment);

            lineaOrariaGroupWrapper.appendChild(evoControlsInner); // Aggiungi il contenitore interno al wrapper del gruppo
            evoCalculatorContainer.appendChild(lineaOrariaGroupWrapper); // Aggiungi il gruppo al container principale

            // --- Gruppo "Ora del giorno" (Label + Box Uscita) ---
            const oraDelGiornoGroupWrapper = document.createElement('div');
            oraDelGiornoGroupWrapper.classList.add('evo-group-wrapper');

            const oraDelGiornoLabel = document.createElement('div');
            oraDelGiornoLabel.classList.add('evo-label');
            oraDelGiornoLabel.textContent = 'Ora del giorno';
            oraDelGiornoGroupWrapper.appendChild(oraDelGiornoLabel);

            // 3. Nuova Box Compatta per l'Orario di Uscita Calcolato
            compactExitTimeBox = document.createElement('div');
            compactExitTimeBox.id = 'compactExitTimeBox';
            compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">--:--</span>`;
            oraDelGiornoGroupWrapper.appendChild(compactExitTimeBox);

            evoCalculatorContainer.appendChild(oraDelGiornoGroupWrapper);


            // Inserimento del container principale nella pagina
            if (existingButtonsDiv) {
                existingButtonsDiv.appendChild(evoCalculatorContainer);
                console.log("Container calcolatore EVO, labels e box aggiunti.");
            } else {
                updateButton.parentNode.insertBefore(evoCalculatorContainer, updateButton.nextSibling);
                console.warn("Non trovato div contenitore comune, riposizionato accanto ad 'Aggiorna'.");
            }

            // Imposta lo stato iniziale dello switch ed esegui il calcolo iniziale
            setActiveSwitchSegment(currentActiveModeKeySwitch);
        }
    }, 500);
})();
