export class Interface {
    searchBar = {};
    resultsInterface = {};
    errorTimeoutId = null;

    #map = null;
    #marker = null;

    constructor() {
        this.searchBar = {
            input: document.getElementById('searchInput'),
            button: document.getElementById('searchButton'),
        };

        this.resultsInterface = {
            ipAddress : document.getElementById('ipAddress'),
            location: document.getElementById('location'),
            timezone: document.getElementById('timezone'),
            isp: document.getElementById('ISP'),
        }
    }

    get searchTrigger() {
        return this.searchBar.button;
    }

    get searchValue() {
        return this.searchBar.input.value;
    }

    setSearchBarError() {
        this.searchBar.input.classList.add('error');

        if (this.errorTimeoutId) {
            clearTimeout(this.errorTimeoutId);
        }

        this.errorTimeoutId = setTimeout(() => {
            this.searchBar.input.classList.remove('error');
        }, 2000);
    }

    removeSearchBarError() {
        this.searchBar.input.classList.remove('error');

        if (this.errorTimeoutId) {
            clearTimeout(this.errorTimeoutId);
        }
    }

    disableTrigger() {
        this.searchBar.button.disabled = true;
        this.searchBar.input.disabled = true;
    }

    enabledTrigger() {
        this.searchBar.button.disabled = false;
        this.searchBar.input.disabled = false;
    }

    showResults(data) {
        const filteredData = this.#getDataForUI(data);
        
        for (const elementName in this.resultsInterface) {
            const textData = filteredData[elementName];
            const element = this.resultsInterface[elementName];
            element.innerText = textData;
        }

        const { lat, lng } = data.location;
        this.#updateMap(lat, lng);
    }

    #getDataForUI(data) {
        const {ip, location, isp} = data;

        return {
            ipAddress : ip,
            location : `${location.city}, ${location.region} ${location.postalCode}`,
            timezone : `UTC ${location.timezone}`,
            isp : data.isp
        }
    }

    #updateMap(lat, lng) {
        const zoomLevel = 13; 

        if (!this.#map) {
            this.#map = L.map('map').setView([lat, lng], zoomLevel);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.#map);


            this.#marker = L.marker([lat, lng]).addTo(this.#map);
        } else {
            this.#map.flyTo([lat, lng], zoomLevel); 
            this.#marker.setLatLng([lat, lng]);
        }
    }
}