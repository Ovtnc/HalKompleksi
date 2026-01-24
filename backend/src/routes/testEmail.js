const express = require('express');
const router = express.Router();
const { sendPasswordResetEmail } = require('../utils/emailService');

// Test email endpoint (sadece development için)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email adresi gereklidir' });
    }
    
    console.log('🧪 Testing email service with email:', email);
    const result = await sendPasswordResetEmail(email, 'test-token-1234567890');
    
    if (result.success) {
      res.json({ 
        success: true,
        message: 'Test e-postası başarıyla gönderildi',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error || 'E-posta gönderilemedi',
        details: result
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
