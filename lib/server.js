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

    const init = ({ port, webApp }) => {
        return new Promise((resolve) => {
            const listener = app.listen(port || SERVER_DEFAULT_PORT, () => {
                debug(`Server started and available on http://0.0.0.0:${listener.address().port}`);
                debug(`+ Web interface is ${webApp ? 'ENABLED' : 'DISABLED'}`);

                webApp && app.use(express.static(__dirname + '/../interface'));

                resolve();
            });

            app.get('/shutter/get/position', (req, res) => {
                debug('GET /shutter/get/position');
                emit('getPosition', (position) => res.send('' + position));
            });

            app.get('/shutter/get/state', (req, res) => {
                debug('GET /shutter/get/state');
                emit('getState', (state) => res.send('' + state));
            });

            app.put('/shutter/set/:position', (req, res) => {
                debug(`PUT /shutter/set/${req.params.position}`);
                emit('setPosition', { targetPosition: req.params.position });
                res.sendStatus(204);
            });

            app.put('/shutter/stop', (req, res) => {
                debug('PUT /shutter/stop');
                emit('stop');
                res.sendStatus(204);
            });
        });
    };
    
    return { init, on };
})();
