let currentQuestionIndex = 0;
let score = 0;

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
      score += index;
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
  
    // Instead of showing boring result, show the fancy popup
    document.getElementById("popup").classList.remove("hidden");
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
  
    // Optional: Show a sweet confirmation
    document.getElementById("popup").innerHTML = `
      <div class="popup-box">
        <h2>💌 All Set!</h2>
        <p>We’ve got your email. Your stress assessment is on its way ✨</p>
        <p>Thanks for hanging out with us. You’re doing amazing. 💖</p>
      </div>
    `;
  }
  

function restartAssessment() {
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById("result-box").classList.add("hidden");
  document.getElementById("question-box").classList.remove("hidden");
  showQuestion();
}

window.onload = showQuestion;
