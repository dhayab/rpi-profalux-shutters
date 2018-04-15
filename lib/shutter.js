const debug = require('debug')('Profalux-Shutter');
const gpio = (() => {
    try {
        return require('rpi-gpio');
    } catch(e) {
        return require('./fake-gpio');
    }
})();

const SHUTTER_PRESS_DURATION = 500;

class Shutter {
    constructor({ name, pins } = {}) {
        this.name = name || 'Shutter';
        this.pins = pins;
    }

    _initPin({ name, pin }) {
        return new Promise((resolve, reject) => {
            debug(`+ GPIO configuration for ${name.toUpperCase()} (${pin})...`);
            gpio.setup(pin, gpio.DIR_OUT, (error) => {
                if (error) {
                    reject({ name, pin, error });
                } else {
                    gpio.write(pin, name.toLowerCase() === 'common', (error) => {
                        if (error) {
                            debug(`! GPIO configuration for ${name.toUpperCase()} failed!`);
                            reject({ name, pin, error });
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }

    init() {
        debug(`Initializing shutter ${this.name}...`);
        return new Promise((resolve, reject) => {
            Promise
                .all(Object.keys(this.pins).map((name) => this._initPin({ name, pin: this.pins[name] })))
                .then(resolve)
                .catch((error) => reject(error))
            ;
        });
    }

    execute(action) {
        return new Promise((resolve, reject) => {
            const allowedActions = Object.keys(this.pins).filter((pin) => pin !== 'common');
            const requestedAction = action.toLowerCase();

            if (!allowedActions.includes(requestedAction)) {
                reject(`Action ${action} not recognized`);
                throw new Error(`Action ${action} not recognized`);
            }

            debug(`- Executing action ${requestedAction.toUpperCase()} on shutter ${this.name}...`);
            gpio.write(this.pins[requestedAction], true, (error) => {
                if (error) {
                    reject({ action: requestedAction, error });
                    throw new Error(error);
                } else {
                    setTimeout(() => gpio.write(this.pins[requestedAction], false), SHUTTER_PRESS_DURATION);
                    resolve();
                }
            });
        });
    }
}

module.exports = Shutter;
