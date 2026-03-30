"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const DeliveryController_1 = require("../controllers/DeliveryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const UserController_1 = require("../controllers/UserController");
const RecipientController_1 = require("../controllers/RecipientController");
const routes = (0, express_1.Router)();
routes.post("/login", AuthController_1.AuthController.login);
// Deliveries
routes.post("/deliveries", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), DeliveryController_1.DeliveryController.create);
routes.get("/deliveries", authMiddleware_1.authMiddleware, DeliveryController_1.DeliveryController.list);
routes.get("/deliveries/:id", authMiddleware_1.authMiddleware, DeliveryController_1.DeliveryController.getById);
routes.put("/deliveries/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), DeliveryController_1.DeliveryController.update);
routes.delete("/deliveries/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), DeliveryController_1.DeliveryController.delete);
routes.put("/deliveries/:id/status", authMiddleware_1.authMiddleware, DeliveryController_1.DeliveryController.updateStatus);
routes.get("/deliveries/nearby", authMiddleware_1.authMiddleware, DeliveryController_1.DeliveryController.listNearby);
routes.get("/my-deliveries", authMiddleware_1.authMiddleware, DeliveryController_1.DeliveryController.listMyDeliveries);
// Deliverymen
routes.post("/deliverymen", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), UserController_1.UserController.create);
routes.get("/deliverymen", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), UserController_1.UserController.list);
routes.get("/deliverymen/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), UserController_1.UserController.getById);
routes.put("/deliverymen/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), UserController_1.UserController.update);
routes.delete("/deliverymen/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), UserController_1.UserController.delete);
// Recipients
routes.post("/recipients", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), RecipientController_1.RecipientController.create);
routes.get("/recipients", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), RecipientController_1.RecipientController.list);
routes.get("/recipients/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), RecipientController_1.RecipientController.getById);
routes.put("/recipients/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), RecipientController_1.RecipientController.update);
routes.delete("/recipients/:id", authMiddleware_1.authMiddleware, (0, roleMiddleware_1.roleMiddleware)("admin"), RecipientController_1.RecipientController.delete);
// Change password
routes.put("/users/:id/password", authMiddleware_1.authMiddleware, UserController_1.UserController.changePassword);
exports.default = routes;
