// Funkcja do ładowania realizacji
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Ładowanie realizacji...');
    
    try {
        // Pobieranie listy realizacji z serwera
        const response = await fetch('/api/realizacje');
        const realizacje = await response.json();
        
        // Kontener na realizacje
        const projectsGrid = document.querySelector('.projects-grid');
        
        // Czyszczenie kontenera
        projectsGrid.innerHTML = '';
        
        // Dodawanie każdej realizacji do strony
        realizacje.forEach(realizacja => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            // Tworzenie sekcji ze zdjęciami
            const projectImages = document.createElement('div');
            projectImages.className = 'project-images';
            
            // Dodawanie głównego zdjęcia
            const mainImage = document.createElement('img');
            mainImage.src = realizacja.mainImage;
            mainImage.alt = realizacja.title;
            projectImages.appendChild(mainImage);
            
            // Dodawanie zdjęcia hover (jeśli istnieje)
            if (realizacja.hoverImage) {
                const hoverImage = document.createElement('img');
                hoverImage.src = realizacja.hoverImage;
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
                yearSpan.innerHTML = `<i class="fas fa-calendar"></i> ${realizacja.year}`;
                projectDetails.appendChild(yearSpan);
            }
            
            // Dodawanie lokalizacji (jeśli istnieje)
            if (realizacja.location) {
                const locationSpan = document.createElement('span');
                locationSpan.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${realizacja.location}`;
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
                    // Dodawanie obsługi kliknięcia w zdjęcie
                    projectImages.addEventListener('click', () => {
                        // Otwieranie slidera z wszystkimi zdjęciami
                        window.openSlider(photos, 0);
                    });
                })
                .catch(error => {
                    console.error(`Błąd podczas pobierania zdjęć dla realizacji ${realizacja.id}:`, error);
                });
        });
        
        console.log('Realizacje załadowane pomyślnie!');
    } catch (error) {
        console.error('Błąd podczas ładowania realizacji:', error);
        // Wyświetlanie komunikatu o błędzie
        const projectsGrid = document.querySelector('.projects-grid');
        projectsGrid.innerHTML = '<p class="error-message">Wystąpił błąd podczas ładowania realizacji. Spróbuj ponownie później.</p>';
    }
}); 