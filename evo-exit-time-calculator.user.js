// ==UserScript==
// @name          EVO Exit Time Calculator
// @namespace     https://unibo.it/
// @version       1.18 // Versione aggiornata con pausa predefinita di 10 minuti
// @description   Calcola l'orario di uscita su Personale Unibo (Sistema EVO), includendo la pausa tra timbrature e posiziona il bottone accanto ad "Aggiorna". Appare solo sulla pagina "Cartellino". Aggiunge una pausa predefinita di 10 minuti.
// @author        Your Name (sostituire con il tuo nome/nickname se lo carichi su GitHub)
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
     * Funzione principale per calcolare l'orario di uscita previsto.
     * @param {Event} event - L'oggetto evento del click per prevenire la propagazione.
     */
    function calcolaPerOggi(event) {
        event.stopPropagation();
        event.preventDefault(); 

        console.log("--- Avvio calcolo per oggi (EVO Exit Time Calculator v1.18) ---");
        
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
                const tipo = orarioTesto.startsWith("E ") ? "E" : (orarioTesto.startsWith("U ") ? "U" : null);
                
                if (tipo) {
                    const orario = orarioTesto.slice(2); 
                    if (orario.match(/^\d{2}:\d{2}$/)) {
                         badgeList.push({
                            tipo: tipo,
                            orario: orario,
                            originalElement: badge
                        });
                    } else {
                        console.warn(`[DEBUG] Rilevato testo che inizia con E/U ma orario non valido: "${orarioTesto}" dall'elemento:`, badge);
                    }
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

        // Minuti lavorativi base (7 ore e 12 minuti = 432 minuti)
        let minutiLavorativiBase = 432; 
        let pausaConsiderata = 0; // Minuti di pausa che verranno effettivamente inclusi nel calcolo

        // Logica per la pausa predefinita di 10 minuti
        const PAUSA_MINIMA_PREDEFINITA = 10; // 10 minuti di pausa predefinita

        if (pausaInizio && pausaFine) {
            const minutiPausaReale = timeToMinutes(pausaFine) - timeToMinutes(pausaInizio);
            console.log(`Minuti di pausa calcolati (reali): ${minutiPausaReale}`);

            // Se la pausa reale è valida (tra 1 e 179 minuti)
            if (minutiPausaReale > 0 && minutiPausaReale < 180) {
                // Prende il massimo tra la pausa reale e la pausa minima predefinita
                pausaConsiderata = Math.max(PAUSA_MINIMA_PREDEFINITA, minutiPausaReale);
                console.log(`Pausa considerata: ${pausaConsiderata} minuti (max tra reale e predefinita).`);
            } else {
                // Se la pausa reale non è valida (es. negativa o troppo lunga), usa la pausa minima predefinita
                pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
                console.log(`Pausa reale non valida, usando pausa predefinita: ${pausaConsiderata} minuti.`);
            }
        } else {
            // Se non ci sono timbrature di pausa (U-E), usa la pausa minima predefinita
            pausaConsiderata = PAUSA_MINIMA_PREDEFINITA;
            console.log(`Nessuna pausa U-E valida trovata, usando pausa predefinita: ${pausaConsiderata} minuti.`);
        }
        
        // Calcola i minuti lavorativi totali aggiungendo la pausa considerata
        const minutiLavorativiTotali = minutiLavorativiBase + pausaConsiderata;

        const entrataInizialeMinuti = timeToMinutes(entrataIniziale);
        const uscitaPrevistaMinuti = entrataInizialeMinuti + minutiLavorativiTotali;
        const uscitaPrevista = minutesToTime(uscitaPrevistaMinuti);

        console.log(`Calcolo finale: ${entrataIniziale} (entrata) + ${minutiLavorativiTotali} minuti (lavoro base + pausa) = ${uscitaPrevista}`);

        const celle = righeDelGiorno[0].querySelectorAll("td");
        if (celle.length >= 8) {
            const cellaOrario = celle[7]; 
            cellaOrario.textContent = uscitaPrevista;
            cellaOrario.style.color = "blue"; 
            cellaOrario.style.fontWeight = "bold"; 
            // Aggiorna il tooltip per riflettere la pausa effettivamente considerata
            cellaOrario.title = `Entrata: ${entrataIniziale} + ${minutiLavorativiTotali} minuti (${pausaConsiderata} pausa inclusa)`;
            console.log(`Orario ${uscitaPrevista} inserito nella cella.`);
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
            calcolaButton.textContent = "Calcola uscita oggi";
            
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
            console.log("Bottone 'Calcola uscita oggi' creato e aggiunto temporaneamente al body (solo su pagina Cartellino).");

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
                console.log("Bottone 'Calcola uscita oggi' riposizionato accanto al bottone Aggiorna.");
                
                calcolaButton.onclick = calcolaPerOggi;
                console.log("Evento onclick ricollegato al bottone dopo il riposizionamento.");
            }
        }, 500); 
    }

})();
