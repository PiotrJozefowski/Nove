document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.replace(/\/+$/, '').split('/');
    const realizacjaId = pathParts[pathParts.length - 1];

    if (!realizacjaId) {
        window.location.href = '/realizacje';
        return;
    }

    try {
        const response = await fetch(`/api/realizacje/${realizacjaId}`);
        if (!response.ok) {
            window.location.href = '/realizacje';
            return;
        }

        const realizacja = await response.json();

        document.title = `${realizacja.title} | Nove`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = realizacja.content || `Realizacja budowlana - ${realizacja.title}`;
        }

        document.querySelector('.realizacja-title').textContent = realizacja.title;
        document.querySelector('.realizacja-description').textContent = realizacja.content;

        const photos = realizacja.photos.map(p => `/realizacje/${realizacjaId}/photos/${p}`);

        // Hero background from first photo
        if (photos.length > 0) {
            const heroSection = document.querySelector('.realizacja-hero-section');
            heroSection.style.backgroundImage = `url('${photos[0]}')`;
        }

        // Year
        const yearMeta = document.querySelector('.realizacja-meta .realizacja-year');
        const yearDetail = document.querySelector('.realizacja-detail-year');
        if (realizacja.year) {
            yearMeta.querySelector('span').textContent = realizacja.year;
            yearDetail.querySelector('.detail-value').textContent = realizacja.year;
        } else {
            yearMeta.style.display = 'none';
            yearDetail.style.display = 'none';
        }

        // Location
        const locationMeta = document.querySelector('.realizacja-meta .realizacja-location');
        const locationDetail = document.querySelector('.realizacja-detail-location');
        if (realizacja.location) {
            locationMeta.querySelector('span').textContent = realizacja.location;
            locationDetail.querySelector('.detail-value').textContent = realizacja.location;
        } else {
            locationMeta.style.display = 'none';
            locationDetail.style.display = 'none';
        }

        // Photo count
        document.querySelector('.realizacja-photo-count').textContent = `${photos.length} zdjęć`;

        if (photos.length > 0) {
            setupGallery(photos);
        }

        document.querySelector('.realizacja-loading').style.display = 'none';
        document.querySelector('.realizacja-content').style.display = 'block';
        AOS.refresh();
    } catch (error) {
        document.querySelector('.realizacja-loading').textContent =
            'Wystąpił błąd podczas ładowania realizacji.';
    }
});

function setupGallery(photos) {
    let currentIndex = 0;

    const heroImg = document.querySelector('.realizacja-hero-img');
    const counter = document.querySelector('.gallery-counter');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const thumbnailsContainer = document.querySelector('.realizacja-thumbnails');

    const updateMain = () => {
        heroImg.src = photos[currentIndex];
        heroImg.alt = `Zdjęcie ${currentIndex + 1}`;
        counter.textContent = `${currentIndex + 1} / ${photos.length}`;

        thumbnailsContainer.querySelectorAll('.thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === currentIndex);
        });

        const activeThumb = thumbnailsContainer.querySelector('.thumb.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    photos.forEach((photo, i) => {
        const thumb = document.createElement('img');
        thumb.src = photo;
        thumb.alt = `Miniatura ${i + 1}`;
        thumb.className = 'thumb' + (i === 0 ? ' active' : '');
        thumb.loading = 'lazy';
        thumb.addEventListener('click', () => {
            currentIndex = i;
            updateMain();
        });
        thumbnailsContainer.appendChild(thumb);
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        updateMain();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % photos.length;
        updateMain();
    });

    heroImg.addEventListener('click', () => {
        if (window.openSlider) {
            window.openSlider(photos, currentIndex);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.slider-container')?.style.display === 'flex') return;
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
    });

    updateMain();
}
