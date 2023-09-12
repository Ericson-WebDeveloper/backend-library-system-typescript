import { Router } from "express";
import {
  RegisterBookBorrowed,
  LoansList,
  LoansFindId,
  UpdateLoanDueDate,
  SendEmailNotifLoanReturn,
  LoansListUser,
  LoanDashBoardDatas,
} from "../controller/LoanController";
import { bookBorrowedValidate } from "../helper/Validation";
import { handleErrors } from "../helper/Validator-Error";

import { protect } from "../middleware/authmiddleware";
import { roleprotect } from "../middleware/roleMiddleware";
const router = Router();

// check if user has currenlty borrowed this
router.post(
  "/create-borrowed/request",
  protect,
  roleprotect(["Librarian"]),
  bookBorrowedValidate,
  handleErrors,
  RegisterBookBorrowed
);
router.get(
  "/list", 
  protect, 
  roleprotect(["Librarian"]), 
  LoansList
);
router.get(
  "/:id_loan",
  protect,
  roleprotect(["Librarian", "User"]),
  LoansFindId
);
router.put(
  "/update/:id_loan",
  protect,
  roleprotect(["Librarian"]),
  UpdateLoanDueDate
);
router.put(
  "/send-email/:id_loan",
  protect,
  roleprotect(["Librarian"]),
  SendEmailNotifLoanReturn
);
router.get(
  "/loans-user/:user_id",
  protect,
  roleprotect(["User", "Librarian"]),
  LoansListUser
);
router.get(
  `/loan-dashboard/counts`,
  protect,
  roleprotect(["Librarian"]),
  LoanDashBoardDatas
);


export default router;
