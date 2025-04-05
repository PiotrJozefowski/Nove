// Funkcja do obsługi slidera zdjęć
document.addEventListener('DOMContentLoaded', () => {
    // Tworzenie elementu slidera
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    sliderContainer.style.display = 'none';
    document.body.appendChild(sliderContainer);
    
    // Tworzenie elementów slidera
    const sliderContent = document.createElement('div');
    sliderContent.className = 'slider-content';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'slider-close';
    closeButton.innerHTML = '&times;';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'slider-prev';
    prevButton.innerHTML = '&lt;';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'slider-next';
    nextButton.innerHTML = '&gt;';
    
    const imageContainer = document.createElement('div');
    imageContainer.className = 'slider-image-container';
    
    const image = document.createElement('img');
    image.className = 'slider-image';
    
    const imageCounter = document.createElement('div');
    imageCounter.className = 'slider-counter';
    
    // Składanie elementów slidera
    imageContainer.appendChild(image);
    sliderContent.appendChild(closeButton);
    sliderContent.appendChild(prevButton);
    sliderContent.appendChild(imageContainer);
    sliderContent.appendChild(nextButton);
    sliderContent.appendChild(imageCounter);
    sliderContainer.appendChild(sliderContent);
    
    // Zmienne do obsługi slidera
    let currentImages = [];
    let currentIndex = 0;
    
    // Funkcja do otwierania slidera
    window.openSlider = (images, startIndex = 0) => {
        currentImages = images;
        currentIndex = startIndex;
        
        // Wyświetlanie pierwszego zdjęcia
        updateSliderImage();
        
        // Pokazywanie slidera
        sliderContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Blokowanie przewijania strony
    };
    
    // Funkcja do aktualizacji zdjęcia w sliderze
    const updateSliderImage = () => {
        if (currentImages.length === 0) return;
        
        image.src = currentImages[currentIndex];
        imageCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    };
    
    // Obsługa przycisków
    closeButton.addEventListener('click', () => {
        sliderContainer.style.display = 'none';
        document.body.style.overflow = ''; // Przywracanie przewijania strony
    });
    
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderImage();
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentIndex < currentImages.length - 1) {
            currentIndex++;
            updateSliderImage();
        }
    });
    
    // Obsługa klawiszy
    document.addEventListener('keydown', (e) => {
        if (sliderContainer.style.display === 'none') return;
        
        if (e.key === 'Escape') {
            closeButton.click();
        } else if (e.key === 'ArrowLeft') {
            prevButton.click();
        } else if (e.key === 'ArrowRight') {
            nextButton.click();
        }
    });
    
    // Obsługa kliknięcia poza sliderem
    sliderContainer.addEventListener('click', (e) => {
        if (e.target === sliderContainer) {
            closeButton.click();
        }
    });
}); 