Hallo liebe OpenLibry-Community!

Es gibt eine neue Version: **1.12** ist da. Sie bringt viele kleine Verbesserungen im Alltag, vor allem rund um Klassen und Versetzung, die Admin-Verwaltung und die Sicherheit. Ein herzliches Dankeschön an alle, die getestet, Feedback gegeben und mitgemacht haben!

Außerdem hat unsere **Webseite ein neues Design** bekommen. Schaut vorbei auf [openlibry.de](https://openlibry.de)!

Macht bitte wie immer beim Update vorher ein **Backup** eurer Datenbank.

Für den Austausch von Ideen und Erfahrungen gibt es unseren Discord-Kanal. Schaut gerne vorbei: [Discord](https://discord.gg/xTHhsTMNf)

---
## 🌐 Neues Design für die Webseite

Unsere Webseite [openlibry.de](https://openlibry.de) präsentiert sich in frischem, neuem Design. Sie ist übersichtlicher und leichter zu bedienen. Dort findet ihr weiterhin alles Wichtige zu OpenLibry, von der Installation bis zur Dokumentation. Wir freuen uns über euer Feedback dazu!

---
# OpenLibry v1.12 – Release Notes

## 📚 Katalog & Bücher
- Beim Speichern eines bestehenden Buchs verschob sich das **Ausleih- bzw. Rückgabedatum** je nach Zeitzone um einen Tag. Das ist behoben, und Regressionstests sichern es ab.
- Neues Skript zum **Massenabruf von Covern**, das ihr nach einem Import ausführen könnt.
- Beim **Batch-Scan-Import** lässt sich jetzt ein gemeinsames **Regalfach** für alle Bücher vergeben.
- Auf **Buchetiketten** wird der Autor jetzt mit Nachnamen zuerst gedruckt (#400).
- Beim Etikettendruck verschluckte das Feld für die Buch-IDs Trennzeichen. Das ist behoben.

## 👤 Benutzerverwaltung & Klassen
- Bei der **Versetzung** in die nächste Klasse wird nur noch die erste Zahl im Klassennamen erhöht.
- **Nicht-numerische Klassenstufen** werden bei der Versetzung übersprungen.
- Die **Klassensuche** unterstützt jetzt Klassenstufen mit Punkt (z. B. „5.a"). Der zugehörige Filter-Fehler wurde behoben.
- Die **Klassenstufen-Filter** unterscheiden nicht mehr zwischen Groß- und Kleinschreibung.
- Benutzer- und Buchseiten fangen **fehlende oder ungültige IDs** jetzt sauber ab, statt abzustürzen.

## 🛡 Admin & Berichte
- Die Admin-Seite verlinkt jetzt auf die **Admin-Konten** und hat ein übersichtlicheres, gruppiertes Layout.
- Der **Audit-Report** lädt jetzt alle Einträge, nicht nur einen Teil.

## 🎨 Oberfläche & Konfiguration
- Neue **Startseite**: Die Katze wurde durch ein neues Titelbild ersetzt.
- Die **Route hinter `/`** ist jetzt konfigurierbar. Vielen Dank an [@gunwald](https://github.com/gunwald) für diesen Beitrag!

## 🔒 Sicherheit
- **Strikte Eingabevalidierung** für IDs, Query-Parameter und Batch-Bodies.
- Weitere Sicherheitskorrekturen.

## 🛠 Tests & Dokumentation
- Zusätzliche **Cypress-Tests** für die Admin-Konten sowie eine automatisierte Test-Pipeline.
- Neue Dokumentation dazu, wie die Tests funktionieren.
- Neues Übersichtsbild **„Wo läuft OpenLibry?"** auf der Installationsseite.
- Interne Code-Aufräumarbeiten.

Alle Änderungen im Detail: [v1.11...v1.12](https://github.com/jzakotnik/openlibry/compare/v1.11...v1.12)

---

## 💡 Work Hack: Erst säubern, dann die KI auswerten lassen

Viele von euch fragen sich, wie sie aus dem Bestand mehr herausholen: Welche Bücher werden kaum ausgeliehen? Welche Klassenstufe liest am meisten? Was sollten wir nachkaufen? Ein KI-Assistent kann dafür aus euren Daten einen schönen Report schreiben. Aber:

**Gebt der KI niemals Daten mit Personenbezug.** Namen, E-Mail-Adressen und Klassenzuordnungen einzelner Kinder gehören nicht in ein externes KI-Tool.

So geht ihr vor:

1. **Arbeitet nur mit einer Kopie.** Macht ein Backup, und bereinigt nur die Kopie, nie die Originaldatenbank.
2. **Entfernt personenbezogene Daten.** Löscht oder ersetzt in der Kopie Vor- und Nachnamen, E-Mail-Adressen und alles andere, was auf eine Person verweist. Behaltet nur, was für die Auswertung nötig ist, zum Beispiel eine anonyme Nutzer-ID und die Klassenstufe.
3. **Prüft das Ergebnis.** Schaut die bereinigte Datei einmal selbst durch, bevor ihr sie weitergebt. Freitextfelder wie Notizen verraten oft mehr, als man denkt.
4. **Dann erst die KI fragen.** Zum Beispiel: *„Erstelle einen Report über die Ausleihen des letzten Schuljahres: Top-10-Titel, selten ausgeliehene Bücher, Ausleihen pro Klassenstufe und Vorschläge für Neuanschaffungen."*
5. **Löscht die bereinigte Kopie wieder**, wenn der Report fertig ist.

So bekommt ihr eine Auswertung, die ihr dem Förderverein oder dem Kollegium zeigen könnt, ohne dass Daten von Kindern oder Eltern das Haus verlassen. Klärt im Zweifel mit eurer Schule oder eurem Träger, welche KI-Tools ihr nutzen dürft.

---

## 💬 Teilt eure Erfahrungen!

OpenLibry wird ehrenamtlich und als Hobby von uns für euch gemacht, und euer Feedback ist der wichtigste Treiber für neue Features.

**Was läuft gut? Was nervt euch noch? Wie nutzt ihr OpenLibry? Was fehlt euch unbedingt?**

Meldet euch gerne:

- 💬 Als **E-Mail** an info@openlibry.de
- 🐛 Als **Issue auf GitHub**: [github.com/jzakotnik/openlibry/issues](https://github.com/jzakotnik/openlibry/issues)
- 💬 [Discord](https://discord.gg/xTHhsTMNf) – Austausch mit der Community, Hilfe & Neuigkeiten
- 🌐 Auf unserer Website: [openlibry.de](https://openlibry.de)

Wir lesen alles und freuen uns über jede Rückmeldung, egal ob Lob, Kritik oder neue Idee.

---

*Viele Grüße und viel Spaß mit Version 1.12!*
*Das OpenLibry-Team* 📖
