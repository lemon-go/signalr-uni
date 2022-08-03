JavaScript and TypeScript clients(compatible with [DCloud/uni-app](https://uniapp.dcloud.io/) and [Wechat Miniprogram](https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/SocketTask.html) platform) for SignalR for ASP.NET Core and Azure SignalR Service.

## Installation

```bash
npm install signalr-uni
```

## Usage

See the [SignalR Documentation](https://docs.microsoft.com/aspnet/core/signalr) at docs.microsoft.com for documentation on the latest release. [API Reference Documentation](https://docs.microsoft.com/javascript/api/%40aspnet/signalr/?view=signalr-js-latest) is also available on docs.microsoft.com.

For documentation on using this client with Azure SignalR Service and Azure Functions, see the [SignalR Service serverless developer guide](https://docs.microsoft.com/azure/azure-signalr/signalr-concept-serverless-development-config).

### Wechat Miniprogram
To use the client in a MP(Wechat) application, install the package to your `node_modules` folder and use `import { /*MODULE NAME*/ } from 'signalr-uni'` or `require('signalr-uni')` to load the module (Remember to build NPM).


### UniApp

To use the client in a uni application, install the package to your `node_modules` folder and use `import { /*MODULE NAME*/ } from 'signalr-uni'` to load the module.
### Browser

To use the client in a browser, copy `*.js` files from the `dist/browser` folder to your script folder include on your page using the `<script>` tag.

### WebWorker

To use the client in a webworker, copy `*.js` files from the `dist/webworker` folder to your script folder include on your webworker using the `importScripts` function. Note that webworker SignalR hub connection supports only absolute path to a SignalR hub.

### Node.js

To use the client in a NodeJS application, install the package to your `node_modules` folder and use `require('@microsoft/signalr')` to load the module. The object returned by `require('@microsoft/signalr')` has the same members as the global `signalR` object (when used in a browser).

### Example (UniApp)

```javascript
import { HubConnectionBuilder, LogLevel } from 'signalr-uni';

const connection = new HubConnectionBuilder()
    .withUrl("https://example.com/signalr/chat")
    .withAutomaticReconnect([0, 2000, 4000, 8000, 10000, 30000, 60000])
    .configureLogging(LogLevel.Debug)
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));
```

### Example (Browser)

```javascript
let connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));
```

### Example (WebWorker)

```javascript
importScripts('signalr.js');

let connection = new signalR.HubConnectionBuilder()
    .withUrl("https://example.com/signalr/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));

```

### Example (NodeJS)

```javascript
// Use `@microsoft/signalr` instead of `signalr-uni` in a NodeJS application.
const signalR = require("@microsoft/signalr");

let connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));
```
