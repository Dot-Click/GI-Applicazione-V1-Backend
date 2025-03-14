import winston from "winston";

let alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all:true
    }),
    winston.format.label({
        label:'[LOGGER]'
    }),
    winston.format.printf(
        info => ` ${info.label}  ${info.level} : ${info.message}: ${info.method} : ${info.url}`
    )
);

const logger = winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.Console({format: winston.format.combine(winston.format.colorize(),alignColorsAndTime)})
  ],
});

export default logger;
