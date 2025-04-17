# Stress Assessment Application

A web-based stress assessment tool that allows users to answer questions about their stress levels, view their results, and optionally receive their assessment results by email. Data is stored in Google Sheets for easy access and analysis.

## Features

- User information collection (name, email, phone)
- 10-question stress assessment based on standardized questions
- Results categorization (Low, Moderate, High stress)
- Google Sheets integration for data storage
- Email functionality for sending assessment results
- Data privacy options (users can skip sharing complete assessment data)
- Mobile-friendly responsive design

## Setup Instructions

### 1. Set Up the HTML/CSS/JS Files

1. Clone or download this repository to your local machine
2. Make sure the following file structure is maintained:
   ```
   /index.html
   /style/style.css
   /js/
     script.js
     questions.js
   ```

### 2. Set Up Google Sheets and Apps Script

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
   - Name it something descriptive like "Stress Assessment Data"

2. **Set Up the Google Apps Script**:
   - In your Google Sheet, click on **Extensions** > **Apps Script**
   - This will open the Apps Script editor in a new tab
   - Rename the project to "Stress Assessment Data Handler" (at the top of the page)
   - Delete any code in the default `Code.gs` file
   - Copy and paste the entire code from the `apps_script_code.js` file into the editor
   - Click **Save** (disk icon) or press Ctrl+S/Cmd+S

3. **Deploy as a Web App**:
   - Click on **Deploy** > **New deployment**
   - For "Select type", choose **Web app**
   - Fill in the following details:
     - Description: "Stress Assessment Data Handler"
     - Execute as: "Me" (your Google account)
     - Who has access: Choose "Anyone" for public assessments or "Anyone with Google Account" for more security
   - Click **Deploy**
   - You'll be prompted to authorize the app - click through the authorization screens
   - After deployment, you'll receive a URL - **COPY THIS URL**
   - Click **Done**

4. **Connect to Your Assessment Form**:
   - Open your JavaScript file (`js/script.js`)
   - Find this line: `const appsScriptUrl = 'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';`
   - Replace `'REPLACE_WITH_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'` with the URL you copied, keeping the quotes
   - Save the file

### 3. Testing the Setup

1. Host the files on a web server or use a local development server
2. Open the application in a web browser
3. Complete the assessment form with test data
4. Try both paths:
   - "Skip & View Results Now" (only saves basic user data)
   - "Send My Results" (saves complete assessment data and simulates sending an email)
5. Check your Google Sheet to verify that data is being saved correctly

## Data Flow

### When a User Starts the Assessment
- User enters their name, email, and phone number
- Data is stored locally in the browser
- No data is sent to Google Sheets yet

### When a User Skips Sharing Complete Results
- If user clicks "Skip & View Results Now"
- Only basic user data is sent to Google Sheets (name, email, phone, consent)
- Assessment responses are not saved to Google Sheets
- Results are displayed to the user

### When a User Chooses to Share Complete Results
- If user clicks "Send My Results"
- Complete data is sent to Google Sheets (user info + all responses + results)
- Email system is triggered (if configured)
- Results are displayed to the user

## Google Sheet Structure

The application creates a single sheet with the following columns:

- **Timestamp** - When the data was recorded
- **Data Type** - Type of record ('user_data_only' or 'complete_data')
- **Name** - User's name
- **Email** - User's email
- **Phone** - User's phone number
- **Consent to Contact** - Whether the user consented to being contacted
- **Score** - The numerical score (0-40)
- **Max Score** - Maximum possible score (always 40)
- **Stress Level** - Low, Moderate, or High
- **Percentage** - Score as a percentage
- **Message** - Message associated with the stress level
- **Email Status** - Status of email sending ('Sent' or empty)
- **Response Data** - JSON string containing all question responses

## Email Functionality

The application includes functionality to send emails with assessment results. To fully enable this:

1. The Google Apps Script must be authorized to send emails (happens during deployment)
2. Users must provide a valid email address

**Note**: The current implementation simulates email sending - to actually send emails, you need to:
1. Ensure your Google account has permission to send emails
2. Deploy the Apps Script with appropriate scopes
3. Test the email functionality in a controlled environment

## Customization

### Assessment Questions
- Edit the `questions.js` file to modify the assessment questions
- Each question has options and point values
- Some questions use reverse scoring (indicated in the file)

### Styling
- Modify `style.css` to change the appearance
- The design is responsive and works on mobile devices

### Results Categorization
- Edit the score thresholds in the `calculateAndStoreResults()` function in `script.js`
- Current categories:
  - Low Stress: 0-25% of max score
  - Moderate Stress: 26-50% of max score
  - High Stress: 51-100% of max score

## Troubleshooting

### Data Not Appearing in Google Sheet
- Check browser console for error messages
- Verify the Apps Script URL is correct
- Make sure the web app is deployed with appropriate access permissions
- Try redeploying the Apps Script as a new version

### CORS Issues
- The application uses a form submission technique to avoid CORS issues
- If CORS issues persist, check that the Google Apps Script is properly deployed

### Email Not Working
- Check the authorization settings in the Apps Script
- Verify the email addresses are valid
- Check the Apps Script execution logs for errors

## Security Considerations

- This implementation sends data directly from the browser to Google Sheets
- For production use, consider:
  - Adding CORS restrictions in the Apps Script
  - Using token-based authentication
  - Implementing rate limiting
  - Validating data on the server side
  - Adding reCAPTCHA to prevent abuse

## License

[Add your license information here]

## Credits

[Add credits and acknowledgements here] 