
import { Config } from "./config/index";
import logger from "./config/logger";
import app from "./app";
import { AppDataSource } from "./config/data-source";

const startServer = async () => {
    try {
        await AppDataSource.initialize()
        logger.info("Data Source has been initialized!");
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