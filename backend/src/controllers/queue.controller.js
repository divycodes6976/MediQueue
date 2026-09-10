

const {callNext,completeToken}= require("../services/queue.service");


// department nikalo req se 
// services call

const callNextPatient = async (req, res) => {
    try{
        const department = (req.user?.department ?? "").trim().toUpperCase();
        if (!department) {
            return res.status(400).json({ message: "Department is required" });
        }

        const nextPatient = await callNext(department);
        if (!nextPatient) {
            return res.status(404).json({ message: "No patients in queue" });
        }
        return res.json({ message: "Next patient called", nextPatient });

    }catch(err){
        const message = err instanceof Error ? err.message : "Unknown internal server error";
        res.status(500).json({ message: "Failed to call next patient", error: message });
    }
    
};




const completeOrSkip = async (req, res) => {
    try {
      const { tokenId, action } = req.body;

       const normalizedTokenId = Number(tokenId);

         if (!Number.isInteger(normalizedTokenId) || normalizedTokenId <= 0) {
    return res.status(400).json({
        message: "Valid tokenId is required"
    });
          }

       if (action !== "DONE" && action !== "SKIPPED") {
    return res.status(400).json({
        message: "action must be DONE or SKIPPED"
    });
    }

   const result = await completeToken(
    normalizedTokenId,
    action
   );

   if (!result) {
    return res.status(404).json({
        message: "Token not found"
    });
  }

  res.json({
    success: true,
    result
    });
      }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown internal server error";
        res.status(500).json({ message: "Failed to complete token", error: message });
    }
};

module.exports={
    completeOrSkip,
    callNextPatient
}
