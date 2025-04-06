require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const mailConfig = require('./config/mail');
const path = require('path');
const fs = require('fs');
const app = express();

// Konfiguracja zmiennych środowiskowych
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// Konfiguracja w zależności od środowiska
if (NODE_ENV === 'production') {
    // Tryb produkcyjny - optymalizacje
    app.set('trust proxy', 1); // Ufaj nagłówkom proxy w produkcji
    app.disable('x-powered-by'); // Ukryj informację o Express w nagłówkach
    app.enable('view cache'); // Włącz cache dla widoków
} else {
    // Tryb deweloperski - więcej informacji debugowania
    app.set('trust proxy', 0);
    app.enable('verbose errors');
}

// Middleware do obsługi statycznych plików
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0, // Cache statycznych plików w produkcji
    etag: NODE_ENV === 'production' // Włącz ETag w produkcji
}));

// Middleware do parsowania JSON
app.use(express.json());

// Logowanie konfiguracji SMTP
console.log('Konfiguracja SMTP:', {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS // Ukrywamy hasło w logach
    }
});

// Konfiguracja transportera mailowego
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Weryfikacja połączenia SMTP
transporter.verify(function(error, success) {
    if (error) {
        console.error('Błąd weryfikacji SMTP:', error);
    } else {
        console.log('Serwer SMTP jest gotowy do wysyłania maili');
    }
});

// Middleware do logowania w zależności od środowiska
app.use((req, res, next) => {
    if (NODE_ENV !== 'production') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// Główna ścieżka
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Strona realizacji
app.get('/realizacje', (req, res) => {
    res.sendFile(__dirname + '/public/realizacje.html');
});

// Strona kontaktowa
app.get('/kontakt', (req, res) => {
    res.sendFile(__dirname + '/public/kontakt.html');
});

// Strona ogrodzeń
app.get('/ogrodzenia', (req, res) => {
    res.sendFile(__dirname + '/public/ogrodzenia.html');
});

// Obsługa formularza kontaktowego
app.post('/kontakt', async (req, res) => {
    const { name, email, phone, type, message } = req.body;

    try {
        // Przygotowanie treści maila
        const mailOptions = {
            from: mailConfig.from,
            to: mailConfig.to,
            subject: `Nowe zapytanie - ${type}`,
            html: `
                <h2>Nowe zapytanie ze strony</h2>
                <p><strong>Imię i nazwisko:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Rodzaj usługi:</strong> ${type}</p>
                <p><strong>Wiadomość:</strong></p>
                <p>${message}</p>
            `
        };

        // Wysyłanie maila
        await transporter.sendMail(mailOptions);

        // Sukces
        res.json({ success: true, message: 'Wiadomość została wysłana pomyślnie.' });
    } catch (error) {
        // Logowanie błędu w zależności od środowiska
        if (NODE_ENV !== 'production') {
            console.error('Błąd podczas wysyłania maila:', error);
        }

        // Odpowiedź z błędem
        res.status(500).json({ 
            success: false, 
            message: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.' 
        });
    }
});

// Endpoint API do pobierania listy realizacji
app.get('/api/realizacje', (req, res) => {
    const realizacjeDir = path.join(__dirname, 'public', 'images', 'realizacje');
    
    try {
        // Sprawdzanie, czy folder realizacje istnieje
        if (!fs.existsSync(realizacjeDir)) {
            return res.status(404).json({ error: 'Folder realizacje nie istnieje' });
        }
        
        // Pobieranie listy folderów realizacji
        const realizacje = fs.readdirSync(realizacjeDir)
            .filter(item => fs.statSync(path.join(realizacjeDir, item)).isDirectory())
            .map(folder => {
                const folderPath = path.join(realizacjeDir, folder);
                const photosDir = path.join(folderPath, 'photos');
                
                // Sprawdzanie, czy folder photos istnieje
                if (!fs.existsSync(photosDir)) {
                    console.warn(`Folder photos nie istnieje dla realizacji ${folder}`);
                    return null;
                }
                
                // Pobieranie listy zdjęć
                const photos = fs.readdirSync(photosDir)
                    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
                    .map(file => `/images/realizacje/${folder}/photos/${file}`);
                
                // Pobieranie głównego zdjęcia (pierwsze z listy)
                const mainImage = photos.length > 0 ? photos[0] : null;
                
                // Pobieranie zdjęcia hover (drugie z listy, jeśli istnieje)
                const hoverImage = photos.length > 1 ? photos[1] : null;
                
                // Pobieranie tytułu z pliku Title.txt
                let title = folder;
                const titlePath = path.join(folderPath, 'Title.txt');
                if (fs.existsSync(titlePath)) {
                    title = fs.readFileSync(titlePath, 'utf8').trim();
                }
                
                // Pobieranie opisu z pliku Content.txt
                let content = '';
                const contentPath = path.join(folderPath, 'Content.txt');
                if (fs.existsSync(contentPath)) {
                    content = fs.readFileSync(contentPath, 'utf8').trim();
                }
                
                // Pobieranie roku z pliku Year.txt
                let year = '';
                const yearPath = path.join(folderPath, 'Year.txt');
                if (fs.existsSync(yearPath)) {
                    year = fs.readFileSync(yearPath, 'utf8').trim();
                }
                
                // Pobieranie lokalizacji z pliku Location.txt
                let location = '';
                const locationPath = path.join(folderPath, 'Location.txt');
                if (fs.existsSync(locationPath)) {
                    location = fs.readFileSync(locationPath, 'utf8').trim();
                }
                
                return {
                    id: folder,
                    title,
                    content,
                    year,
                    location,
                    mainImage,
                    hoverImage,
                    photos
                };
            })
            .filter(realizacja => realizacja !== null);
        
        res.json(realizacje);
    } catch (error) {
        console.error('Błąd podczas pobierania realizacji:', error);
        res.status(500).json({ error: 'Błąd podczas pobierania realizacji' });
    }
});

// Endpoint API do pobierania zdjęć dla danej realizacji
app.get('/api/realizacje/:id/photos', (req, res) => {
    const realizacjaId = req.params.id;
    const photosDir = path.join(__dirname, 'public', 'images', 'realizacje', realizacjaId, 'photos');
    
    try {
        // Sprawdzanie, czy folder photos istnieje
        if (!fs.existsSync(photosDir)) {
            return res.status(404).json({ error: 'Folder ze zdjęciami nie istnieje' });
        }
        
        // Pobieranie listy zdjęć
        const photos = fs.readdirSync(photosDir)
            .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
            .map(file => `/images/realizacje/${realizacjaId}/photos/${file}`);
        
        res.json(photos);
    } catch (error) {
        console.error(`Błąd podczas pobierania zdjęć dla realizacji ${realizacjaId}:`, error);
        res.status(500).json({ error: 'Błąd podczas pobierania zdjęć' });
    }
});

// Sitemap i Robots.txt
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(__dirname + '/public/sitemap.xml');
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(__dirname + '/public/robots.txt');
});

// Obsługa błędów 404
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Obsługa błędów
app.use((err, req, res, next) => {
    // Logowanie błędu w zależności od środowiska
    if (NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Odpowiedź z błędem
    res.status(500).json({ 
        success: false, 
        message: NODE_ENV === 'production' 
            ? 'Wystąpił błąd serwera. Spróbuj ponownie później.' 
            : err.message 
    });
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer uruchomiony w trybie ${NODE_ENV} na porcie ${PORT}`);
}); 