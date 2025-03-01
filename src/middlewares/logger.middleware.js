import logger from "../lib/logger.js";

export const loggerMiddleware = async (req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        date: new Date().toDateString(),
        message: "Request received"
    });
    next();
};
