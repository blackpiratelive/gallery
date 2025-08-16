$(document).ready(function() {
    // --- STATE ---
    let currentImageIndex = 0;
    let isSidebarCollapsed = false;
    let galleryLinks = [];

    // --- DOM ELEMENTS CACHE ---
    const $modal = $('#fullscreen-modal');
    const $modalBg = $('#modal-bg');
    const $fullscreenImage = $('#fullscreen-image');
    const $imageTitle = $('#image-title');
    const $imageDescription = $('#image-description');
    const $imageTags = $('#image-tags');
    const $imageUser = $('#image-user');
    const $sidebarContainer = $('#sidebar-container');
    const $imageContainer = $('#image-container');
    const $sidebarContent = $('#sidebar-content');

    // --- INITIALIZATION ---
    function initializeGallery() {
        $('#photo-gallery').justifiedGallery({
            rowHeight: 220,
            margins: 8,
            lastRow: 'justify',
            cssAnimation: true
        });
        // Cache the links for navigation
        galleryLinks = $('.gallery-link');
    }

    // --- MODAL & DYNAMIC STYLING ---
    function updateModalContent(index) {
        if (index < 0 || index >= galleryLinks.length) return;

        const link = $(galleryLinks[index]);
        const photoData = link.data();

        $fullscreenImage.attr('src', photoData.src).attr('alt', photoData.title);
        $modalBg.css('background-image', `url(${photoData.thumbnail})`);

        $imageTitle.text(photoData.title);
        $imageDescription.text(photoData.description);
        
        const tagsHtml = (photoData.tags || '').split(',').map(tag => 
            tag.trim() ? `<span class="bg-white/20 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">${tag.trim()}</span>` : ''
        ).join('');
        $imageTags.html(tagsHtml);
        
        $imageUser.html(`<a href="${photoData.authorLink}" target="_blank" class="hover:underline">${photoData.author}</a>`);

        // Use the dominant color passed from Hugo
        const dominantColor = photoData.color;
        const isDark = isColorDark(hexToRgb(dominantColor));
        const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';
        const secondaryTextColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';

        $sidebarContainer.css({ 'background-color': dominantColor, 'color': textColor });
        $sidebarContainer.find('h2, h3').css('color', textColor);
        $sidebarContainer.find('p, div, a').css('color', secondaryTextColor);
        $sidebarContainer.find('.border-b').css('border-color', isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)');
        $sidebarContainer.find('button').css('color', textColor);
        $imageTags.find('span').css({
            'background-color': isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            'color': textColor
        });
    }

    function openModal(id) {
        const photoIndex = galleryLinks.toArray().findIndex(el => $(el).data('id') === id);
        if (photoIndex === -1) return;
        currentImageIndex = photoIndex;
        updateModalContent(currentImageIndex);
        $('body').addClass('modal-open');
        $modal.removeClass('modal-closed');
    }

    function closeModal() {
        $('body').removeClass('modal-open');
        $modal.addClass('modal-closed');
    }

    window.closeModalOnClick = function(event) {
        if (event.target === $modal[0]) closeModal();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryLinks.length;
        updateModalContent(currentImageIndex);
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryLinks.length) % galleryLinks.length;
        updateModalContent(currentImageIndex);
    }

    function toggleSidebar() {
        isSidebarCollapsed = !isSidebarCollapsed;
        $sidebarContent.toggleClass('hidden');
        $sidebarContainer.toggleClass('p-6 p-0');
        $sidebarContainer.toggleClass('md:w-1/4 md:w-0');
        $imageContainer.toggleClass('md:w-3/4 md:w-full');
        $('#show-sidebar-btn').toggleClass('hidden', !isSidebarCollapsed);
    }

    // --- HELPERS ---
    function hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    function isColorDark([r, g, b]) {
        return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }

    // --- THEME SWITCHER ---
    function updateThemeIcon() {
        const isDark = $('html').hasClass('dark');
        $('#theme-icon-light').toggle(isDark);
        $('#theme-icon-dark').toggle(!isDark);
    }

    function toggleTheme() {
        const isDark = $('html').toggleClass('dark').hasClass('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon();
    }

    // --- EVENT LISTENERS ---
    $('#theme-toggle').on('click', toggleTheme);
    $('#close-modal-btn').on('click', closeModal);
    $('#prev-btn').on('click', showPrevImage);
    $('#next-btn').on('click', showNextImage);
    $('#sidebar-toggle-btn').on('click', toggleSidebar);
    $('#show-sidebar-btn').on('click', toggleSidebar);

    $(document).on('click', '.gallery-link', function(e) {
        e.preventDefault();
        openModal($(this).data('id'));
    });
    
    $(document).on('keydown', (e) => {
        if ($modal.hasClass('modal-closed')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // --- RUN ---
    initializeGallery();
    updateThemeIcon();
});
