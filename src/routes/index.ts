import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { DeliveryController } from "../controllers/DeliveryController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { UserController } from "../controllers/UserController";
import { RecipientController } from "../controllers/RecipientController";

const routes = Router();

routes.post("/login", AuthController.login);
routes.post("/register", AuthController.register);

// Deliveries
routes.post(
  "/deliveries",
  authMiddleware,
  roleMiddleware("admin"),
  DeliveryController.create,
);
routes.get("/deliveries", authMiddleware, DeliveryController.list);
routes.get("/deliveries/:id", authMiddleware, DeliveryController.getById);
routes.put(
  "/deliveries/:id",
  authMiddleware,
  roleMiddleware("admin"),
  DeliveryController.update,
);
routes.delete(
  "/deliveries/:id",
  authMiddleware,
  roleMiddleware("admin"),
  DeliveryController.delete,
);
routes.put(
  "/deliveries/:id/status",
  authMiddleware,
  DeliveryController.updateStatus,
);
routes.get("/deliveries/nearby", authMiddleware, DeliveryController.listNearby);
routes.get(
  "/my-deliveries",
  authMiddleware,
  DeliveryController.listMyDeliveries,
);

// Deliverymen
routes.post(
  "/deliverymen",
  authMiddleware,
  roleMiddleware("admin"),
  UserController.create,
);
routes.get(
  "/deliverymen",
  authMiddleware,
  roleMiddleware("admin"),
  UserController.list,
);
routes.get(
  "/deliverymen/:id",
  authMiddleware,
  roleMiddleware("admin"),
  UserController.getById,
);
routes.put(
  "/deliverymen/:id",
  authMiddleware,
  roleMiddleware("admin"),
  UserController.update,
);
routes.delete(
  "/deliverymen/:id",
  authMiddleware,
  roleMiddleware("admin"),
  UserController.delete,
);

// Recipients
routes.post(
  "/recipients",
  authMiddleware,
  roleMiddleware("admin"),
  RecipientController.create,
);
routes.get(
  "/recipients",
  authMiddleware,
  roleMiddleware("admin"),
  RecipientController.list,
);
routes.get(
  "/recipients/:id",
  authMiddleware,
  roleMiddleware("admin"),
  RecipientController.getById,
);
routes.put(
  "/recipients/:id",
  authMiddleware,
  roleMiddleware("admin"),
  RecipientController.update,
);
routes.delete(
  "/recipients/:id",
  authMiddleware,
  roleMiddleware("admin"),
  RecipientController.delete,
);

// Change password
routes.put(
  "/users/:id/password",
  authMiddleware,
  UserController.changePassword,
);

export default routes;
