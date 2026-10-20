# OpenLibry v1.12 – Release Notes

## 📚 Katalog & Bücher

* Beim Speichern eines bestehenden Buchs verschob sich das Ausleih- bzw. Rückgabedatum (`rentedDate`/`dueDate`) je nach Zeitzone um einen Tag. Das ist behoben, und Regressionstests sichern es ab.
* Neues Skript zum Massenabruf von Covern, das nach einem Import ausgeführt werden kann.
* Beim Batch-Scan-Import lässt sich jetzt ein gemeinsames Regalfach (Shelf) für alle Bücher vergeben.
* Auf Buchetiketten wird der Autor jetzt mit Nachnamen zuerst gedruckt (#400).
* Beim Etikettendruck verschluckte das Feld für die Buch-IDs Trennzeichen. Das ist behoben.

## 👤 Benutzerverwaltung & Klassen

* Beim Versetzen von Nutzer:innen in die nächste Klasse wird nur noch die erste Zahl im Klassennamen erhöht.
* Nicht-numerische Klassenstufen werden bei der Versetzung übersprungen.
* Die Klassensuche unterstützt jetzt Klassenstufen mit Punkt (z. B. „5.a"). Der zugehörige Filter-Fehler wurde behoben.
* Die Klassenstufen-Filter unterscheiden nicht mehr zwischen Groß- und Kleinschreibung.
* Benutzer- und Buchseiten fangen fehlende oder ungültige IDs jetzt sauber ab, statt abzustürzen.

## 🛡 Admin & Berichte

* Die Admin-Seite verlinkt jetzt auf die Admin-Konten und hat ein übersichtlicheres, gruppiertes Layout.
* Der Audit-Report lädt jetzt alle Einträge, nicht nur einen Teil.

## 🎨 Oberfläche & Konfiguration

* Neue Startseite: Die Katze wurde durch ein neues Titelbild ersetzt.
* Die Route hinter `/` ist jetzt konfigurierbar. Vielen Dank an [@gunwald](https://github.com/gunwald) für diesen Beitrag!

## 🔒 Sicherheit

* Strikte Eingabevalidierung für IDs, Query-Parameter und Batch-Bodies (Security M2).
* Weitere Sicherheitskorrekturen.

## 🛠 Tests & Dokumentation

* Zusätzliche Cypress-Tests für die Admin-Konten sowie eine automatisierte Test-Pipeline.
* Neue Dokumentation dazu, wie die Tests funktionieren.
* Neues Übersichtsbild „Wo läuft OpenLibry?" auf der Installationsseite.
* Interne Code-Aufräumarbeiten (u. a. Datumskonvertierung in `BookDateField`, Typfehler in `increaseNumberInString`).

**Full Changelog**: [v1.11...v1.12](https://github.com/jzakotnik/openlibry/compare/v1.11...v1.12)
