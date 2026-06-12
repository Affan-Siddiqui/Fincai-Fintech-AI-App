

import { Router } from "express";
import { 
    bulkDeleteTransactionController, 
    bulkTransactionController, 
    createTransactionController,
    deleteTransactionController,
    duplicateTransactionController,
    getAllTransactionController,
    getTransactionByIdController, 
        updateTransactionController
} from "../controllers/transaction.controller";


const transactionRoute = Router();

transactionRoute.post("/create", createTransactionController);
transactionRoute.get("/all", getAllTransactionController);
transactionRoute.get("/:id", getTransactionByIdController);

transactionRoute.post("/duplicate/:id", duplicateTransactionController);
transactionRoute.put("/update/:id", updateTransactionController);
transactionRoute.post("/bulk", bulkTransactionController);

transactionRoute.delete("/delete/:id", deleteTransactionController);
transactionRoute.delete("/bulk-delete", bulkDeleteTransactionController);


export default transactionRoute;