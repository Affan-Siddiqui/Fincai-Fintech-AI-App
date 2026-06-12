import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middleware/asyncHandler.middleware";
import { createTransactionSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validator";
import { Request, Response } from "express";
import { createTransactionService, duplicateTransactionService, getAllTransactionService, getTransactionByIdService, updateTransactionService } from "../services/transaction.services";
import { TransactionTypeEnum } from "../enums/transaction.enum";


export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id?.toString();

    if (!userId) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            message: "User ID is missing",
        });
    }

    const transaction = await createTransactionService(body, userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Transacton created successfully",
      transaction,
    });
  }
);


export const getAllTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "User ID is missing",
      });
    }

    const filters = {
      keyword: req.query.keyword as string | undefined,
      type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
      recurringStatus: req.query.recurringStatus as
        | "RECURRING"
        | "NON_RECURRING"
        | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    console.log(userId, filters, pagination);
    
    const result = await getAllTransactionService(userId, filters, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction fetched successfully",
      ...result,
    });
  }
)

export const getTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "User ID is missing",
      });
    }

    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await getTransactionByIdService(userId, transactionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction fetched successfully",
      transaction,
    });
  }
);

export const duplicateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString(); 

    if (!userId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "User ID is missing",
      });
    }  

    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await duplicateTransactionService(
      userId,
      transactionId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction duplicated successfully",
      data: transaction,
    });
  }
)

export const updateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "User ID is missing",
      });
    }  

    const transactionId = transactionIdSchema.parse(req.params.id);
    const body = updateTransactionSchema.parse(req.body);

    const transaction = await updateTransactionService(
      userId,
      transactionId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction updated successfully",
      data: transaction,
    });

  }
)