// ==UserScript==
// @name          EVO Exit Time Calculator
// @namespace     https://unibo.it/
// @version       1.24
// @description   Calcola e mostra l'orario di uscita su Personale Unibo (Sistema EVO) per 7 ore e 12 minuti, includendo la pausa tra timbrature. L'orario viene visualizzato in una "pillola" blu con testo bianco. Sostituisce l'orario esistente nella cella. Il bottone appare solo sulla pagina "Cartellino" accanto ad "Aggiorna". Aggiunge una pausa predefinita di 10 minuti.
// @author        Stefano
// @match         https://personale-unibo.hrgpi.it/*
// @grant         none
// ==/UserScript==

(function () {
    'use strict';

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
     * Funzione principale per calcolare l'orario di uscita previsto (7h 12m).
     * @param {Event} event - L'oggetto evento del click per prevenire la propagazione.
     */
    function calcolaPerOggi(event) {
        event.stopPropagation();
        event.preventDefault(); 

        console.log("--- Avvio calcolo per oggi (EVO Exit Time Calculator v1.24) ---"); // Modificato versione
        
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
                    console.warn(`[DEBUG] Rilevato testo non valido per orario: "${orarioTesto}" dall'elemento:`, badge);
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
        const entrataIniziale = entrataInizialeObj.orario;
        console.log(`Entrata iniziale rilevata: ${entrataIniziale}`);

        let pausaInizio = null;
        let pausaFine = null;
        let lastUIndex = -1;

        for (let i = badgeList.length - 1; i >= 0; i--) {
            if (badgeList[i].tipo === "U") {
                lastUIndex = i;
                pausaInizio = badgeList[i].orario;
                break;
            }
        }
        
        console.log(`Ultima U trovata: ${pausaInizio ? pausaInizio : 'Nessuna'}`);

        if (pausaInizio) {
            for (let j = lastUIndex + 1; j < badgeList.length; j++) {
                if (badgeList[j].tipo === "E") {
                    pausaFine = badgeList[j].orario;
                    break;
                }
            }
        }
        console.log(`Prima E dopo l'ultima U: ${pausaFine ? pausaFine : 'Nessuna'}`);

        let minutiLavorativiBase = 432; // 7 ore e 12 minuti
        let pausaConsiderata = 0; 
        const PAUSA_MINIMA_PREDEFINITA = 10; 

        if (pausaInizio && pausaFine) {
            const minutiPausaReale = timeToMinutes(pausaFine) - timeToMinutes(pausaInizio);
            console.log(`Minuti di pausa calcolati (reali): ${minutiPausaReale}`);

            if (minutiPausaReale > 0 && minutiPausaReale < 180) {
                pausaConsiderata = Math.max(PAUSA_MINIMA_PREDEFINITA, minutiPausaReale);
                console.log(`Pausa considerata: ${pausaConsiderata} minuti (max tra reale e predefinita).`);
            } else {
                pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
                console.log(`Pausa reale non valida, usando pausa predefinita: ${pausaConsiderata} minuti.`);
            }
        } else {
            pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
            console.log(`Nessuna pausa U-E valida trovata, usando pausa predefinita: ${pausaConsiderata} minuti.`);
        }
        
        const minutiLavorativiTotali = minutiLavorativiBase + pausaConsiderata;

        const entrataInizialeMinuti = timeToMinutes(entrataIniziale);
        const uscitaPrevistaMinuti = entrataInizialeMinuti + minutiLavorativiTotali;
        const uscitaPrevista = minutesToTime(uscitaPrevistaMinuti);

        console.log(`Calcolo finale: ${entrataIniziale} (entrata) + ${minutiLavorativiTotali} minuti (lavoro base + pausa) = ${uscitaPrevista}`);

        const celle = righeDelGiorno[0].querySelectorAll("td");
        if (celle.length >= 8) {
            const cellaOrario = celle[7]; 
            // MODIFICA QUI: Crea un <span> e applica gli stili del "bottone"
            cellaOrario.innerHTML = ''; // Pulisci la cella
            const displaySpan = document.createElement('span');
            displaySpan.textContent = uscitaPrevista;
            
            Object.assign(displaySpan.style, {
                backgroundColor: "#007bff", // Sfondo blu
                color: "white",             // Testo bianco
                padding: "5px 10px",        // Padding
                borderRadius: "4px",        // Bordi arrotondati
                fontWeight: "bold",
                display: "inline-block"     // Permette padding e margini
            });

            cellaOrario.appendChild(displaySpan);
            cellaOrario.title = `Entrata: ${entrataIniziale} + ${minutiLavorativiTotali} minuti (${pausaConsiderata} pausa inclusa)`;
            console.log(`Orario ${uscitaPrevista} inserito nella cella con stile "bottone" blu.`);
        } else {
            console.warn("⚠️ Non ci sono abbastanza celle nella prima riga per inserire l'orario di uscita.");
        }
        console.log("--- Fine calcolo per oggi ---");
    }

    // --- UI - Gestione del Bottone ---

    let calcolaButton = null;

    const waitForPageElements = setInterval(() => {
        const cartellinoTitle = document.querySelector('div.title-label');
        const isCartellinoPage = cartellinoTitle && cartellinoTitle.textContent.includes('Cartellino');
        const timeTable = document.querySelector('table');

        if (isCartellinoPage && timeTable) {
            clearInterval(waitForPageElements); 

            calcolaButton = document.createElement("button");
            calcolaButton.textContent = "Ora del Giorno"; 
            
            Object.assign(calcolaButton.style, {
                padding: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                marginLeft: "10px" 
            });
            
            calcolaButton.setAttribute('type', 'button'); 
            calcolaButton.onclick = calcolaPerOggi;
            
            document.body.appendChild(calcolaButton);
            console.log("Bottone 'Ora del Giorno' creato e aggiunto temporaneamente al body (solo su pagina Cartellino).");

            startPositioningButton();
        }
    }, 500); 

    function startPositioningButton() {
        const waitForUpdateButton = setInterval(() => {
            const updateButton = document.getElementById("firstFocus");
            
            if (calcolaButton && updateButton) {
                clearInterval(waitForUpdateButton); 

                if (calcolaButton.parentNode) {
                    calcolaButton.parentNode.removeChild(calcolaButton);
                }

                updateButton.parentNode.insertBefore(calcolaButton, updateButton.nextSibling);
                console.log("Bottone 'Ora del Giorno' riposizionato accanto al bottone Aggiorna.");
                
                calcolaButton.onclick = calcolaPerOggi;
                console.log("Evento onclick ricollegato al bottone dopo il riposizionamento.");
            }
        }, 500); 
    }

})();
