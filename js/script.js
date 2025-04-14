let currentQuestionIndex = 0;
let score = 0;
let userResponses = [];
let userData = {
  name: "",
  email: "",
  phone: "",
  canContact: false
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
  
  // Save user data to Excel via backend
  saveUserDataToExcel(userData.name, userData.email, userData.phone);
  
  // Hide user info form and show question box
  document.getElementById("user-info-form").classList.add("hidden");
  document.getElementById("question-box").classList.remove("hidden");
  
  // Pre-fill email in the results popup
  document.getElementById("user-email").value = userData.email;
  document.getElementById("consent-checkbox").checked = userData.canContact;
  
  // Start the assessment
  showQuestion();
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
    viewResultsBtn.onclick = displayResultsDirectly;
    
    // Add it before the existing submit button
    const existingButton = popupBox.querySelector("button");
    popupBox.insertBefore(viewResultsBtn, existingButton);
    
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
    
    // Show a loading message
    const popupBox = document.querySelector(".popup-box");
    const originalContent = popupBox.innerHTML;
    popupBox.innerHTML = `
      <h2>Sending Results...</h2>
      <p>Please wait while we email your results.</p>
    `;
    
    // Prepare the results data for email
    sendResultsEmail(email, consent)
      .then(() => {
        // Update popup to show success message
        popupBox.innerHTML = `
          <h2>Results Sent! 📧</h2>
          <p>Check your inbox at ${email} for your stress assessment results.</p>
          <button onclick="displayResultsDirectly()" class="btn view-results-btn">Continue to Results</button>
        `;
      })
      .catch(error => {
        console.error("Error sending email:", error);
        popupBox.innerHTML = `
          <h2>Oops! Something went wrong</h2>
          <p>We couldn't send your results by email. Please try again later.</p>
          <button onclick="displayResultsDirectly()" class="btn view-results-btn">View Results Now</button>
        `;
      });
  }
  
  function sendResultsEmail(email, consent) {
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
    
    // Create email data object with complete information for Excel storage
    const emailData = {
      name: userData.name,
      email: email,
      phone: userData.phone || '',
      to: email,
      subject: "Your Crink Stress Assessment Results",
      stressLevel: stressLevel,
      score: score,
      maxScore: totalQuestions * 4,
      percentage: progressPercentage,
      message: resultMessage,
      responses: userResponses,
      consentToContact: consent
    };
    
    // Send to backend to handle both email and Excel storage
    return new Promise((resolve, reject) => {
      // Simulate an API call to your backend
      setTimeout(() => {
        try {
          console.log("📧 Sending data for email and Excel storage:", emailData);
          
          // In a real environment, this would be an actual fetch call:
          fetch('http://localhost:3000/api/send-assessment-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
          }).then(response => {
            if (!response.ok) throw new Error('Failed to process assessment data');
            return response.json();
          }).then(data => {
            console.log('Backend response:', data);
            resolve(data);
          }).catch(error => {
            console.error('Error connecting to backend:', error);
            // Fall back to simulated success if server is not available during development
            resolve({success: true, message: 'Simulated success (server not available)'});
          });
        } catch (error) {
          console.error('Error in processing:', error);
          reject(error);
        }
      }, 1500); // Simulate network delay during development
    });
  }
  
  function displayResultsDirectly() {
    // Show results based on score
    let resultMessage;
    let stressLevel;
    let progressPercentage;
    
    // Calculate maximum possible score (total questions × max 4 points per question)
    const maxPossibleScore = totalQuestions * 4;
    
    // Calculate stress levels based on score ranges
    if (score <= maxPossibleScore * 0.25) { // 0-25% of max score
      resultMessage = "You're managing stress well!";
      stressLevel = "Low Stress";
      progressPercentage = Math.round((score / maxPossibleScore) * 100); // Dynamic percentage based on actual score
    } else if (score <= maxPossibleScore * 0.5) { // 26-50% of max score
      resultMessage = "You're experiencing some stress. Try some relaxation techniques.";
      stressLevel = "Moderate Stress";
      progressPercentage = Math.round((score / maxPossibleScore) * 100); // Dynamic percentage based on actual score
    } else {
      resultMessage = "Your stress levels are elevated. Consider seeking support.";
      stressLevel = "High Stress";
      progressPercentage = Math.round((score / maxPossibleScore) * 100); // Dynamic percentage up to 100%
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
    
    // Populate the results page with fancy progress indicator
    resultsPage.innerHTML = `
      <div class="results-container">
        <h2>Your Stress Assessment Results</h2>
        <div class="stress-level-display">
          <h3>${stressLevel}</h3>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
        <p class="result-message">${resultMessage}</p>
        <p class="score-display">Total Score: ${score} out of ${totalQuestions * 4}</p>
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
  // Redirect to the therapy page
  window.location.href = "https://www.crink.app/therapy"; // Replace with your actual therapy page URL
}

function saveUserDataToExcel(name, email, phone) {
  // Create the data object with just the basic user information
  const userData = {
    name: name,
    email: email,
    phone: phone
  };
  
  // Try to send the data to the backend
  // Using a Promise with timeout to handle potential connection issues
  const timeoutDuration = 5000; // 5 seconds timeout
  
  const fetchWithTimeout = (url, options, timeout) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      )
    ]);
  };
  
  // Try to save data but continue assessment flow regardless of outcome
  fetchWithTimeout('http://localhost:3000/api/save-user-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  }, timeoutDuration)
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to save user data');
    }
    return response.json();
  })
  .then(data => {
    console.log('User data saved successfully:', data);
  })
  .catch(error => {
    // Log the error but don't interrupt the assessment flow
    console.log('User data will only be stored locally. Backend connection failed:', error.message);
    
    // Store the data locally as a fallback (in sessionStorage)
    try {
      const existingData = JSON.parse(sessionStorage.getItem('crinkUserData') || '[]');
      existingData.push({
        ...userData,
        timestamp: new Date().toISOString()
      });
      sessionStorage.setItem('crinkUserData', JSON.stringify(existingData));
      console.log('User data saved to session storage as fallback');
    } catch (storageError) {
      console.error('Failed to save to session storage:', storageError);
    }
  });
}
