const log4js = require('log4js');

log4js.configure({
    appenders: {
        errorLogs: { type: 'file', filename: './logs/error.log' },
        infoLogs: { type: 'file', filename: './logs/info.log' },
        traceLogs: { type: 'file', filename: './logs/trace.log' },
        debugLogs: { type: 'file', filename: './logs/debug.log' },
        console: { type: 'console' }
    },
    categories: {
        error: { appenders: ['console', 'errorLogs'], level: 'error' },
        info: { appenders: ['console', 'infoLogs'], level: 'info' },
        trace: { appenders: ['traceLogs'], level: 'trace' },
        debug: { appenders: ['console', 'debugLogs'], level: 'debug' },
        default: { appenders: ['console', 'errorLogs'], level: 'trace' }
    }
});


const error = log4js.getLogger('error');
const trace = log4js.getLogger('trace');
const info = log4js.getLogger('info');
const debug = log4js.getLogger('debug');

exports.trace = trace
exports.error = error
exports.info = info
exports.debug = debug
