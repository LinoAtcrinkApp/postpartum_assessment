// Google Apps Script to save assessment data to a Google Sheet

// This function is called when the web app receives a POST request
function doPost(e) {
  try {
    let payload;
    
    // Handle form-encoded data or direct JSON
    if (e.postData.type === "application/x-www-form-urlencoded") {
      // Form data from form submission
      if (e.parameter.payload) {
        payload = JSON.parse(e.parameter.payload);
      } else {
        throw new Error("Form data received but no payload parameter found");
      }
    } else {
      // Direct JSON payload
      payload = JSON.parse(e.postData.contents);
    }
    
    const data = payload.data;
    const sheetType = payload.sheetType;
    
    // Process data based on sheet type
    if (sheetType === 'user_data') {
      // Only basic user data from the skip path
      saveUserDataOnly(data);
    } else if (sheetType === 'complete_data') {
      // Save the complete data (includes user, assessment, and email data)
      saveCompleteData(data);
    } else {
      throw new Error('Unknown sheet type: ' + sheetType);
    }
    
    // Return success response and close the popup window if it was opened
    const htmlOutput = HtmlService.createHtmlOutput(
      '<html><body>' +
      '<p>Data saved successfully!</p>' +
      '<script>window.onload=function(){setTimeout(function(){window.close();},1000);}</script>' +
      '</body></html>'
    );
    
    return htmlOutput;
      
  } catch (error) {
    // Return error response
    const htmlOutput = HtmlService.createHtmlOutput(
      '<html><body>' +
      '<p>Error: ' + error.message + '</p>' +
      '<script>window.onload=function(){setTimeout(function(){window.close();},3000);}</script>' +
      '</body></html>'
    );
    
    return htmlOutput;
  }
}

// This function is needed to enable CORS
function doGet() {
  return HtmlService.createHtmlOutput(
    '<html><body>' +
    '<h3>The Google Apps Script is working correctly.</h3>' +
    '<p>This web app is designed to collect data from the Postpartum Assessment form.</p>' +
    '</body></html>'
  );
}

// Function to save all data types to a single sheet
function saveToSingleSheet(data, dataType) {
  // Get or create the single assessment data sheet
  const sheet = getOrCreateSheet('Postpartum Assessment Data');
  
  // Add headers if they don't exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Data Type',
      'Name',
      'Email',
      'Phone',
      'Profession',
      'Consent to Contact',
      'Score',
      'Max Score',
      'Assessment Level',
      'Percentage',
      'Message',
      'Email Status',
      'Response Data'
    ]);
  }
  
  // Create a base record with common fields
  let record = [
    data.timestamp || new Date().toISOString(),
    dataType,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.profession || '',
    (data.canContact || data.consentToContact) ? 'Yes' : 'No',
  ];
  
  // Add score-related fields if present
  if (dataType === 'assessment_data' && data.finalResults) {
    record.push(
      data.finalResults.score,
      data.finalResults.maxScore,
      data.finalResults.stressLevel,
      data.finalResults.percentage,
      data.finalResults.message
    );
  } else if (dataType === 'email_data') {
    record.push(
      data.score,
      data.maxScore,
      data.assessmentLevel,
      data.percentage,
      data.message,
      'Pending' // Email status initially pending
    );
  } else {
    // For user_data or other types, add empty values
    record.push('', '', '', '', '');
  }
  
  // Add response data as JSON string if present
  if (dataType === 'assessment_data' && data.assessmentResponses) {
    record.push(JSON.stringify(data.assessmentResponses));
  } else if (dataType === 'email_data' && data.responses) {
    record.push(JSON.stringify(data.responses));
  } else {
    record.push('');
  }
  
  // Append the row
  sheet.appendRow(record);
  
  // Return the row index for potential reference
  return sheet.getLastRow();
}

// Function to send email with assessment results
function sendEmail(data) {
  try {    
    // Create HTML email content
    const htmlBody = createEmailHtml(data);
    
    // Send the email
    GmailApp.sendEmail(
      data.to, 
      data.subject,
      "Your assessment results are attached in this email (requires HTML view).", // Plain text fallback
      { 
        htmlBody: htmlBody,
        name: "Crink Postpartum Assessment"
      }
    );
    
    // Update the email status in the sheet
    updateEmailStatus(data.email, 'Sent');
    
    return true;
  } catch (error) {
    console.error("Error sending email: " + error.message);
    return false;
  }
}

