let currentDepartment = ''; 
let allQuestions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let selectedOption = null;
let isAnswerRevealed = false;

let correctQuestions = [];
let wrongQuestions = [];
let skippedQuestions = [];
let totalAllowedQuestions = 25; 

let questionTimerInterval;
let timeRemaining = 60;

function openBlueprint(dept) {
    currentDepartment = dept;
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('blueprint-screen').classList.add('active');
    
    const titleText = document.getElementById('blueprint-title-text');
    const listContainer = document.getElementById('blueprint-list-container');
    
    if (dept === 'med_lab') {
        titleText.innerText = "🔬 የላቦራቶሪ ዘርፍ ኮርሶችን ይምረጡ";
        renderMedLabBlueprints(listContainer);
    } else if (dept === 'business') {
        titleText.innerText = "💼 የቢዝነስ ማኔጅመንት ኮርሶችን ይምረጡ";
        renderBusinessBlueprints(listContainer);
    }
}

function handleCountChange() {
    const val = document.getElementById('question-count-select').value;
    totalAllowedQuestions = val === 'all' ? 9999 : parseInt(val);
}

function renderMedLabBlueprints(container) {
    container.innerHTML = `
        <div class="blueprint-card" onclick="loadQuestionsData('Laboratory Management')">
            <div><div class="blueprint-title">Theme 1: Laboratory Management & Quality Assurance</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Hematology')">
            <div><div class="blueprint-title">Theme 2: Hematology and Immunohematology</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Clinical Chemistry')">
            <div><div class="blueprint-title">Theme 3: Clinical Chemistry and Body Fluids</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Microbiology')">
            <div><div class="blueprint-title">Theme 4: Medical Microbiology and Virology</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Parasitology')">
            <div><div class="blueprint-title">Theme 5: Diagnostic Parasitology and Immunology</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card mixed-card" onclick="loadQuestionsData('all')">
            <div><div class="blueprint-title">🌟 ሁሉንም የብሉፕሪንት ጥያቄዎች አዋህድ</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
    `;
}

function renderBusinessBlueprints(container) {
    container.innerHTML = `
        <div class="blueprint-card" onclick="loadQuestionsData('Theme 1')">
            <div><div class="blueprint-title">Theme 1: Fundamentals of Management and Marketing</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Theme 2')">
            <div><div class="blueprint-title">Theme 2: Human Resource and Organizational Behaviour</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Theme 3')">
            <div><div class="blueprint-title">Theme 3: Innovation, Strategy and Project Management</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Theme 4')">
            <div><div class="blueprint-title">Theme 4: Managerial Statistics and Business Research</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card" onclick="loadQuestionsData('Theme 5')">
            <div><div class="blueprint-title">Theme 5: Management Science and Financial Management</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
        <div class="blueprint-card mixed-card" onclick="loadQuestionsData('all')">
            <div><div class="blueprint-title">🌟 ሁሉንም የቢዝነስ ጥያቄዎች አዋህድ</div></div>
            <span class="arrow-icon">➡️</span>
        </div>
    `;
}

function loadQuestionsData(categoryKey) {
    const fileName = currentDepartment === 'med_lab' ? 'med_lab.csv' : 'business_management.csv';
    
    Papa.parse(fileName, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            let rawData = results.data;
            let matched = [];
            
            if (categoryKey === 'all') {
                matched = rawData;
            } else {
                let target = categoryKey.toLowerCase().trim();
                matched = rawData.filter(q => {
                    let themeField = (q.Theme || q.theme || "").toLowerCase().trim();
                    return themeField.includes(target);
                });
            }

            if (matched.length === 0) {
                alert("ይቅርታ፣ ለተመረጠው ክፍል ጥያቄዎች አልተገኙም!");
                return;
            }

            matched.sort(() => Math.random() - 0.5);

            let limit = Math.min(matched.length, totalAllowedQuestions);
            filteredQuestions = matched.slice(0, limit);
            
            correctQuestions = [];
            wrongQuestions = [];
            skippedQuestions = [];
            currentQuestionIndex = 0;

            document.getElementById('blueprint-screen').classList.remove('active');
            document.getElementById('quiz-screen').classList.add('active');
            
            setupQuestionTimer();
            showQuestion();
        },
        error: function() {
            alert(`ይቅርታ፣ የውሂብ ፋይሉን ማግኘት አልተቻለም።`);
        }
    });
}

