# Openlibly

Die einfache Software für die Schulbibliothek

# Import from OpenBiblio

- Start podman with docker compose
- Open myphpadmin, create openbiblio database
- Execute script to copy mySQL files



Import members via `SELECT * FROM member`. Export as json. 

Import books via 
```sql
SELECT `biblio_copy`.*, `biblio`.*, `biblio_status_hist`.* FROM `biblio_copy` , `biblio`, `biblio_status_hist` WHERE biblio_copy.bibid = biblio.bibid AND biblio.bibid = biblio_status_hist.bibid;
```


Import fields and attach them to the books via
```sql
SELECT * FROM `biblio_field`, `usmarc_tag_dm`, `usmarc_subfield_dm` WHERE biblio_field.tag = usmarc_tag_dm.tag AND biblio_field.subfield_cd = usmarc_subfield_dm.subfield_cd;
```

Field structure:
```sql
SELECT `usmarc_subfield_dm`.*, `usmarc_tag_dm`.*
FROM `usmarc_subfield_dm`
	, `usmarc_tag_dm` WHERE usmarc_tag_dm.tag = usmarc_subfield_dm.tag
```


These fields are migrated:
- 20 a isbn	
- 250 a Ausgabebezeichnung
- 260 a Erscheinungsort
- 300 a Umfang
- 520 a Zusammenfassung
- 901 a min Spieler
- 260 b Name des Verlags	
- 300 b Andere physische Merkmale			
- 20 c Beschaffungsangaben
- 260 c Erscheinungsjahr
- 300 c Ausmaße
- 901 c min Alter
- 300 e Begleitmaterial
- 541 h Kaufpreis	