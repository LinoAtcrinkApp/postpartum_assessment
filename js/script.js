let currentQuestionIndex = 0;
let score = 0;
let userResponses = [];
let userData = {
  name: "",
  email: "",
  phone: "",
  canContact: false,
  assessmentResponses: [],
  finalResults: {
    score: 0,
    stressLevel: "",
    message: "",
    percentage: 0
  }
};

const questions = assessmentQuestions;
const totalQuestions = questions.length;

document.getElementById("total-questions").textContent = totalQuestions;

// Initialize the assessment process
window.onload = initAssessment;

function initAssessment() {
  // Add event listener to the start button
  document.getElementById("start-assessment").addEventListener("click", startAssessment);
  
  // Initially hide the question box
  document.getElementById("question-box").classList.add("hidden");
}

function startAssessment() {
  // Validate required fields
  const nameInput = document.getElementById("user-name");
  const emailInput = document.getElementById("user-email-initial");
  const phoneInput = document.getElementById("user-phone");
  
  if (!nameInput.value.trim()) {
    alert("Please enter your name to continue.");
    nameInput.focus();
    return;
  }
  
  if (!emailInput.value.trim()) {
    alert("Please enter your email to continue.");
    emailInput.focus();
    return;
  }
  
  if (!phoneInput.value.trim()) {
    alert("Please enter your phone number to continue.");
    phoneInput.focus();
    return;
  }
  
  // Store user data
  userData.name = nameInput.value.trim();
  userData.email = emailInput.value.trim();
  userData.phone = phoneInput.value.trim();
  userData.canContact = document.getElementById("contact-consent").checked;
  
  // Store initial data locally (don't save to Google Sheets yet)
  storeUserDataLocally(userData.name, userData.email, userData.phone, userData.canContact);
  
  // Hide user info form and show question box
  document.getElementById("user-info-form").classList.add("hidden");
  document.getElementById("question-box").classList.remove("hidden");
  
  // Pre-fill email in the results popup
  document.getElementById("user-email").value = userData.email;
  document.getElementById("consent-checkbox").checked = userData.canContact;
  
  // Start the assessment
  showQuestion();
}

// Store user data locally without sending to Google Sheets
function storeUserDataLocally(name, email, phone, canContact) {
  // Create the data object with just the basic user information
  const userDataObj = {
    name: name,
    email: email,
    phone: phone,
    canContact: canContact,
    timestamp: new Date().toISOString()
  };
  
  // Store locally as a backup
  try {
    const existingData = JSON.parse(localStorage.getItem('crinkUserData') || '[]');
    existingData.push(userDataObj);
    localStorage.setItem('crinkUserData', JSON.stringify(existingData));
    console.log('User data saved to localStorage');
  } catch (storageError) {
    console.error('Failed to save to localStorage:', storageError);
  }
}

function showQuestion() {
  const current = questions[currentQuestionIndex];
  document.getElementById("question-text").textContent = current.question;
  document.getElementById("current-question").textContent = currentQuestionIndex + 1;

  const container = document.getElementById("options-container");
  container.innerHTML = "";

  current.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.classList.add("option-button");
    btn.textContent = optionText;
    btn.onclick = () => {
      // Add points based on the question's points array
      // Points are already correctly defined in the question data
      const pointValue = current.points[index];
      score += pointValue;
      
      // Store user's response for review
      userResponses.push({
        question: current.question,
        answer: optionText,
        points: pointValue
      });
      
      currentQuestionIndex++;
      if (currentQuestionIndex < totalQuestions) {
        showQuestion();
      } else {
        showResult();
      }
    };
    container.appendChild(btn);
  });
}

