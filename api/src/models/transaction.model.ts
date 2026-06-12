import mongoose, { Document, Schema } from "mongoose";
import { PaymentMethodEnum, RecurringIntervalEnum, TransactionStatusEnum, TransactionTypeEnum } from "../enums/transaction.enum";
import { convertToCents, convertToDollarUnit } from "../utils/format-currency";


export interface TransactionDocument extends Document{
    userId : mongoose.Types.ObjectId;
    type : keyof typeof TransactionTypeEnum;
    title : string;
    amount : number;
    category: string;
    receiptUrl?: string | undefined;
    isRecurring: boolean; 
    recurringInterval?: keyof typeof RecurringIntervalEnum | null;
    nextRecurringDate: Date | null;
    lastProcessed?: Date | null;
    description?: string | undefined;
    date: Date;
    status: keyof typeof TransactionStatusEnum;
    paymentMethod: keyof typeof PaymentMethodEnum;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionTypeEnum),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertToDollarUnit(value),
    },

    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: Object.values(RecurringIntervalEnum),
      default: null,
    },
    nextRecurringDate: {
      type: Date,
      default: null,
    },
    lastProcessed: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatusEnum),
      default: TransactionStatusEnum.COMPLETED,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethodEnum),
      default: PaymentMethodEnum.CASH,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  transactionSchema
);

export default TransactionModel;

