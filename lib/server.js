const debug = require('debug')('Profalux-Server');
const express = require('express');

const SERVER_DEFAULT_PORT = 19240;

module.exports = (() => {
    const listeners = {};
    const app = express();
    
    const emit = (eventName, ...args) => {
        if (listeners[eventName]) {
            listeners[eventName].forEach((callback) => callback(...args));
        }
    };

    const on = (eventName, callback) => {
        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }

        listeners[eventName].push(callback);
    };

    const init = ({ port }) => {
        return new Promise((resolve) => {
            const listener = app.listen(port || SERVER_DEFAULT_PORT, () => {
                debug(`Server started and available on http://0.0.0.0:${listener.address().port}`);
                resolve();
            });

            app.put('/shutter/:action', (req, res) => {
                debug(`PUT /shutter/${req.params.action}`);
                emit('action', { action: req.params.action });
                res.sendStatus(200);
            });
        });
    };
    
    return { init, on };
})();
