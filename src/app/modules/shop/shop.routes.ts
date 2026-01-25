import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';
import { ShopController } from './shop.controller';
import { parseBody } from '../../middleware/bodyParser';
import { multerUpload } from '../../config/multer.config';
import validateRequest from '../../middleware/validateRequest';
import { ShopValidation } from './shop.validation';


const router = Router();

router.get(
    '/my-shop',
    auth(UserRole.ADMIN,UserRole.USER),
    ShopController.getMyShop
)

router.post(
    '/',
    auth(UserRole.ADMIN),
    multerUpload.single('logo'),
    parseBody,
    validateRequest(ShopValidation.createShopValidation),
    ShopController.createShop
)

router.put(
    '/',
    auth(UserRole.ADMIN),
    multerUpload.single('logo'),
    parseBody,
    validateRequest(ShopValidation.createShopValidation),
    ShopController.updateShop
)

export const ShopRoutes = router;
