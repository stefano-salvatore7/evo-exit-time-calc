// ==UserScript==
// @name          EVO Exit Time Calculator (Unificato)
// @namespace     https://unibo.it/
// @version       2.1
// @description   Calcola e mostra l'orario di uscita su Personale Unibo (Sistema EVO) per giornate da 7h 12m e 6h 1m. Permette di selezionare la fascia oraria di ingresso (7:30, 8:00, 8:30) che viene usata come limite inferiore per l'ingresso effettivo in entrambi i calcoli. La preferenza della fascia viene salvata. Include la pausa tra timbrature o 10 minuti predefiniti. Appare solo sulla pagina "Cartellino".
// @author        Stefano
// @match         https://personale-unibo.hrgpi.it/*
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    // --- Configurazione Fasce Orarie ---
    // Mappa delle fasce orarie disponibili e il loro limite inferiore in formato "HH:mm"
    const FASCE_ORARIE = {
        '07:30 - 08:30': '07:30',
        '08:00 - 09:00': '08:00',
        '08:30 - 09:30': '08:30'
    };
    const DEFAULT_FASCIA = '07:30 - 08:30'; // Fascia oraria predefinita

    const STORAGE_KEY = 'evoExitTime_selectedFascia'; // Chiave per salvare la preferenza della fascia

    // --- Colori per i bottoni e le pillole ---
    const COLOR_ORA_DEL_GIORNO = "#28a745"; // Verde
    const COLOR_SEI_ORE_UNDICI = "#8A2BE2"; // Viola

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
     * @param {string} displayColor - Il colore esadecimale per la pillola dell'orario di uscita.
     * @param {string} calcoloTipo - Stringa per i log (es. "7h 12m", "6h 11m").
     */
    function calcolaOrarioDiUscita(fasciaSelezionataKey, minutiLavorativiNetti, displayColor, calcoloTipo) {
        const limiteIngressoMinuti = timeToMinutes(FASCE_ORARIE[fasciaSelezionataKey]);
        console.log(`--- Avvio calcolo (${calcoloTipo} - Unificato v2.0). Fascia selezionata: ${fasciaSelezionataKey}. Limite ingresso: ${FASCE_ORARIE[fasciaSelezionataKey]} ---`);

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
                } else {
                    // console.warn(`[DEBUG] Rilevato testo non valido per orario: "${orarioTesto}" dall'elemento:`, badge);
                }
            });
        }

        badgeList.sort((a, b) => timeToMinutes(a.orario) - timeToMinutes(b.orario));

        console.log("Badge rilevati (e ordinati cronologicamente):", badgeList);

        if (badgeList.length === 0) {
            console.warn("⚠️ Nessun badge E/U trovato per il giorno corrente.");
            return;
        }

        const entrataInizialeObj = badgeList.find(b => b.tipo === "E");
        if (!entrataInizialeObj) {
            console.warn("⚠️ Nessuna timbratura di ENTRATA ('E') trovata.");
            return;
        }

        let entrataInizialeEffettiva = entrataInizialeObj.orario;
        let entrataInizialeConsiderataMinuti = timeToMinutes(entrataInizialeEffettiva);

        // Logica: l'ingresso considerato è il MAGGIORE tra l'orario timbrato e il limite inferiore della fascia
        if (entrataInizialeConsiderataMinuti < limiteIngressoMinuti) {
            console.log(`Entrata (${entrataInizialeEffettiva}) antecedente al limite della fascia (${minutesToTime(limiteIngressoMinuti)}). Sarà considerata dalle ${minutesToTime(limiteIngressoMinuti)}.`);
            entrataInizialeConsiderataMinuti = limiteIngressoMinuti;
        } else {
             console.log(`Entrata iniziale rilevata: ${entrataInizialeEffettiva}`);
        }

        const entrataInizialeVisualizzata = minutesToTime(entrataInizialeConsiderataMinuti);

        // Logica per il calcolo della pausa
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

        if (pausaInizio) {
            for (let j = lastUIndex + 1; j < badgeList.length; j++) {
                if (badgeList[j].tipo === "E") {
                    pausaFine = badgeList[j].orario;
                    break;
                }
            }
        }

        if (pausaInizio && pausaFine) {
            const minutiPausaReale = timeToMinutes(pausaFine) - timeToMinutes(pausaInizio);
            if (minutiPausaReale > 0 && minutiPausaReale < 180) { // Pausa non negativa e meno di 3 ore
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

        const celle = righeDelGiorno[0].querySelectorAll("td");
        if (celle.length >= 8) {
            const cellaOrario = celle[7];
            cellaOrario.innerHTML = '';
            const displaySpan = document.createElement('span');
            displaySpan.textContent = uscitaPrevista;

            Object.assign(displaySpan.style, {
                backgroundColor: displayColor,
                color: "white",
                padding: "5px 10px",
                borderRadius: "4px",
                fontWeight: "bold",
                display: "inline-block"
            });

            cellaOrario.appendChild(displaySpan);
            cellaOrario.title = `Tipo: ${calcoloTipo} | Fascia: ${fasciaSelezionataKey} | Entrata effettiva: ${entrataInizialeEffettiva} | Entrata considerata: ${entrataInizialeVisualizzata} | ${minutiLavorativiNetti} minuti (netti) + ${pausaConsiderata} minuti (pausa)`;
            console.log(`Orario ${uscitaPrevista} (${calcoloTipo}) inserito nella cella.`);
        } else {
            console.warn(`⚠️ Non ci sono abbastanza celle nella prima riga per inserire l'orario di uscita (${calcoloTipo}).`);
        }
        console.log(`--- Fine calcolo per oggi (${calcoloTipo}) ---`);
    }

    // --- UI - Gestione del Selettore Fascia e dei Bottoni ---

    let fasciaSelect = null;
    let oraDelGiornoButton = null;
    let seiOreUndiciButton = null;

    const waitForPageElements = setInterval(() => {
        const cartellinoTitle = document.querySelector('div.title-label');
        const isCartellinoPage = cartellinoTitle && cartellinoTitle.textContent.includes('Cartellino');
        const timeTable = document.querySelector('table');
        const updateButton = document.getElementById("firstFocus"); // Bottone "Aggiorna"

        if (isCartellinoPage && timeTable && updateButton) {
            clearInterval(waitForPageElements);

            // Trova il div contenitore dei bottoni principali per il posizionamento
            const existingButtonsDiv = updateButton.closest('.row.buttons, div.row.mb-2');

            // Crea il contenitore per i nostri elementi
            const customButtonContainer = document.createElement('div');
            Object.assign(customButtonContainer.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '10px', // Spazio tra gli elementi
                marginTop: '10px', // Spazio dal contenuto sopra
                marginBottom: '10px', // Spazio dal contenuto sotto
                flexWrap: 'wrap' // Permette ai bottoni di andare a capo su schermi piccoli
            });

            // Crea e aggiungi il selettore della fascia oraria
            fasciaSelect = document.createElement('select');
            fasciaSelect.id = 'fasciaOrariaSelector'; // ID unico per il selettore
            Object.assign(fasciaSelect.style, {
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
            });

            // Popola il selettore
            for (const key in FASCE_ORARIE) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                fasciaSelect.appendChild(option);
            }

            // Carica la preferenza salvata
            const savedFascia = GM_getValue(STORAGE_KEY, DEFAULT_FASCIA);
            fasciaSelect.value = savedFascia;
            console.log(`Fascia oraria caricata: ${savedFascia}`);

            // Aggiungi listener per salvare la scelta e ricalcolare al cambio
            fasciaSelect.addEventListener('change', (e) => {
                GM_setValue(STORAGE_KEY, e.target.value);
                console.log(`Fascia oraria salvata: ${e.target.value}`);
                // Non ricalcola automaticamente qui, ma aspetta il click sui bottoni specifici
            });
            customButtonContainer.appendChild(fasciaSelect);

            // Crea il bottone "Ora del Giorno" (7h 12m)
            oraDelGiornoButton = document.createElement("button");
            oraDelGiornoButton.textContent = "Ora del Giorno";
            Object.assign(oraDelGiornoButton.style, {
                padding: "10px",
                backgroundColor: COLOR_ORA_DEL_GIORNO, // Verde
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
            });
            oraDelGiornoButton.setAttribute('type', 'button');
            oraDelGiornoButton.onclick = () => calcolaOrarioDiUscita(fasciaSelect.value, 432, COLOR_ORA_DEL_GIORNO, "7h 12m"); // 7 ore e 12 minuti = 432 minuti
            customButtonContainer.appendChild(oraDelGiornoButton);

            // Crea il bottone "6 ore e 11" (6h 1m)
            seiOreUndiciButton = document.createElement("button");
            seiOreUndiciButton.textContent = "6 ore e 11";
            Object.assign(seiOreUndiciButton.style, {
                padding: "10px",
                backgroundColor: COLOR_SEI_ORE_UNDICI, // Viola
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
            });
            seiOreUndiciButton.setAttribute('type', 'button');
            seiOreUndiciButton.onclick = () => calcolaOrarioDiUscita(fasciaSelect.value, 361, COLOR_SEI_ORE_UNDICI, "6h 11m"); // 6 ore e 1 minuto = 361 minuti
            customButtonContainer.appendChild(seiOreUndiciButton);

            // Aggiungi il container con selettore e bottoni al DOM
            if (existingButtonsDiv) {
                existingButtonsDiv.appendChild(customButtonContainer);
                console.log("Selettore fascia e bottoni di calcolo unificati aggiunti al container esistente.");
            } else {
                // Fallback se il div specifico non viene trovato
                updateButton.parentNode.insertBefore(customButtonContainer, updateButton.nextSibling);
                console.warn("Non trovato div contenitore comune, riposizionato accanto ad 'Aggiorna'.");
            }
        }
    }, 500); // Controlla ogni 500ms
})();
