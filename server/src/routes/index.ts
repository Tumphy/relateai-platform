import express from 'express';
import authRoutes from './auth';
import accountRoutes from './accounts';
import contactRoutes from './contacts';
import messageRoutes from './messages';
import researchRoutes from './research';
import emailRoutes from './email';
import emailTemplateRoutes from './emailTemplates';
import linkedinRoutes from './linkedin';

const router = express.Router();

// API health check
router.get('/', (req, res) => {
  res.json({ message: 'RelateAI API v1' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/accounts', accountRoutes);
router.use('/contacts', contactRoutes);
router.use('/messages', messageRoutes);
router.use('/research', researchRoutes);
router.use('/email', emailRoutes);
router.use('/email-templates', emailTemplateRoutes);
router.use('/linkedin', linkedinRoutes);

export default router;