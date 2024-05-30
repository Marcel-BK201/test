let imageLinks = [];
let currentIndex = 0;
let savedLinks = JSON.parse(localStorage.getItem('paja')) || [];
let deletedLinks = JSON.parse(localStorage.getItem('nopaja')) || [];
let showSavedOnly = false;

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const allLinks = e.target.result.split('\n').filter(link => link.trim() !== '');
            const filteredLinks = allLinks.filter(link => !deletedLinks.includes(link));
            imageLinks = shuffleArray(filteredLinks); // Shuffle the array
            localStorage.setItem('originalImageLinks', JSON.stringify(allLinks));
            if (imageLinks.length > 0) {
                displayFormattedMedia();
                document.getElementById('fileInput').style.display = 'none';
                updateCounter();
                updateButtonStyles();
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('saveButton').addEventListener('click', function() {
    toggleLink(savedLinks, 'paja');
    updateButtonStyles();
});

document.getElementById('delButton').addEventListener('click', function() {
    toggleLink(deletedLinks, 'nopaja');
    imageLinks = imageLinks.filter(link => !deletedLinks.includes(link));
    currentIndex = Math.min(currentIndex, imageLinks.length - 1); // Ensure index is within bounds
    if (imageLinks.length > 0) {
        displayFormattedMedia();
    } else {
        showLoading();
        alert('No more images to display');
    }
    updateCounter();
    updateButtonStyles();
});

document.getElementById('nextButton').addEventListener('click', nextMedia);
document.getElementById('prevButton').addEventListener('click', prevMedia);

document.getElementById('goToButton').addEventListener('click', function() {
    const goToIndex = parseInt(document.getElementById('goToInput').value, 10) - 1;
    if (goToIndex >= 0 && goToIndex < imageLinks.length) {
        currentIndex = goToIndex;
        displayFormattedMedia();
        updateCounter();
        updateButtonStyles();
    } else {
        alert('Invalid image number');
    }
});

document.getElementById('saved').addEventListener('click', function() {
    showSavedOnly = !showSavedOnly;
    if (showSavedOnly) {
        document.getElementById('saved').style.backgroundColor = 'green';
        imageLinks = shuffleArray(savedLinks.filter(link => !deletedLinks.includes(link)));
        currentIndex = 0;
    } else {
        document.getElementById('saved').style.backgroundColor = '';
        const allLinks = JSON.parse(localStorage.getItem('originalImageLinks'));
        imageLinks = shuffleArray(allLinks.filter(link => !deletedLinks.includes(link)));
    }
    displayFormattedMedia();
    updateCounter();
    updateButtonStyles();
});

document.getElementById('imageDisplay').addEventListener('click', function() {
    const link = document.getElementById('imageDisplay').src;
    window.open(link, '_blank');
});

document.getElementById('videoDisplay').addEventListener('click', function() {
    const link = document.getElementById('videoDisplay').src;
    window.open(link, '_blank');
});

function toggleLink(array, key) {
    const currentLink = imageLinks[currentIndex];
    const index = array.indexOf(currentLink);
    if (index === -1) {
        array.push(currentLink);
    } else {
        array.splice(index, 1);
    }
    localStorage.setItem(key, JSON.stringify(array));
}

function formatLink(link, extension) {
    link = link.replace('thumbnails', 'images'); // Replace "thumbnails" with "images"
    link = link.replace('thumbnail_', ''); // Remove "thumbnail_"
    link = link.replace(/\?.*$/, ''); // Remove everything after the last "."
    link = link.replace(/\.[^/.]+$/, `.${extension}`); // Change the file extension to the desired one
    return link;
}

function displayFormattedMedia() {
    const currentLink = imageLinks[currentIndex];
    if (currentLink) {
        const formats = ['jpg', 'jpeg', 'png', 'mp4'];
        showLoading();

        const promises = formats.map(format => {
            return new Promise((resolve, reject) => {
                const link = formatLink(currentLink, format);
                if (format === 'mp4') {
                    const video = document.createElement('video');
                    video.onloadeddata = () => resolve({ type: 'video', link });
                    video.onerror = reject;
                    video.src = link;
                } else {
                    const image = new Image();
                    image.onload = () => resolve({ type: 'image', link });
                    image.onerror = reject;
                    image.src = link;
                }
            });
        });

        Promise.any(promises).then(result => {
            hideLoading();
            if (result.type === 'video') {
                document.getElementById('videoDisplay').src = result.link;
                document.getElementById('videoDisplay').style.display = 'block';
                document.getElementById('imageDisplay').style.display = 'none';
            } else {
                document.getElementById('imageDisplay').src = result.link;
                document.getElementById('imageDisplay').style.display = 'block';
                document.getElementById('videoDisplay').style.display = 'none';
            }
            document.getElementById('linkDisplay').innerText = result.link;
            updateButtonStyles();
        }).catch(() => {
            alert('No valid formats found');
            hideLoading();
        });
    }
}

function showLoading() {
    document.getElementById('imageDisplay').style.display = 'none';
    document.getElementById('videoDisplay').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function updateCounter() {
    const counter = document.getElementById('counter');
    counter.innerText = `${currentIndex + 1} de ${imageLinks.length}`;
}

function updateSaved() {
    const saved = document.getElementById('saved');
    saved.innerText = `Saved (${savedLinks.length})`;
}

function nextMedia() {
    if (currentIndex < imageLinks.length - 1) {
        currentIndex++;
        displayFormattedMedia();
        updateCounter();
        updateButtonStyles();
    } else {
        alert('No more media');
    }
}

function prevMedia() {
    if (currentIndex > 0) {
        currentIndex--;
        displayFormattedMedia();
        updateCounter();
        updateButtonStyles();
    } else {
        alert('No previous media');
    }
}

function updateButtonStyles() {
    const currentLink = imageLinks[currentIndex];
    const saveButton = document.getElementById('saveButton');
    const delButton = document.getElementById('delButton');
    
    if (savedLinks.includes(currentLink)) {
        saveButton.style.backgroundColor = 'green';
    } else {
        saveButton.style.backgroundColor = '';
    }

    if (deletedLinks.includes(currentLink)) {
        delButton.style.backgroundColor = 'red';
    } else {
        delButton.style.backgroundColor = '';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

console.log(savedLinks); // This will log saved links, you might want to do something else with them
