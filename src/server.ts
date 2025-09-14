
import { Config } from "./config/index";
import logger from "./config/logger";
import app from "./app";

const startServer = () => {
    try {
        app.listen(Config.PORT, () => {
            // console.log(`Auth Service is running on port ${Config.PORT}`);
            logger.info(`Auth Service is running on port ${Config.PORT}`);
        });
    } catch (error) {
        console.error("Error starting auth service:", error);
        process.exit(1);
    }
};

startServer();