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

// Workout Class
class Workout {
    date = new Date();
    // ID
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords; // [lat, long]
        this.distance = distance; // in kms
        this.duration = duration; // in min
    }
}

// Child classes: Running
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    // Calculate page
    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

// Child classes: Cycling
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    // Calc speed
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// App
class App {
    #map;
    #mapEvent;

    constructor() {
        this._getPosition();

        // ---------------------- //
        // // Event Listeners // //
        // ---------------------- //
        // Event Listener: Form submit event
        form.addEventListener('submit', this._newWorkout.bind(this));

        // Event Listener: Workout type change event
        inputType.addEventListener('change', this._toggleElevationField);
    }

    // Get users loacation
    _getPosition() {
        // check if users browser support Geolocation API & fetch user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                () => {
                    alert(`Could not fetch user's location!`);
                }
            );
        }
    }

    // Load Map
    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        // Leaflet JS library - Map
        this.#map = L.map('map').setView(coords, 13);

        // Map as per current location
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        // Click Event to add a new workout
        this.#map.on('click', this._showForm.bind(this));
    }

    // Show form
    _showForm(mapEv) {
        this.#mapEvent = mapEv;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    // New workout
    _newWorkout(e) {
        e.preventDefault();

        // Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
            '';

        // Display marker
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup',
                })
            )
            .setPopupContent('Workout')
            .openPopup();
    }
}

// Init App
const app = new App();
