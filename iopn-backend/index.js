"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const listener_1 = require("./listener/listener");
// after socket init
(0, listener_1.startListener)(io);
