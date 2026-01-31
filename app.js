// Global variables
let currentTest = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timer = null;
let timeLeft = 1800; // 30 minutes in seconds
let testStarted = false;

// Initialize the application
$(document).ready(function() {
    initializeEventListeners();
    checkMCQDatabase();
});

// Check if MCQ database is loaded
function checkMCQDatabase() {
    if (typeof mcqDatabase === 'undefined') {
        console.error('MCQ Database not loaded!');
        alert('Error: Question database not loaded. Please refresh the page.');
    } else {
        console.log('MCQ Database loaded successfully');
        // Log the number of questions for each test
        for (let test in mcqDatabase) {
            console.log(`${test}: ${mcqDatabase[test].length} questions`);
        }
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Start test buttons
    $('.start-test-btn').click(function() {
        const testType = $(this).data('test');
        startTest(testType);
    });
    
    // Home link
    $('#homeLink, #backToHome').click(function(e) {
        e.preventDefault();
        goToHome();
    });
    
    // Quit test button
    $('#quitTest').click(function() {
        if (confirm('Are you sure you want to quit the test? Your progress will be lost.')) {
            clearInterval(timer);
            goToHome();
        }
    });
    
    // Navigation buttons
    $('#prevBtn').click(function() {
        if (currentQuestionIndex > 0) {
            goToQuestion(currentQuestionIndex - 1);
        }
    });
    
    $('#nextBtn').click(function() {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            goToQuestion(currentQuestionIndex + 1);
        } else {
            finishTest();
        }
    });
    
    // Review answers button
    $('#reviewAnswers').click(function() {
        showReviewMode();
    });
}

// Start a test
function startTest(testType) {
    currentTest = testType;
    
    // Check if test exists
    if (!mcqDatabase[testType]) {
        alert('Test not available. Please try another test.');
        return;
    }
    
    // Get random 50 questions
    currentQuestions = getRandomQuestions(mcqDatabase[testType], 50);
    
    // Initialize user answers array
    userAnswers = new Array(currentQuestions.length).fill(null);
    
    // Reset variables
    currentQuestionIndex = 0;
    timeLeft = 1800; // 30 minutes
    testStarted = true;
    
    // Show test page
    $('#homePage').hide();
    $('#resultsPage').hide();
    $('#testPage').show();
    
    // Set test title
    const testTitles = {
        'english': 'English Test',
        'math-matric': 'Math Matric Test',
        'math-1st': 'Math 1st Year Test',
        'math-2nd': 'Math 2nd Year Test',
        'physics-matric': 'Physics Matric Test',
        'physics-1st': 'Physics 1st Year Test',
        'physics-2nd': 'Physics 2nd Year Test'
    };
    $('#testTitle').text(testTitles[testType] || 'Test');
    
    // Start timer
    startTimer();
    
    // Create question map
    createQuestionMap();
    
    // Show first question
    displayQuestion(0);
    
    // Scroll to top
    $('html, body').animate({ scrollTop: 0 }, 300);
}

// Get random questions from array
function getRandomQuestions(questionsArray, count) {
    const shuffled = [...questionsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, questionsArray.length));
}

// Start timer
function startTimer() {
    updateTimerDisplay();
    
    timer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time is up! Your test will be submitted automatically.');
            finishTest();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    $('#timer').text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    
    // Change color when time is running out
    if (timeLeft <= 300) { // Less than 5 minutes
        $('#timer').css('color', '#dc3545');
    } else if (timeLeft <= 600) { // Less than 10 minutes
        $('#timer').css('color', '#ff6b6b');
    } else {
        $('#timer').css('color', '#ff6b6b');
    }
}

// Create question map
function createQuestionMap() {
    const mapContainer = $('#questionMap');
    mapContainer.empty();
    
    for (let i = 0; i < currentQuestions.length; i++) {
        const btn = $('<button>')
            .addClass('q-map-btn')
            .text(i + 1)
            .click(function() {
                goToQuestion(i);
            });
        
        if (i === currentQuestionIndex) {
            btn.addClass('current');
        }
        
        if (userAnswers[i] !== null) {
            btn.addClass('answered');
        }
        
        mapContainer.append(btn);
    }
}

// Display a question
function displayQuestion(index) {
    const question = currentQuestions[index];
    
    // Update question number
    $('#currentQuestionNum').text(index + 1);
    
    // Update question text
    $('#questionText').text(question.question);
    
    // Update progress bar
    const progress = ((index + 1) / currentQuestions.length) * 100;
    $('#progressBar').css('width', progress + '%');
    
    // Create options
    const optionsContainer = $('#optionsContainer');
    optionsContainer.empty();
    
    question.options.forEach((option, optionIndex) => {
        const optionBtn = $('<button>')
            .addClass('option-btn')
            .html(`<strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${option}`)
            .click(function() {
                if (!testStarted || $(this).hasClass('disabled')) return;
                selectOption(index, optionIndex);
            });
        
        // If user has already answered this question
        if (userAnswers[index] === optionIndex) {
            optionBtn.addClass('selected');
        }
        
        optionsContainer.append(optionBtn);
    });
    
    // Update navigation buttons
    $('#prevBtn').prop('disabled', index === 0);
    
    if (index === currentQuestions.length - 1) {
        $('#nextBtn').html('<i class="fas fa-check me-2"></i>Finish Test');
    } else {
        $('#nextBtn').html('Next<i class="fas fa-chevron-right ms-2"></i>');
    }
    
    // Update question map
    createQuestionMap();
}

// Select an option
function selectOption(questionIndex, optionIndex) {
    userAnswers[questionIndex] = optionIndex;
    
    // Remove selected class from all options
    $('#optionsContainer .option-btn').removeClass('selected');
    
    // Add selected class to clicked option
    $('#optionsContainer .option-btn').eq(optionIndex).addClass('selected');
    
    // Update question map
    createQuestionMap();
}

