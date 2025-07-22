# EVO Exit Time Calculator - Changelog

This document tracks the changes and updates across different versions of the EVO Exit Time Calculator UserScript.

---

## **Version 1.25**
* **Release Date:** 22 Luglio 2025
* **Author:** Stefano
* **Changes:**
    * **Orario d'Ingresso Flessibile:** Introdotta una condizione per cui se la prima timbratura di ingresso (`E`) è antecedente alle **07:30**, l'orario di inizio per il calcolo delle 7 ore e 12 minuti lavorative viene comunque fissato alle **07:30**. Questo assicura che il calcolo dell'uscita non sia influenzato da ingressi anticipati oltre un certo limite.
    * **Tooltip Dettagliato:** Il tooltip dell'orario di uscita ora mostra sia l'orario di ingresso effettivo che quello considerato (ad esempio, "Entrata effettiva: 07:27 | Entrata considerata: 07:30").

---

## **Version 1.24**
* **Release Date:** 18 Luglio 2025
* **Author:** Stefano
* **Changes:**
    * **Miglioramento Visuale Orario:** L'orario di uscita calcolato viene ora visualizzato all'interno di una "pillola" stilizzata con sfondo **blu** e testo **bianco**. Questo ne migliora la leggibilità e l'integrazione visiva con gli elementi esistenti nella pagina.

---

## **Version 1.23**
* **Release Date:** 18 Luglio 2025
* **Author:** Stefano
* **Changes:**
    * **Sovrascrittura Cella Orario:** Il calcolo dell'orario di uscita sostituisce ora completamente qualsiasi contenuto precedente nella cella di destinazione, garantendo una visualizzazione singola e chiara e prevenendo sovrapposizioni indesiderate.

---

## **Version 1.22**
* **Release Date:** 18 Luglio 2025
* **Author:** Stefano
* **Changes:**
    * **Supporto Telelavoro:** Aggiunto il supporto per il parsing dei formati di timbratura specifici per il "Telelavoro" (`E[HH:mm]` e `U[HH:mm]`), oltre al formato standard (`E HH:mm`, `U HH:mm`). Questo aumenta la robustezza e l'accuratezza del rilevamento delle timbrature.

---

## **Version 1.21**
* **Release Date:** *Non Specificata*
* **Author:** Stefano
* **Changes:**
    * Nessun cambiamento funzionale significativo rispetto alla v1.19. (Questa versione potrebbe essere stata un test o un'etichetta provvisoria).

---

## **Version 1.19**
* **Release Date:** *Non Specificata*
* **Author:** Stefano
* **Changes:**
    * **Testo Bottone Aggiornato:** Il testo del bottone per avviare il calcolo è stato modificato da "Calcola uscita oggi" a **"Ora del Giorno"**, per una denominazione più concisa e descrittiva.

---

## **Version 1.18**
* **Release Date:** *Non Specificata*
* **Author:** Stefano
* **Changes:**
    * **Gestione Pausa Minima:** Introdotta una **pausa minima predefinita di 10 minuti**. Se non viene rilevata una sequenza di timbrature U/E che indichi una pausa, o se la pausa effettiva calcolata è inferiore a 10 minuti, vengono comunque considerati 10 minuti di pausa nel calcolo dell'orario di uscita. Altrimenti, viene utilizzata la durata della pausa U/E effettiva (se valida e ragionevole).

---

## **Version 1.17**
* **Release Date:** *Non Specificata*
* **Author:** Stefano
* **Changes:**
    * **Visibilità Selettiva Bottone:** Il bottone "Ora del Giorno" appare ora **esclusivamente sulla pagina "Cartellino"** del portale, evitando la sua visualizzazione su altre sezioni non pertinenti.

---

## **Version 1.16**
* **Release Date:** *Non Specificata*
* **Author:** Stefano
* **Changes:**
    * **Correzioni UI:** Risolti problemi relativi al posizionamento del bottone "Calcola uscita oggi", garantendone l'ancoraggio corretto accanto al bottone "Aggiorna". Aggiunti `stopPropagation()` e `preventDefault()` per migliorare la gestione degli eventi di click e prevenire potenziali conflitti.

---

## **Version 1.0 - 1.15**
* **Release Date:** *Date varie*
* **Author:** Stefano
* **Changes:**
    * Implementazione iniziale del meccanismo di calcolo dell'orario di uscita basato su un turno di 7 ore e 12 minuti.
    * Introduzione e perfezionamento della logica di rilevamento e gestione della pausa tra le timbrature di Uscita (`U`) ed Entrata (`E`).
    * Varie correzioni di bug, ottimizzazioni del codice e miglioramenti della stabilità.
