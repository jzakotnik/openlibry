# Erste Einrichtung

OpenLibry läuft? Super! Jetzt richten wir deine Bibliothek ein.

## Übersicht

Nach der Installation gibt es ein paar Dinge zu tun:

1. ✅ Ersten Admin-Nutzer anlegen
2. ✅ Authentifizierung aktivieren
3. ✅ Grundeinstellungen anpassen
4. ✅ Erste Bücher und Nutzer anlegen
5. ✅ Testausleihe durchführen

## 1. Ersten Admin-Nutzer anlegen

Direkt nach der Installation ist die Authentifizierung deaktiviert. Das ist Absicht – so kannst du den ersten Benutzer anlegen.

### Registrierung öffnen

Gehe zu:

```
http://dein-server:3000/auth/register
```

!!! warning "Wichtig"
    Diese Seite ist nur erreichbar, wenn `AUTH_ENABLED=false` in der `.env`-Datei steht.

### Nutzer anlegen

Gib einen Benutzernamen und ein Passwort ein. Das ist dein Admin-Account für OpenLibry.

!!! tip "Passwort-Tipp"
    Wähle ein sicheres Passwort! Auch wenn es "nur" eine Schulbibliothek ist – Datenschutz ist wichtig.

## 2. Authentifizierung aktivieren

Nachdem du den ersten Nutzer angelegt hast:

### In der .env-Datei

Öffne die `.env`-Datei und ändere:

```env
AUTH_ENABLED=true
```

### OpenLibry neu starten

=== "Docker"

    ```bash
    docker restart openlibry
    ```

=== "Bare Metal"

    ```bash
    # Mit pm2
    pm2 restart openlibry
    
    # Oder manuell
    # Strg+C zum Beenden, dann:
    npm run dev
    ```

Ab jetzt musst du dich anmelden, um OpenLibry zu nutzen.

## 3. Grundeinstellungen anpassen

Die wichtigsten Einstellungen findest du in der `.env`-Datei.

### Ausleihzeiten

```env
# Wie lange darf ein Buch ausgeliehen werden? (in Tagen)
RENTAL_DURATION_DAYS=21

# Wie lange bei Verlängerung? (in Tagen)
EXTENSION_DURATION_DAYS=14

# Wie oft darf verlängert werden?
MAX_EXTENSIONS=2
```

### Schul-Informationen

```env
# Schulname (erscheint auf Mahnungen etc.)
SCHOOL_NAME="Grundschule Beispielstadt"

# Logo-Datei (im public-Ordner)
SCHOOL_LOGO="school_logo.png"
```

!!! info "Mehr Einstellungen"
    Alle Einstellungen findest du in der [Umgebungsvariablen-Referenz](../configuration/environment-variables.md).

## 4. Erste Bücher anlegen

### Manuell anlegen

1. Gehe zu **Bücher**
2. Klicke auf das **+** Symbol
3. Fülle mindestens aus:
   - **Titel** (Pflichtfeld)
   - **Autor** (Pflichtfeld)
4. Optional, aber empfohlen:
   - **ISBN** – für Cover-Bilder
   - **Schlagworte** – für Filter
5. Klicke **Speichern**

### Per ISBN-Suche

Wenn du eine ISBN hast:

1. Gib die ISBN im entsprechenden Feld ein
2. OpenLibry sucht automatisch nach Metadaten
3. Cover-Bild wird (falls verfügbar) geladen

### Per Excel-Import

Du hast schon eine Liste deiner Bücher? Perfekt!

1. Gehe zu **Reports** → **Excel Import**
2. Lade eine Excel-Datei hoch
3. Prüfe die Vorschau
4. Importiere

Mehr dazu: [Excel-Import](../import/excel-generic.md)

## 5. Erste Nutzer anlegen

### Manuell anlegen

1. Gehe zu **Nutzer**
2. Klicke auf das **+** Symbol
3. Fülle aus:
   - **Vorname**
   - **Nachname**
   - **Klasse** (z.B. "3a")
4. Optional:
   - **Lehrkraft**
   - **E-Mail** (für Mahnungen)
5. Klicke **Speichern**

### Per Excel-Import

Auch Nutzer können per Excel importiert werden. 

!!! tip "Tipp für den Schuljahresanfang"
    Frag im Sekretariat nach einer Schülerliste als Excel. Die lässt sich oft direkt importieren.

## 6. Testausleihe

Jetzt der Praxistest!

1. Gehe zu **Leihe**
2. **Links**: Suche einen Nutzer und klicke ihn an
3. **Rechts**: Suche ein Buch
4. Klicke auf das **Ausleihe-Symbol** ▶️

Das Buch sollte jetzt als "ausgeliehen" erscheinen.

### Rückgabe testen

1. Der Nutzer ist noch geöffnet
2. Unter dem Namen siehst du die ausgeliehenen Bücher
3. Klicke auf das **Rückgabe-Symbol** ↩️

Fertig!

## 7. Optional: Barcode-Etiketten

Wenn du Barcodes nutzen willst:

1. Gehe zu **Reports**
2. Wähle **Buch-Etiketten**
3. Wähle die Bücher aus
4. Klicke **Erzeuge PDF**
5. Drucke auf Etikettenpapier

Mehr dazu: [Bücherlabels konfigurieren](../configuration/book-labels.md)

## Checkliste

- [ ] Admin-Nutzer angelegt
- [ ] Authentifizierung aktiviert
- [ ] Grundeinstellungen angepasst
- [ ] Erste Bücher angelegt
- [ ] Erste Nutzer angelegt
- [ ] Testausleihe erfolgreich
- [ ] (Optional) Barcode-Etiketten gedruckt

## Wie geht's weiter?

Deine Bibliothek ist bereit für den Echtbetrieb!

- [Benutzerhandbuch](../user-guide/index.md) – Tägliche Arbeit mit OpenLibry
- [Konfiguration](../configuration/index.md) – Alle Einstellungen im Detail
- [Import](../import/index.md) – Bestehende Daten importieren
- [Tipps & Tricks](../user-guide/tips-tricks.md) – Effizienter arbeiten