// Go to a specific question
function goToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion(index);
    
    // Scroll to top
    $('html, body').animate({ scrollTop: 0 }, 300);
}

// Finish test
function finishTest() {
    clearInterval(timer);
    testStarted = false;
    
    // Calculate results
    const results = calculateResults();
    
    // Show results page
    showResults(results);
}

// Calculate results
function calculateResults() {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] === null) {
            unanswered++;
        } else if (userAnswers[index] === question.correct) {
            correct++;
        } else {
            wrong++;
        }
    });
    
    const total = currentQuestions.length;
    const percentage = ((correct / total) * 100).toFixed(2);
    
    return {
        correct: correct,
        wrong: wrong,
        unanswered: unanswered,
        total: total,
        percentage: percentage
    };
}

// Show results
function showResults(results) {
    $('#testPage').hide();
    $('#resultsPage').show();
    
    // Update scores
    $('#scoreMarks').text(`${results.correct}/${results.total}`);
    $('#scorePercent').text(`${results.percentage}%`);
    $('#correctAnswers').text(results.correct);
    $('#wrongAnswers').text(results.wrong);
    $('#unanswered').text(results.unanswered);
    
    // Update icon and message based on performance
    const icon = $('#resultsIcon');
    const message = $('#performanceMessage');
    
    if (results.percentage >= 80) {
        icon.removeClass().addClass('fas fa-trophy fa-5x text-warning');
        message.html('<strong>Excellent!</strong> You did a great job! Keep up the good work!');
    } else if (results.percentage >= 60) {
        icon.removeClass().addClass('fas fa-medal fa-5x text-success');
        message.html('<strong>Good job!</strong> You\'re doing well. Keep practicing!');
    } else if (results.percentage >= 40) {
        icon.removeClass().addClass('fas fa-star fa-5x text-info');
        message.html('<strong>Not bad!</strong> There\'s room for improvement. Keep studying!');
    } else {
        icon.removeClass().addClass('fas fa-book fa-5x text-primary');
        message.html('<strong>Keep trying!</strong> Practice makes perfect. Don\'t give up!');
    }
    
    // Scroll to top
    $('html, body').animate({ scrollTop: 0 }, 300);
}

// Show review mode
function showReviewMode() {
    testStarted = false;
    
    $('#resultsPage').hide();
    $('#testPage').show();
    
    // Show first question in review mode
    currentQuestionIndex = 0;
    displayQuestionInReviewMode(0);
}

// Display question in review mode
function displayQuestionInReviewMode(index) {
    const question = currentQuestions[index];
    
    // Update question number
    $('#currentQuestionNum').text(index + 1);
    
    // Update question text
    $('#questionText').text(question.question);
    
    // Update progress bar
    const progress = ((index + 1) / currentQuestions.length) * 100;
    $('#progressBar').css('width', progress + '%');
    
    // Create options with correct/wrong indicators
    const optionsContainer = $('#optionsContainer');
    optionsContainer.empty();
    
    question.options.forEach((option, optionIndex) => {
        const optionBtn = $('<button>')
            .addClass('option-btn disabled')
            .html(`<strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${option}`);
        
        // Mark correct answer
        if (optionIndex === question.correct) {
            optionBtn.addClass('correct');
        }
        
        // Mark user's wrong answer
        if (userAnswers[index] === optionIndex && optionIndex !== question.correct) {
            optionBtn.addClass('wrong');
        }
        
        optionsContainer.append(optionBtn);
    });
    
    // Update navigation buttons
    $('#prevBtn').prop('disabled', index === 0).off('click').click(function() {
        if (index > 0) {
            displayQuestionInReviewMode(index - 1);
            currentQuestionIndex--;
            updateReviewQuestionMap();
        }
    });
    
    if (index === currentQuestions.length - 1) {
        $('#nextBtn').html('<i class="fas fa-home me-2"></i>Back to Results').off('click').click(function() {
            showResults(calculateResults());
        });
    } else {
        $('#nextBtn').html('Next<i class="fas fa-chevron-right ms-2"></i>').off('click').click(function() {
            displayQuestionInReviewMode(index + 1);
            currentQuestionIndex++;
            updateReviewQuestionMap();
        });
    }
    
    // Update question map for review
    updateReviewQuestionMap();
}

// Update question map for review mode
function updateReviewQuestionMap() {
    const mapContainer = $('#questionMap');
    mapContainer.empty();
    
    for (let i = 0; i < currentQuestions.length; i++) {
        const btn = $('<button>')
            .addClass('q-map-btn')
            .text(i + 1)
            .click(function() {
                displayQuestionInReviewMode(i);
                currentQuestionIndex = i;
                updateReviewQuestionMap();
            });
        
        if (i === currentQuestionIndex) {
            btn.addClass('current');
        }
        
        // Color code based on answer
        if (userAnswers[i] === currentQuestions[i].correct) {
            btn.addClass('correct');
        } else if (userAnswers[i] !== null) {
            btn.addClass('wrong');
        }
        
        mapContainer.append(btn);
    }
}

// Go to home page
function goToHome() {
    clearInterval(timer);
    testStarted = false;
    
    $('#testPage').hide();
    $('#resultsPage').hide();
    $('#homePage').show();
    
    // Reset variables
    currentTest = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    timeLeft = 1800;
    
    // Scroll to top
    $('html, body').animate({ scrollTop: 0 }, 300);
}

// Smooth scrolling for navigation links
$('a[href^="#"]').click(function(e) {
    if ($(this).attr('href') !== '#') {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 1000);
        }
    }
});

// Prevent closing browser/tab accidentally during test
window.addEventListener('beforeunload', function(e) {
    if (testStarted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});