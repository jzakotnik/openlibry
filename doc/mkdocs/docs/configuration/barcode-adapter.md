# Barcode-Adapter

Manche Bibliotheken haben Etiketten, deren Barcode mehr enthält als die reine Medien-ID
(z. B. der [SBC-Standard](https://sbc-standard.de/)). Der Barcode-Adapter extrahiert beim
Suchen und Scannen die Medien-ID. Ohne Konfiguration passiert nichts.

## Aktivieren

In `.env` setzen (Neubau nötig, da `NEXT_PUBLIC_`):

```bash
NEXT_PUBLIC_BARCODE_ADAPTER=sbc
```

`sbc` dekodiert `$` + 6 Zeichen Kennung + 6 Zeichen Base-32-Nummer + `%`, prüft die
EAN-Prüfziffer und liefert die 8-stellige ID (z. B. `$69JGQNTPLIEM%` → `99999995`).
Bücher müssen mit dieser ID als OpenLibry-ID importiert werden.

## Eigene Regeln

Alternativ eine JSON-Liste von Schritten, die der Reihe nach ausgeführt werden:

| Schritt | Wirkung |
|---|---|
| `{"type":"match","pattern":"^LIB-(\\d+)$"}` | muss passen; Gruppe 1 ist das Ergebnis |
| `{"type":"slice","start":2,"end":10}` | Teilstring |
| `{"type":"stripPrefix","value":"X"}` / `stripSuffix` | Präfix/Suffix entfernen |
| `{"type":"fromBase","base":32}` | Zahl aus Basis 2–36 ins Dezimalsystem |
| `{"type":"eanCheck"}` | letzte Ziffer als EAN-Prüfziffer prüfen |
| `{"type":"divide","by":10}` | ganzzahlig teilen (Prüfziffer entfernen) |
| `{"type":"trimLeadingZeros"}` | führende Nullen entfernen |

Passt ein Schritt nicht (oder ist die Konfiguration ungültig), bleibt die Eingabe unverändert.

!!! note "Scanner-Tastaturlayout"
    USB-Scanner tippen wie eine Tastatur. Bei deutschem Layout müssen `$` und `%`
    korrekt ankommen; ggf. das Layout des Scanners anpassen.
