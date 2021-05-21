import { WebSocketConstructor } from "./Polyfills";

type UniSocketTask = (UniApp.SocketTask & { readyState: number }) | null;

/**
 * 兼容 Uni app 平台的 WebSocket 连接实现。
 * @param url
 * @param protocols
 * @param options
 * @author Fred Yuan
 * @version 0.1.0
 * @see uni-doc https://uniapp.dcloud.io/api/request/websocket
 *              https://github.com/dcloudio/uni-app/blob/master/src/core/service/api/network/socket.js
 */
export const UniWebSocket: WebSocketConstructor =  class UniSocket implements WebSocket {
    public get url() { return this._url; }
    public binaryType: BinaryType = "blob";
    public get bufferedAmount() { return 0; }
    public get extensions() { return ""; }
    public get protocol() { return ""; }
    public get readyState() {
        if (this._socket) {
            return this._socket.readyState;
        }
        return UniSocket.CLOSED;
    }
    public get CLOSED() { return 3; }
    public get CLOSING() { return 2; }
    public get OPEN() { return 1; }
    public get CONNECTING() { return 0; }

    // tslint:disable-next-line:variable-name
    private _url: string = "";
    // tslint:disable-next-line:variable-name
    private _socket: UniSocketTask = null;

    constructor(url: string, protocols?: string | string[], options?: any) {
        const self = this;
        self._url = url;
        // tslint:disable-next-line:variable-name
        let _protocols: string[] | undefined;
        if (typeof protocols === "string") {
            _protocols = [protocols];
        } else if (Array.isArray(protocols)) {
            _protocols = protocols;
        }

        const header = { "Content-Type": "application/json" };
        const connectOption: UniApp.ConnectSocketOption = {
            url,
            header,
            method: "GET",
            protocols: _protocols,
            success(res) {
                console.log("[UniWebSocket] uni.connectSocket invoke success.", res);
                self._socket = socket;
            },
            fail(err) {
                console.error("[UniWebSocket] uni.connectSocket invoke faild.", err);
            },
        };
        if (typeof options === "object") {
            if (typeof options.header === "object") {
                connectOption.header = { ...header, ...options.header };
            }
            if (typeof options.method === "string") {
                connectOption.method = options.method.toUpperCase();
            }
            if (typeof options.protocols === "string") {
                if (!connectOption.protocols) {
                    connectOption.protocols = [options.protocols];
                } else {
                    connectOption.protocols.push(options.protocols);
                }
            } else if (Array.isArray(options.protocols)) {
                if (!connectOption.protocols) {
                    connectOption.protocols = options.protocols;
                } else {
                    connectOption.protocols.push(...options.protocols);
                }
            }
        }

        const socket = uni.connectSocket(connectOption) as UniSocketTask;
        socket!.onOpen(() => {
            if (self.onopen) {
                self.onopen(new Event("open"));
            }
        });
        socket!.onClose(() => {
            if (self.onclose) {
                self.onclose(new CloseEvent("close", {
                    /** Warn: incorrect */
                    wasClean: true,
                    code: 1000,
                }));
            }
        });
        socket!.onError(() => {
            if (self.onerror) {
                self.onerror(new Event("error"));
            }
        });
        socket!.onMessage((result) => {
            if (self.onmessage) {
                self.onmessage(new MessageEvent("message", { data: result.data }));
            }
        });
    }

    public onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    public onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    public onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    public onopen: ((this: WebSocket, ev: Event) => any) | null = null;

    // tslint:disable-next-line:variable-name
    public addEventListener<K extends keyof WebSocketEventMap>(_type: K, _listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, _options?: boolean | AddEventListenerOptions): void {
        /** empty-implements */
    }
    // public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    // tslint:disable-next-line:variable-name
    public removeEventListener<K extends keyof WebSocketEventMap>(_type: K, _listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, _options?: boolean | EventListenerOptions): void {
        /** empty-implements */
    }
    // public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    // tslint:disable-next-line:variable-name
    public dispatchEvent(_event: Event): boolean {
        /** empty-implements */
        return false;
    }

    public close(code?: number, reason?: string): void {
        if (this._socket) {
            this._socket.close({ code, reason });
        }
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        data = data as (string | ArrayBuffer);
        if (this._socket) {
            this._socket.send({ data });
        }
    }

    public static CLOSED = 3;
    public static CLOSING = 2;
    public static OPEN = 1;
    public static CONNECTING = 0;
};
