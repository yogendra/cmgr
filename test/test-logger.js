
import logger from '../lib/logger.js';

logger.log('silly', "127.0.0.1 - there's no place like home");
logger.log('debug', "127.0.0.1 - there's no place like home");
logger.log('verbose', "127.0.0.1 - there's no place like home");
logger.log('info', "127.0.0.1 - there's no place like home");
logger.log('warn', "127.0.0.1 - there's no place like home");
logger.log('error', "127.0.0.1 - there's no place like home");
logger.info("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");


let place = { home: "127.0.0.1"}
logger.log('silly', "%s - there's no place like home", place.home);
logger.log('debug', "%s - there's no place like home", place.home);
logger.log('verbose', "%s - there's no place like home", place.home);
logger.log('info', "%s - there's no place like home", place.home);
logger.log('warn', "%s - there's no place like home", place.home);
logger.log('error', "%s - there's no place like home", place.home);
logger.info("%s - there's no place like home", place.home);
logger.warn("%s - there's no place like home", place.home);
logger.error("%s - there's no place like home", place.home);
