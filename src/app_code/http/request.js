/**
 * Http request object
 */

export default class HttpRequest {

    create(url, timeout, headers, body) {
        let request = {};
        request["url"] = url;
        request["timeout"] = timeout;
        request["headers"] = headers;
        request["data"] = body;

        return request;
    }
}