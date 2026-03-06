export class Searcher {
    BASEURL= '/api/';
    FIELDS = '?fields=status,regionName,city,district,zip,lat,lon,offset,isp,query';
    savedResults = {};
    searchHistory = new Set();

    isValidSearch(searchValue) {
        if (typeof searchValue !== 'string') return false;

        const ip = searchValue.trim();

        const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    async start() {
        const url = 'https://ipapi.co/json/';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const result = await response.json();
            const {isValid , data } = this.#startHelper(result);

            if (isValid === false) {
                throw new Error("Datos de la API inválidos o incompletos");
            }

            this.#saveResult(data.ipAddress, data);
            return {
                success: true,
                data: data
            }
        } catch (error) {
            return await this.search('');
        }
    }
    
    #startHelper({latitude, longitude, ip, city, region, postal, utc_offset, org}) {
        if(typeof latitude !== 'number' || typeof longitude !== 'number'){
            return { isValid : false , data : {}};
        };

        const offsetHours = utc_offset ? Number(utc_offset.slice(0, 3)): null;

        return {
            isValid: true,
            data: {
                ipAddress: ip,
                location: `${city}, ${region} ${postal}`,
                timezone: `UTC ${offsetHours}:00`,
                isp: org,
                lat: latitude,
                lon: longitude,
            }
        };
    }

    async search(ipAddress) {
        
        if (this.searchHistory.has(ipAddress)) {
            return {
                success: true,
                data: this.savedResults[ipAddress]
            };
        }
        
        try {
            const url = `${this.BASEURL}${ipAddress}${this.FIELDS}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const result = await response.json();
            const {isValid , data } = this.#validResponse(result);

            if (isValid === false) {
                throw new Error("Datos de la API inválidos o incompletos");
            }

            this.#saveResult(ipAddress, data);
            return {
                success: true,
                data: data
            }
        } catch (error) {
            return {
                success: false,
                data: {},
            }
        }
    }

    #validResponse({lat, lon, query, city, regionName, zip, offset, isp}) {
        if(typeof lat !== 'number' || typeof lon !== 'number'){
            return { isValid : false , data : {}};
        };

        return {
            isValid: true,
            data: {
                ipAddress: query,
                location: `${city}, ${regionName} ${zip}`,
                timezone: this.#secondOffsetToHours(offset),
                isp: isp,
                lat: lat,
                lon: lon,
            }
        };
    }

    #secondOffsetToHours(offset) {
        const head = 'UTC ';
        const tail = ':00'


        if(offset === 0) return head + '00' + tail;

        const sign  = offset > 0 ? '+' : '-';
        const hours = String(offset / 3600);

        return head + sign + hours + tail;
    }

    #saveResult(ipAddress, result) {
        this.savedResults[result['ip']] = result;
        this.searchHistory.add(ipAddress);
    }
};
