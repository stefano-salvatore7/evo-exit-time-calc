// ==UserScript==
// @name          EVO Exit Time Calculator (Edge Fix)
// @namespace     https://unibo.it/
// @version       1.20
// @description   Calcola l'orario di uscita su Personale Unibo (Sistema EVO), compatibile anche con Edge. Bottone accanto ad "Aggiorna". Aggiunge pausa predefinita di 10 minuti.
// @author        stefano
// @match         https://personale-unibo.hrgpi.it/*
// @grant         none
// @run-at        document-idle
// ==/UserScript==

(function () {
    'use strict';

    console.log("✅ EVO Exit Time Calculator avviato");

    // (DEBUG visivo in alto a sinistra)
    const debugBanner = document.createElement("div");
    debugBanner.textContent = "🔍 EVO Script attivo!";
    Object.assign(debugBanner.style, {
        position: "fixed",
        top: "0",
        left: "0",
        zIndex: 9999,
        backgroundColor: "#ffc",
        padding: "5px",
        fontSize: "12px"
    });
    document.body.appendChild(debugBanner);

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

        console.log("--- Avvio calcolo per oggi ---");

        const oggi = new Date();
        const giornoOggi = String(oggi.getDate());
        const righeTabella = document.querySelectorAll('table tr');
        let righeDelGiorno = [];
        let foundTodayRow = false;

        for (const riga of righeTabella) {
            const primaCella = riga.querySelector("td");
            if (primaCella) {
                const testo = primaCella.textContent.trim();
                if (testo === giornoOggi) {
                    foundTodayRow = true;
                    righeDelGiorno.push(riga);
                } else if (foundTodayRow && testo === "") {
                    righeDelGiorno.push(riga);
                } else if (foundTodayRow) {
                    break;
                }
            }
        }

        const badgeList = [];
        for (const riga of righeDelGiorno) {
            const badgeElements = riga.querySelectorAll("span[class*='badge-'], div[class*='badge-']");
            badgeElements.forEach(badge => {
                const text = badge.textContent.trim();
                const tipo = text.startsWith("E ") ? "E" : (text.startsWith("U ") ? "U" : null);
                if (tipo && /^\d{2}:\d{2}$/.test(text.slice(2))) {
                    badgeList.push({ tipo, orario: text.slice(2), originalElement: badge });
                }
            });
        }

        badgeList.sort((a, b) => timeToMinutes(a.orario) - timeToMinutes(b.orario));

        if (!badgeList.length) return;

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

    function waitUntil(conditionFn, callback, timeout = 10000, interval = 300) {
        const start = Date.now();
        const handle = setInterval(() => {
            if (conditionFn()) {
                clearInterval(handle);
                callback();
            } else if (Date.now() - start > timeout) {
                clearInterval(handle);
                console.warn("⏱ Timeout in attesa degli elementi della pagina.");
            }
        }, interval);
    }

    waitUntil(() => {
        const title = document.querySelector('div.title-label');
        const table = document.querySelector('table');
        return title && title.textContent.includes('Cartellino') && table;
    }, () => {
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
        calcolaButton.type = "button";
        calcolaButton.onclick = calcolaPerOggi;

        document.body.appendChild(calcolaButton);

        waitUntil(() => document.getElementById("firstFocus"), () => {
            const updateBtn = document.getElementById("firstFocus");
            if (updateBtn && updateBtn.parentNode) {
                if (calcolaButton.parentNode) {
                    calcolaButton.remove();
                }
                updateBtn.parentNode.insertBefore(calcolaButton, updateBtn.nextSibling);
            }
        });
    });

})();
