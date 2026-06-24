document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/data/realizacje.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const realizacje = await response.json();
        const projectsGrid = document.querySelector('.projects-grid');
        projectsGrid.innerHTML = '';

        if (!realizacje || realizacje.length === 0) {
            projectsGrid.innerHTML = '<p class="error-message">Brak dostępnych realizacji.</p>';
            return;
        }

        realizacje.forEach((realizacja, index) => {
            const projectCard = document.createElement('a');
            projectCard.className = 'project-card';
            projectCard.href = `/realizacje/${realizacja.id}`;
            projectCard.setAttribute('data-aos', 'fade-up');
            projectCard.setAttribute('data-aos-delay', `${index * 50}`);

            const projectImages = document.createElement('div');
            projectImages.className = 'project-images';

            const mainImage = document.createElement('img');
            mainImage.src = `/realizacje/${realizacja.id}/photos/${realizacja.photos[0]}`;
            mainImage.alt = realizacja.title;
            mainImage.loading = 'lazy';
            projectImages.appendChild(mainImage);

            if (realizacja.photos.length > 1) {
                const hoverImage = document.createElement('img');
                hoverImage.src = `/realizacje/${realizacja.id}/photos/${realizacja.photos[1]}`;
                hoverImage.alt = realizacja.title + ' - widok dodatkowy';
                hoverImage.className = 'hover-image';
                hoverImage.loading = 'lazy';
                projectImages.appendChild(hoverImage);
            }

            const title = document.createElement('h3');
            title.textContent = realizacja.title;

            const description = document.createElement('p');
            description.textContent = realizacja.content;

            const projectDetails = document.createElement('div');
            projectDetails.className = 'project-details';

            if (realizacja.year) {
                const yearSpan = document.createElement('span');
                const yearIcon = document.createElement('i');
                yearIcon.className = 'fas fa-calendar';
                yearSpan.appendChild(yearIcon);
                yearSpan.appendChild(document.createTextNode(` ${realizacja.year}`));
                projectDetails.appendChild(yearSpan);
            }

            if (realizacja.location) {
                const locationSpan = document.createElement('span');
                const locationIcon = document.createElement('i');
                locationIcon.className = 'fas fa-map-marker-alt';
                locationSpan.appendChild(locationIcon);
                locationSpan.appendChild(document.createTextNode(` ${realizacja.location}`));
                projectDetails.appendChild(locationSpan);
            }

            projectCard.appendChild(projectImages);
            projectCard.appendChild(title);
            projectCard.appendChild(description);
            projectCard.appendChild(projectDetails);

            projectsGrid.appendChild(projectCard);
        });

        AOS.refresh();
    } catch (error) {
        const projectsGrid = document.querySelector('.projects-grid');
        projectsGrid.innerHTML = '<p class="error-message">Wystąpił błąd podczas ładowania realizacji. Spróbuj ponownie później.</p>';
    }
});
