import logger from "../lib/logger.js";

export const loggerMiddleware = async (req, res, next) => {
    let oldJson = res.json; 
    let responseBody;
  
    res.json = function (data) {
      responseBody = data;
      return oldJson.apply(res, arguments);
    };

  res.on("finish", () => {
    if (res.statusCode >= 400) {
      logger.error({
        method: req.method,
        url: req.url,
        date: new Date().toDateString(),
        message: responseBody?.message || "Unknown error",
      });
    } else {
      logger.info({
        method: req.method,
        url: req.url,
        date: new Date().toDateString(),
        message: responseBody?.message || "Request received",
      });
    }
  });
  next();
};