function setupQuestionTimer() {
    clearInterval(questionTimerInterval);
    timeRemaining = 60; 
    updateTimerUI();
    
    questionTimerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerUI();
        
        if (timeRemaining <= 0) {
            clearInterval(questionTimerInterval);
            autoSkipDueToTimeout();
        }
    }, 1000);
}

function updateTimerUI() {
    const timerBox = document.getElementById('timer-box');
    let secs = timeRemaining.toString().padStart(2, '0');
    timerBox.innerText = `⏱️ 00:${secs}`;
    
    if (timeRemaining <= 10) {
        timerBox.style.background = '#fee2e2';
        timerBox.style.color = '#ef4444';
    } else {
        timerBox.style.background = '#fef3c7';
        timerBox.style.color = '#b45309';
    }
}

function showQuestion() {
    isAnswerRevealed = false;
    selectedOption = null;
    
    document.getElementById('submit-btn').style.display = 'inline-block';
    document.getElementById('skip-btn').style.display = 'inline-block';
    document.getElementById('next-btn').style.display = 'none';

    let q = filteredQuestions[currentQuestionIndex];
    document.getElementById('question-counter').innerText = `ጥያቄ፡ ${currentQuestionIndex + 1}/${filteredQuestions.length}`;
    document.getElementById('quiz-progress').style.width = `${((currentQuestionIndex) / filteredQuestions.length) * 100}%`;

    let optA = q.OptionA || q.a || "";
    let optB = q.OptionB || q.b || "";
    let optC = q.OptionC || q.c || "";
    let optD = q.OptionD || q.d || "";

    let html = `
        <div class="question-header-tags">
            <span class="tag-badge-number">QUESTION ${currentQuestionIndex + 1}</span>
            <span class="tag-badge-primary">📚 ${q.Theme || q.theme || "Blueprint Topic"}</span>
        </div>
        <div class="question-text-body">${q.Question || q.question}</div>
        <ul class="options-wrapper-list">
            <li class="premium-option-item" onclick="selectOption(this, 'A')"><strong>A)</strong> ${optA}</li>
            <li class="premium-option-item" onclick="selectOption(this, 'B')"><strong>B)</strong> ${optB}</li>
            <li class="premium-option-item" onclick="selectOption(this, 'C')"><strong>C)</strong> ${optC}</li>
            <li class="premium-option-item" onclick="selectOption(this, 'D')"><strong>D)</strong> ${optD}</li>
        </ul>
        <div id="dynamic-feedback-zone"></div>
    `;
    document.getElementById('quiz-box').innerHTML = html;
}

function selectOption(element, letter) {
    if (isAnswerRevealed) return;
    selectedOption = letter;
    document.querySelectorAll('.premium-option-item').forEach(item => {
        item.classList.remove('checked');
    });
    element.classList.add('checked');
}

