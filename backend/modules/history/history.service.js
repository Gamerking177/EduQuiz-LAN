const History = require("./history.model");

// Host ki history nikalne ka function
exports.getHostHistoryFromDB = async (deviceId) => {
    return await History.find({ hostDeviceId: deviceId, status: "ended" })
        .sort({ createdAt: -1 })
        .select("settings.title settings.category createdAt players");
};

// Player ki history nikalne ka function
exports.getPlayerHistoryFromDB = async (deviceId) => {
    return await History.find({ "players.deviceId": deviceId, status: "ended" })
        .sort({ createdAt: -1 })
        .select("settings.title createdAt players");
};