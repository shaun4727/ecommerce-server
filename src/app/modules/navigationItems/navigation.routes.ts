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

router.post(
  '/update-nav-menu',
  auth(UserRole.ADMIN, UserRole.USER),
  NavigationController.navigationUpdateController
);


router.get(
  '/get-menu',
  NavigationController.getNavigationMenusController
);


router.get(
  '/get-menu-not-dashboard',
  NavigationController.getNavigationMenus
);

router.delete(
  '/delete-menu/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  NavigationController.deleteNavigationMenusController
);

export const NavigationRoutes = router;