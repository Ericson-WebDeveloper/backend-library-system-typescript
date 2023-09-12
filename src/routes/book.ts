import {Router} from 'express';
import { handleErrors } from '../helper/Validator-Error';
import { protect } from '../middleware/authmiddleware';
import { bookRegister, bookUpdatingValidate } from '../helper/Validation';
import {RegisterBook, BooksAll, GetBook, UpdateBook, SearchBooks, BooksDashBoard, RemoveBook} from '../controller/BookController';
import { roleprotect } from '../middleware/roleMiddleware';

const router = Router();

router.post(`/add-new`, protect, roleprotect(['Librarian']), bookRegister, handleErrors, RegisterBook);
router.get(`/all-books`, protect, roleprotect(['Librarian', 'User']), BooksAll);
router.get(`/book-:id`, protect, roleprotect(['Librarian']), GetBook);
router.put(`/book-update/:id`, protect, roleprotect(['Librarian']), bookUpdatingValidate, handleErrors, UpdateBook);
router.delete(`/book-remove/:id`, protect, roleprotect(['Librarian']), UpdateBook);
router.post(`/book-search/details`, protect, roleprotect(['Librarian']), SearchBooks);
// delete books condition need all copies return
router.delete(`/delete/:id_book`, protect, roleprotect(['Librarian']), RemoveBook);


router.get(`/book-dashboard/counts`, protect, roleprotect(['Librarian']), BooksDashBoard);

export default router;