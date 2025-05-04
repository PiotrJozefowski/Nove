// Czekamy na załadowanie dokumentu
document.addEventListener('DOMContentLoaded', () => {
    // Przykładowa funkcja
    function powitanie() {
        const header = document.querySelector('header h1');
        if (header) {
            header.textContent = 'Witaj na mojej stronie!';
        }
    }
    
    // Wywołanie funkcji
    powitanie();

    // Obsługa menu mobilnego
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Zamykanie menu po kliknięciu w link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Obsługa formularza kontaktowego
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Pobieranie danych z formularza
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                type: document.getElementById('type').value,
                message: document.getElementById('message').value
            };

            try {
                // Wysyłanie danych na serwer
                const response = await fetch('/kontakt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Dziękujemy za zapytanie! Skontaktujemy się wkrótce.');
                    contactForm.reset();
                } else {
                    alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później.');
                }
            } catch (error) {
                console.error('Błąd podczas wysyłania formularza:', error);
                alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później.');
            }
        });
    }
}); 