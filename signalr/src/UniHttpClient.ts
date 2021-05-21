import { AbortError, HttpError, TimeoutError } from "./Errors";
import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { ILogger, LogLevel } from "./ILogger";

type RequestMethod = "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";

export class UniHttpClient extends HttpClient {
    private readonly logger: ILogger;

    constructor(logger: ILogger) {
        super();
        this.logger = logger;
    }

    public send(request: HttpRequest): Promise<HttpResponse> {
        // Check that abort was not signaled before calling send
        if (request.abortSignal && request.abortSignal.aborted) {
            return Promise.reject(new AbortError());
        }

        if (!request.method) {
            return Promise.reject(new Error("No method defined."));
        }
        if (!request.url) {
            return Promise.reject(new Error("No url defined."));
        }

        const self = this;

        return new Promise<HttpResponse>((resolve, reject) => {
            const conf: UniApp.RequestOptions = {
                url: request.url!,
                data: request.content,
                method: (request.method || "GET").toUpperCase() as RequestMethod,
                withCredentials: request.withCredentials === undefined ? true : request.withCredentials,
                header: {
                    // Tell auth middleware to 401 instead of redirecting
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/x-www-form-urlencoded",
                    ...(request.headers || {}),
                },
                responseType: request.responseType || "text",
                dataType: "text",
                timeout: request.timeout,
            };

            conf.success = ({ data, statusCode }) => {
                if (request.abortSignal) {
                    request.abortSignal.onabort = null;
                }
                if (statusCode >= 200 && statusCode < 300) {
                    const dataType = typeof data;
                    let dataString = "";
                    if (data instanceof ArrayBuffer) {
                        dataString = utf8ArrayToString(new Int32Array(data));
                    } else if (dataType !== "string" && dataType !== "undefined") {
                        dataString = JSON.stringify(data);
                    } else if (data) {
                        dataString = data + "";
                    }
                    resolve(new HttpResponse(statusCode, "OK", dataString));
                } else {
                    const errorMessage = `(UniHttpClient) Request success, but status code is ${ statusCode }`;
                    self.logger.log(LogLevel.Error, errorMessage);
                    reject(new HttpError(errorMessage, statusCode));
                }
            };
            conf.fail = ({ errMsg }) => {
                self.logger.log(LogLevel.Error, `(UniHttpClient) Request failed, message: ${ errMsg }.`);
                let err: Error;
                if ((errMsg + "").toUpperCase().indexOf("TIMEOUT") !== -1) {
                    err = new TimeoutError(errMsg);
                } else {
                    err = new HttpError(errMsg, -1);
                }
                reject(err);
            };

            if (request.abortSignal) {
                request.abortSignal.onabort = () => {
                    if (reqTask) {
                        reqTask.abort();
                    }
                    reject(new AbortError());
                };
            }
            const reqTask = uni.request(conf);
        });
    }
}

function utf8ArrayToString(array: ArrayLike<number>): string {
    let out = "";
    let i = 0;
    const len = array.length;
    let c: number;

    let char2: number;
    let char3: number;

    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}
