function handleError(message, error, showAlert = false) {
    console.error(message, error);
    if (showAlert) {
        alert(message);
    }
}

async function getApiKey() {
    try {
        const response = await fetch('apis/config.json');
        if (!response.ok) {
            throw new Error('Failed to load API key config.');
        }
        const config = await response.json();
        return config.apiKey;
    } catch (error) {
        handleError('Failed to fetch API key.', error);
        return null;
    }
}

async function fetchGenres(apiKey) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        if (!response.ok) {
            throw new Error('Failed to fetch genres.');
        }
        const data = await response.json();
        return data.genres;
    } catch (error) {
        handleError('An error occurred while fetching genres:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const homePage = document.getElementById('homePage');
    const welcomeBanner = document.getElementById('welcomeBanner');
    const closeBanner = document.getElementById('closeBanner');
    const categorySelect = document.getElementById('categorySelect');
    const popularMedia = document.getElementById('popularMedia');
    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const posterImage = document.getElementById('posterImage');

    if (closeBanner) {
        closeBanner.addEventListener('click', () => {
            welcomeBanner.style.display = 'none';
        });
    }

    if (homePage) {
        homePage.classList.remove('hidden');
    }

    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    if (searchInput) {
        document.getElementById('searchButton').addEventListener('click', search);
        searchInput.addEventListener('keydown', async function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                search();
            }
        });

        searchInput.addEventListener('input', async function () {
            const query = searchInput.value;
            if (query.length > 2) {
                const selectedCategory = categorySelect.value;
                const response = await fetch(`https://api.themoviedb.org/3/search/${selectedCategory}?api_key=${API_KEY}&query=${query}`);
                if (response.ok) {
                    const data = await response.json();
                    displaySearchSuggestions(data.results);
                } else {
                    searchSuggestions.classList.add('hidden');
                }
            } else {
                searchSuggestions.classList.add('hidden');
            }
        });
    }

    const API_KEY = await getApiKey();
    if (!API_KEY) return;

    const genres = await fetchGenres(API_KEY);
    const genreMap = genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
    }, {});

    genreMap[80] = 'Crime';

    async function search() {
        const searchInputValue = searchInput.value;
        const selectedCategory = categorySelect.value;
        const response = await fetch(`https://api.themoviedb.org/3/search/${selectedCategory}?api_key=${API_KEY}&query=${searchInputValue}`);

        if (response.ok) {
            const data = await response.json();

            // Display search results in the search results container
            displaySearchResults(data.results);

            // Also display search results in the popular media area
            displayPopularMedia(data.results);

            searchSuggestions.classList.add('hidden');

            const newUrl = `${window.location.origin}${window.location.pathname}?query=${encodeURIComponent(searchInputValue)}&category=${selectedCategory}`;
            window.history.pushState({ searchInputValue, selectedCategory }, '', newUrl);
        } else {
            handleError('Failed to fetch search results.');
        }
    }

    async function fetchPopularMedia(page = 1) {
        const selectedCategory = categorySelect.value;
        let url = '';
        let moviePage = page;
        let tvPage = page;

        try {
            if (selectedCategory === 'latest') {
                url = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}&page=${page}`;
            } else if (selectedCategory === 'animation') {
                const genreId = 16; // Animation genre ID
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${moviePage}&language=en-US`;
                const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${tvPage}&language=en-US`;
                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (movieResponse.ok && tvResponse.ok) {
                    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
                    const combinedResults = [...movieData.results, ...tvData.results].slice(0, 12);
                    const totalPages = Math.max(movieData.total_pages, tvData.total_pages);
                    displayPopularMedia(combinedResults);
                    updatePaginationControls(page, totalPages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            } else if (selectedCategory === 'crime') {
                const genreId = 80;
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${moviePage}&language=en-US`;
                const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${tvPage}&language=en-US`;
                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (movieResponse.ok && tvResponse.ok) {
                    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
                    const combinedResults = [...movieData.results, ...tvData.results].slice(0, 12);
                    const totalPages = Math.max(movieData.total_pages, tvData.total_pages);
                    displayPopularMedia(combinedResults);
                    updatePaginationControls(page, totalPages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            } else if (selectedCategory === 'horror') {
                const genreId = 27;
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${moviePage}&language=en-US`;
                const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${tvPage}&language=en-US`;
                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (movieResponse.ok && tvResponse.ok) {
                    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
                    const combinedResults = [...movieData.results, ...tvData.results].slice(0, 12);
                    const totalPages = Math.max(movieData.total_pages, tvData.total_pages);
                    displayPopularMedia(combinedResults);
                    updatePaginationControls(page, totalPages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            } else if (selectedCategory === 'action') {
                const genreId = 28;
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${moviePage}&language=en-US`;
                const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${tvPage}&language=en-US`;
                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (movieResponse.ok && tvResponse.ok) {
                    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
                    const combinedResults = [...movieData.results, ...tvData.results].slice(0, 12);
                    const totalPages = Math.max(movieData.total_pages, tvData.total_pages);
                    displayPopularMedia(combinedResults);
                    updatePaginationControls(page, totalPages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            } else if (selectedCategory === 'drama') {
                const genreId = 18;
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${moviePage}&language=en-US`;
                const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${tvPage}&language=en-US`;
                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (movieResponse.ok && tvResponse.ok) {
                    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
                    const combinedResults = [...movieData.results, ...tvData.results].slice(0, 12);
                    const totalPages = Math.max(movieData.total_pages, tvData.total_pages);
                    displayPopularMedia(combinedResults);
                    updatePaginationControls(page, totalPages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            } else if (selectedCategory === 'scifi') {
                const genreId = 878;
                const movieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${moviePage}&language=en-US`;
                const tvUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&page=${tvPage}&language=en-US`;
                const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
                if (movieResponse.ok && tvResponse.ok) {
                    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
                    const combinedResults = [...movieData.results, ...tvData.results].slice(0, 12);
                    const totalPages = Math.max(movieData.total_pages, tvData.total_pages);
                    displayPopularMedia(combinedResults);
                    updatePaginationControls(page, totalPages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            } else if (selectedCategory === 'tv') {
                url = `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&page=${page}`;
            } else {
                url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=${page}`;
            }

            if (url) {
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const results = data.results.slice(0, 12);
                    displayPopularMedia(results);
                    updatePaginationControls(data.page, data.total_pages);
                } else {
                    handleError(`Failed to fetch ${selectedCategory} media.`);
                }
            }
        } catch (error) {
            handleError(`An error occurred while fetching ${selectedCategory} media.`, error);
        }
    }




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

    function changePage(page) {
        fetchPopularMedia(page);
    }

    async function fetchSelectedMedia(mediaId, mediaType) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${API_KEY}`);
            if (response.ok) {
                const media = await response.json();

                // Generate a URL-friendly title
                const titleSlug = media.title ? media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : media.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const newUrl = `${window.location.origin}${window.location.pathname}?title=${encodeURIComponent(titleSlug)}`;
                window.history.pushState({ mediaId, mediaType, title: media.title || media.name }, '', newUrl);

                displaySelectedMedia(media, mediaType);
                await fetchMediaTrailer(mediaId, mediaType);

                if (posterImage && media.poster_path) {
                    posterImage.src = `https://image.tmdb.org/t/p/w300${media.poster_path}`;
                    posterImage.alt = media.title || media.name;
                }

                videoPlayerContainer.classList.remove('hidden');
            } else {
                handleError('Failed to fetch media details.', new Error('API response not OK'));
                videoPlayerContainer.classList.add('hidden');
            }
        } catch (error) {
            handleError('An error occurred while fetching media details.', error);
            videoPlayerContainer.classList.add('hidden');
        }
    }



    async function fetchMediaTrailer(mediaId, mediaType) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?api_key=${API_KEY}`);
            if (response.ok) {
                const data = await response.json();
                const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                if (trailer) {
                    videoPlayer.src = `https://www.youtube.com/embed/${trailer.key}`;
                } else {
                    videoPlayer.src = '';
                    videoPlayerContainer.classList.add('hidden');
                }
            } else {
                handleError('Failed to fetch media trailer.', new Error('API response not OK'));
                videoPlayerContainer.classList.add('hidden');
            }
        } catch (error) {
            handleError('An error occurred while fetching media trailer.', error);
            videoPlayerContainer.classList.add('hidden');
        }
    }

    function displayPopularMedia(results) {
        popularMedia.innerHTML = '';

        results.forEach(media => {
            const mediaCard = document.createElement('div');
            mediaCard.classList.add('media-card');

            const genreNames = media.genre_ids.map(id => genreMap[id] || 'Unknown').join(', ');
            const formattedDate = media.release_date ? new Date(media.release_date).toLocaleDateString() : (media.first_air_date ? new Date(media.first_air_date).toLocaleDateString() : 'Unknown Date');
            const ratingStars = Array.from({ length: 5 }, (_, i) => i < Math.round(media.vote_average / 2) ? '★' : '☆').join(' ');

            const mediaType = media.media_type || (media.title ? 'movie' : 'tv');

            // Generate a URL-friendly title
            const titleSlug = media.title ? media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : media.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            mediaCard.innerHTML = `
            <div class="relative w-full h-64 overflow-hidden rounded-lg mb-4">
                <img src="https://image.tmdb.org/t/p/w300${media.poster_path}" alt="${media.title || media.name}" class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
            </div>
            <div class="flex-grow w-full">
                <h3 class="text-lg font-semibold text-white truncate">${media.title || media.name}</h3>
                <p class="text-gray-400 text-sm mt-2">${mediaType === 'movie' ? '🎬 Movie' : mediaType === 'tv' ? '📺 TV Show' : '📽 Animation'}</p>
                <p class="text-gray-400 text-sm mt-1">Genres: ${genreNames}</p>
                <div class="flex items-center mt-2">
                    <span class="text-yellow-400 text-base">${ratingStars}</span>
                    <span class="text-gray-300 text-sm ml-2">${media.vote_average.toFixed(1)}/10</span>
                </div>
                <p class="text-gray-300 text-sm mt-1">Release Date: ${formattedDate}</p>
            </div>
        `;

            mediaCard.addEventListener('click', function () {
                fetchSelectedMedia(media.id, mediaType);
            });

            popularMedia.appendChild(mediaCard);
        });
    }



    function displaySearchResults(results) {
        const searchResultsContainer = document.getElementById('searchResultsContainer');
        searchResultsContainer.innerHTML = '';
        results.forEach(result => {
            const resultCard = document.createElement('div');
            resultCard.classList.add('result-card');
            resultCard.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${result.title || result.name}">
                <h3>${result.title || result.name}</h3>
                <p>Release Date: ${result.release_date || result.first_air_date}</p>
            `;
            searchResultsContainer.appendChild(resultCard);
        });
    }

    function displaySearchSuggestions(results) {
        searchSuggestions.innerHTML = '';
        results.forEach(result => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = result.title || result.name;
            suggestionItem.addEventListener('click', () => {
                searchInput.value = suggestionItem.textContent;
                search();
                searchSuggestions.classList.add('hidden');
            });
            searchSuggestions.appendChild(suggestionItem);
        });
        searchSuggestions.classList.remove('hidden');
    }

    async function loadMediaFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');

        if (title) {
            // Convert the title slug back to a format you can use to fetch media
            const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}`);
            if (response.ok) {
                const data = await response.json();
                const media = data.results.find(item => (item.title && item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === title) || (item.name && item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === title));
                if (media) {
                    const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
                    await fetchSelectedMedia(media.id, mediaType);
                }
            }
        }
    }


    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            fetchPopularMedia();
        });
    }

    fetchPopularMedia();
    loadMediaFromUrlParams();
});
