# Authentifizierung

Login und Benutzerverwaltung in OpenLibry.

## Übersicht

OpenLibry hat ein einfaches Authentifizierungssystem:

- Ein oder mehrere Benutzer können sich anmelden
- Alle angemeldeten Benutzer haben volle Rechte
- Ohne Login ist OpenLibry komplett zugänglich (wenn deaktiviert)

## Aktivieren/Deaktivieren

```env
# In der .env-Datei
AUTH_ENABLED=true   # Login erforderlich
AUTH_ENABLED=false  # Kein Login nötig
```

!!! warning "Für den Produktivbetrieb"
    Im Produktivbetrieb sollte `AUTH_ENABLED=true` sein, besonders wenn OpenLibry aus dem Internet erreichbar ist.

## Ersten Benutzer anlegen

Bei einer neuen Installation:

1. Setze `AUTH_ENABLED=false` in der `.env`
2. Starte OpenLibry neu
3. Öffne `/auth/register` im Browser
4. Erstelle einen Benutzer (Username + Passwort)
5. Setze `AUTH_ENABLED=true` in der `.env`
6. Starte OpenLibry neu

## Weitere Benutzer anlegen

Aktuell können weitere Benutzer nur über den gleichen Weg angelegt werden:

1. `AUTH_ENABLED=false` setzen
2. Neu starten
3. `/auth/register` öffnen
4. Benutzer anlegen
5. `AUTH_ENABLED=true` setzen
6. Neu starten

!!! info "Geplantes Feature"
    Eine Benutzerverwaltung im Admin-Bereich ist für zukünftige Versionen geplant.

## NEXTAUTH_SECRET

Das `NEXTAUTH_SECRET` ist ein geheimer Schlüssel für die Session-Verwaltung:

```env
NEXTAUTH_SECRET=einLangerZufälligerString123!
```

**Wichtig:**
- Verwende einen langen, zufälligen String
- Ändere ihn nicht nachträglich (loggt alle Benutzer aus)
- Halte ihn geheim

### Secret generieren

```bash
# Zufälliges Secret generieren
openssl rand -base64 32
```

## Passwort vergessen?

Es gibt aktuell keine "Passwort vergessen"-Funktion. Alternativen:

### Option 1: Neuen Benutzer anlegen

1. `AUTH_ENABLED=false` setzen
2. Neuen Benutzer unter `/auth/register` anlegen
3. `AUTH_ENABLED=true` setzen

### Option 2: Datenbank bearbeiten (für Experten)

Die Benutzer werden in der SQLite-Datenbank gespeichert. Mit einem SQLite-Browser kannst du:

- Passwort zurücksetzen
- Benutzer löschen

## Session-Dauer

Sessions sind standardmäßig langlebig. Du wirst nicht automatisch ausgeloggt.

Zum manuellen Ausloggen: Klicke auf deinen Benutzernamen → Logout.

## Sicherheitstipps

1. **Starke Passwörter** verwenden
2. **HTTPS** nutzen (siehe [nginx-Installation](../installation/nginx-ssl.md))
3. **NEXTAUTH_SECRET** sicher aufbewahren
4. Bei Verdacht auf Kompromittierung: NEXTAUTH_SECRET ändern

## Nächste Schritte

- [Erste Einrichtung](../getting-started/first-steps.md)
- [nginx & HTTPS](../installation/nginx-ssl.md)
