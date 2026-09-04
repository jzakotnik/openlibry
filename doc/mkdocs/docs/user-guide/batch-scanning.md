# Stapelerfassung (Batch Scanning)

Mit der Stapelerfassung können Sie schnell und effizient viele Bücher auf einmal in OpenLibry erfassen. Diese Funktion ist ideal für:

- Ersterfassung einer Bibliothek
- Neuzugänge aus Buchspenden
- Inventarisierung neuer Bestellungen

## Zugang zur Stapelerfassung

Die Stapelerfassung erreichen Sie über die Bücherverwaltung:

1. Öffnen Sie die **Bücherverwaltung** im Hauptmenü
2. Klicken Sie auf das **Stapel-Symbol** (Queue-Icon) neben dem Hinzufügen-Button
3. Die Stapelerfassungs-Seite öffnet sich



## Workflow

### Schritt 1: ISBN-Barcodes scannen

1. Positionieren Sie den Cursor im Eingabefeld
2. Scannen Sie die ISBN-Barcodes der Bücher mit Ihrem Barcode-Scanner
3. Nach jedem Scan wird automatisch eine Zeile hinzugefügt
4. Die ISBN wird validiert und in der Liste angezeigt

!!! tip "Tipp"
    Der Barcode-Scanner sollte so konfiguriert sein, dass er nach dem Scan automatisch Enter sendet. Dies beschleunigt den Erfassungsprozess erheblich.

#### Barcode mit der Kamera erfassen

Wenn kein Handscanner zur Verfügung steht, können Sie den Barcode auch mit der Kamera des Geräts aufnehmen. Das Kamerasymbol rechts im ISBN-Eingabefeld öffnet den Scanner. Halten Sie den Barcode in den Rahmen, die erkannte ISBN wird automatisch in das Feld übernommen. Sind mehrere Kameras vorhanden, etwa Vorder- und Rückkamera eines Tablets, wechseln Sie mit dem Symbol oben rechts zwischen ihnen. Dasselbe Kamerasymbol finden Sie im ISBN-Feld der Buchbearbeitung.

!!! warning "HTTPS erforderlich"
    Browser geben die Kamera nur in einem sicheren Kontext frei, also über HTTPS oder beim Aufruf über localhost. Wenn Sie OpenLibry im Schulnetz über eine einfache HTTP-Adresse erreichen, zum Beispiel über `http://192.168.1.50:3000`, bleibt die Kamera gesperrt und der Scanner weist darauf hin, dass eine HTTPS-Verbindung nötig ist. Die Eingabe von Hand und der angeschlossene Handscanner arbeiten unabhängig davon weiter. Wie Sie HTTPS einrichten, steht unter [Installation mit nginx und SSL](../installation/nginx-ssl.md).

### Schritt 2: Buchdaten abrufen

Nachdem Sie alle ISBNs gescannt haben:

1. Klicken Sie auf **Daten abrufen**
2. OpenLibry sucht automatisch nach Buchinformationen in verschiedenen Quellen
3. Der Fortschritt wird für jedes Buch angezeigt
4. Gefundene Daten werden in der Vorschau angezeigt

### Schritt 3: Daten überprüfen und anpassen

Für jedes Buch wird eine Vorschau angezeigt mit:

- **Titel** und **Untertitel**
- **Autor(en)**
- **Verlag** und **Erscheinungsjahr**
- **Cover-Bild** (falls verfügbar)

Sie können die Daten vor dem Speichern anpassen:

- Klicken Sie auf ein Feld, um es zu bearbeiten
- Fehlende Informationen können manuell ergänzt werden
- Nicht gefundene Bücher können manuell erfasst werden

### Schritt 4: Bücher speichern

1. Überprüfen Sie alle Einträge
2. Entfernen Sie fehlerhafte Einträge (falls gewünscht)
3. Klicken Sie auf **Alle speichern**
4. Die Bücher werden in die Datenbank aufgenommen

## ISBN-Datenquellen

OpenLibry verwendet mehrere Datenquellen für die ISBN-Suche:

| Quelle | Beschreibung | Stärken |
|--------|--------------|---------|
| **DNB (Deutsche Nationalbibliothek)** | Offizielle deutsche Bibliografie | Deutsche Bücher, vollständige Metadaten |
| **Google Books** | Google Buchsuche | Internationale Bücher, Cover-Bilder |
| **Open Library** | Freie Buchdatenbank | Ältere Werke, internationale Titel |
| **ISBNSearch.org** | ISBN-Suchdienst | Breite Abdeckung |

Die Suche erfolgt automatisch nacheinander, bis Daten gefunden werden. Die Reihenfolge ist auf deutsche Schulbibliotheken optimiert.

## Fehlerbehebung

### ISBN wird nicht erkannt

- Überprüfen Sie, ob die ISBN korrekt gescannt wurde
- Prüfen Sie die ISBN auf Tippfehler
- Manche älteren Bücher haben nur 10-stellige ISBNs - diese werden automatisch umgewandelt

### Kamera-Scanner lässt sich nicht öffnen

Prüfen Sie zuerst die Adresse in der Browserzeile. Ohne HTTPS gibt der Browser keine Kamera frei, siehe den Hinweis in Schritt 1. Besteht bereits eine HTTPS-Verbindung und der Scanner meldet trotzdem einen verweigerten Zugriff, wurde die Kameraberechtigung für diese Seite abgelehnt. Sie lässt sich in den Website-Einstellungen des Browsers wieder erteilen. Auf Geräten ohne Kamera meldet der Scanner, dass keine Kamera gefunden wurde.

### Keine Buchdaten gefunden

Wenn für eine ISBN keine Daten gefunden werden:

1. Das Buch wird mit der ISBN aber ohne weitere Daten angezeigt
2. Geben Sie Titel und Autor manuell ein
3. Das Buch kann trotzdem gespeichert werden

### Falsche Buchdaten

Manchmal werden für eine ISBN falsche Ausgaben gefunden:

- Überprüfen Sie Titel und Autor
- Korrigieren Sie die Daten vor dem Speichern
- Besonders bei Neuauflagen können Abweichungen auftreten

## Best Practices

!!! success "Empfehlungen für effizientes Arbeiten"

    1. **Vorbereitung**: Sortieren Sie die Bücher vor dem Scannen
    2. **Batching**: Erfassen Sie 20-50 Bücher pro Durchgang
    3. **Qualitätskontrolle**: Prüfen Sie die Daten vor dem Speichern
    4. **Nacharbeit**: Ergänzen Sie fehlende Cover-Bilder später in der Buchverwaltung

## Technische Details

Die Stapelerfassung verwendet eine modulare ISBN-Lookup-Architektur:

```
Benutzeroberfläche
       ↓
ISBN-Validierung
       ↓
┌──────────────────────────────────┐
│   ISBN Service Chain             │
│   ├── DNB SRU Service           │
│   ├── DNB Portal Scraping       │
│   ├── Google Books API          │
│   ├── Open Library API          │
│   └── ISBNSearch Service        │
└──────────────────────────────────┘
       ↓
Datenaufbereitung & Sanitierung
       ↓
Buchvorschau & Bearbeitung
       ↓
Datenbank
```

Jeder Service wird nacheinander abgefragt, bis Daten gefunden werden. Die Ergebnisse werden automatisch bereinigt und normalisiert.
