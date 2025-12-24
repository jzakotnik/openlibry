# Backup & Restore

So sicherst du deine Daten und stellst sie im Notfall wieder her.

## Die Datenbank

OpenLibry speichert alle Daten in einer einzigen SQLite-Datei:

```
database/dev.db
```

Das macht Backups super einfach: **Eine Datei kopieren – fertig!**

## Backup erstellen

### Manuell

```bash
# Einfaches Backup
cp database/dev.db database/dev.db.backup

# Backup mit Datum
cp database/dev.db "database/backup_$(date +%Y%m%d_%H%M%S).db"
```

### Automatisch (Cronjob)

Erstelle ein Backup-Script:

```bash title="/home/user/backup-openlibry.sh"
#!/bin/bash
OPENLIBRY_DIR="/pfad/zu/openlibry"
BACKUP_DIR="/pfad/zu/backups"
DATE=$(date +%Y%m%d)

# Backup erstellen
cp $OPENLIBRY_DIR/database/dev.db $BACKUP_DIR/openlibry_$DATE.db

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "openlibry_*.db" -mtime +30 -delete

echo "Backup erstellt: openlibry_$DATE.db"
```

Täglich um 3 Uhr ausführen:

```bash
chmod +x /home/user/backup-openlibry.sh
crontab -e
# Füge hinzu:
0 3 * * * /home/user/backup-openlibry.sh
```

## Backup wiederherstellen

### Aus Datei-Backup

```bash
# OpenLibry stoppen
pm2 stop openlibry  # oder docker stop openlibry

# Backup zurückspielen
cp database/dev.db.backup database/dev.db

# OpenLibry starten
pm2 start openlibry  # oder docker start openlibry
```

### Aus Excel-Export

Falls du nur einen Excel-Export hast:

1. Frische OpenLibry-Installation aufsetzen
2. [Excel-Import](../import/excel-generic.md) durchführen

!!! warning "Verlust möglich"
    Der Excel-Export enthält nicht alle Daten (z.B. keine Ausleihhistorie). Ein Datenbank-Backup ist vollständiger.

## Backup-Strategie

### Empfohlen

| Häufigkeit | Was | Wo |
|------------|-----|-----|
| Täglich | Datenbank-Backup | Lokaler Server |
| Wöchentlich | Datenbank-Backup | Externer Speicher (USB, Cloud) |
| Monatlich | Excel-Export | Archiv |

### 3-2-1-Regel

- **3** Kopien deiner Daten
- **2** verschiedene Medien (z.B. Server + USB)
- **1** Kopie an einem anderen Ort

## Externe Speicherorte

### USB-Stick

```bash
# USB-Stick mounten (falls nicht automatisch)
sudo mount /dev/sdb1 /mnt/usb

# Backup kopieren
cp database/dev.db /mnt/usb/openlibry_backup.db

# USB-Stick sicher entfernen
sudo umount /mnt/usb
```

### Cloud (z.B. mit rclone)

```bash
# rclone einrichten (einmalig)
rclone config

# Backup hochladen
rclone copy database/dev.db remote:openlibry-backups/
```

### Netzlaufwerk

```bash
# NFS/SMB-Share mounten
sudo mount -t cifs //server/share /mnt/backup -o username=user

# Backup kopieren
cp database/dev.db /mnt/backup/openlibry_$(date +%Y%m%d).db
```

## Docker-spezifisch

Bei Docker liegt die Datenbank im gemounteten Volume:

```bash
# Aus dem Host-System
cp ./database/dev.db ./database/dev.db.backup

# Oder aus dem Container
docker cp openlibry:/app/database/dev.db ./backup.db
```

## Prüfen, ob Backup funktioniert

!!! danger "Wichtig!"
    Ein Backup, das nicht getestet wurde, ist kein Backup!

So testest du:

1. Backup erstellen
2. Temporäre Test-Installation aufsetzen
3. Backup dort einspielen
4. Prüfen, ob alles funktioniert

## Notfall-Checkliste

Falls etwas schiefgegangen ist:

1. ☐ Ruhe bewahren
2. ☐ Aktuellen Zustand sichern (auch wenn kaputt)
3. ☐ Letztes funktionierendes Backup finden
4. ☐ Auf Test-System wiederherstellen und prüfen
5. ☐ Wenn OK: Auf Produktion wiederherstellen
6. ☐ Ursache analysieren

## Nächste Schritte

- [Excel Export](excel-export.md) – Zusätzliche Sicherung
- [Updates](../installation/upgrading.md) – Vor Updates immer Backup machen!
