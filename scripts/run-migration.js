const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

function runMigration() {
    // ✅ Check what .env.migration file exists and where
    const envPath1 = path.join(__dirname, ".env.migration");
    const envPath2 = path.join(__dirname, "../.env.migration");
    const envPath3 = path.join(__dirname, "../../.env.migration");

    console.log("=== ENV FILE CHECK ===");
    console.log(`Checking: ${envPath1} → exists: ${fs.existsSync(envPath1)}`);
    console.log(`Checking: ${envPath2} → exists: ${fs.existsSync(envPath2)}`);
    console.log(`Checking: ${envPath3} → exists: ${fs.existsSync(envPath3)}`);

    // ✅ Load the env file manually and log the DB credentials
    require("dotenv").config({ path: envPath1 });
    console.log("\n=== CREDENTIALS BEING USED ===");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PORT:", process.env.DB_PORT);
    console.log("DB_USERNAME:", process.env.DB_USERNAME);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "✅ set: " + process.env.DB_PASSWORD : "❌ NOT SET");
    console.log("DB_NAME:", process.env.DB_NAME);
    console.log("==============================\n");

    exec(
        "npx cross-env NODE_ENV=migration npm run migration:run -- -d src/config/data-source.ts",
        { shell: true },
        (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing migration: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`Error output: ${stderr}`);
                return;
            }

            console.log(`Migration output: ${stdout}`);
        }
    );
}

runMigration();