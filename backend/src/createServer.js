const config = require("config");
const Koa = require("koa");

const {getLogger, initializeLogger} = require("./core/logging");
const installRest = require("./rest/");
const {initializeData, shutdownData} = require("./data");
const installMiddleware = require("./core/installMiddlewares");

const PORT = config.get("port");
const LOG_LEVEL = config.get("logging.level");
const LOG_DISABLED = config.get("logging.disabled");
const NODE_ENV = config.get("env");

module.exports = async function createServer() {
    initializeLogger({
        level: LOG_LEVEL,
        disabled: LOG_DISABLED,
        defaultMeta: {NODE_ENV},
    });

    await initializeData();

    const app = new Koa();

    installMiddleware(app);

    installRest(app);

    return {
        getApp() {
            return app;
        },
        start() {
            return new Promise((resolve) => {
                app.listen(PORT, () => {
                    getLogger().info(`🚀 Server listening on http://localhost:${PORT}`);
                    resolve();
                });
            });
        },
        async stop() {
            app.removeAllListeners();
            await shutdownData();
            getLogger().info("Goodbye!");
        },
    };
};
