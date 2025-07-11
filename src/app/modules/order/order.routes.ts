import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../user/user.interface';

const router = Router();

// Define routes
router.get(
    '/my-shop-orders',
    auth(UserRole.USER,UserRole.ADMIN),
    OrderController.getMyShopOrders
);

router.get(
    '/my-orders',
    auth(UserRole.USER,UserRole.ADMIN),
    OrderController.getMyOrders
);

router.get(
    '/:orderId',
    auth(UserRole.USER,UserRole.ADMIN),
    OrderController.getOrderDetails
);

router.post(
    '/',
    auth(UserRole.USER,UserRole.ADMIN),
    OrderController.createOrder
)
router.post(
    '/assign-agent',
    auth(UserRole.ADMIN),
    OrderController.assignOrder
)

router.patch(
    '/:orderId/status',
    auth(UserRole.USER,UserRole.ADMIN),
    OrderController.changeOrderStatus
)

export const OrderRoutes = router;
