
export class Searcher {
    BASEURL = 'http://ip-api.com/json/';
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
            const url = `${this.BASEURL}${ipAddress}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();

            if (this.#validResponse(result) === false) {
                throw new Error("Datos de la API inválidos o incompletos");
            }

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

    #validResponse(result) {
        if (!result) return false;

        if (result.status !== "success") return false;

        if (!result.query || !result.city || !result.regionName || !result.zip || !result.timezone || !result.isp) {
            return false;
        }

        if (result.lat === undefined || result.lon === undefined) {
            return false;
        }

        return true;
    }

    #saveResult(ipAddress, result) {
        this.savedResults[result['ip']] = result;
        this.searchHistory.add(ipAddress);
    }
};
