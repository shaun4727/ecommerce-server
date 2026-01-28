import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";





const navigationCreation = catchAsync(async (req: Request, res: Response) => {

    const menuData = req.body;
    console.log(menuData);


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
      message: 'Mega Menu created successfully!',
    data: menuData,
  });
});

export const NavigationController = {
    navigationCreation
}
