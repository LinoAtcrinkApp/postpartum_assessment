let currentQuestionIndex = 0;
let score = 0;
let userResponses = [];

const questions = assessmentQuestions;
const totalQuestions = questions.length;

document.getElementById("total-questions").textContent = totalQuestions;

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
  
    // You can hook this into your backend or a form tool
    console.log("📬 Email:", email);
    console.log("✅ Consent to contact:", consent);
  
    // Show results after collecting email
    displayResultsDirectly();
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
        <button onclick="restartAssessment()" class="btn restart-btn">Take Assessment Again</button>
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

window.onload = showQuestion;
