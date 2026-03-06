
export class Searcher {
    BASEURL = 'https://geo.ipify.org/api/v2/country,city?apiKey=';
    APIKEY = 'at_pfV1E3zfTgVAuGUz9Y056jjg0SQiC';
    savedResults = {};
    searchHistory = new Set();

    constructor() {

    }

    isValidSearch(searchValue) {
        if (typeof searchValue !== 'string') return false;

        const ip = searchValue.trim();

        const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    async search(ipAddress) {
        if (this.searchHistory.has(ipAddress)) {
            return {
                success: true,
                data: this.savedResults[ipAddress]
            };
        }

        try {
            const url = `${this.BASEURL}${this.APIKEY}&ipAddress=${ipAddress}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            this.#saveResult(ipAddress, result);
            return {
                success: true,
                data: result
            }
        } catch (error) {
            return {
                success: false,
                data: {},
            }
        }
    }

    #saveResult(ipAddress, result) {
        this.savedResults[result['ip']] = result;
        this.searchHistory.add(ipAddress);
    }
};
