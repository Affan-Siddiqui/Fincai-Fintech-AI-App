

import { Router } from "express";
import { createTransactionController, duplicateTransactionController, getAllTransactionController, getTransactionByIdController, updateTransactionController } from "../controllers/transaction.controller";


const transactionRoute = Router();

transactionRoute.post("/create", createTransactionController);
transactionRoute.get("/all", getAllTransactionController);
transactionRoute.get("/:id", getTransactionByIdController);

transactionRoute.put("/duplicate/:id", duplicateTransactionController);
transactionRoute.put("/update/:id", updateTransactionController);


export default transactionRoute;