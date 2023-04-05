# Openlibly

Die einfache Software für die Schulbibliothek

# Import from OpenBiblio

- Start podman with docker compose
- Open myphpadmin, create openbiblio database
- Execute script to copy mySQL files
- Use API to import members `curl -X POST -H "Content-Type: application/json" -d @member.json http://localhost:3000/api/openbiblioimport/migrateUsers`

- Copy 3 book jsons together to one book_all.json, this includes the exports for tables `biblio.json`, `biblio_status_hist.json` and `usmarc_subfield_dm.json`
- Use API to import books `curl -X POST -H "Content-Type: application/json" -d @book_all.json  http://localhost:3000/api/openbiblioimport/migrateBooks`



Import members via `SELECT * FROM member`. Export as json. 


## this does not work
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

Sample book:
```json
{"bibid":"2185","copyid":"2185","copy_desc":"","barcode_nmbr":"2185","status_cd":"out","status_begin_dt":"2006-06-09 10:17:18","due_back_dt":"2006-06-30","mbrid":"1035","renewal_count":"0","create_dt":"2005-05-24 20:08:39","last_change_dt":"2023-01-27 10:56:54","last_change_userid":"4","material_cd":"2","collection_cd":"6","call_nmbr1":"Bücherei","call_nmbr2":"","call_nmbr3":"","title":"Die Wilden Fußballkerle. Bd. 09: Joschka, die siebte Kavallerie","title_remainder":"","responsibility_stmt":"","author":"Masannek, Joachim","topic1":"Fußball","topic2":"Teamgeist","topic3":"","topic4":"","topic5":"","opac_flg":"Y"},
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


# How to access Open Library
ISBN Service für 10 und 13 ISBN: 
https://openlibrary.org/isbn/9780140328721
Cover: 
https://covers.openlibrary.org/13834659