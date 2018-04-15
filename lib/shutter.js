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
    constructor({ name, travel, pins } = {}) {
        this.name = name || 'Shutter';
        this.pins = pins;
        this.travel = travel || 0;
        this.currentPosition = 0;
        this.currentState = Shutter.STATE_IDLE;
        this.targetPosition = 0;
        this._tick = undefined;
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

    _setTargetPosition(targetPosition) {
        debug('Setting targetPosition at %d', targetPosition);
        this.targetPosition = targetPosition;
        if (!this.travel) {
            debug('Current position is %d', this.targetPosition);
            this.currentPosition = this.targetPosition;
            return;
        }

        clearInterval(this._tick);
        this._tick = setInterval(() => {
            const delta = (1000 * 100 / this.travel) * (this.currentPosition < this.targetPosition ? 1 : -1);
            this.currentPosition = Math.min(Math.max(0, this.currentPosition + delta), 100);
            this.currentState = delta > 0 ? Shutter.STATE_OPENING : Shutter.STATE_CLOSING;

            if (
                (delta > 0 && this.currentPosition >= this.targetPosition) ||
                (delta < 0 && this.currentPosition <= this.targetPosition)
            ) {
                this.stop();
            }
        }, 1000);
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

    _execute(action, targetPosition) {
        return new Promise((resolve, reject) => {
            gpio.write(this.pins[action], true, (error) => {
                if (error) {
                    return reject({ action, error });
                } else {
                    if (action !== 'stop') {
                        this._setTargetPosition(targetPosition);
                    }
    
                    setTimeout(() => gpio.write(this.pins[action], false), SHUTTER_PRESS_DURATION);
                    resolve();
                }
            });
        });
    }

    update(targetPosition) {
        return new Promise((resolve, reject) => {
            if (isNaN(targetPosition) || targetPosition < 0 || targetPosition > 100) {
                return reject('Target position is out of bounds.');
            }

            const action = this.currentPosition < targetPosition ? 'up' : 'down';
            debug('- Executing action %s on shutter %s...', action.toUpperCase(), this.name);
            return this._execute(action, targetPosition);
        });
    }

    stop() {
        clearInterval(this._tick);
        this.currentState = Shutter.STATE_IDLE;
        return this._execute('stop');
    }
}

Shutter.STATE_CLOSING = 0;
Shutter.STATE_OPENING = 1;
Shutter.STATE_IDLE = 2;

module.exports = Shutter;
