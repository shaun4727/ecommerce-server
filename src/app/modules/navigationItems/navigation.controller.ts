import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { NavigationService } from "./navigation.service";





const navigationCreation = catchAsync(async (req: Request, res: Response) => {

    const result = await NavigationService.createNavigation(
    req.body
    );


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Menu created successfully!',
    data: result,
  });
});

const navigationUpdateController = catchAsync(async (req: Request, res: Response) => {

    // const result = await NavigationService.createNavigation(
    // req.body
    // );
    console.log(req.body);

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: 'Menu updated successfully!',
//     data: result,
//   });
});


const getNavigationMenusController = catchAsync(async (req: Request, res: Response) => {

    const result = await NavigationService.getNavigationMenuService();


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Menu retrieved successfully!',
    data: result,
  });
});


const deleteNavigationMenusController = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    await NavigationService.deleteNavigationMenuService(id);


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Menu deleted successfully!',
    data: '',
  });
});

export const NavigationController = {
    navigationCreation,
    getNavigationMenusController,
    deleteNavigationMenusController,
    navigationUpdateController
}
