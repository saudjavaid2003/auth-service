import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        service: "auth-service"
    },
    transports: [
        new winston.transports.Console({
            level: "info",
            format: winston.format.json()
        })
    ]
});

export default logger; // Fixed export