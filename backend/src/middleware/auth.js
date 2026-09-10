const jsonwebtoken = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Login required" });
    }

    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid token, login again" });
        }

        req.user = {
            userId: decoded.userId ?? decoded.id,
            id: decoded.userId ?? decoded.id,
            role: decoded.role,
        };

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Login required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
    }

    return next();
};

const doctorAuthorize = authorize("doctor");
const receptionAuthorize = authorize("reception");

module.exports = {
    authenticate,
    authorize,
    doctorAuthorize,
    receptionAuthorize,
};