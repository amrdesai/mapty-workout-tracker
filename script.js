'use strict';

// -------- //
// Classes //
// -------- //
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

    // ------- //
    // Methods //
    // ------- //

    // Set workout description
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // prettier-ignore
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

// Child classes: Running
class Running extends Workout {
    type = 'running';

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    // Calc speed
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// ------------------------- //
// Application Architecture
// ------------------------- //
const formEl = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// App
class App {
    #map;
    #mapEvent;
    #workouts = [];
    #zoomLevel = 13;

    constructor() {
        this._getPosition();
        // ---------------------- //
        // // Event Listeners // //
        // ---------------------- //
        // Event Listener: Form submit event
        formEl.addEventListener('submit', this._newWorkout.bind(this));

        // Event Listener: Workout type change event
        inputType.addEventListener('change', this._toggleElevationField);

        // Event Listener: Click on Workout item from the list
        containerWorkouts.addEventListener(
            'click',
            this._moveToPopup.bind(this)
        );
    }

    // ------- //
    // Methods //
    // ------- //
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

    // Method: Load Map
    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        // Leaflet JS library - Map
        this.#map = L.map('map').setView(coords, this.#zoomLevel);

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
        formEl.classList.remove('hidden');
        inputDistance.focus();
    }

    // Hide form
    _hideForm() {
        // Empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
            '';

        // Hide form from UI
        formEl.style.display = 'none';
        formEl.classList.add('hidden');
        setTimeout(() => (formEl.style.display = 'grid'), 1000);
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

        // Function: Validate inputs
        const validateInputs = (...inputs) =>
            inputs.every((input) => Number.isFinite(input));

        // Function: Validate inputs
        const allPositive = (...inputs) => inputs.every((input) => input > 0);

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // If workout is running object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            // Check if data is valid
            if (
                !validateInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return alert(`Input must be a positive number.`);

            // Create a running object & push to workouts array
            workout = new Running([lat, lng], distance, duration, cadence);
            this.#workouts.push(workout);
        }

        // If workout is cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            // Check if data is valid
            if (
                !validateInputs(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return alert(`Input must be a positive number.`);

            // Create a cycling object & push to workouts array
            workout = new Cycling([lat, lng], distance, duration, elevation);
            this.#workouts.push(workout);
        }

        // Render workout on map as marker
        this._renderWorkoutMarker(workout);

        // Render workout on list to UI
        this._renderWorkout(workout);

        // Hide form & clear input fields
        this._hideForm();
    }

    // Render workout marker
    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(
                `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
                    workout.description
                }`
            )
            .openPopup();
    }

    // Render workout to UI
    _renderWorkout(workout) {
        // prettier-ignore
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
            `;

        // Running
        if (workout.type === 'running') {
            // prettier-ignore
            html += `
                    <div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.pace.toFixed(1)}</span>
                        <span class="workout__unit">min/km</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">🦶🏼</span>
                        <span class="workout__value">${workout.cadence}</span>
                        <span class="workout__unit">spm</span>
                    </div>
                </li>
            `
        }

        // Cycling
        if (workout.type === 'cycling') {
            // prettier-ignore
            html += `
                    <div class="workout__details">
                        <span class="workout__icon">⚡️</span>
                        <span class="workout__value">${workout.speed.toFixed(1)}</span>
                        <span class="workout__unit">km/h</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon">⛰</span>
                        <span class="workout__value">${workout.elevationGain}</span>
                        <span class="workout__unit">m</span>
                    </div>
                </li>
                `
        }

        formEl.insertAdjacentHTML('afterend', html);
    }

    // Move to location in map
    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');
        // Guard clause
        if (!workoutEl) return;
        // Get workout data
        const workout = this.#workouts.find(
            (workout) => workout.id === workoutEl.dataset.id
        );
        // Set workout to center in map
        this.#map.setView(workout.coords, this.#zoomLevel, {
            animate: true,
            pan: { duration: 1 },
        });
    }
}

// Init App
const app = new App();
