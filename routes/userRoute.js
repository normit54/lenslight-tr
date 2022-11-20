import express from "express";
import * as userController from "../controllers/userController.js"
import * as authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

router.route("/register").post(userController.createUser); //localhost/users/register
router.route("/login").post(userController.loginUser);
//cookies kullanmaya baslanınca gerekti
router
    .route("/dashboard")
    .get(authMiddleware.authenticateToken ,userController.getDashboardPage);
router
    .route("/")
    .get(authMiddleware.authenticateToken, userController.getAllUsers);
router
    .route("/:id")
    .get(authMiddleware.authenticateToken, userController.getAUser);
router
    .route("/:id/follow")
    .put(authMiddleware.authenticateToken, userController.follow);
router
    .route("/:id/unfollow")
    .put(authMiddleware.authenticateToken, userController.unFollow);

export default router;