function submitAnswer() {
    if (selectedOption === null) {
        alert("እባክዎ መጀመሪያ አንድ ምርጫ ይምረጡ ወይም ካልፈለጉ 'አልፈው' ይሂዱ!");
        return;
    }
    if (isAnswerRevealed) return;

    clearInterval(questionTimerInterval); 
    isAnswerRevealed = true;

    let q = filteredQuestions[currentQuestionIndex];
    let correctAns = (q.CorrectAnswer || q.correct || "").trim().toUpperCase().charAt(0);

    let items = document.querySelectorAll('.premium-option-item');
    let letters = ['A', 'B', 'C', 'D'];
    
    items.forEach((item, idx) => {
        if (letters[idx] === correctAns) {
            item.classList.add('correct');
        }
        if (letters[idx] === selectedOption && selectedOption !== correctAns) {
            item.classList.add('wrong');
        }
    });

    let isCorrect = selectedOption === correctAns;
    if (isCorrect) {
        if (!correctQuestions.includes(q)) correctQuestions.push(q);
        wrongQuestions = wrongQuestions.filter(item => item !== q);
        skippedQuestions = skippedQuestions.filter(item => item !== q);
    } else {
        if (!wrongQuestions.includes(q)) wrongQuestions.push(q);
        correctQuestions = correctQuestions.filter(item => item !== q);
        skippedQuestions = skippedQuestions.filter(item => item !== q);
    }

    q.userSelectedAnswer = selectedOption; 

    // ፈተናው ላይ ለጊዜው የሚታየውን ማብራሪያ በሮማን ቁጥር ማስተካከያ
    renderFeedbackBox(isCorrect, q.Explanation || q.explanation || "No extended explanation provided.");
}

function skipQuestion() {
    clearInterval(questionTimerInterval);
    let q = filteredQuestions[currentQuestionIndex];
    q.userSelectedAnswer = 'Skipped';
    if (!skippedQuestions.includes(q) && !correctQuestions.includes(q) && !wrongQuestions.includes(q)) {
        skippedQuestions.push(q);
    }
    goToNextOrEnd();
}

function autoSkipDueToTimeout() {
    let q = filteredQuestions[currentQuestionIndex];
    q.userSelectedAnswer = 'Timeout';
    if (!skippedQuestions.includes(q) && !correctQuestions.includes(q) && !wrongQuestions.includes(q)) {
        skippedQuestions.push(q);
    }
    goToNextOrEnd();
}

function renderFeedbackBox(isCorrect, explanationText) {
    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('skip-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';

    let feedbackZone = document.getElementById('dynamic-feedback-zone');
    feedbackZone.innerHTML = `
        <div class="status-banner ${isCorrect ? 'status-correct' : 'status-wrong'}">
            ${isCorrect ? '🎉 በትክክል ተመልሷል!' : '❌ መልስዎ አልተሳካም!'}
        </div>
        <div class="explanation-box">
            <h4>💡 Scientific Rationale & Analysis:</h4>
            <div class="roman-explanation-list">
                <p><strong>I. Core Concept:</strong> Overview of the fundamental blueprint standard principles.</p>
                <p><strong>II. Rationale Breakdown:</strong> ${explanationText}</p>
                <p><strong>III. Exam Takeaway:</strong> Key indicator to identify and solve similar questions easily.</p>
            </div>
        </div>
    `;
}

function nextQuestion() {
    goToNextOrEnd();
}

function goToNextOrEnd() {
    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuestions.length) {
        setupQuestionTimer();
        showQuestion();
    } else {
        endQuizAndShowDashboard();
    }
}

