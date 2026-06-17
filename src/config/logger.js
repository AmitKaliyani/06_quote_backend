import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const transports = [new winston.transports.Console()];

if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: "logs/app.log",
    })
  );

  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    })
  );
}

const logger = winston.createLogger({
  level: "info",

  format: isProduction
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        })
      ),

  transports,
});

export default logger;

//   transports: [
//     new transports.Console(),
//     new winston.transports.File({ filename: "src/logs/app.log" }),
//     new winston.transports.File({
//       filename: "src/logs/error.log",
//       level: "error",
//     }),
//   ],
