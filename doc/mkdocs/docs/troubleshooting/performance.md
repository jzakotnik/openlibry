# Performance

OpenLibry ist langsam? So machst du es schneller.

## Auf dem Raspberry Pi

### Empfohlene Maßnahmen

1. **SSD statt SD-Karte**: Der größte Performance-Gewinn!

2. **Swap erhöhen** (bei wenig RAM):
   ```bash
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile
   # CONF_SWAPSIZE=2048
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

3. **64-bit OS verwenden** (Raspberry Pi 4)

### Nicht empfohlen

- Raspberry Pi Zero/1 – zu schwach
- SD-Karten der Klasse 4 oder niedriger

## Allgemeine Tipps

### Datenbank optimieren

```bash
sqlite3 database/dev.db "VACUUM;"
sqlite3 database/dev.db "ANALYZE;"
```

### Weniger Cover-Bilder

Große Cover-Bilder verlangsamen die Anzeige. Bilder auf 300-500px Breite reduzieren.

### Browser-Cache leeren

Manchmal hilft ein ++ctrl+shift+r++ (Hard Reload).

## Docker-Performance

### Ressourcen begrenzen

```yaml
services:
  openlibry:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Bei sehr vielen Büchern (>10.000)

- Paginierung nutzen (falls verfügbar)
- Spezifischer suchen
- Datenbank regelmäßig optimieren
