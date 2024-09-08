function handleError(message, error) {
    console.error(message, error);
    alert(message);
}

// Function to fetch the API key from the configuration file
async function getApiKey() {
    try {
        const response = await fetch('apis/config.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const config = await response.json();
        return config.apiKey;
    } catch (error) {
        handleError('Failed to fetch API key.', error);
        return null;
    }
}

// Function to fetch genres
async function fetchGenres(apiKey) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.genres;
    } catch (error) {
        handleError('Failed to fetch genres.', error);
        return [];
    }
}

// Function to debounce input events
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to display a loading spinner
function showLoading() {
    const searchSuggestions = document.getElementById('searchSuggestions');
    if (searchSuggestions) {
        searchSuggestions.innerHTML = '<div class="spinner"></div>';
        searchSuggestions.classList.remove('hidden');
    }
}

// Function to highlight matching text
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Function to display search suggestions with preserved letter case
async function displaySearchSuggestions(results, query, genreMap) {
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (!searchSuggestions) return;

    if (results.length === 0) {
        searchSuggestions.innerHTML = '<div class="p-2 text-gray-500">No suggestions available</div>';
        searchSuggestions.classList.remove('hidden');
        return;
    }

    const suggestionsHTML = results.map(media => {
        const mediaTypeLabel = media.media_type === 'movie' ? 'Movie' : 'TV Show';
        const mediaTitle = media.title || media.name;
        const mediaRating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
        const highlightedTitle = highlightText(mediaTitle, query);
        const genreNames = media.genre_ids.map(id => genreMap[id] || 'Unknown').join(', ');

        return `
            <div class="suggestion-item p-4 cursor-pointer rounded-lg" data-id="${media.id}" data-type="${media.media_type}">
                <div class="flex items-center">
                    <img src="https://image.tmdb.org/t/p/w45${media.poster_path}" alt="${mediaTitle}" class="w-16 h-24 object-cover rounded-md mr-4">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-white truncate">${highlightedTitle}</h4>
                        <p class="text-gray-400 text-sm">${mediaTypeLabel}</p>
                        <p class="text-yellow-400 text-sm">${mediaRating}/10</p>
                        <p class="text-gray-400 text-sm">Genres: ${genreNames}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    searchSuggestions.innerHTML = suggestionsHTML;
    searchSuggestions.classList.remove('hidden');

    // Attach click events to suggestions
    searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', async () => {
            const mediaId = item.getAttribute('data-id');
            const mediaType = item.getAttribute('data-type');
            const apiKey = await getApiKey();
            if (apiKey) {
                fetchSelectedMedia(apiKey, mediaId, mediaType);
                searchSuggestions.classList.add('hidden');
            }
        });
    });

    // Set up keyboard navigation
    setupKeyboardNavigation(searchSuggestions);
}

// Function to handle search input changes
async function handleSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchInputValue = searchInput.value.trim();
    const apiKey = await getApiKey();

    if (!searchInputValue) {
        const searchSuggestions = document.getElementById('searchSuggestions');
        if (searchSuggestions) searchSuggestions.innerHTML = '';
        return;
    }

    if (!apiKey) {
        handleError('Failed to fetch API key.');
        return;
    }

    showLoading(); // Show spinner while fetching data

    try {
        const genres = await fetchGenres(apiKey); // Fetch genres
        const genreMap = genres.reduce((map, genre) => {
            map[genre.id] = genre.name;
            return map;
        }, {});

        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(searchInputValue)}`);
        if (response.ok) {
            const data = await response.json();
            displaySearchSuggestions(data.results, searchInputValue, genreMap);
        } else {
            handleError('Failed to fetch search results.');
        }
    } catch (error) {
        handleError('An error occurred while fetching search results:', error);
    }
}

// Debounced event listener for search input
document.getElementById('searchInput').addEventListener('input', debounce(handleSearchInput, 300));

// Function to set up keyboard navigation for suggestions
function setupKeyboardNavigation(container) {
    const items = container.querySelectorAll('.suggestion-item');
    let currentIndex = -1;

    function selectItem(index) {
        items.forEach((item, i) => item.classList.toggle('selected', i === index));
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            currentIndex = (currentIndex + 1) % items.length;
            selectItem(currentIndex);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            selectItem(currentIndex);
            event.preventDefault();
        } else if (event.key === 'Enter') {
            if (currentIndex >= 0 && currentIndex < items.length) {
                items[currentIndex].click();
                event.preventDefault();
            }
        }
    });
}

// Event listener for random button click
document.getElementById('randomButton').addEventListener('click', async function() {
    const apiKey = await getApiKey();

    if (!apiKey) {
        handleError('Failed to fetch API key.');
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
        if (response.ok) {
            const data = await response.json();
            const randomMedia = data.results[Math.floor(Math.random() * data.results.length)];
            fetchSelectedMedia(apiKey, randomMedia.id, randomMedia.media_type);
        } else {
            handleError('Failed to fetch trending media.');
        }
    } catch (error) {
        handleError('An error occurred while fetching trending media:', error);
    }
});

