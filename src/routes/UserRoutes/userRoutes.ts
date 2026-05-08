import { Router } from "express";
import { JWTMiddleware } from "../../middleware/JWTMiddleware.ts";
import registration from "../../controller/User/registration.ts";
import updateUser from "../../controller/User/updateUser.ts";
import login from "../../controller/User/login.ts";
import logout from "../../controller/User/logout.ts";
const router = Router();

router.post("/register", registration);
router.post("/login", login);
router.post("/logout",JWTMiddleware, logout);
router.put("/update", JWTMiddleware, updateUser);
export default router;