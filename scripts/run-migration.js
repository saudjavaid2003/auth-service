const { exec } = require("child_process");

function runMigration() {
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