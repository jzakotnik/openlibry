# Daten exportieren

Daten sichern, exportieren und wiederherstellen.

## Übersicht

| Funktion | Verwendung |
|----------|------------|
| [Excel Export](excel-export.md) | Daten in Excel exportieren |
| [Backup & Restore](backup-restore.md) | Datenbank sichern und wiederherstellen |

## Warum exportieren?

### Datensicherung

Die wichtigste Funktion: **Backups**. Wenn etwas schiefgeht, kannst du den letzten Stand wiederherstellen.

### Statistiken

Mit dem Excel-Export kannst du:

- Auswertungen in Excel erstellen
- Daten an die Schulleitung weitergeben
- Jahresberichte erstellen

### Migration

Falls du mal umziehen musst:

- Export aus der alten Installation
- Import in die neue

## Schnellstart: Backup

Das Wichtigste zuerst – so sicherst du deine Daten:

```bash
# Einfaches Backup der Datenbank
cp database/dev.db database/dev.db.backup

# Backup mit Datum
cp database/dev.db "database/backup_$(date +%Y%m%d).db"
```

Mehr Details: [Backup & Restore](backup-restore.md)

## Nächste Schritte

- [Excel Export](excel-export.md)
- [Backup & Restore](backup-restore.md)
