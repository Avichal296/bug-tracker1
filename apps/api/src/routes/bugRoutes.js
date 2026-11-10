import { Router } from 'express';
import {
  createBug,
  createUploadUrl,
  deleteBug,
  getBug,
  listBugs,
  updateBug,
} from '../controllers/bugController.js';
import { authenticate } from '../middleware/authenticate.js';

export const bugRoutes = Router();

bugRoutes.use(authenticate);
bugRoutes.post('/upload-url', createUploadUrl);
bugRoutes.post('/', createBug);
bugRoutes.get('/', listBugs);
bugRoutes.get('/:id', getBug);
bugRoutes.put('/:id', updateBug);
bugRoutes.delete('/:id', deleteBug);
