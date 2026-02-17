// ==UserScript==
// @name          EVO - Calcola Orario di Uscita
// @namespace     https://unibo.it/
// @version       4.3
// @description   Calcola e mostra l'orario di uscita nel Cartellino. Include selettore fascia oraria e switch 7:12/6:01. Responsive mobile.
// @author        Stefano
// @match         https://personale-unibo.hrgpi.it/*
// @icon          https://www.unibo.it/favicon.ico
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
    const COLOR_PRIMARY_ACTIVE = "#bb2e29";
    const COLOR_INACTIVE_BACKGROUND = "#ffffff";
    const COLOR_INACTIVE_TEXT = "#333333";
    const COLOR_SWITCH_BORDER = "#ffffff";

    // Colori per la compact box
    const COLOR_COMPACT_BOX_BACKGROUND = "#DDD8D8";
    const COLOR_COMPACT_BOX_TEXT = "#333333";
    const COLOR_COMPACT_BOX_VALUE = "#333333";

    // Calcolo Tipi
    const CALC_MODE_SEVEN_TWELVE = {
        key: 'sevenTwelve',
        textShort: '7:12',
        minutes: 432,
        color: COLOR_PRIMARY_ACTIVE,
        logType: "7h 12m"
    };

    const CALC_MODE_SIX_ONE = {
        key: 'sixOne',
        textShort: '6:01',
        minutes: 361,
        color: COLOR_PRIMARY_ACTIVE,
        logType: "6h 1m"
    };

    const CALC_MODES_SWITCH = {
        [CALC_MODE_SEVEN_TWELVE.key]: CALC_MODE_SEVEN_TWELVE,
        [CALC_MODE_SIX_ONE.key]: CALC_MODE_SIX_ONE
    };

    const DEFAULT_CALC_MODE_KEY_SWITCH = CALC_MODE_SEVEN_TWELVE.key;
    const EXIT_LABEL = "Uscita:";

    /**
     * Inietta il CSS per importare e applicare il font Open Sans e per gli stili dell'UI.
     * Include un blocco responsive per dispositivi mobile (solo grafico, logica invariata).
     */
    function injectOpenSansAndUI_CSS() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

            #evoCalculatorContainer *,
            #evoCalculatorContainer {
                font-family: 'Open Sans', sans-serif !important;
            }

            #evoCalculatorContainer {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
                margin-bottom: 15px;
                background-color: transparent;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                display: flex;
                align-items: flex-start;
                gap: 15px;
                flex-wrap: wrap;
                width: fit-content;
            }

            .evo-label {
                font-size: 13px;
                font-weight: 600;
                color: #555;
                margin-bottom: 5px;
                white-space: nowrap;
            }

            .evo-group-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .evo-group-wrapper.linea-oraria {
                max-width: fit-content;
            }

            .evo-controls-inner {
                display: flex;
                align-items: center;
                gap: 7px;
            }

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

            .calc-mode-slider {
                position: absolute;
                top: 3px;
                height: calc(100% - 6px);
                width: calc(50% - 6px);
                background-color: ${COLOR_PRIMARY_ACTIVE};
                border-radius: inherit;
                transition: left 0.2s ease;
                z-index: 1;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }

            .calc-mode-slider.pos-0 {
                left: 3px;
            }
            .calc-mode-slider.pos-1 {
                left: calc(100% - (50% - 6px) - 3px);
            }

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

            .calc-mode-switch-segment.active-text {
                color: ${COLOR_SWITCH_BORDER};
            }

            .custom-exit-time-pill {
                background-color: ${COLOR_PRIMARY_ACTIVE};
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                display: inline-block;
                white-space: nowrap;
            }

            #compactExitTimeBox {
                background-color: ${COLOR_COMPACT_BOX_BACKGROUND};
                color: ${COLOR_COMPACT_BOX_TEXT};
                width: 118.7px;
                height: 37.8px;
                box-sizing: border-box;
                padding: 8px 12px;
                border-radius: 5px;
                border: 1px solid #ccc;
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
                color: ${COLOR_COMPACT_BOX_VALUE};
            }

            #compactExitTimeBox .exit-label {
                font-size: 14px;
                font-weight: bold;
                line-height: 1;
                vertical-align: middle;
                color: ${COLOR_COMPACT_BOX_TEXT};
            }

            /* ================================================================
               RESPONSIVE MOBILE
               Stessa logica di rilevamento di EVO Mobile Plus.
               Solo grafica: font, dimensioni, padding. Logica JS invariata.
            ================================================================ */
            @media (max-width: 1024px) and (orientation: portrait),
                   (max-width: 768px),
                   (hover: none) and (pointer: coarse) {

                #evoCalculatorContainer {
                    width: 100% !important;
                    box-sizing: border-box !important;
                    flex-direction: row !important;
                    flex-wrap: wrap !important;
                    gap: 1.2rem !important;
                    padding: 1.2rem !important;
                    margin-top: 1rem !important;
                    margin-bottom: 1rem !important;
                    border-radius: 0.7rem !important;
                }

                /* Label "Linea oraria" / "Ora del giorno" */
                .evo-label {
                    font-size: 1.5rem !important;
                    margin-bottom: 0.6rem !important;
                    color: #555 !important;
                }

                /* Wrapper gruppo: occupa almeno metà riga ciascuno */
                .evo-group-wrapper {
                    flex: 1 1 auto !important;
                    align-items: flex-start !important;
                    min-width: 0 !important;
                }

                /* Inner controls affiancati */
                .evo-controls-inner {
                    gap: 0.8rem !important;
                    flex-wrap: nowrap !important;
                    align-items: center !important;
                }

                /* Select fascia oraria */
                #fasciaOrariaSelector {
                    font-size: 1.8rem !important;
                    padding: 0.8rem 0.6rem !important;
                    width: auto !important;
                    min-width: 10rem !important;
                    height: auto !important;
                    border-radius: 0.5rem !important;
                    border: 1px solid #ccc !important;
                    -webkit-appearance: none !important;
                    appearance: none !important;
                }

                /* Switch 7:12 / 6:01 */
                .calc-mode-switch {
                    font-size: 1.8rem !important;
                    width: auto !important;
                    min-width: 9rem !important;
                    height: auto !important;
                    padding: 0.3rem !important;
                    border-radius: 0.6rem !important;
                }

                .calc-mode-switch-segment {
                    font-size: 1.8rem !important;
                    padding: 0.6rem 0.8rem !important;
                    line-height: 1.4 !important;
                }

                /* Lo slider si adatta all'altezza automatica */
                .calc-mode-slider {
                    top: 0.3rem !important;
                    height: calc(100% - 0.6rem) !important;
                    border-radius: 0.4rem !important;
                }

                /* Box compatta "Uscita: HH:MM" */
                #compactExitTimeBox {
                    font-size: 1.8rem !important;
                    width: auto !important;
                    min-width: 9rem !important;
                    height: auto !important;
                    padding: 0.8rem 1.2rem !important;
                    border-radius: 0.5rem !important;
                    gap: 0.5rem !important;
                }

                #compactExitTimeBox .exit-label {
                    font-size: 1.8rem !important;
                }

                #compactExitTimeBox .value {
                    font-size: 2rem !important;
                    font-weight: 700 !important;
                }

                /* Pillola orario nella colonna tabella */
                .custom-exit-time-pill {
                    font-size: 1.6rem !important;
                    padding: 0.4rem 0.8rem !important;
                    border-radius: 0.4rem !important;
                }
            }

            /* Schermi molto piccoli (≤480px portrait) */
            @media (max-width: 480px) and (orientation: portrait),
                   (max-width: 640px) and (orientation: portrait) and (max-height: 800px) {

                #evoCalculatorContainer {
                    gap: 1rem !important;
                    padding: 1rem !important;
                }

                .evo-label {
                    font-size: 1.4rem !important;
                }

                #fasciaOrariaSelector {
                    font-size: 1.6rem !important;
                    padding: 0.7rem 0.5rem !important;
                    min-width: 9rem !important;
                }

                .calc-mode-switch {
                    font-size: 1.6rem !important;
                    min-width: 8rem !important;
                }

                .calc-mode-switch-segment {
                    font-size: 1.6rem !important;
                    padding: 0.5rem 0.6rem !important;
                }

                #compactExitTimeBox {
                    font-size: 1.6rem !important;
                    min-width: 8rem !important;
                    padding: 0.7rem 1rem !important;
                }

                #compactExitTimeBox .exit-label {
                    font-size: 1.6rem !important;
                }

                #compactExitTimeBox .value {
                    font-size: 1.8rem !important;
                }

                .custom-exit-time-pill {
                    font-size: 1.4rem !important;
                    padding: 0.35rem 0.7rem !important;
                }
            }
        `;
        document.head.appendChild(style);
        console.log("Stili CSS iniettati (v4.3).");
    }

    /**
     * Converte una stringa oraria (HH:mm) in minuti totali dalla mezzanotte.
     */
    function timeToMinutes(t) {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }

    /**
     * Converte un numero totale di minuti dalla mezzanotte in una stringa oraria (HH:mm).
     */
    function minutesToTime(mins) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        return `${h}:${m}`;
    }

    /**
     * Estrae le timbrature dalla nuova struttura HTML per il giorno corrente
     */
    function estraiTimbratureGiornoCorrente(giornoCorrente) {
        const badgeList = [];
        
        // Trova tutte le righe della tabella
        const righeTabella = document.querySelectorAll('table tr');
        let rigaGiornoCorrente = null;
        
        // Cerca la riga che corrisponde al giorno corrente
        for (const riga of righeTabella) {
            const primaColonna = riga.querySelector('td.table_td_mese');
            if (primaColonna) {
                const testoGiorno = primaColonna.textContent.trim();
                // Il testo è tipo "24 sab" quindi estraiamo solo il numero
                const numeroGiorno = testoGiorno.split(' ')[0];
                
                if (numeroGiorno === giornoCorrente) {
                    rigaGiornoCorrente = riga;
                    console.log(`Trovata riga per il giorno ${giornoCorrente}:`, riga);
                    break;
                }
            }
        }
        
        if (!rigaGiornoCorrente) {
            console.warn(`Nessuna riga trovata per il giorno ${giornoCorrente}`);
            return { badgeList, rigaGiornoCorrente: null };
        }
        
        // Ora cerca le timbrature solo in questa riga
        const clockings = rigaGiornoCorrente.querySelectorAll('.clocking.entry, .clocking.exit');
        
        clockings.forEach(clocking => {
            const isEntry = clocking.classList.contains('entry');
            const tipo = isEntry ? 'E' : 'U';
            
            // Cerca lo span con l'orario (fw-bold text-black)
            const orarioSpan = clocking.querySelector('span.fw-bold.text-black');
            
            if (orarioSpan) {
                const orario = orarioSpan.textContent.trim();
                
                // Verifica che sia un formato orario valido (HH:mm)
                if (/^\d{2}:\d{2}$/.test(orario)) {
                    badgeList.push({
                        tipo: tipo,
                        orario: orario,
                        originalElement: clocking
                    });
                    console.log(`Timbratura trovata: ${tipo} ${orario}`);
                }
            }
        });
        
        return { badgeList, rigaGiornoCorrente };
    }

    /**
     * Funzione generica per calcolare l'orario di uscita previsto.
     */
    function calcolaOrarioDiUscita(fasciaSelezionataKey, minutiLavorativiNetti, displayColor, calcoloTipo) {
        const limiteIngressoMinuti = timeToMinutes(FASCE_ORARIE[fasciaSelezionataKey]);
        console.log(`--- Avvio calcolo (${calcoloTipo} - v4.3). Fascia: ${fasciaSelezionataKey}. Limite: ${FASCE_ORARIE[fasciaSelezionataKey]} ---`);

        const oggi = new Date();
        const giornoOggi = String(oggi.getDate());
        console.log(`Giorno corrente: ${giornoOggi}`);

        // Usa la nuova funzione di estrazione PER IL GIORNO CORRENTE
        const { badgeList, rigaGiornoCorrente } = estraiTimbratureGiornoCorrente(giornoOggi);
        
        badgeList.sort((a, b) => timeToMinutes(a.orario) - timeToMinutes(b.orario));
        console.log("Badge rilevati per oggi (ordinati):", badgeList);

        if (badgeList.length === 0) {
            console.warn("⚠️ Nessun badge E/U trovato per oggi.");
            if (compactExitTimeBox) {
                compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">N/A</span>`;
            }
            return;
        }

        const entrataInizialeObj = badgeList.find(b => b.tipo === "E");
        if (!entrataInizialeObj) {
            console.warn("⚠️ Nessuna timbratura di ENTRATA trovata per oggi.");
            if (compactExitTimeBox) {
                compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">N/A</span>`;
            }
            return;
        }

        let entrataInizialeEffettiva = entrataInizialeObj.orario;
        let entrataInizialeConsiderataMinuti = timeToMinutes(entrataInizialeEffettiva);

        if (entrataInizialeConsiderataMinuti < limiteIngressoMinuti) {
            console.log(`Entrata (${entrataInizialeEffettiva}) antecedente al limite (${minutesToTime(limiteIngressoMinuti)}). Considerata dalle ${minutesToTime(limiteIngressoMinuti)}.`);
            entrataInizialeConsiderataMinuti = limiteIngressoMinuti;
        } else {
            console.log(`Entrata iniziale: ${entrataInizialeEffettiva}`);
        }

        const entrataInizialeVisualizzata = minutesToTime(entrataInizialeConsiderataMinuti);

        let pausaInizio = null;
        let pausaFine = null;
        let lastUIndex = -1;
        const PAUSA_MINIMA_PREDEFINITA = 10;
        let pausaConsiderata = 0;

        for (let i = 0; i < badgeList.length - 1; i++) {
            if (badgeList[i].tipo === "U" && badgeList[i + 1].tipo === "E") {
                pausaInizio = badgeList[i].orario;
                pausaFine = badgeList[i + 1].orario;
                break;
            }
        }

        if (pausaInizio && pausaFine) {
            const minutiPausaReale = timeToMinutes(pausaFine) - timeToMinutes(pausaInizio);
            if (minutiPausaReale > 0 && minutiPausaReale < 180) {
                pausaConsiderata = Math.max(PAUSA_MINIMA_PREDEFINITA, minutiPausaReale);
                console.log(`Pausa considerata: ${pausaConsiderata} minuti.`);
            } else {
                pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
                console.log(`Pausa non valida, usando predefinita: ${pausaConsiderata} minuti.`);
            }
        } else {
            pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
            console.log(`Nessuna pausa U-E, usando predefinita: ${pausaConsiderata} minuti.`);
        }

        const minutiLavorativiTotali = minutiLavorativiNetti + pausaConsiderata;
        const uscitaPrevistaMinuti = entrataInizialeConsiderataMinuti + minutiLavorativiTotali;
        const uscitaPrevista = minutesToTime(uscitaPrevistaMinuti);

        console.log(`Calcolo: ${entrataInizialeVisualizzata} + ${minutiLavorativiTotali} min = ${uscitaPrevista}`);

        // 1. Aggiorna il badge nella tabella (colonna "Orario")
        if (rigaGiornoCorrente) {
            const celle = rigaGiornoCorrente.querySelectorAll("td");
            // La struttura è: Data(0), Timbrature(1), Assenze(2), Richieste(3), Orario(4), poi i contatori...
            // Cerchiamo la colonna "Orario" che dovrebbe essere indice 4
            if (celle.length >= 5) {
                const cellaOrario = celle[4]; // Indice 4 per la colonna "Orario"
                
                // Svuota completamente il contenuto della cella
                cellaOrario.innerHTML = '';
                
                // Crea il nuovo badge
                const displaySpan = document.createElement('span');
                displaySpan.textContent = `➡️ ${uscitaPrevista}`;
                displaySpan.classList.add('custom-exit-time-pill');
                displaySpan.title = `Tipo: ${calcoloTipo} | Fascia: ${fasciaSelezionataKey} | Entrata: ${entrataInizialeEffettiva} (considerata: ${entrataInizialeVisualizzata}) | ${minutiLavorativiNetti}min + ${pausaConsiderata}min pausa`;
                
                // Inserisci il badge sostituendo tutto il contenuto
                cellaOrario.appendChild(displaySpan);
                console.log(`Badge ${displaySpan.textContent} inserito nella colonna Orario (sostituendo il contenuto precedente).`);
            } else {
                console.warn(`⚠️ Struttura celle non valida per inserire il badge.`);
            }
        }

        // 2. Aggiorna la box compatta
        if (compactExitTimeBox) {
            compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">${uscitaPrevista}</span>`;
            compactExitTimeBox.title = `Orario calcolato con ${calcoloTipo}. Fascia: ${fasciaSelezionataKey} | Entrata: ${entrataInizialeEffettiva} (considerata: ${entrataInizialeVisualizzata}) | ${minutiLavorativiNetti}min + ${pausaConsiderata}min pausa`;
        }

        console.log(`--- Fine calcolo (${calcoloTipo}) ---`);
    }

    let fasciaSelect = null;
    let sevenTwelveSegment = null;
    let sixOneSegment = null;
    let sliderElement = null;
    let compactExitTimeBox = null;
    let currentActiveModeKeySwitch = null;

    /**
     * Aggiorna lo stato visivo dello switch e ricalcola.
     */
    function setActiveSwitchSegment(modeKey) {
        currentActiveModeKeySwitch = modeKey;
        GM_setValue(STORAGE_KEY_CALC_MODE, modeKey);
        console.log(`Modalità salvata: ${modeKey}`);

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

            // Cerca il contenitore dei bottoni - prova vari selettori
            let existingButtonsDiv = updateButton.closest('.row.buttons');
            if (!existingButtonsDiv) {
                existingButtonsDiv = updateButton.closest('div.row.mb-2');
            }
            if (!existingButtonsDiv) {
                existingButtonsDiv = updateButton.closest('div.row');
            }

            currentActiveModeKeySwitch = GM_getValue(STORAGE_KEY_CALC_MODE, DEFAULT_CALC_MODE_KEY_SWITCH);

            const evoCalculatorContainer = document.createElement('div');
            evoCalculatorContainer.id = 'evoCalculatorContainer';

            // Gruppo "Linea oraria"
            const lineaOrariaGroupWrapper = document.createElement('div');
            lineaOrariaGroupWrapper.classList.add('evo-group-wrapper', 'linea-oraria');

            const lineaOrariaLabel = document.createElement('div');
            lineaOrariaLabel.classList.add('evo-label');
            lineaOrariaLabel.textContent = 'Linea oraria';
            lineaOrariaGroupWrapper.appendChild(lineaOrariaLabel);

            const evoControlsInner = document.createElement('div');
            evoControlsInner.classList.add('evo-controls-inner');

            // Selettore Fascia
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
                console.log(`Fascia salvata: ${e.target.value}`);
                let modeToCalculate = CALC_MODES_SWITCH[currentActiveModeKeySwitch];
                calcolaOrarioDiUscita(fasciaSelect.value, modeToCalculate.minutes, modeToCalculate.color, modeToCalculate.logType);
            });
            evoControlsInner.appendChild(fasciaSelect);

            // Toggle Switch
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

            lineaOrariaGroupWrapper.appendChild(evoControlsInner);
            evoCalculatorContainer.appendChild(lineaOrariaGroupWrapper);

            // Gruppo "Ora del giorno"
            const oraDelGiornoGroupWrapper = document.createElement('div');
            oraDelGiornoGroupWrapper.classList.add('evo-group-wrapper');

            const oraDelGiornoLabel = document.createElement('div');
            oraDelGiornoLabel.classList.add('evo-label');
            oraDelGiornoLabel.textContent = 'Ora del giorno';
            oraDelGiornoGroupWrapper.appendChild(oraDelGiornoLabel);

            // Box Compatta Orario
            compactExitTimeBox = document.createElement('div');
            compactExitTimeBox.id = 'compactExitTimeBox';
            compactExitTimeBox.innerHTML = `<span class="exit-label">${EXIT_LABEL}</span> <span class="value">--:--</span>`;
            oraDelGiornoGroupWrapper.appendChild(compactExitTimeBox);

            evoCalculatorContainer.appendChild(oraDelGiornoGroupWrapper);

            // Inserimento - prova ad appendere al contenitore, altrimenti inserisci dopo il bottone
            if (existingButtonsDiv) {
                existingButtonsDiv.appendChild(evoCalculatorContainer);
                console.log("Container aggiunto al contenitore dei bottoni.");
            } else {
                updateButton.parentNode.insertBefore(evoCalculatorContainer, updateButton.nextSibling);
                console.warn("Container inserito dopo il bottone 'Aggiorna'.");
            }

            // Calcolo iniziale
            setActiveSwitchSegment(currentActiveModeKeySwitch);
        }
    }, 500);
})();
