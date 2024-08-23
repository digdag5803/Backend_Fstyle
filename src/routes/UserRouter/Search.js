import exxpress from 'express';
import SearchController from '../../controllers/User/SearchController.js';

const router = exxpress.Router();

router.get('/products', SearchController.SearchProductByName);
export default router;