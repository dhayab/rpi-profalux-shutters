
const argv = require('minimist')(process.argv.slice(2));
const config = ((configName) => {
    const configPath = require('path').join(process.cwd(), configName);
    if (!require('fs').existsSync(configPath)) {
        console.error(`Config file "${configPath}" could not be found.`); //eslint-disable-line no-console
        process.exit(127);
    }
    return require(configPath);
})(argv.config || 'config.json');

const Server = require('./lib/server');
const Shutter = require('./lib/shutter');

const shutter = new Shutter(config.shutter);
shutter.init()
    .then(() => Server.init(config))
    .then(() => {
        Server.on('action', ({ action }) => shutter.execute(action));
    })
;
