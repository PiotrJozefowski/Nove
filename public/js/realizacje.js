// Funkcja do ładowania realizacji
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Pobieranie listy realizacji z serwera
        const response = await fetch('/api/realizacje');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const realizacje = await response.json();
        console.log('Otrzymane dane z API:', realizacje);
        
        // Kontener na realizacje
        const projectsGrid = document.querySelector('.projects-grid');
        
        // Czyszczenie kontenera
        projectsGrid.innerHTML = '';
        
        if (!realizacje || realizacje.length === 0) {
            projectsGrid.innerHTML = '<p class="error-message">Brak dostępnych realizacji.</p>';
            return;
        }
        
        // Tworzenie popupu
        const popup = document.createElement('div');
        popup.className = 'project-popup';
        popup.innerHTML = `
            <div class="project-popup-content">
                <div class="project-popup-header">
                    <h2></h2>
                    <button class="project-popup-close" title="Zamknij">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="project-popup-body">
                    <div class="project-popup-info">
                        <div class="project-popup-details"></div>
                        <div class="project-popup-description"></div>
                    </div>
                    <div class="project-popup-slider">
                        <div class="slider-image-container">
                            <img class="slider-image" src="" alt="">
                            <button class="slider-prev" title="Poprzednie">&lt;</button>
                            <button class="slider-next" title="Następne">&gt;</button>
                            <div class="slider-counter"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
        
        // Obsługa zamykania popupu
        const closePopup = () => {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
        
        popup.querySelector('.project-popup-close').addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });
        
        // Funkcja do obsługi slidera
        const setupSlider = (photos) => {
            let currentIndex = 0;
            const image = popup.querySelector('.slider-image');
            const counter = popup.querySelector('.slider-counter');
            const prevButton = popup.querySelector('.slider-prev');
            const nextButton = popup.querySelector('.slider-next');
            
            const updateImage = () => {
                image.src = photos[currentIndex];
                counter.textContent = `${currentIndex + 1} / ${photos.length}`;
            };
            
            // Obsługa kliknięcia w zdjęcie
            image.addEventListener('click', () => {
                closePopup();
                window.openSlider(photos, currentIndex);
            });
            
            prevButton.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + photos.length) % photos.length;
                updateImage();
            });
            
            nextButton.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % photos.length;
                updateImage();
            });
            
            // Obsługa klawiszy
            document.addEventListener('keydown', (e) => {
                if (popup.style.display === 'flex') {
                    if (e.key === 'ArrowLeft') prevButton.click();
                    if (e.key === 'ArrowRight') nextButton.click();
                    if (e.key === 'Escape') closePopup();
                }
            });
            
            updateImage();
        };
        
        // Dodawanie każdej realizacji do strony
        realizacje.forEach((realizacja, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-aos', 'fade-up');
            projectCard.setAttribute('data-aos-delay', `${index * 100}`);
            
            // Tworzenie sekcji ze zdjęciami
            const projectImages = document.createElement('div');
            projectImages.className = 'project-images';
            
            // Dodawanie głównego zdjęcia
            const mainImage = document.createElement('img');
            const mainImagePath = `/realizacje/${realizacja.id}/photos/${realizacja.photos[0]}`;
            console.log('Ścieżka do głównego zdjęcia:', mainImagePath);
            mainImage.src = mainImagePath;
            mainImage.alt = realizacja.title;
            projectImages.appendChild(mainImage);
            
            // Dodawanie zdjęcia hover (jeśli istnieje)
            if (realizacja.photos.length > 1) {
                const hoverImage = document.createElement('img');
                const hoverImagePath = `/realizacje/${realizacja.id}/photos/${realizacja.photos[1]}`;
                console.log('Ścieżka do zdjęcia hover:', hoverImagePath);
                hoverImage.src = hoverImagePath;
                hoverImage.alt = realizacja.title + ' - widok dodatkowy';
                hoverImage.className = 'hover-image';
                projectImages.appendChild(hoverImage);
            }
            
            // Tworzenie sekcji z tytułem i opisem
            const title = document.createElement('h3');
            title.textContent = realizacja.title;
            
            const description = document.createElement('p');
            description.textContent = realizacja.content;
            
            // Tworzenie sekcji z dodatkowymi informacjami
            const projectDetails = document.createElement('div');
            projectDetails.className = 'project-details';
            
            // Dodawanie roku (jeśli istnieje)
            if (realizacja.year) {
                const yearSpan = document.createElement('span');
                const yearIcon = document.createElement('i');
                yearIcon.className = 'fas fa-calendar';
                yearSpan.appendChild(yearIcon);
                yearSpan.appendChild(document.createTextNode(` ${realizacja.year}`));
                projectDetails.appendChild(yearSpan);
            }
            
            // Dodawanie lokalizacji (jeśli istnieje)
            if (realizacja.location) {
                const locationSpan = document.createElement('span');
                const locationIcon = document.createElement('i');
                locationIcon.className = 'fas fa-map-marker-alt';
                locationSpan.appendChild(locationIcon);
                locationSpan.appendChild(document.createTextNode(` ${realizacja.location}`));
                projectDetails.appendChild(locationSpan);
            }
            
            // Składanie karty projektu
            projectCard.appendChild(projectImages);
            projectCard.appendChild(title);
            projectCard.appendChild(description);
            projectCard.appendChild(projectDetails);
            
            // Dodawanie karty do siatki
            projectsGrid.appendChild(projectCard);
            
            // Pobieranie wszystkich zdjęć dla realizacji
            fetch(`/api/realizacje/${realizacja.id}/photos`)
                .then(response => response.json())
                .then(photos => {
                    // Obsługa kliknięcia w kartę projektu
                    projectCard.addEventListener('click', () => {
                        // Wypełnianie popupu danymi
                        const popupContent = popup.querySelector('.project-popup-content');
                        popupContent.querySelector('h2').textContent = realizacja.title;
                        
                        const popupDetails = popupContent.querySelector('.project-popup-details');
                        popupDetails.innerHTML = '';
                        if (realizacja.year) {
                            popupDetails.innerHTML += `<span><i class="fas fa-calendar"></i> ${realizacja.year}</span>`;
                        }
                        if (realizacja.location) {
                            popupDetails.innerHTML += `<span><i class="fas fa-map-marker-alt"></i> ${realizacja.location}</span>`;
                        }
                        
                        popupContent.querySelector('.project-popup-description').textContent = realizacja.content;
                        
                        // Konfiguracja slidera
                        const photos = realizacja.photos.map(photo => `/realizacje/${realizacja.id}/photos/${photo}`);
                        setupSlider(photos);
                        
                        // Wyświetlanie popupu
                        popup.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                    });
                })
                .catch(error => {
                    console.error(`Błąd podczas pobierania zdjęć dla realizacji ${realizacja.id}:`, error);
                });
        });
        
        // Odświeżanie animacji AOS po załadowaniu wszystkich realizacji
        AOS.refresh();
    } catch (error) {
        const projectsGrid = document.querySelector('.projects-grid');
        projectsGrid.innerHTML = '<p class="error-message">Wystąpił błąd podczas ładowania realizacji. Spróbuj ponownie później.</p>';
    }
}); 