// Helper function to update email status
function updateEmailStatus(email, status) {
  const sheet = getOrCreateSheet('Postpartum Assessment Data');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Start from row 1 to include header
  for (let i = values.length - 1; i >= 1; i--) {
    // Look for the most recent email_data row for this email
    if (values[i][1] === 'email_data' && values[i][3] === email) {
      // Column L (index 11) is email status
      sheet.getRange(i + 1, 12).setValue(status);
      break;
    }
  }
}

// Helper function to get or create a sheet
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  return sheet;
}

// Helper function to create HTML email content
function createEmailHtml(data) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #614ad3; color: white; padding: 15px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .result { font-size: 24px; color: #614ad3; margin: 15px 0; }
          .score { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 15px 0; }
          .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Postpartum Assessment Results</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            ${data.profession ? `<p><strong>Profession:</strong> ${data.profession}</p>` : ''}
            <p>Thank you for completing the Crink Postpartum Assessment. Here are your results:</p>
            
            <div class="result">
              <strong>${data.assessmentLevel}</strong>
            </div>
            
            <p>${data.message}</p>
            
            <div class="score">
              <strong>Your Score:</strong> ${data.score} out of ${data.maxScore} (${data.percentage}%)
            </div>
            
            <p>If you'd like to discuss these results or explore postpartum support options, our team is here to help.</p>
            <p>Best regards,<br>The Crink Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${data.email} because you requested your assessment results.<br>
            Visit us at <a href="https://crink.app/therapy" target="_blank" style="color: #614ad3;">crink.app</a></p>

            ${data.consentToContact ? '<p>You have consented to be contacted by our team for follow-up.</p>' : ''}
          </div>
        </div>
      </body>
    </html>
  `;
}

// Function to save basic user data only (from skip path)
function saveUserDataOnly(data) {
  // Get or create the assessment data sheet  
  const sheet = getOrCreateSheet('Postpartum Assessment Data');
  
  // Add headers if they don't exist
  ensureHeadersExist(sheet);
  
  // Create a base record with user data only
  let record = [
    data.timestamp || new Date().toISOString(),
    'user_data_only', // Mark this as user data only (skip path)
    data.name || '',
    data.email || '',
    data.phone || '',
    data.canContact ? 'Yes' : 'No',
    '', '', '', '', '', '', '' // Empty fields for the assessment data
  ];
  
  // Append the row
  sheet.appendRow(record);
}

// Function to save complete data (user chose to email results)
function saveCompleteData(data) {
  // Get the user and email data components
  const userData = data.userData;
  const emailData = data.emailData;
  
  // Get or create the assessment data sheet
  const sheet = getOrCreateSheet('Postpartum Assessment Data');
  
  // Add headers if they don't exist
  ensureHeadersExist(sheet);
  
  // Create a complete record with all available data
  let record = [
    userData.timestamp || new Date().toISOString(),
    'complete_data', // Mark this as complete data (email path)
    userData.name || '',
    userData.email || '',
    userData.phone || '',
    userData.canContact ? 'Yes' : 'No',
    userData.finalResults.score,
    userData.finalResults.maxScore,
    userData.finalResults.stressLevel,
    userData.finalResults.percentage,
    userData.finalResults.message,
    emailData.sendMail ? 'Sent' : 'Not Sent', // Email status
    JSON.stringify(userData.assessmentResponses) // All responses as JSON
  ];
  
  // Append the row
  sheet.appendRow(record);
  
  // Since this includes email data, try to send the email too
  if (emailData.sendMail) {
    try {
      sendEmailWithData(emailData);
    } catch (error) {
      console.error("Failed to send email: " + error.message);
      // Continue anyway, data is saved
    }
  }
}

// Function to ensure headers exist in the sheet
function ensureHeadersExist(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Data Type',
      'Name',
      'Email',
      'Phone',
      'Profession',
      'Consent to Contact',
      'Score',
      'Max Score',
      'Assessment Level',
      'Percentage',
      'Message',
      'Email Status',
    ]);
  }
}

// Function to send email with the provided data
function sendEmailWithData(data) {
  // Create HTML email content
  const htmlBody = createEmailHtml(data);
  
  // Send the email
  GmailApp.sendEmail(
    data.to, 
    data.subject,
    "Your assessment results are attached in this email (requires HTML view).", // Plain text fallback
    { 
      htmlBody: htmlBody,
      name: "Crink Postpartum Assessment"
    }
  );
  
  return true;
} 