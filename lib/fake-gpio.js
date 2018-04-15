const debug = require('debug')('Profalux-Fake-GPIO');

class FakeGpio {
    constructor() {
        this.DIR_OUT = 'out';
    }

    setup(pin, direction, onSetup) {
        debug('set up pin %d', pin);
        onSetup && onSetup();
    }

    write(pin, value, cb) {
        debug('writing pin %d with value %s', pin, value);
        cb && cb();
    }
}

module.exports = new FakeGpio();
