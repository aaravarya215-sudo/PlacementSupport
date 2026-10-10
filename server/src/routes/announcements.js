import express from 'express';
import { AnnouncementDB, DriveDB, AuditLogDB } from '../db/db.js';

const router = express.Router();

// GET all announcements
router.get('/', (req, res) => {
  try {
    const list = AnnouncementDB.getAll();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE announcement (TPO broadcast)
router.post('/', (req, res) => {
  try {
    const { title, message, category, priority, driveId, companyName, postedBy } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }

    const announcement = AnnouncementDB.create({
      title,
      message,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      driveId: driveId || null,
      companyName: companyName || null,
      postedBy: postedBy || 'Dr. Rajesh Sharma, Head TPO'
    });

    AuditLogDB.log('ANNOUNCEMENT_POSTED', {
      announcementId: announcement.id,
      title: announcement.title,
      category: announcement.category,
      reason: 'TPO broadcast published to portal replace WhatsApp notification'
    });

    res.status(201).json({ success: true, data: announcement, message: 'Broadcast published successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE announcement
router.delete('/:id', (req, res) => {
  try {
    AnnouncementDB.delete(req.params.id);
    res.json({ success: true, message: 'Announcement removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