function showResult() {
    document.getElementById("question-box").classList.add("hidden");
  
    // Show the popup with option to view results directly
    document.getElementById("popup").classList.remove("hidden");
    
    // Add view results button to the popup
    const popupBox = document.querySelector(".popup-box");
    
    // Add a "Skip & View Results" button
    const viewResultsBtn = document.createElement("button");
    viewResultsBtn.textContent = "Skip & View Results Now";
    viewResultsBtn.className = "btn view-results-btn";
    viewResultsBtn.style.marginRight = "10px";
    viewResultsBtn.style.backgroundColor = "#614ad3";
    viewResultsBtn.id = "skip-view-results-btn";
    
    // Add it before the existing submit button
    const existingButton = popupBox.querySelector("button");
    popupBox.insertBefore(viewResultsBtn, existingButton);
    
    // Add event listener to the skip button
    document.getElementById("skip-view-results-btn").addEventListener("click", function() {
      displayResultsDirectly();
    });
    
    // Add some space between buttons
    const spacer = document.createElement("div");
    spacer.style.height = "10px";
    popupBox.insertBefore(spacer, existingButton);
  }
  
  function submitEmail() {
    const email = document.getElementById("user-email").value;
    const consent = document.getElementById("consent-checkbox").checked;
  
    if (!email) {
      alert("Oops! Please enter your email so we can send the results ✉️");
      return;
    }
    
    // Update userData with latest values
    userData.email = email;
    userData.canContact = consent;
    
    // Show a loading message
    const popupBox = document.querySelector(".popup-box");
    const originalContent = popupBox.innerHTML;
    popupBox.innerHTML = `
      <h2>Sending Results...</h2>
      <p>Please wait while we email your results.</p>
    `;
    
    // Calculate and store results in userData
    calculateAndStoreResults();
    
    // Save complete assessment data to Google Sheets
    saveCompleteAssessmentData(userData);
    
    // Simulate email sending
    setTimeout(() => {
      // Update popup to show success message with working continue button
      popupBox.innerHTML = `
        <h2>Results Sent! 📧</h2>
        <p>Check your inbox at ${email} for your stress assessment results.</p>
        <button id="continue-to-results" class="btn view-results-btn">Continue to Results</button>
      `;
      
      // Add event listener to the new button
      document.getElementById("continue-to-results").addEventListener("click", function() {
        displayResultsDirectly();
      });
    }, 1500);
  }
  
  function calculateAndStoreResults() {
    // Calculate the same results as shown in the UI
    const maxPossibleScore = totalQuestions * 4;
    
    let resultMessage;
    let stressLevel;
    let progressPercentage;
    
    if (score <= maxPossibleScore * 0.25) {
      resultMessage = "You're managing stress well!";
      stressLevel = "Low Stress";
      progressPercentage = Math.round((score / maxPossibleScore) * 100);
    } else if (score <= maxPossibleScore * 0.5) {
      resultMessage = "You're experiencing some stress. Try some relaxation techniques.";
      stressLevel = "Moderate Stress";
      progressPercentage = Math.round((score / maxPossibleScore) * 100);
    } else {
      resultMessage = "Your stress levels are elevated. Consider seeking support.";
      stressLevel = "High Stress";
      progressPercentage = Math.round((score / maxPossibleScore) * 100);
    }
    
    // Store all results data in userData object
    userData.finalResults = {
      score: score,
      stressLevel: stressLevel,
      message: resultMessage,
      percentage: progressPercentage,
      maxScore: totalQuestions * 4
    };
    userData.assessmentResponses = userResponses;
    
    return userData;
  }
  
  function displayResultsDirectly() {
    // Get the updated consent value from the popup if it exists
    let updatedConsent = false;
    let updatedEmail = userData.email; // Default to stored value
    
    const consentCheckbox = document.getElementById("consent-checkbox");
    const emailInput = document.getElementById("user-email");
    
    // Only update if elements exist (they might not if coming directly from skip button)
    if (consentCheckbox) {
      updatedConsent = consentCheckbox.checked;
    }
    
    if (emailInput && emailInput.value) {
      updatedEmail = emailInput.value;
    }
    
    // Update userData with latest values
    userData.email = updatedEmail;
    userData.canContact = updatedConsent;
    
    // Calculate and store all results
    calculateAndStoreResults();
    
    // When skipping, only save basic user data to Google Sheets
    if (!document.getElementById("continue-to-results")) {
      // This means we're coming from skip button, not from email submission
      saveUserDataToExcel(userData.name, userData.email, userData.phone);
    }
    
    // Hide popup and display results in a separate "page"
    document.getElementById("popup").classList.add("hidden");
    
    // Create results page if it doesn't exist yet
    let resultsPage = document.getElementById("results-page");
    if (!resultsPage) {
      resultsPage = document.createElement("div");
      resultsPage.id = "results-page";
      document.querySelector(".assessment-wrapper").appendChild(resultsPage);
    }
    
    // Populate the results page with progress indicator (no download buttons)
    resultsPage.innerHTML = `
      <div class="results-container">
        <h2>Your Stress Assessment Results</h2>
        <div class="stress-level-display">
          <h3>${userData.finalResults.stressLevel}</h3>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${userData.finalResults.percentage}%"></div>
          </div>
        </div>
        <p class="result-message">${userData.finalResults.message}</p>
        <p class="score-display">Total Score: ${userData.finalResults.score} out of ${userData.finalResults.maxScore}</p>
        <button onclick="redirectToTherapy()" class="btn restart-btn">Start Therapy Now</button>
      </div>
    `;
    
    // Show the results page
    resultsPage.classList.remove("hidden");
  }

