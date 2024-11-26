// Sample poetry data
const shayariData = [
    {
        id: 1,
        text: 'ये न थी हमने जो रस्म को पाई थी\nये उन्हीं की है जो तेरे पहले आए थे',
        translation: 'This tradition that we inherited\nBelongs to those who came before you',
        author: 'Faiz Ahmad Faiz',
        isFavorite: false
    },
    {
        id: 2,
        text: 'इश्क़ पर ज़ोर नहीं है ये वो आतिश ग़ालिब\nकि लगाए न लगे और बुझाए न बने',
        translation: 'Love cannot be forced, it\'s such a fire Ghalib\nThat neither can be lit nor extinguished at will',
        author: 'Mirza Ghalib',
        isFavorite: false
    },
    {
        id: 3,
        text: 'हम तो समझे थे एक तुम हो\nतुम तो हर एक से मिले निकले',
        translation: 'I thought you were the only one\nTurns out you met with everyone',
        author: 'Bashir Badr',
        isFavorite: false
    }
];

// DOM Elements
const shayariContainer = document.querySelector('.shayari-container');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const homeBtn = document.getElementById('home-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchOverlay = document.querySelector('.search-overlay');

// State
let currentView = 'home';
let favorites = new Set();
let currentIndex = 0;

// Load favorites from localStorage
function loadFavorites() {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        favorites = new Set(JSON.parse(savedFavorites));
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
}

// Create Shayari Card Element
function createShayariCard(shayari) {
    const card = document.createElement('div');
    card.className = 'shayari-card';
    
    const content = document.createElement('div');
    content.className = 'shayari-content';
    content.innerHTML = `
        <div class="shayari-text">${shayari.text.replace(/\n/g, '<br>')}</div>
        <div class="shayari-translation">${shayari.translation.replace(/\n/g, '<br>')}</div>
        <div class="shayari-author">- ${shayari.author}</div>
    `;
    
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
        <button class="action-btn favorite-btn ${favorites.has(shayari.id) ? 'active' : ''}" data-id="${shayari.id}">
            <i class="fas fa-heart"></i>
        </button>
        <button class="action-btn share-btn" data-id="${shayari.id}">
            <i class="fas fa-share-alt"></i>
        </button>
    `;
    
    card.appendChild(content);
    card.appendChild(actions);
    
    // Add event listeners
    const favoriteBtn = actions.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', () => toggleFavorite(shayari.id));
    
    const shareButton = actions.querySelector('.share-btn');
    shareButton.addEventListener('click', () => shareShayari(shayari));
    
    return card;
}

// Display Shayari Cards
function displayShayari(shayariList) {
    shayariContainer.innerHTML = '';
    const displayList = currentView === 'favorites' 
        ? shayariList.filter(shayari => favorites.has(shayari.id))
        : shayariList;
        
    displayList.forEach(shayari => {
        const card = createShayariCard(shayari);
        shayariContainer.appendChild(card);
    });
    
    // Scroll to top
    shayariContainer.scrollTo(0, 0);
}

// Toggle Favorite
function toggleFavorite(id) {
    if (favorites.has(id)) {
        favorites.delete(id);
    } else {
        favorites.add(id);
    }
    saveFavorites();
    
    // Update UI
    const btn = document.querySelector(`.favorite-btn[data-id="${id}"]`);
    btn.classList.toggle('active');
}

// Share Shayari
async function shareShayari(shayari) {
    const shareText = `${shayari.text}\n\n${shayari.translation}\n- ${shayari.author}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Sher-o-Shayari',
                text: shareText
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        // Fallback copy to clipboard
        navigator.clipboard.writeText(shareText)
            .then(() => alert('Copied to clipboard!'))
            .catch(err => console.error('Error copying to clipboard:', err));
    }
}

// Search Functionality
function searchShayari(query) {
    return shayariData.filter(shayari => 
        shayari.text.toLowerCase().includes(query.toLowerCase()) ||
        shayari.translation.toLowerCase().includes(query.toLowerCase()) ||
        shayari.author.toLowerCase().includes(query.toLowerCase())
    );
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        const results = searchShayari(query);
        displayShayari(results);
    }
    searchOverlay.classList.remove('active');
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

searchToggleBtn.addEventListener('click', () => {
    searchOverlay.classList.toggle('active');
    if (searchOverlay.classList.contains('active')) {
        searchInput.focus();
    }
});

homeBtn.addEventListener('click', () => {
    currentView = 'home';
    homeBtn.classList.add('active');
    favoritesBtn.classList.remove('active');
    displayShayari(shayariData);
    searchInput.value = '';
});

favoritesBtn.addEventListener('click', () => {
    currentView = 'favorites';
    favoritesBtn.classList.add('active');
    homeBtn.classList.remove('active');
    displayShayari(shayariData);
});

// Handle swipe gestures
let touchStartY = 0;
let touchEndY = 0;

shayariContainer.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

shayariContainer.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchEndY - touchStartY;
    const cards = document.querySelectorAll('.shayari-card');
    const cardHeight = window.innerHeight;
    
    if (Math.abs(swipeDistance) > 50) {
        const direction = swipeDistance > 0 ? -1 : 1;
        const targetScroll = Math.round(shayariContainer.scrollTop / cardHeight) * cardHeight + (cardHeight * direction);
        shayariContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
}

// Initialize
loadFavorites();
displayShayari(shayariData);
homeBtn.classList.add('active');
