import { WebSocketConstructor } from "./Polyfills";

type WxSocketTask = (WechatMiniprogram.SocketTask & { readyState: number });

/**
 * 兼容微信小程序平台的 WebSocket 连接实现。
 * @author Fred Yuan
 * @see doc https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/SocketTask.html
 */
export const WxWebSocket: WebSocketConstructor =  class WxSocket implements WebSocket {
    public get url() { return this._url; }
    public binaryType: BinaryType = "blob";
    public get bufferedAmount() { return 0; }
    public get extensions() { return ""; }
    public get protocol() { return ""; }
    public get readyState() {
        return this._socket.readyState;
    }
    public get CLOSED() { return 3; }
    public get CLOSING() { return 2; }
    public get OPEN() { return 1; }
    public get CONNECTING() { return 0; }

    // tslint:disable-next-line:variable-name
    private _url: string;
    // tslint:disable-next-line:variable-name
    private _socket: WxSocketTask;

    constructor(url: string, protocols?: string | string[], options?: any) {
        this._url = url;
        // tslint:disable-next-line:variable-name
        let _protocols: string[] | undefined;
        if (typeof protocols === "string") {
            _protocols = [protocols];
        } else if (Array.isArray(protocols)) {
            _protocols = protocols;
        }

        const header = { "Content-Type": "application/json" };
        const connectOption: WechatMiniprogram.ConnectSocketOption = {
            url,
            header,
            protocols: _protocols,
            success(res) {
                console.log("[WxWebSocket] wx.connectSocket invoke success.", res);
            },
            fail(err) {
                console.error("[WxWebSocket] wx.connectSocket invoke faild.", err);
            },
        };
        if (typeof options === "object") {
            if (typeof options.header === "object") {
                connectOption.header = { ...header, ...options.header };
            } else if (typeof options.headers === "object") {
                connectOption.header = { ...header, ...options.headers };
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

        const socket = wx.connectSocket(connectOption) as WxSocketTask;
        this._socket = socket;
        socket.onOpen(() => {
            if (this.onopen) {
                const ev: Event = { type: "open" } as Event;
                this.onopen(ev);
                // this.onopen(new Event("open"));
            }
        });
        socket.onClose((reason) => {
            if (this.onclose) {
                const ev = { ...reason, type: "close" } as CloseEvent;
                this.onclose(ev);
                // this.onclose(new CloseEvent("close", {
                //     /** Warn: incorrect */
                //     wasClean: true,
                //     code: 1000,
                // }));
            }
        });
        socket.onError(() => {
            if (this.onerror) {
                const ev = { type: "error" } as Event;
                this.onerror(ev);
                // this.onerror(new Event("error"));
            }
        });
        socket.onMessage((result) => {
            if (this.onmessage) {
                const ev = { type: "message", data: result.data } as MessageEvent<string | ArrayBuffer>;
                this.onmessage(ev);
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
        throw new Error("WxWebSocket do not implement 'addEventListener' method.");
    }
    // public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    // tslint:disable-next-line:variable-name
    public removeEventListener<K extends keyof WebSocketEventMap>(_type: K, _listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, _options?: boolean | EventListenerOptions): void {
        /** empty-implements */
        throw new Error("WxWebSocket do not implement 'removeEventListener' method.");
    }
    // public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    // tslint:disable-next-line:variable-name
    public dispatchEvent(_event: Event): boolean {
        /** empty-implements */
        throw new Error("WxWebSocket do not implement 'dispatchEvent' method.");
        // return false;
    }

    public close(code?: number, reason?: string): void {
        this._socket.close({ code, reason });
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        data = data as (string | ArrayBuffer);
        this._socket.send({ data });
    }

    public static CLOSED = 3;
    public static CLOSING = 2;
    public static OPEN = 1;
    public static CONNECTING = 0;
};