function restartAssessment() {
  currentQuestionIndex = 0;
  score = 0;
  userResponses = []; // Clear user responses
  document.getElementById("popup").classList.add("hidden");
  
  // Hide results page if it exists
  const resultsPage = document.getElementById("results-page");
  if (resultsPage) {
    resultsPage.classList.add("hidden");
  }
  
  document.getElementById("question-box").classList.remove("hidden");
  showQuestion();
}

function redirectToTherapy() {
  // Open the therapy page in a new tab
  window.open("https://www.crink.app/therapy", "_blank"); // Opens in a new tab/window
}

function saveUserDataToExcel(name, email, phone) {
  // Create the data object with just the basic user information
  const userData = {
    name: name,
    email: email,
    phone: phone,
    canContact: document.getElementById("contact-consent").checked,
    timestamp: new Date().toISOString()
  };
  
  // Save to Google Sheets via Apps Script
  saveToGoogleSheets(userData, 'user_data');
  
  // Also store locally as a backup
  try {
    const existingData = JSON.parse(localStorage.getItem('crinkUserData') || '[]');
    existingData.push(userData);
    localStorage.setItem('crinkUserData', JSON.stringify(existingData));
    console.log('User data saved to localStorage as backup');
  } catch (storageError) {
    console.error('Failed to save to localStorage:', storageError);
  }
}

// New function to save complete assessment data
function saveCompleteAssessmentData(completeUserData) {
  console.log("Complete user assessment data:", completeUserData);
  
  // Add timestamp
  const dataToSave = {
    ...completeUserData,
    timestamp: new Date().toISOString()
  };
  
  // Create email data object to include with the assessment data
  const emailData = {
    name: dataToSave.name,
    email: dataToSave.email,
    phone: dataToSave.phone || '',
    to: dataToSave.email,
    subject: "Your Crink Stress Assessment Results",
    stressLevel: dataToSave.finalResults.stressLevel,
    score: dataToSave.finalResults.score,
    maxScore: dataToSave.finalResults.maxScore,
    percentage: dataToSave.finalResults.percentage,
    message: dataToSave.finalResults.message,
    responses: dataToSave.assessmentResponses,
    consentToContact: dataToSave.canContact,
    timestamp: dataToSave.timestamp
  };
  
  // Save one complete record to Google Sheets (includes assessment + email data)
  saveToGoogleSheets({
    userData: dataToSave,
    emailData: emailData
  }, 'complete_data');
  
  // Also store locally as a backup
  try {
    const existingData = JSON.parse(localStorage.getItem('crinkCompleteAssessmentData') || '[]');
    existingData.push(dataToSave);
    localStorage.setItem('crinkCompleteAssessmentData', JSON.stringify(existingData));
    console.log('Complete assessment data saved to localStorage as backup');
    
    // Also save email data
    const existingEmailData = JSON.parse(localStorage.getItem('crinkEmailData') || '[]');
    existingEmailData.push(emailData);
    localStorage.setItem('crinkEmailData', JSON.stringify(existingEmailData));
  } catch (storageError) {
    console.error('Failed to save to localStorage:', storageError);
  }
}

// Function to save data to Google Sheets via Apps Script
function saveToGoogleSheets(data, sheetType) {
  // Replace this URL with your Google Apps Script Web App URL
  const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbw2Z-cs9fN5QjKYgjmK2eni7auZuCFftGhw425-A7x3WZ4gUz0J7yfwOXxgtV8kE3Pl/exec';
  
  // Prepare the data for sending
  const payload = {
    data: data,
    sheetType: sheetType // Tells the Apps Script which sheet/tab to use
  };
  
  try {
    // Create a hidden iframe for the form target
    const iframeId = 'hidden-form-target';
    let iframe = document.getElementById(iframeId);
    
    // Create iframe if it doesn't exist
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.setAttribute('id', iframeId);
      iframe.setAttribute('name', iframeId);
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    
    // Create a hidden form and submit it instead of using fetch (avoids CORS issues)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = appsScriptUrl;
    form.target = iframeId; // Submit to the hidden iframe
    form.style.display = 'none';
    
    // Create a hidden input for the data
    const inputData = document.createElement('input');
    inputData.type = 'hidden';
    inputData.name = 'payload';
    inputData.value = JSON.stringify(payload);
    form.appendChild(inputData);
    
    // Add the form to the document and submit it
    document.body.appendChild(form);
    form.submit();
    
    // Remove the form after submission
    setTimeout(() => {
      document.body.removeChild(form);
    }, 1000);
    
    console.log(`Data submitted to Google Sheets (${sheetType})`);
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    console.log('Data was saved locally as backup');
  }
}