function endQuizAndShowDashboard() {
    clearInterval(questionTimerInterval);
    
    document.getElementById('main-quiz-container').classList.add('expanded-dashboard-view');
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('score-screen').classList.add('active');

    let correctCount = correctQuestions.length;
    let totalQuestions = filteredQuestions.length;
    let percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    document.getElementById('google-score-val').innerText = `${correctCount}/${totalQuestions}`;
    document.getElementById('google-accuracy-val').innerText = `${percentage}%`;
    
    document.getElementById('stat-correct-count').innerText = correctCount;
    document.getElementById('stat-wrong-count').innerText = wrongQuestions.length;
    document.getElementById('stat-skipped-count').innerText = skippedQuestions.length;

    let reviewZone = document.getElementById('review-zone');
    reviewZone.innerHTML = "";

    if (wrongQuestions.length > 0) {
        reviewZone.innerHTML += `
            <div class="learning-action-item action-wrong" onclick="retrySpecificSet('wrong')">
                <span class="action-icon">❌</span>
                <div class="action-details">
                    <h4>Review Wrong (${wrongQuestions.length})</h4>
                    <p>የተሳሳቱትን ብቻ በድጋሚ ፈትን</p>
                </div>
            </div>
        `;
    }

    if (skippedQuestions.length > 0) {
        reviewZone.innerHTML += `
            <div class="learning-action-item action-skipped" onclick="retrySpecificSet('skipped')">
                <span class="action-icon">⏩</span>
                <div class="action-details">
                    <h4>Study Skipped (${skippedQuestions.length})</h4>
                    <p>ያለፍካቸውን ጥያቄዎች ብቻ እይ</p>
                </div>
            </div>
        `;
    }
    
    reviewZone.innerHTML += `
        <div class="learning-action-item action-all" onclick="retrySpecificSet('all')">
            <span class="action-icon">🔄</span>
            <div class="action-details">
                <h4>Restart Fresh Quiz</h4>
                <p>ሁሉንም ጥያቄዎች አደባልቀህ እንደገና ጀምር</p>
            </div>
        </div>
    `;

    // *** የስተካከለው የዳሽቦርድ ማብራሪያ (የሮማን ቁጥሮች አቀራረብ) ***
    let scrollZone = document.getElementById('detailed-explanations-scroll-zone');
    scrollZone.innerHTML = "";

    filteredQuestions.forEach((q, idx) => {
        let isCorrect = correctQuestions.includes(q);
        let isSkipped = skippedQuestions.includes(q);
        
        let cardClass = "explanation-report-card border-wrong";
        let statusTag = "❌ Incorrect";
        if (isCorrect) {
            cardClass = "explanation-report-card border-correct";
            statusTag = "✔ Correct";
        } else if (isSkipped) {
            cardClass = "explanation-report-card border-skipped";
            statusTag = "⏩ Skipped";
        }

        let userAns = q.userSelectedAnswer || "None";
        let correctAns = (q.CorrectAnswer || q.correct || "").trim().toUpperCase().charAt(0);
        let explanationText = q.Explanation || q.explanation || "No extended explanation document loadable.";

        scrollZone.innerHTML += `
            <div class="${cardClass}">
                <div class="report-card-header">
                    <span class="report-q-num">QUESTION ${idx + 1}</span>
                    <span class="report-status-badge">${statusTag}</span>
                </div>
                <div class="report-question-text">${q.Question || q.question}</div>
                
                <div class="report-choices-info">
                    <p>🎯 Correct Choice: <strong>Option ${correctAns}</strong></p>
                    <p>👤 Your Answer: <strong class="${isCorrect ? 'text-success' : 'text-danger'}">${userAns === 'Skipped' ? 'የታለፈ (Skipped)' : 'Option ' + userAns}</strong></p>
                </div>

                <div class="report-explanation-box">
                    <h5>💡 Scientific Rationale & Concept Breakthrough:</h5>
                    <div class="roman-explanation-list">
                        <p><strong>I. Core Concept:</strong> Systematic verification and analysis of the foundational standard criteria.</p>
                        <p><strong>II. Detailed Breakdown:</strong> ${explanationText}</p>
                        <p><strong>III. Key Takeaway:</strong> Vital concept integration required to accurately distinguish this category in the upcoming National Exit Exam.</p>
                    </div>
                </div>
            </div>
        `;
    });
}

function retrySpecificSet(type) {
    if (type === 'wrong') {
        filteredQuestions = [...wrongQuestions];
    } else if (type === 'skipped') {
        filteredQuestions = [...skippedQuestions];
    } else if (type === 'all') {
        filteredQuestions.sort(() => Math.random() - 0.5);
    }

    currentQuestionIndex = 0;
    correctQuestions = [];
    wrongQuestions = [];
    skippedQuestions = [];

    document.getElementById('main-quiz-container').classList.remove('expanded-dashboard-view');
    document.getElementById('score-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');
    
    setupQuestionTimer();
    showQuestion();
}

function resetToHome() {
    clearInterval(questionTimerInterval);
    document.getElementById('main-quiz-container').classList.remove('expanded-dashboard-view');
    document.getElementById('score-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('active');
}

function goBackToWelcome() {
    document.getElementById('blueprint-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('active');
}