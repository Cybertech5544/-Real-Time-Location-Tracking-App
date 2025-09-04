// Initialize the map
let map;
let marker;
let watchId;
let userCount = 1;

// Update status indicators
function updateStatus(elementId, text, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        element.style.color = isError ? '#ff6b6b' : '#ffffff';
    }
}

// Initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    console.log("Map initialized");
}

// Simulate other users (for demo purposes)
function simulateOtherUsers() {
    // This is just for demonstration - in a real app, you'd have real WebSocket connections
    updateStatus('users-online', userCount);
    
    // Simulate user count changes
    setInterval(() => {
        userCount = Math.max(1, userCount + (Math.random() > 0.7 ? 1 : -1));
        updateStatus('users-online', userCount);
    }, 5000);
}

// Initialize the application
function initApp() {
    initMap();
    updateStatus('connection-status', 'Connected (Demo Mode)');
    updateStatus('user-id', 'DEMO-' + Math.floor(Math.random() * 10000));
    simulateOtherUsers();
    
    // Request geolocation
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Update the map
                if (marker) {
                    marker.setLatLng([latitude, longitude]);
                } else {
                    marker = L.marker([latitude, longitude])
                        .addTo(map)
                        .bindPopup('Your location');
                }
                
                map.setView([latitude, longitude], 16);
                updateStatus('location-status', 'Access granted');
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMsg = 'Unknown error';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Permission denied. Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Location request timed out.';
                        break;
                }
                
                updateStatus('location-status', errorMsg, true);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    } else {
        updateStatus('location-status', 'Geolocation is not supported by this browser.', true);
    }
}

// Start the app when the page loads
window.addEventListener('load', initApp);
