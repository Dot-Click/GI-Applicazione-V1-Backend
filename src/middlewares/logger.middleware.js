import logger from "../lib/logger.js";

export const loggerMiddleware = async (req, res, next) => {
    let oldJson = res.json; 
    let responseBody;
    const startHrTime = process.hrtime();
    
    res.json = function (data) {
      responseBody = data;
      return oldJson.apply(res, arguments);
    };

  res.on("finish", () => {
      const elapsedHrTime = process.hrtime(startHrTime);
      const elapsedMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(3);
    if (res.statusCode >= 400) {
      logger.error({
        method: req.method,
        url: req.url,
        date: new Date().toDateString(),
        message: responseBody?.message || "Unknown error",
        duration: elapsedMs
      });
    } else {
      logger.info({
        method: req.method,
        url: req.url,
        date: new Date().toDateString(),
        message: responseBody?.message || "Request received",
        duration: elapsedMs
      });
    }
  });
  next();
};
