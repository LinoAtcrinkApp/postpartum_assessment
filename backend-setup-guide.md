# Backend Service Setup Guide

This guide outlines how to set up a backend service to handle sending assessment results via email and storing data in Excel.

## Option 1: Using a Node.js Express Server

### 1. Set Up Basic Express Server

```bash
# Install required packages
npm init -y
npm install express cors body-parser nodemailer dotenv exceljs
```

### 2. Create Server File (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Function to save data to Excel
async function saveToExcel(userData) {
  try {
    // Configure Excel file path - you can change this location as needed
    const excelDir = process.env.EXCEL_DIR || __dirname; // Use env variable or default to server directory
    const excelFilePath = path.join(excelDir, 'assessment_data.xlsx');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }
    
    let workbook;
    
    // Check if file exists, if not create a new one
    if (fs.existsSync(excelFilePath)) {
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(excelFilePath);
    } else {
      workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('User Data');
      
      // Define header row - only storing name, email, and phone as requested
      worksheet.columns = [
        { header: 'Date', key: 'date' },
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Phone', key: 'phone' }
      ];
    }
    
    const worksheet = workbook.getWorksheet('User Data');
    
    // Prepare row data - only basic user information
    const rowData = {
      date: new Date().toISOString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    };
    
    // Add row to worksheet
    worksheet.addRow(rowData);
    
    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    console.log('User data saved to Excel file successfully');
    return true;
  } catch (error) {
    console.error('Error saving to Excel:', error);
    return false;
  }
}

// Email sending endpoint
app.post('/api/send-assessment-results', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      to,
      subject,
      stressLevel,
      score,
      maxScore,
      percentage,
      message,
      responses,
      consentToContact
    } = req.body;

    // Configure email transporter (using environment variables)
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Create HTML content for email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h1 style="color: #614ad3; text-align: center;">Your Stress Assessment Results</h1>
        
        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #614ad3; margin-top: 0;">${stressLevel}</h2>
          <div style="background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; margin: 15px 0;">
            <div style="background: linear-gradient(90deg, #5b61f3, #614ad3); height: 100%; width: ${percentage}%;"></div>
          </div>
          <p style="font-size: 18px;">${message}</p>
          <p style="color: #666;">Score: ${score} out of ${maxScore}</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h3>Ready for the next step?</h3>
          <p>Take control of your well-being today:</p>
          <a href="https://www.crink.app/therapy" style="display: block; background-color: #614ad3; color: white; text-decoration: none; text-align: center; padding: 12px; border-radius: 8px; font-weight: bold;">Start Therapy Now</a>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: htmlContent
    });

    // Save data to Excel
    await saveToExcel({
      name,
      email,
      phone,
      consentToContact,
      score,
      stressLevel,
      percentage,
      responses
    });

    // If consent given, store in your marketing database
    if (consentToContact) {
      // Add code to store in your CRM/marketing database
      console.log(`User ${to} has consented to marketing`);
    }

    res.status(200).json({ success: true, message: 'Email sent successfully and data saved to Excel' });
  } catch (error) {
    console.error('Error in assessment processing:', error);
    res.status(500).json({ success: false, message: 'Failed to process assessment data' });
  }
});

// Endpoint for saving user data when assessment starts
app.post('/api/save-user-data', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and phone number are all required' 
      });
    }

    // Save basic user data to Excel
    const saved = await saveToExcel({ name, email, phone });

    if (saved) {
      res.status(200).json({ 
        success: true, 
        message: 'User data saved to Excel successfully' 
      });
    } else {
      throw new Error('Failed to save to Excel');
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save user data' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. Set Up Environment Variables (.env)

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Crink Support <support@crink.app>"
PORT=3000
```

Note: For Gmail, you'll need to use an App Password rather than your regular password.

## Option 2: Using a Serverless Function (AWS Lambda)

If you prefer a serverless approach, you can use AWS Lambda with API Gateway:

1. Create a Lambda function with similar logic to the Express route
2. Set up API Gateway to trigger the Lambda function
3. Deploy and use the API Gateway URL as your endpoint

## Option 3: Using an Email Service API Directly

Services like SendGrid or Mailchimp allow you to send emails directly from frontend code using their APIs, though this approach is less secure as you'd need to include API keys in frontend code.

### Example Frontend Update Using SendGrid

```javascript
// First: npm install @sendgrid/mail

async function sendResultsEmail(email, consent) {
  const emailData = {
    // ... existing email data preparation ...
  };
  
  // Send directly to SendGrid API
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_SENDGRID_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }]
        }],
        from: { email: 'support@crink.app', name: 'Crink Support' },
        subject: emailData.subject,
        content: [{
          type: 'text/html',
          value: `<h1>${emailData.stressLevel}</h1><p>${emailData.message}</p>...`
        }]
      })
    });
    
    if (!response.ok) throw new Error('Failed to send email');
    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
```

## Update Frontend Code

In your `script.js`, update the fetch call in the `sendResultsEmail` function to use your new endpoint:

```javascript
// Replace the commented fetch code with:
return fetch('http://localhost:3000/api/send-assessment-results', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(emailData)
}).then(response => {
  if (!response.ok) throw new Error('Failed to send email');
  return response.json();
});
```

## Testing Your Integration

1. Start your backend server
2. Open your assessment in the browser
3. Complete the assessment and enter an email address
4. Check that the email is received with correct formatting
5. Test the "Start Therapy Now" button redirects correctly
