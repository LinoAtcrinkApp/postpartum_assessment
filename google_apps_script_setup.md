# Google Apps Script Setup for Stress Assessment

These instructions will help you set up a Google Apps Script to store assessment data in Google Sheets.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Stress Assessment Data"
3. Keep the spreadsheet open for the next steps

## Step 2: Set Up the Google Apps Script

1. In your Google Sheet, click on **Extensions** > **Apps Script**
2. This will open the Apps Script editor in a new tab
3. Rename the project to "Stress Assessment Data Handler" (at the top of the page)
4. Delete any code in the default `Code.gs` file
5. Copy and paste the entire code from the `apps_script_code.js` file into the editor
6. Click **Save** (disk icon) or press Ctrl+S/Cmd+S

## Step 3: Deploy as a Web App

1. Click on **Deploy** > **New deployment**
2. For "Select type", choose **Web app**
3. Fill in the following details:
   - Description: "Stress Assessment Data Handler"
   - Execute as: "Me" (your Google account)
   - Who has access: Choose "Anyone" for public assessments or "Anyone with Google Account" for more security
4. Click **Deploy**
5. You'll be prompted to authorize the app - click through the authorization screens
6. After deployment, you'll receive a URL - **COPY THIS URL**
7. Click **Done**

## Step 4: Connect to Your Assessment Form

1. Open your JavaScript file (`js/script.js`)
2. Find the line with `const appsScriptUrl = 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';`
3. Replace `'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'` with the URL you copied, keeping the quotes
4. Save the file

## Step 5: Test the Integration

1. Complete the assessment form with test data
2. When you submit the form, check the Google Sheet to verify that the data is being saved correctly
3. You should see a single sheet named "Stress Assessment Data" with all your data
4. The "Data Type" column will indicate what type of data each row contains:
   - `user_data` - Basic user information when they start the assessment
   - `assessment_data` - Complete assessment results with JSON data of responses
   - `email_data` - Email sending records

## Understanding the Sheet Structure

The sheet contains the following columns:
- **Timestamp** - When the data was recorded
- **Data Type** - Type of record (user_data, assessment_data, email_data)
- **Name** - User's name
- **Email** - User's email
- **Phone** - User's phone number
- **Consent to Contact** - Whether the user consented to being contacted
- **Score** - The numerical score of the assessment (if applicable)
- **Max Score** - Maximum possible score (if applicable)
- **Stress Level** - Stress level assessment (if applicable)
- **Percentage** - Score as a percentage (if applicable)
- **Message** - Message associated with the stress level (if applicable)
- **Email Status** - Status of email sending (Pending or Sent, if applicable)
- **Response Data** - JSON string containing all question responses (if applicable)

## Troubleshooting

If data isn't appearing in your Google Sheet:

1. Check the browser console for any error messages
2. Verify that the Apps Script URL is correct
3. Make sure the web app is deployed with appropriate access permissions
4. Check that your Google account has permission to modify the spreadsheet

## Security Considerations

- This implementation sends data directly from the browser to Google Sheets
- For production use, consider:
  - Adding CORS restrictions in the Apps Script
  - Using token-based authentication
  - Implementing rate limiting
  - Validating data on the server side

## Email Functionality

The script includes functionality to send emails with assessment results. This requires:

1. The script to be authorized to send emails (happens during deployment)
2. The user to provide a valid email address

Emails will be sent from your Google account that owns the script. 