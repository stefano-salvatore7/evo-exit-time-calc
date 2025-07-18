// ==UserScript==
// @name          EVO Exit Time Calculator
// @namespace     https://unibo.it/
// @version       1.19
// @description   Calcola l'orario di uscita su Personale Unibo (Sistema EVO), includendo la pausa tra timbrature e posiziona il bottone accanto ad "Aggiorna". Appare solo sulla pagina "Cartellino". Aggiunge una pausa predefinita di 10 minuti.
// @author        Your Name
// @match         https://personale-unibo.hrgpi.it/*
// @grant         none
// ==/UserScript==

(function () {
    'use strict';

    function timeToMinutes(t) {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    }

    function minutesToTime(mins) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        return `${h}:${m}`;
    }

    function calcolaPerOggi(event) {
        event.stopPropagation();
        event.preventDefault(); 

        const oggi = new Date();
        const giornoOggi = String(oggi.getDate());
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

        const badgeList = [];

        for (const riga of righeDelGiorno) {
            const badgeElements = riga.querySelectorAll("span[class*='badge-success'], span[class*='badge-danger'], div[class*='badge-success'], div[class*='badge-danger']");
            badgeElements.forEach(badge => {
                const orarioTesto = badge.textContent.trim();
                const tipo = orarioTesto.startsWith("E ") ? "E" : (orarioTesto.startsWith("U ") ? "U" : null);
                if (tipo && /^\d{2}:\d{2}$/.test(orarioTesto.slice(2))) {
                    badgeList.push({ tipo, orario: orarioTesto.slice(2), originalElement: badge });
                }
            });
        }

        badgeList.sort((a, b) => timeToMinutes(a.orario) - timeToMinutes(b.orario));

        const entrataInizialeObj = badgeList.find(b => b.tipo === "E");
        if (!entrataInizialeObj) return;

        const entrataIniziale = entrataInizialeObj.orario;
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

        if (pausaInizio) {
            for (let j = lastUIndex + 1; j < badgeList.length; j++) {
                if (badgeList[j].tipo === "E") {
                    pausaFine = badgeList[j].orario;
                    break;
                }
            }
        }

        const PAUSA_MINIMA = 10;
        let pausaConsiderata = PAUSA_MINIMA;

        if (pausaInizio && pausaFine) {
            const pausaReale = timeToMinutes(pausaFine) - timeToMinutes(pausaInizio);
            if (pausaReale > 0 && pausaReale < 180) {
                pausaConsiderata = Math.max(PAUSA_MINIMA, pausaReale);
            }
        }

        const minutiTotali = 432 + pausaConsiderata;
        const uscitaPrevista = minutesToTime(timeToMinutes(entrataIniziale) + minutiTotali);

        const celle = righeDelGiorno[0].querySelectorAll("td");
        if (celle.length >= 8) {
            celle[7].textContent = uscitaPrevista;
            celle[7].style.color = "blue";
            celle[7].style.fontWeight = "bold";
            celle[7].title = `Entrata: ${entrataIniziale} + ${minutiTotali} minuti (${pausaConsiderata} pausa)`;
        }
    }

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
                calcolaButton.onclick = calcolaPerOggi;
            }
        }, 500);
    }

})();
