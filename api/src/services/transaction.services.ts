import { createTransactionController } from "../controllers/transaction.controller";
import { TransactionTypeEnum } from "../enums/transaction.enum";
import TransactionModel from "../models/transaction.model";
import { NotFoundException } from "../utils/app-error";
import { calculateNextOccurrence } from "../utils/helper";
import { CreateTransactionType, UpdateTransactionType } from "../validators/transaction.validator";

export const createTransactionService = async (body : CreateTransactionType, userId : string) => {
    let nextRecurringDate: Date | null = null;
    const currentDate = new Date()

    if (body.isRecurring && body.recurringInterval) {
        const calulatedDate = calculateNextOccurrence(
            body.date,
            body.recurringInterval
        );

        nextRecurringDate = calulatedDate < currentDate ? calculateNextOccurrence(
            currentDate, body.recurringInterval
        ) : calulatedDate
    }

    const transaction = await TransactionModel.create({
        ...body,
        userId,
        category: body.category,
        amount: Number(body.amount),
        isRecurring: body.isRecurring || false,
        recurringInterval: body.recurringInterval || null,
        nextRecurringDate,
        lastProcessed: null
    });

    return transaction
}

export const getAllTransactionService = async (userId: string, filters: {
        keyword: string | undefined,
        type?: keyof typeof TransactionTypeEnum | undefined,
        recurringStatus?: "RECURRING" | "NON_RECURRING" | undefined;
    },
    pagination: {
        pageSize: number;
        pageNumber: number;
    }
) => {
    const { keyword, type, recurringStatus } = filters;

    const filterConditions: Record<string, any> = {
        userId,
    };

    if(keyword) {
        filterConditions.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { category: { $regex: keyword, $options: "i" } },
        ];
    }

    if (type) {
        filterConditions.type = type;
    }

    if (recurringStatus) {
        if (recurringStatus === "RECURRING") {
            filterConditions.isRecurring = true;
        } else if (recurringStatus === "NON_RECURRING") {
            filterConditions.isRecurring = false;
        }
    }

    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [transations, totalCount] = await Promise.all([
        TransactionModel.find(filterConditions)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 }),
        TransactionModel.countDocuments(filterConditions),
    ]);

     const totalPages = Math.ceil(totalCount / pageSize);

    return {
        transations,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};

export const getTransactionByIdService = async (userId: string, transactionId: string) => {
    const transaction = await TransactionModel.findOne({
        _id: transactionId,
        userId,
    });
    if (!transaction) throw new NotFoundException("Transaction not found");

    return transaction;
}

export const duplicateTransactionService = async (userId : string, transactionId: string) => {
    const transaction = await TransactionModel.findOne({
        _id: transactionId,
        userId,
    });
    if (!transaction) throw new NotFoundException("Transaction not found");

    const { _id, createdAt, updatedAt, isRecurring, recurringInterval, nextRecurringDate, ...transactionData } = transaction.toObject();

    console.log(transactionData);
    

    const duplicatedTransaction = await TransactionModel.create(
        {
            ...transactionData,
            title: `Duplicate - ${transaction.title}`,
            description: transaction.description
                ? `${transaction.description} (Duplicate)`
                : "Duplicated transaction",
        }
    );

    return duplicatedTransaction;
}

export const updateTransactionService = async (userId : string, transactionId: string, body : UpdateTransactionType) => {
    const existingTransaction = await TransactionModel.findOne({
        _id: transactionId,
        userId,
    });
    if (!existingTransaction) throw new NotFoundException("Transaction not found");

    const now = new Date();
    const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;

    const date =
        body.date !== undefined ? new Date(body.date) : existingTransaction.date;

    const recurringInterval =
        body.recurringInterval || existingTransaction.recurringInterval;

    let nextRecurringDate: Date | undefined;

    if (isRecurring && recurringInterval) {
        const calulatedDate = calculateNextOccurrence(date, recurringInterval);

        nextRecurringDate =
            calulatedDate < now
                ? calculateNextOccurrence(now, recurringInterval)
                : calulatedDate;
    }

    const updatedTransaction = {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.type && { type: body.type }),
        ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
        ...(body.amount !== undefined && { amount: Number(body.amount) }),
        date,
        isRecurring,
        recurringInterval,
        nextRecurringDate,
    }

    await existingTransaction.set(updatedTransaction);
    await existingTransaction.save();

    return existingTransaction;
}
