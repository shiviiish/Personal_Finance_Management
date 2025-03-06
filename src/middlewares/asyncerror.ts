import { Request, Response, NextFunction } from "express";

export const catchAsyncError = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return fn(req, res, next).catch(next);
  };
