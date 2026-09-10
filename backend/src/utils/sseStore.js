"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = exports.removeClient = exports.addClient = void 0;
const clients = {};
const addClient = (dept, res) => {
    if (!clients[dept])
        clients[dept] = [];
    clients[dept].push({ res });
};
exports.addClient = addClient;
const removeClient = (dept, res) => {
    clients[dept] = (clients[dept] || []).filter((c) => c.res !== res);
};
exports.removeClient = removeClient;
const broadcast = (dept, data) => {
    (clients[dept] || []).forEach((c) => {
        c.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};
exports.broadcast = broadcast;
