/**
 * Http service
 * Class for making http requests
 */

export default class HttpService {

    /**
     * Get request
     * @param url
     * @param callback
     */
    get(url, callback) {
        fetch(url,{
            method: 'GET'
        }).then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson);
            callback(responseJson);
        }).catch(error => {
            console.log('Http Error:', error);
            callback(null);
        });
    }

    /**
     * Get with headers request
     * @param url
     * @param headers
     * @param callback
     */
    getWithHeaders(url, timeout, headers) {
        return Promise.race([
            fetch(url,{method: 'GET',headers: headers}).then((response) => {
                return response;
            }).catch(error => {return {status: 0}}),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), timeout)
            )
        ]);
    }

    /**
     * Get request that calls a failure callback if request takes too long
     * @param url
     * @param callback
     * @param callback
     * @param timeout
     */
    getWithTimeout(url, timeout) {
        return Promise.race([
            fetch(url, {method: 'GET'}).then((response) => {
                return response;
            }).catch((e) => {return {status: 0}}),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), timeout)
            )
        ]);
    }
/**
     * Get request
     * @param url
     * @param callback
     */
    getQuery(url, callback) {
        fetch(url,{
            method: 'GET'
        }).then((response) => response.text())
        .then((responseJson) => {
            console.log(responseJson);
            callback(responseJson);
        }).catch(error => {
            console.log('Http Error:', error);
            callback(null);
        });
    }

    /**
     * Post with headers request
     * @param url
     * @param headers
     * @param body
     * @param callback
     */
    postIt(url, headers, body, callback) {
        let ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if(ajax.readyState === 4) {
                callback(ajax);
            }
        };
        ajax.open("post", url, true);
        ajax.timeout = global.configuration.get("postTimeout");
        ajax.send(global.functions.replace("username={0}&password={1}",
            [global.configuration.get("waveguide_gateway_username"), global.configuration.get("waveguide_gateway_password")]));
    }

    /**
     * Ajax Get with headers request
     * @param url
     * @param callback
     */
    getIt(url, callback) {
        let ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (ajax && ajax.status === 200) {
                return ajax;
            }
            else {
                console.log(ajax);
                return null;
            }
        };
        ajax.open("get", url, true);
        ajax.setRequestHeader('Content-Type', 'text/html', );
        ajax.send(global.functions.replace("username={0}&password={1}",
            [global.configuration.get("waveguide_gateway_username"), global.configuration.get("waveguide_gateway_password")]));
    }

    /**
     * Post request
     * @param url
     * @param headers
     * @param payload
     * @param callback
     */
    post(url, headers, payload, callback) {
        let body = JSON.stringify(payload);
        fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        }).then(function(data){ callback(data)
        }).catch(error => function() {console.error('Http Error:', error)});
    }
}
