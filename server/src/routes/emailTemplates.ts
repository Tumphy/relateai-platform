import express from 'express';
import { 
  getTemplates, 
  getTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getDefaultTemplates,
  previewTemplate
} from '../controllers/emailTemplate.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all templates (with filtering)
router.get('/', getTemplates);

// Get default templates for each category
router.get('/defaults', getDefaultTemplates);

// Preview a template with variables replaced
router.post('/:templateId/preview', previewTemplate);

// Get a specific template
router.get('/:id', getTemplateById);

// Create a new template
router.post('/', createTemplate);

// Update a template
router.put('/:id', updateTemplate);

// Delete a template
router.delete('/:id', deleteTemplate);

export default router;
