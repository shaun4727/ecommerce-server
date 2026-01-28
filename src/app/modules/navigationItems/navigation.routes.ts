import { Router } from "express";
import { UserRole } from '../user/user.interface';
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { createNavigationValidationSchema } from './navigation.validation';
import { NavigationController } from './navigation.controller';


const router = Router();





router.post(
  '/create-menu',
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(createNavigationValidationSchema),
  NavigationController.navigationCreation
);

export const NavigationRoutes = router;