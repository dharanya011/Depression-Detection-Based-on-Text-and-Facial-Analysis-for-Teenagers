// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active link switching
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    });

    // --- Camera Source Logic ---
    const webcam = document.getElementById('webcam');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const startCamBtn = document.getElementById('start-cam-btn');
    let isCameraActive = false;
    let localStream = null;

    startCamBtn.addEventListener('click', async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcam.srcObject = localStream;
            webcam.classList.remove('hidden');
            cameraPlaceholder.classList.add('hidden');
            isCameraActive = true;
            document.getElementById('camera-wrapper').parentElement.classList.remove('has-error');
        } catch (err) {
            console.error("Error accessing camera: ", err);
            alert("Could not access the camera. Please ensure permissions are granted.");
        }
    });

    // Cleanup camera when switching sections (optional but good practice)
    window.addEventListener('beforeunload', () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    });


    // --- Form Submission & Validation ---
    const form = document.getElementById('analysis-form');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.getElementById('spinner');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset errors
        document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));
        
        const textInput = document.getElementById('text-input').value.trim();
        
        let isValid = true;
        
        // Validate text length
        if (textInput.split(' ').length < 2) {
            document.getElementById('text-input').parentElement.classList.add('has-error');
            isValid = false;
        }
        
        // Validate camera
        if (!isCameraActive) {
            document.getElementById('camera-wrapper').parentElement.classList.add('has-error');
            document.getElementById('camera-error').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('camera-error').style.display = 'none';
        }
        
        if (isValid) {
            // Simulate a visual scanning effect on the webcam
            webcam.style.filter = "contrast(1.4) brightness(1.2)";
            setTimeout(() => { webcam.style.filter = "none"; }, 400);
            
            simulateAnalysis(textInput);
        }
    });

    // --- Analysis Logic ---
    function simulateAnalysis(text) {
        // UI State: Loading
        btnText.textContent = 'Analyzing...';
        spinner.classList.remove('hidden');
        analyzeBtn.disabled = true;
        
        // Timeout to simulate API call / processing time
        setTimeout(() => {
            const results = processLogic(text);
            displayResults(results);
            
            // Reset Button
            btnText.textContent = 'Analyze Now';
            spinner.classList.add('hidden');
            analyzeBtn.disabled = false;
            
            // Show result section and scroll to it
            const resultSection = document.getElementById('result');
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
        }, 2000); // 2 second delay
    }

    function processLogic(text) {
        text = text.toLowerCase();
        
        // 1. Text Logic
        const negativeWords = ['sad', 'tired', 'lonely', 'depressed', 'hopeless', 'bad', 'down', 'empty', 'worthless'];
        const positiveWords = ['happy', 'excited', 'good', 'great', 'joy', 'awesome', 'amazing', 'fine', 'okay'];
        
        let negCount = 0;
        let posCount = 0;
        
        negativeWords.forEach(word => {
            if (text.includes(word)) negCount++;
        });
        
        positiveWords.forEach(word => {
            if (text.includes(word)) posCount++;
        });
        
        // Text Sentiment Result
        let textResult = 'Neutral';
        let level = 'Moderate'; 
        
        if (negCount > posCount) {
            textResult = 'Negative (Signs of Distress)';
            level = 'High';
        } else if (posCount > negCount) {
            textResult = 'Positive / Healthy';
            level = 'Low';
        }
        
        // 2. Facial Logic (Random simulation)
        const emotions = ['Happy', 'Sad', 'Angry', 'Neutral'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        
        // 3. Combined Logic Adjustments
        // If text is Low but face is Sad or Angry, bump to Moderate
        if (level === 'Low' && (randomEmotion === 'Sad' || randomEmotion === 'Angry')) {
            level = 'Moderate';
        }
        // If text is High and face is Sad/Angry, it's definitely High.
        
        // Confidence percentage (Random between 75 and 98)
        const confidence = Math.floor(Math.random() * (98 - 75 + 1)) + 75;
        
        return {
            level: level,
            textSentiment: textResult,
            facialEmotion: randomEmotion,
            confidence: confidence
        };
    }

    // --- Chart initialization ---
    let myChart = null;

    function displayResults(data) {
        // UI Elements
        const elLevel = document.getElementById('depression-level');
        const elBar = document.getElementById('depression-bar');
        const elText = document.getElementById('text-sentiment');
        const elFace = document.getElementById('facial-emotion');
        const elConfidencePath = document.getElementById('confidence-circle-path');
        const elConfidenceText = document.getElementById('confidence-score');
        
        // Clean up previous classes
        ['text-low', 'text-mod', 'text-high', 'bg-low', 'bg-mod', 'bg-high', 'stroke-low', 'stroke-mod', 'stroke-high'].forEach(cls => {
            elLevel.classList.remove(cls);
            elBar.classList.remove(cls);
            elText.classList.remove(cls);
            elFace.classList.remove(cls);
            elConfidencePath.classList.remove(cls);
            elConfidenceText.classList.remove(cls);
        });
        
        // Set values and colors based on level
        elLevel.textContent = data.level;
        elText.textContent = data.textSentiment;
        elFace.textContent = data.facialEmotion;
        
        let targetWidth = '50%';
        let colorClassPrefix = 'mod';
        
        if (data.level === 'Low') {
            targetWidth = '20%';
            colorClassPrefix = 'low';
        } else if (data.level === 'High') {
            targetWidth = '90%';
            colorClassPrefix = 'high';
        }
        
        // Apply colors
        elLevel.classList.add(`text-${colorClassPrefix}`);
        elBar.classList.add(`bg-${colorClassPrefix}`);
        elConfidencePath.classList.add(`stroke-${colorClassPrefix}`);
        elConfidenceText.classList.add(`text-${colorClassPrefix}`);
        
        // Animate elements
        setTimeout(() => {
            elBar.style.width = targetWidth;
            elConfidencePath.style.strokeDasharray = `${data.confidence}, 100`;
        }, 100);
        
        // Counter animation for confidence
        let currentConf = 0;
        const interval = setInterval(() => {
            if (currentConf >= data.confidence) {
                clearInterval(interval);
            } else {
                currentConf++;
                elConfidenceText.textContent = `${currentConf}%`;
            }
        }, 15);
        
        // Generate Tips
        generateTips(data.level);
        
        // Chart logic
        drawChart(data);
        
        // Save to History
        saveToHistory(data);
    }
    
    function generateTips(level) {
        const tipsList = document.getElementById('tips-list');
        tipsList.innerHTML = ''; // Clear previous
        
        let tips = [];
        if (level === 'Low') {
            tips = [
                "Your well-being looks stable! Keep maintaining a balanced routine.",
                "Continue engaging in activities that bring you joy.",
                "Don't forget to practice basic self-care, like sleeping well and staying hydrated.",
                "Stay connected with supportive friends and family."
            ];
        } else if (level === 'Moderate') {
            tips = [
                "You might be experiencing some stress. Consider trying mindfulness or meditation.",
                "Ensure you're taking short breaks from screens and work.",
                "Talk to someone you trust about how you're feeling.",
                "Try engaging in light physical exercise, like a 15-minute walk outside."
            ];
        } else {
            tips = [
                "It seems you are going through a tough time. It's perfectly okay to ask for professional help.",
                "Please reach out to a trusted adult, counselor, or mental health professional.",
                "Consider calling a local mental health helpline to talk to someone who understands.",
                "Be gentle with yourself. Focus only on one small step at a time today without pressure."
            ];
        }
        
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            li.style.marginBottom = '0.5rem';
            tipsList.appendChild(li);
        });
    }
    
    let analysisHistory = JSON.parse(localStorage.getItem('mindcare_history')) || [];
    
    function saveToHistory(data) {
        const date = new Date();
        data.dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        data.timestamp = date.getTime();
        
        analysisHistory.push(data);
        localStorage.setItem('mindcare_history', JSON.stringify(analysisHistory));
        
        renderHistory();
        renderLeaderboard();
    }
    
    function renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (analysisHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history" id="empty-history">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <p>No analysis history yet. Go to Detection to get started.</p>
                </div>
            `;
            return;
        }

        const sortedHistory = [...analysisHistory].sort((a,b) => b.timestamp - a.timestamp);
        
        sortedHistory.forEach(data => {
            let colorClass = 'mod';
            if(data.level === 'Low') colorClass = 'low';
            if(data.level === 'High') colorClass = 'high';
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-details">
                    <div class="history-date">${data.dateString}</div>
                    <h4>Detected: <span class="text-${colorClass}">${data.level}</span> Risk</h4>
                    <p>Text: ${data.textSentiment} | Face: ${data.facialEmotion}</p>
                </div>
                <div class="history-score">
                    <div class="history-score-val text-${colorClass}">${data.confidence}%</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted)">Confidence</div>
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    function renderLeaderboard() {
        const board = document.getElementById('leaderboard-list');
        board.innerHTML = '';
        
        if (analysisHistory.length === 0) {
            board.innerHTML = '<p class="text-muted" style="text-align:center; margin-top:2rem;">Not enough data yet.</p>';
            return;
        }

        const scoreWeights = { 'Low': 100, 'Moderate': 200, 'High': 300 };
        
        const sortedBoard = [...analysisHistory].sort((a, b) => {
            const scoreA = scoreWeights[a.level] + a.confidence;
            const scoreB = scoreWeights[b.level] + b.confidence;
            return scoreB - scoreA; // Descending
        });

        const top3 = sortedBoard.slice(0, 3);
        
        top3.forEach((data, index) => {
            let colorClass = 'mod';
            if(data.level === 'Low') colorClass = 'low';
            if(data.level === 'High') colorClass = 'high';
            
            let rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="rank-badge">${rankIcon}</div>
                <div class="leaderboard-details" style="flex:1;">
                    <div class="history-date" style="font-size:0.75rem;">${data.dateString}</div>
                    <h4><span class="text-${colorClass}">${data.level}</span> Risk</h4>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">Text: ${data.textSentiment}</p>
                </div>
                <div class="history-score-val text-${colorClass}" style="font-size:1.2rem;">${data.confidence}%</div>
            `;
            board.appendChild(item);
        });
    }

    // Initial load
    renderHistory();
    renderLeaderboard();
    
    function drawChart(data) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        if (myChart) {
            myChart.destroy(); // destroy old chart if exists
        }
        
        // Generate pseudo-probabilities based on output
        let probs = { happy: 10, sad: 10, neutral: 10, angry: 10 };
        
        if (data.level === 'Low') {
            probs.happy = 70; probs.neutral = 20; probs.sad = 5; probs.angry = 5;
        } else if (data.level === 'Moderate') {
            probs.happy = 20; probs.neutral = 40; probs.sad = 30; probs.angry = 10;
        } else {
            probs.happy = 5; probs.neutral = 15; probs.sad = 65; probs.angry = 15;
        }
        
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Happy', 'Neutral', 'Sad', 'Angry'],
                datasets: [{
                    label: 'Emotion Probability (%)',
                    data: [probs.happy, probs.neutral, probs.sad, probs.angry],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.6)', // Green
                        'rgba(148, 163, 184, 0.6)', // Gray
                        'rgba(239, 68, 68, 0.6)', // Red
                        'rgba(245, 158, 11, 0.6)'  // Amber
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(148, 163, 184, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    }
                }
            }
        });
    }

});

// Global function to reset form (called from HTML button)
window.resetForm = function() {
    document.getElementById('analysis-form').reset();
    document.getElementById('file-name-display').textContent = 'No file selected';
    
    // Hide results section and scroll to detection
    document.getElementById('result').classList.add('hidden');
    document.getElementById('detection').scrollIntoView({ behavior: 'smooth' });
};
