# Nove - Strona internetowa firmy budowlanej

Strona internetowa firmy budowlanej Nove, zbudowana przy użyciu Node.js i Express.

## Funkcje

- Responsywny design
- Galeria realizacji
- Slider zdjęć
- Kontakt

## Wymagania

- Node.js >= 14.0.0
- npm lub yarn

## Instalacja lokalna

1. Sklonuj repozytorium:
   ```
   git clone https://github.com/twoj-username/nove-budowlana.git
   cd nove-budowlana
   ```

2. Zainstaluj zależności:
   ```
   npm install
   ```

3. Uruchom aplikację w trybie deweloperskim:
   ```
   npm run dev
   ```

4. Otwórz przeglądarkę i przejdź do `http://localhost:3000`

## Wdrożenie na Cyber-folks

### 1. Przygotowanie plików

1. Upewnij się, że wszystkie pliki są gotowe do wdrożenia.
2. Sprawdź, czy plik `package.json` zawiera odpowiednie skrypty i zależności.

### 2. Wdrożenie na serwerze Cyber-folks

1. Zaloguj się do panelu administracyjnego Cyber-folks.
2. Przejdź do sekcji "Hosting" i wybierz swój hosting.
3. Przejdź do sekcji "Node.js" i kliknij "Dodaj aplikację Node.js".
4. Wypełnij formularz:
   - Nazwa aplikacji: `nove-budowlana`
   - Ścieżka: `/home/twoj-username/nove-budowlana`
   - Plik startowy: `app.js`
   - Port: `3000` (lub inny, jeśli jest wymagany)
   - Wersja Node.js: `14` (lub nowsza)

5. Kliknij "Dodaj" i poczekaj na utworzenie aplikacji.

### 3. Wgranie plików

1. Przejdź do sekcji "Menedżer plików" w panelu Cyber-folks.
2. Przejdź do katalogu `/home/twoj-username/nove-budowlana`.
3. Wgraj wszystkie pliki aplikacji (możesz użyć FTP lub wgrać pliki bezpośrednio przez panel).

### 4. Instalacja zależności

1. Przejdź do sekcji "Terminal" w panelu Cyber-folks.
2. Wykonaj następujące polecenia:
   ```
   cd /home/twoj-username/nove-budowlana
   npm install
   ```

### 5. Uruchomienie aplikacji

1. Przejdź do sekcji "Node.js" w panelu Cyber-folks.
2. Znajdź swoją aplikację i kliknij "Uruchom".

### 6. Konfiguracja domeny

1. Przejdź do sekcji "Domeny" w panelu Cyber-folks.
2. Wybierz domenę, na której chcesz hostować aplikację.
3. Przejdź do sekcji "Subdomeny" i dodaj subdomenę lub skonfiguruj przekierowanie.
4. Ustaw ścieżkę do aplikacji Node.js.

## Struktura projektu

```
nove-budowlana/
├── app.js                  # Główny plik aplikacji
├── package.json            # Konfiguracja projektu i zależności
├── public/                 # Pliki statyczne
│   ├── css/                # Style CSS
│   ├── js/                 # Skrypty JavaScript
│   ├── images/             # Obrazy
│   │   └── realizacje/     # Zdjęcia realizacji
│   ├── index.html          # Strona główna
│   ├── realizacje.html     # Strona realizacji
│   └── kontakt.html        # Strona kontaktowa
└── README.md               # Dokumentacja
```

## Licencja

Wszelkie prawa zastrzeżone © 2024 Nove 