

const { createToken } = require("../services/token.service");
const { getTokenTrackInfo } = require("../services/token.lookup.service");
const { notifyQueueUpdate } = require("../services/queue.service");

const getTokenTrack = async (req, res) => {
    try {
        const tokenNumber = String(req.params.tokenNumber ?? "").trim();
        if (!tokenNumber) {
            return res.status(400).json({ message: "tokenNumber is required" });
        }
        const info = await getTokenTrackInfo(tokenNumber);
        if (!info) {
            return res.status(404).json({ message: "Token not found" });
        }
        return res.json(info);
    }
    catch (error) {
        console.error("getTokenTrack error:", error);
        const message = error instanceof Error ? error.message : "Unknown internal server error";
        return res.status(500).json({ message: "Failed to load token", error: message });
    }
    
};

const generateToken = async (req, res) => {
   try{
    const { patientId, department, priority } = req.body;
    if (!patientId || !department || !priority) {
        return res.status(400).json({ message: "patientId, department, and priority are required" });
    }

    const token = await createToken(patientId, department, priority);
      if(!token){
        return res.status(500).json({ message: "Failed to generate token" });
      }
      await notifyQueueUpdate(department);
        return res.status(201).json({ message: "Token generated successfully", token });

   }catch(err){
    return res.status(500).json({ message: "Failed to generate token", error: err.message });
   }
};


module.exports={
    getTokenTrack,
    generateToken
}
