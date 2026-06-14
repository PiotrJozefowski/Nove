// Czekamy na załadowanie dokumentu
document.addEventListener('DOMContentLoaded', () => {
    // Efekt navbara przy przewijaniu
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Obsługa menu mobilnego
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        const toggleMenu = () => {
            const open = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        menuToggle.addEventListener('click', toggleMenu);
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // Zamykanie menu po kliknięciu w link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
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