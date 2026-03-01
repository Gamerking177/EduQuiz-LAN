const historyService = require("./history.service");
const { sendSuccess, sendError } = require("../../utils/response");

// --- GET HOST HISTORY ---
exports.getHostHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) return sendError(res, "Device ID is required", 400);

    // Service ko call kiya
    const history = await historyService.getHostHistoryFromDB(deviceId);
    
    sendSuccess(res, "Host history fetched successfully", history);
  } catch (error) { 
    sendError(res, error.message, 500); 
  }
};

// --- GET PLAYER HISTORY ---
exports.getPlayerHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) return sendError(res, "Device ID is required", 400);

    // Service ko call kiya
    const history = await historyService.getPlayerHistoryFromDB(deviceId);
    
    sendSuccess(res, "Player history fetched successfully", history);
  } catch (error) { 
    sendError(res, error.message, 500); 
  }
};