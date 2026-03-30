"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = roleMiddleware;
function roleMiddleware(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Acesso negado" });
        }
        next();
    };
}
