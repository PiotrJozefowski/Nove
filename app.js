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

// Middleware do logowania w zależności od środowiska
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware do obsługi statycznych plików
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: NODE_ENV === 'production',
    redirect: false
}));

// Dodatkowy middleware dla folderu realizacje
app.use('/realizacje', express.static(path.join(__dirname, 'public', 'realizacje'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: NODE_ENV === 'production',
    redirect: false
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

// Główna ścieżka
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Strona realizacji
app.get('/realizacje', (req, res) => {
    res.sendFile(__dirname + '/public/realizacje.html');
});

// Strona pojedynczej realizacji z SSR meta
app.get('/realizacje/:id', (req, res) => {
    const id = req.params.id;
    const realizacjaDir = path.join(__dirname, 'public', 'realizacje', id);
    if (!fs.existsSync(realizacjaDir) || !fs.statSync(realizacjaDir).isDirectory()) {
        return res.status(404).sendFile(__dirname + '/public/404.html');
    }

    const baseUrl = 'https://nove-uslugi-budowlane.pl';
    const readTxt = (file) => {
        const p = path.join(realizacjaDir, file);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim() : '';
    };

    const title = readTxt('Title.txt') || id;
    const content = readTxt('Content.txt');
    const description = content ? content.substring(0, 155) + (content.length > 155 ? '...' : '') : `Realizacja budowlana - ${title}`;

    const photosPath = path.join(realizacjaDir, 'photos');
    let ogImage = `${baseUrl}/images/general/IMG_4346-scaled.jpg`;
    if (fs.existsSync(photosPath)) {
        const firstPhoto = fs.readdirSync(photosPath).filter(f => /\.(jpg|jpeg|png)$/i.test(f))[0];
        if (firstPhoto) ogImage = `${baseUrl}/realizacje/${id}/photos/${firstPhoto}`;
    }

    let html = fs.readFileSync(path.join(__dirname, 'public', 'realizacja.html'), 'utf8');
    html = html
        .replace('<title>Realizacja | Nove</title>', `<title>${title} | Nove</title>`)
        .replace(
            '<meta name="description" content="Realizacja budowlana - Nove Usługi Budowlane Warszawa">',
            `<meta name="description" content="${description}">\n    <link rel="canonical" href="${baseUrl}/realizacje/${id}">\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="${title} | Nove">\n    <meta property="og:description" content="${description}">\n    <meta property="og:image" content="${ogImage}">\n    <meta property="og:url" content="${baseUrl}/realizacje/${id}">\n    <meta name="twitter:title" content="${title} | Nove">\n    <meta name="twitter:description" content="${description}">\n    <meta name="twitter:image" content="${ogImage}">\n    <link rel="preload" as="image" href="${ogImage}" fetchpriority="high">`
        );

    res.send(html);
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
    console.log('Pobieranie listy realizacji...');
    const realizacjeDir = path.join(__dirname, 'public', 'realizacje');
    console.log('Ścieżka do folderu realizacji:', realizacjeDir);
    
    try {
        // Sprawdzanie, czy folder realizacje istnieje
        if (!fs.existsSync(realizacjeDir)) {
            console.error('Folder realizacje nie istnieje:', realizacjeDir);
            return res.status(404).json({ error: 'Folder realizacje nie istnieje' });
        }
        
        // Pobieranie listy folderów realizacji
        const folders = fs.readdirSync(realizacjeDir)
            .filter(item => fs.statSync(path.join(realizacjeDir, item)).isDirectory());
        
        console.log('Znalezione foldery realizacji:', folders);
        
        const realizacje = folders.map(folder => {
            const folderPath = path.join(realizacjeDir, folder);
            const photosPath = path.join(folderPath, 'photos');
            console.log(`\nPrzetwarzanie folderu ${folder}:`, folderPath);
            console.log('Ścieżka do zdjęć:', photosPath);
            
            // Sprawdzanie czy folder photos istnieje
            if (!fs.existsSync(photosPath)) {
                console.error(`Folder photos nie istnieje dla realizacji ${folder}`);
                return null;
            }
            
            // Pobieranie listy zdjęć
            const photos = fs.readdirSync(photosPath)
                .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
            
            console.log(`Znalezione zdjęcia w folderze ${folder}:`, photos);
            
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
                folder: folder,
                title,
                content,
                year,
                location,
                photos
            };
        }).filter(Boolean); // Usuwamy null z tablicy
        
        console.log('\nZwracane realizacje:', JSON.stringify(realizacje, null, 2));
        res.json(realizacje);
    } catch (error) {
        console.error('Błąd podczas pobierania realizacji:', error);
        res.status(500).json({ error: 'Błąd podczas pobierania realizacji' });
    }
});

// Endpoint API do pobierania pojedynczej realizacji
app.get('/api/realizacje/:id', (req, res) => {
    const realizacjaDir = path.join(__dirname, 'public', 'realizacje', req.params.id);
    
    try {
        if (!fs.existsSync(realizacjaDir)) {
            return res.status(404).json({ error: 'Realizacja nie znaleziona' });
        }
        
        const photosPath = path.join(realizacjaDir, 'photos');
        let photos = [];
        if (fs.existsSync(photosPath)) {
            photos = fs.readdirSync(photosPath)
                .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
        }
        
        const readFile = (filename) => {
            const filePath = path.join(realizacjaDir, filename);
            return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').trim() : '';
        };
        
        res.json({
            id: req.params.id,
            title: readFile('Title.txt') || req.params.id,
            content: readFile('Content.txt'),
            year: readFile('Year.txt'),
            location: readFile('Location.txt'),
            photos
        });
    } catch (error) {
        console.error('Błąd podczas pobierania realizacji:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Endpoint API do pobierania zdjęć dla danej realizacji
app.get('/api/realizacje/:id/photos', (req, res) => {
    const photosPath = path.join(__dirname, 'public', 'realizacje', req.params.id, 'photos');
    
    try {
        if (!fs.existsSync(photosPath)) {
            return res.status(404).json({ error: 'Folder ze zdjęciami nie znaleziony' });
        }

        const photos = fs.readdirSync(photosPath)
            .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
            .map(file => `/realizacje/${req.params.id}/photos/${file}`);
        
        res.json(photos);
    } catch (error) {
        console.error('Błąd podczas odczytu zdjęć:', error);
        res.status(500).json({ error: 'Błąd serwera' });
    }
});

// Dynamiczny sitemap
app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://nove-uslugi-budowlane.pl';
    const realizacjeDir = path.join(__dirname, 'public', 'realizacje');
    const today = new Date().toISOString().split('T')[0];
    let realizacjeUrls = '';

    if (fs.existsSync(realizacjeDir)) {
        const folders = fs.readdirSync(realizacjeDir)
            .filter(f => fs.statSync(path.join(realizacjeDir, f)).isDirectory());
        folders.forEach(id => {
            let lastmod = today;
            try {
                lastmod = fs.statSync(path.join(realizacjeDir, id)).mtime.toISOString().split('T')[0];
            } catch (e) { /* fallback do dzisiejszej daty */ }
            realizacjeUrls += `
    <url>
        <loc>${baseUrl}/realizacje/${id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`;
        });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/realizacje</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/ogrodzenia</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/kontakt</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>${realizacjeUrls}
</urlset>`;

    res.type('application/xml').send(xml);
});

app.get('/robots.txt', (req, res) => {
    res.sendFile(__dirname + '/public/robots.txt');
});

// Obsługa błędów 404
app.use((req, res, next) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Obsługa błędów
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Coś poszło nie tak!');
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer uruchomiony w trybie ${NODE_ENV} na porcie ${PORT}`);
}); 