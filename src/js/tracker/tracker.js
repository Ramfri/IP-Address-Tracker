import { Searcher } from "./searcher.js";
import { Interface } from "./interface.js";

export class Tracker {
    searcher = null;
    interface = null;
    lastSearch = null;

    constructor() {
        this.searcher = new Searcher();
        this.interface = new Interface();
    }

    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    async start() {
        const handleSearch = async () => {
            const searchValue = this.interface.searchValue;

            if (searchValue === this.lastSearch) return; 
            
            if (this.searcher.isValidSearch(searchValue) === false) {
                return this.interface.setSearchBarError();
            }

            this.interface.disableTrigger();

            const { success, data } = await this.searcher.search(searchValue);



            if(success === false) {
                this.interface.setSearchBarError();
                this.interface.enabledTrigger();
                return;
            };

            this.lastSearch = searchValue;
            this.interface.removeSearchBarError();
            this.interface.showResults(data);            
            this.interface.enabledTrigger();
        };

        const debouncedSearch = this.debounce(handleSearch, 500);
        this.interface.searchTrigger.addEventListener('click', debouncedSearch);

        
        const { success, data } = await this.searcher.start('');
        if(success) {
            this.lastSearch = data.ip; 
            this.interface.showResults(data);
        }
    }
}