// Function to fetch popular media
async function fetchPopularMedia(apiKey, page = 1) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&page=${page}`);
        if (response.ok) {
            const data = await response.json();
            displaySearchResults(data.results);
            updatePaginationControls(data.page, data.total_pages);
            fetchUpcomingMedia(apiKey);
        } else {
            handleError('Failed to fetch popular media.');
        }
    } catch (error) {
        handleError('An error occurred while fetching popular media:', error);
    }
}

// Function to fetch top-rated media
async function fetchTopRatedMedia(apiKey, page = 1) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&page=${page}`);
        if (response.ok) {
            const data = await response.json();
            displaySearchResults(data.results);
            updatePaginationControls(data.page, data.total_pages);
        } else {
            handleError('Failed to fetch top-rated media.');
        }
    } catch (error) {
        handleError('An error occurred while fetching top-rated media:', error);
    }
}

// Function to display search results
function displaySearchResults(results) {
    const mediaContainer = document.getElementById('mediaContainer');
    if (!mediaContainer) return;

    mediaContainer.innerHTML = '';

    results.forEach(media => {
        const mediaCard = document.createElement('div');
        mediaCard.classList.add('media-card', 'bg-gray-900', 'p-6', 'rounded-lg', 'shadow-lg', 'cursor-pointer', 'transition-transform', 'hover:scale-105', 'relative', 'flex', 'flex-col', 'items-start');

        const genreNames = media.genre_ids.map(id => genreMap[id] || 'Unknown').join(', ');
        const formattedDate = media.release_date ? new Date(media.release_date).toLocaleDateString() : 'N/A';
        const ratingStars = '⭐'.repeat(Math.round(media.vote_average / 2));

        mediaCard.innerHTML = `
            <div class="relative w-full h-48 mb-4">
                <img src="https://image.tmdb.org/t/p/w500${media.poster_path}" alt="${media.title || media.name}" class="absolute inset-0 w-full h-full object-cover rounded-lg">
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40"></div>
            </div>
            <div class="w-full">
                <h3 class="text-xl font-semibold text-white truncate">${media.title || media.name}</h3>
                <p class="text-gray-400 text-sm mt-1">${media.media_type === 'movie' ? '🎬 Movie' : '📺 TV Show'}</p>
                <p class="text-gray-400 text-sm mt-1">Genres: ${genreNames}</p>
                <div class="flex items-center mt-2">
                    <span class="text-yellow-400 text-lg">${ratingStars}</span>
                    <span class="text-gray-300 text-sm ml-2">${media.vote_average.toFixed(1)}/10</span>
                </div>
                <p class="text-gray-300 text-sm mt-1">Release Date: ${formattedDate}</p>
            </div>
        `;

        // Event listener to fetch and display selected media details
        mediaCard.addEventListener('click', function() {
            fetchSelectedMedia(apiKey, media.id, media.media_type);
        });

        mediaContainer.appendChild(mediaCard);
    });
}

// Function to fetch upcoming media
async function fetchUpcomingMedia(apiKey) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`);
        if (response.ok) {
            const data = await response.json();
            const upcomingMovies = data.results.filter(media => new Date(media.release_date) > new Date());
            displayUpcomingMedia(upcomingMovies);
        } else {
            handleError('Failed to fetch upcoming media.');
        }
    } catch (error) {
        handleError('An error occurred while fetching upcoming media:', error);
    }
}

// Function to display upcoming media
function displayUpcomingMedia(mediaList) {
    const upcomingMedia = document.getElementById('upcomingMedia');
    if (!upcomingMedia) return;

    upcomingMedia.innerHTML = '';

    mediaList.forEach(media => {
        const mediaItem = document.createElement('div');
        mediaItem.classList.add('text-zinc-300', 'mb-2');
        mediaItem.innerHTML = `<span>${media.title}:</span> <span>${media.release_date}</span>`;
        upcomingMedia.appendChild(mediaItem);
    });
}

// Update pagination controls based on the current category
function updatePaginationControls(currentPage, totalPages) {
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');

    if (currentPageSpan) {
        currentPageSpan.textContent = currentPage;
    }

    if (prevPageButton) {
        prevPageButton.disabled = currentPage === 1;
        prevPageButton.onclick = () => changePage(currentPage - 1);
    }

    if (nextPageButton) {
        nextPageButton.disabled = currentPage === totalPages;
        nextPageButton.onclick = () => changePage(currentPage + 1);
    }
}

// Function to change page based on category selection
function changePage(page) {
    getApiKey().then(apiKey => {
        if (apiKey) {
            const type = document.querySelector('input[name="mediaType"]:checked').value;
            if (type === 'popular') {
                fetchPopularMedia(apiKey, page);
            } else if (type === 'top_rated') {
                fetchTopRatedMedia(apiKey, page);
            }
        }
    });
}

// Function to fetch selected media details
async function fetchSelectedMedia(apiKey, mediaId, mediaType) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}`);
        if (response.ok) {
            const media = await response.json();
            displaySelectedMedia(media, mediaType);
        } else {
            handleError('Failed to fetch media details.');
        }
    } catch (error) {
        handleError('An error occurred while fetching media details:', error);
    }
}

// Handle media type changes
document.querySelectorAll('input[name="mediaType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const type = this.value;
        getApiKey().then(apiKey => {
            if (apiKey) {
                if (type === 'popular') {
                    fetchPopularMedia(apiKey);
                } else if (type === 'top_rated') {
                    fetchTopRatedMedia(apiKey);
                }
            }
        });
    });
});

// Initial load
document.addEventListener('DOMContentLoaded', function() {
    getApiKey().then(apiKey => {
        if (apiKey) {
            fetchPopularMedia(apiKey);
            fetchUpcomingMedia(apiKey);
        }
    });
});