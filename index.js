const config = require('./config.json');

const Server = require('./lib/server');
const Shutter = require('./lib/shutter');

const shutter = new Shutter(config.shutter);
shutter.init()
    .then(() => Server.init(config))
    .then(() => {
        Server.on('action', ({ action }) => shutter.execute(action));
    })
;
