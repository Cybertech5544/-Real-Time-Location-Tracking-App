// Initialize Socket.io connection
const socket = io();
console.log("Connecting to server...");

let myId = null;
let map;
let markers = {};
let userCount = 0;

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

// Initialize the application
function initApp() {
    initMap();
    
    // Socket event handlers
    socket.on('connect', () => {
        myId = socket.id;
        updateStatus('connection-status', 'Connected');
        updateStatus('user-id', myId);
        console.log("Connected with ID:", myId);
    });
    
    socket.on('disconnect', () => {
        updateStatus('connection-status', 'Disconnected', true);
        console.log("Disconnected from server");
    });
    
    socket.on('receive-location', (data) => {
        const { id, latitude, longitude } = data;
        
        if (markers[id]) {
            markers[id].setLatLng([latitude, longitude]);
        } else {
            markers[id] = L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(`User: ${id.substring(0, 8)}`);
            
            userCount++;
            updateStatus('users-online', userCount);
        }
        
        if (id === myId) {
            map.setView([latitude, longitude], 16);
        }
    });
    
    socket.on('user-disconnected', (id) => {
        if (markers[id]) {
            map.removeLayer(markers[id]);
            delete markers[id];
            
            userCount--;
            updateStatus('users-online', userCount);
        }
    });
    
    // Request geolocation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit('send-location', { latitude, longitude });
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