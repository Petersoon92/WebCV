document.addEventListener('DOMContentLoaded', function() {
    const slidesContainer = document.getElementById('slides');
    const dotsContainer = document.getElementById('dots');

    let currentSlide = 0;
    let totalSlides = 0;
    let isAnimating = false;

    async function loadImages() {
        try {
            const response = await fetch('/api/images');
            const images = await response.json();

            if (images.length === 0) {
                showEmptyMessage();
                return;
            }

            createSlides(images);
            createDots(images.length);
            updateDots();
        } catch (error) {
            console.error('Chyba při načítání obrázků:', error);
            showEmptyMessage();
        }
    }

    function createSlides(images) {
        slidesContainer.innerHTML = '';
        totalSlides = images.length;

        images.forEach((imageSrc, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';

            const img = document.createElement('img');
            img.src = `/static/images/${imageSrc}`;
            img.alt = `Portfolio ${index + 1}`;
            img.draggable = false;

            slide.appendChild(img);
            slidesContainer.appendChild(slide);
        });
    }

    function createDots(count) {
        dotsContainer.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        if (isAnimating || index === currentSlide) return;
        if (index < 0 || index >= totalSlides) return;

        isAnimating = true;
        currentSlide = index;

        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();

        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    }

    function showEmptyMessage() {
        slidesContainer.innerHTML = `
            <div class="slide" style="color: #666; font-size: 14px; text-align: center;">
                <p>Přidejte obrázky do složky static/images/</p>
            </div>
        `;
    }

    // Ovládání kolečkem myši
    let wheelTimeout = null;

    document.addEventListener('wheel', function(e) {
        e.preventDefault();

        if (isAnimating || wheelTimeout) return;

        if (e.deltaY > 0) {
            nextSlide();
        } else if (e.deltaY < 0) {
            prevSlide();
        }

        wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
        }, 100);

    }, { passive: false });

    // Klávesové ovládání
    document.addEventListener('keydown', function(e) {
        if (isAnimating) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevSlide();
        }
    });

    // Dotykové ovládání (swipe)
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        if (isAnimating) return;

        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Horizontální swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });

    loadImages();
});
