let currentDepartment = ''; 
let allQuestions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let selectedOption = null;
let isAnswerRevealed = false;

let correctQuestions = [];
let wrongQuestions = [];
let skippedQuestions = [];
let totalAllowedQuestions = 25; // Default Standard

let questionTimerInterval;
let timeRemaining = 60;

function openBlueprint(dept) {
    currentDepartment = dept;
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('blueprint-screen').classList.add('active');
    
    const titleText = document.getElementById('blueprint-title-text');
    const listContainer = document.getElementById('blueprint-list-container');
    const quizTitleDisplay = document.getElementById('quiz-title-display');
    
    if (dept === 'med_lab') {
        titleText.innerText = "🔬 የላቦራቶሪ ዘርф ኮርሶችን ይምረጡ";
        quizTitleDisplay.innerText = "Medical Laboratory Science Exit Exam Center";
        renderMedLabBlueprints(listContainer);
    } else if (dept === 'business') {
        titleText.innerText = "💼 የቢዝነስ ማኔጅመንት ኮርሶችን ይምረጡ";
        quizTitleDisplay.innerText = "Business Management Exit Exam Center";
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

    renderFeedbackBox(isCorrect, q.Explanation || q.explanation || "No extended explanation provided.");
}

function skipQuestion() {
    clearInterval(questionTimerInterval);
    let q = filteredQuestions[currentQuestionIndex];
    if (!skippedQuestions.includes(q) && !correctQuestions.includes(q) && !wrongQuestions.includes(q)) {
        skippedQuestions.push(q);
    }
    goToNextOrEnd();
}

function autoSkipDueToTimeout() {
    let q = filteredQuestions[currentQuestionIndex];
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
            <div class="scrollable-rationale-content">
                <p>${explanationText}</p>
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
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('score-screen').classList.add('active');

    let correctCount = correctQuestions.length;
    let totalQuestions = filteredQuestions.length;
    let percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // እሴቶችን በGoogle ስታይል ማሳያ ላይ መጫን
    document.getElementById('google-score-val').innerText = `${correctCount}/${totalQuestions}`;
    document.getElementById('google-accuracy-val').innerText = `${percentage}%`;
    
    document.getElementById('stat-correct-count').innerText = correctCount;
    document.getElementById('stat-wrong-count').innerText = wrongQuestions.length;
    document.getElementById('stat-skipped-count').innerText = skippedQuestions.length;

    // የማለፍ/አለማለፍ ማሳያ
    const badgeContainer = document.getElementById('badge-pass-fail-container');
    if (percentage >= 50) {
        badgeContainer.innerHTML = `<button class="btn-analyze-perf pass-theme">Analyze my performance</button>`;
    } else {
        badgeContainer.innerHTML = `<button class="btn-analyze-perf fail-theme">Analyze my performance</button>`;
    }

    let reviewZone = document.getElementById('review-zone');
    reviewZone.innerHTML = "";

    // 1. የተሳሳቱ ካሉ
    if (wrongQuestions.length > 0) {
        reviewZone.innerHTML += `
            <div class="learning-card card-wrong" onclick="retrySpecificSet('wrong')">
                <div class="card-icon">❌</div>
                <div class="card-info">
                    <h4>Review Wrong Questions</h4>
                    <p>Create a focus test from the ${wrongQuestions.length} questions you missed to master key concepts.</p>
                </div>
            </div>
        `;
    }

    // 2. የታለፉ ካሉ
    if (skippedQuestions.length > 0) {
        reviewZone.innerHTML += `
            <div class="learning-card card-skipped" onclick="retrySpecificSet('skipped')">
                <div class="card-icon">⏩</div>
                <div class="card-info">
                    <h4>Study Skipped Items</h4>
                    <p>Review the ${skippedQuestions.length} skipped questions you left unanswered during the quiz.</p>
                </div>
            </div>
        `;
    }
    
    // 3. ሙሉውን እንደገና ለመጀመር (More Questions)
    reviewZone.innerHTML += `
        <div class="learning-card card-all" onclick="retrySpecificSet('all')">
            <div class="card-icon">🔄</div>
            <div class="card-info">
                <h4>More Questions / Restart</h4>
                <p>Generate a completely fresh session or reshuffle the current quiz material from scratch.</p>
            </div>
        </div>
    `;
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

    document.getElementById('score-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');
    
    setupQuestionTimer();
    showQuestion();
}

function resetToHome() {
    clearInterval(questionTimerInterval);
    document.getElementById('score-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('active');
}

function goBackToWelcome() {
    document.getElementById('blueprint-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('active');
}