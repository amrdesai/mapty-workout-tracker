'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Get users loacation
if (navigator.geolocation) {
    // check if users browser support Geolocation API & fetch user location
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const coords = [latitude, longitude];

            // Leaflet JS library - Map
            const map = L.map('map').setView(coords, 13);

            L.tileLayer(
                'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }
            ).addTo(map);

            L.marker(coords)
                .addTo(map)
                .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                .openPopup();
        },
        () => {
            alert(`Could not fetch user's location`);
        }
    );
}
