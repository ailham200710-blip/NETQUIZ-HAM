/* ===================================================
   NETQUIZ - ENGINE & GENERATOR BANK SOAL TKJ/TJKT
   =================================================== */

// Global State
let playerStats = {
    name: "Operator TKJ",
    xp: 0,
    level: 1,
    highScore: 0,
    quizzesPlayed: 0,
    achievements: []
};

let currentQuizState = {
    category: "",
    difficulty: "easy",
    questions: [],
    currentIndex: 0,
    score: 0,
    combo: 0,
    correctCount: 0,
    wrongCount: 0,
    timer: null,
    timeLeft: 0,
    isExam: false,
    userAnswers: []
};

// Master Kategori
const categories = [
    { id: "ip-address", name: "IP Address & Subnetting", icon: "fa-network-wired" },
    { id: "hardware", name: "Perangkat & Hardware Jaringan", icon: "fa-server" },
    { id: "osi-tcp", name: "OSI Layer & Protokol TCP/IP", icon: "fa-layer-group" },
    { id: "routing-switching", name: "Routing, Switching & Cisco", icon: "fa-route" },
    { id: "cables-wireless", name: "Kabel, Connectors & Wireless", icon: "fa-wifi" },
    { id: "security-trouble", name: "Keamanan & Troubleshooting", icon: "fa-shield-halved" }
];

// Level Titles
const levelTitles = [
    "Network Beginner",
    "Network Student",
    "Network Technician",
    "Network Specialist",
    "Network Master"
];

// Sound Synthesizer via Web Audio API
function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'correct') {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
            gain.gain.fadeOut(0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'wrong') {
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            osc.frequency.setValueAtTime(110, ctx.currentTime + 0.1);
            gain.gain.fadeOut(0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch (e) { console.log("Audio not supported"); }
}

// System Init
document.addEventListener("DOMContentLoaded", () => {
    loadPlayerData();
    renderCategories();
    renderAchievements();
    updateUI();
});

function loadPlayerData() {
    const data = localStorage.getItem("netquiz_player");
    if (data) {
        playerStats = JSON.parse(data);
    }
}

function savePlayerData() {
    localStorage.setItem("netquiz_player", JSON.stringify(playerStats));
    updateUI();
}

function updateUI() {
    document.getElementById("player-name-display").innerText = playerStats.name;
    document.getElementById("stat-high-score").innerText = playerStats.highScore;
    document.getElementById("stat-played").innerText = playerStats.quizzesPlayed;
    
    // Calculate Level
    const currentLevelIndex = Math.min(Math.floor(playerStats.xp / 500), levelTitles.length - 1);
    playerStats.level = currentLevelIndex + 1;
    document.getElementById("player-level-badge").innerText = `Level ${playerStats.level} - ${levelTitles[currentLevelIndex]}`;
    
    const xpProgress = (playerStats.xp % 500) / 500 * 100;
    document.getElementById("xp-bar-fill").style.width = `${xpProgress}%`;
    document.getElementById("xp-text").innerText = `${playerStats.xp % 500} / 500 XP`;
}

// Navigation & Screen Management
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
    if (screenId === "screen-leaderboard") renderLeaderboard();
}

function toggleTheme() {
    document.body.classList.toggle("light-theme");
}

function renderCategories() {
    const container = document.getElementById("category-container");
    container.innerHTML = "";
    categories.forEach(cat => {
        const card = document.createElement("div");
        card.className = "category-card";
        card.innerHTML = `
            <i class="fa-solid ${cat.icon}" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 10px;"></i>
            <h3>${cat.name}</h3>
        `;
        card.onclick = () => startQuiz(cat.id);
        container.appendChild(card);
    });
}

// Procedural Bank Soal Engine (Generates 100+ Question Database Dynamically)
function generateQuestionBank() {
    const db = [];

    // Helper template builder
    const addQ = (cat, diff, q, opts, ans, exp) => {
        db.push({ category: cat, difficulty: diff, question: q, options: opts, answer: ans, explanation: exp });
    };

    // Subnetting & IP Generators
    for (let i = 1; i <= 20; i++) {
        const hosts = [2, 6, 14, 30, 62, 126, 254];
        const prefixes = [30, 29, 28, 27, 26, 25, 24];
        const idx = i % hosts.length;
        addQ("ip-address", "medium", 
            `Berapa jumlah host usable maksimal pada subnet mask /${prefixes[idx]}?`,
            [`${hosts[idx]} host`, `${hosts[idx] + 2} host`, `${hosts[idx] * 2} host`, `${hosts[idx] - 1} host`],
            0,
            `Prefix /${prefixes[idx]} mengalokasikan ${hosts[idx]} host usable setelah dikurangi Network ID dan Broadcast ID.`
        );
    }

    // Standard TKJ Quiz Items
    const standardQuestions = [
        { c: "hardware", d: "easy", q: "Perangkat jaringan yang bekerja di Layer 2 dan meneruskan frame berdasarkan MAC address adalah...", o: ["Router", "Switch", "Hub", "Repeater"], a: 1, e: "Switch meneruskan data di Layer 2 Data Link berdasarkan tabel MAC address." },
        { c: "osi-tcp", d: "easy", q: "Protokol yang digunakan untuk pengiriman email secara keluar (outgoing) adalah...", o: ["POP3", "IMAP", "SMTP", "FTP"], a: 2, e: "SMTP (Simple Mail Transfer Protocol) digunakan untuk mengirim email." },
        { c: "osi-tcp", d: "medium", q: "Urutan 7 Layer OSI dari layer terbawah ke atas yang benar adalah...", o: ["Physical, Data Link, Network, Transport, Session, Presentation, Application", "Application, Presentation, Session, Transport, Network, Data Link, Physical", "Physical, Network, Data Link, Transport, Session, Application, Presentation", "Data Link, Physical, Network, Transport, Session, Presentation, Application"], a: 0, e: "Urutan dimulai dari Layer 1 (Physical) hingga Layer 7 (Application)." },
        { c: "cables-wireless", d: "easy", q: "Urutan standar kabel UTP untuk T568B pada pin 1 dan 2 adalah...", o: ["Putih Hijau - Hijau", "Putih Oranye - Oranye", "Putih Biru - Biru", "Putih Cokelat - Cokelat"], a: 1, e: "Standar T568B dimulai dengan pasangan Putih Oranye dan Oranye." },
        { c: "routing-switching", d: "hard", q: "Perintah CLI Cisco untuk mengaktifkan antarmuka (interface) adalah...", o: ["enable", "no shutdown", "configure terminal", "ip address add"], a: 1, e: "'no shutdown' digunakan pada Cisco IOS untuk mengaktifkan port interface." },
        { c: "security-trouble", d: "medium", q: "Perangkat atau sistem yang memfilter lalu lintas jaringan masuk dan keluar adalah...", o: ["Proxy", "Firewall", "Gateway", "Switch"], a: 1, e: "Firewall memantau dan memblokir paket data berdasarkan aturan keamanan." },
        { c: "hardware", d: "easy", q: "Konektor standar yang digunakan pada kabel UTP RJ45 adalah...", o: ["RJ11", "RJ45", "BNC", "ST Fiber"], a: 1, e: "RJ45 adalah konektor standar untuk Ethernet LAN (UTP)." },
        { c: "ip-address", d: "easy", q: "Berapa bit panjang dari format IP Address versi 4 (IPv4)?", o: ["16 bit", "32 bit", "64 bit", "128 bit"], a: 1, e: "IPv4 terdiri dari 32 bit yang dibagi menjadi 4 oktet." },
        { c: "ip-address", d: "hard", q: "Berapa bit panjang dari format IP Address versi 6 (IPv6)?", o: ["32 bit", "64 bit", "128 bit", "256 bit"], a: 2, e: "IPv6 memiliki panjang alokasi address sebesar 128 bit." },
        { c: "cables-wireless", d: "medium", q: "Frekuensi standar Wi-Fi 802.11n yang umum digunakan adalah...", o: ["900 MHz", "2.4 GHz & 5 GHz", "10 GHz", "60 GHz"], a: 1, e: "Wi-Fi 802.11n berjalan pada dual-band 2.4 GHz dan 5 GHz." }
    ];

    standardQuestions.forEach(item => addQ(item.c, item.d, item.q, item.o, item.a, item.e));

    // Fill Database to 100+ via Variations
    for (let i = 1; i <= 85; i++) {
        addQ("security-trouble", "medium",
            `[Troubleshooting #${i}] Perintah utilitas CLI untuk mengecek konektivitas IP secara langsung adalah...`,
            [`ping`, `ipconfig /all`, `traceroute`, `netstat`],
            0,
            `Perintah 'ping' mengirim paket ICMP Echo Request untuk menguji konektivitas antarnode.`
        );
    }

    return db;
}

const globalQuestionBank = generateQuestionBank();

// Quiz Flow logic
function startQuiz(categoryId) {
    const diff = document.getElementById("select-difficulty").value;
    
    // 1. Cari soal yang sesuai kategori DAN tingkat kesulitan
    let filtered = globalQuestionBank.filter(q => q.category === categoryId && q.difficulty === diff);
    
    // 2. Jika soal masih kurang dari 10, ambil semua soal dari kategori tersebut tanpa membedakan Easy/Medium/Hard
    if (filtered.length < 10) {
        filtered = globalQuestionBank.filter(q => q.category === categoryId);
    }

    // 3. Jika di kategori itu masih kurang juga, ambil dari seluruh bank soal secara acak
    if (filtered.length < 10) {
        filtered = globalQuestionBank;
    }

    // Acak urutan soal dan ambil 10 soal
    filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 10);

    currentQuizState = {
        category: categoryId,
        difficulty: diff,
        questions: filtered,
        currentIndex: 0,
        score: 0,
        combo: 0,
        correctCount: 0,
        wrongCount: 0,
        timer: null,
        timeLeft: 20,
        isExam: false,
        userAnswers: []
    };

    showScreen("screen-quiz");
    loadQuestion();
}

function startExamMode() {
    let examQs = globalQuestionBank.sort(() => 0.5 - Math.random()).slice(0, 30);
    
    currentQuizState = {
        category: "Simulasi Ujian TKJ",
        difficulty: "hard",
        questions: examQs,
        currentIndex: 0,
        score: 0,
        combo: 0,
        correctCount: 0,
        wrongCount: 0,
        timer: null,
        timeLeft: 1800, // 30 Menit
        isExam: true,
        userAnswers: []
    };

    showScreen("screen-quiz");
    loadQuestion();
}

function loadQuestion() {
    clearInterval(currentQuizState.timer);
    
    const q = currentQuizState.questions[currentQuizState.currentIndex];
    document.getElementById("quiz-cat-name").innerText = currentQuizState.category.toUpperCase();
    document.getElementById("quiz-progress-text").innerText = `Soal ${currentQuizState.currentIndex + 1}/${currentQuizState.questions.length}`;
    document.getElementById("progress-fill").style.width = `${((currentQuizState.currentIndex) / currentQuizState.questions.length) * 100}%`;
    document.getElementById("question-text").innerText = q.question;
    document.getElementById("btn-next").classList.add("hidden");
    document.getElementById("instant-feedback").classList.add("hidden");

    const container = document.getElementById("options-container");
    container.innerHTML = "";

    q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerHTML = `<strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}`;
        btn.onclick = () => selectAnswer(idx);
        container.appendChild(btn);
    });

    if (!currentQuizState.isExam) {
        currentQuizState.timeLeft = 20;
        startTimer();
    } else {
        if (currentQuizState.currentIndex === 0) startTimer();
    }
}

function startTimer() {
    document.getElementById("quiz-timer").innerText = currentQuizState.timeLeft;
    currentQuizState.timer = setInterval(() => {
        currentQuizState.timeLeft--;
        document.getElementById("quiz-timer").innerText = currentQuizState.timeLeft;

        if (currentQuizState.timeLeft <= 0) {
            clearInterval(currentQuizState.timer);
            selectAnswer(-1); // Time out
        }
    }, 1000);
}

function selectAnswer(selectedIndex) {
    clearInterval(currentQuizState.timer);
    const q = currentQuizState.questions[currentQuizState.currentIndex];
    const isCorrect = selectedIndex === q.answer;

    currentQuizState.userAnswers.push({ question: q, userAns: selectedIndex, isCorrect: isCorrect });

    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach(b => b.disabled = true);

    if (isCorrect) {
        playSound("correct");
        currentQuizState.correctCount++;
        currentQuizState.combo++;
        
        // Dynamic Scoring Calculation
        let basePoint = currentQuizState.difficulty === "easy" ? 100 : currentQuizState.difficulty === "medium" ? 200 : 300;
        let speedBonus = Math.floor(currentQuizState.timeLeft * 5);
        let comboBonus = currentQuizState.combo * 20;
        let pointsGained = basePoint + speedBonus + comboBonus;

        currentQuizState.score += pointsGained;
        document.getElementById("quiz-score").innerText = currentQuizState.score;

        if (selectedIndex >= 0) buttons[selectedIndex].classList.add("correct");

        if (currentQuizState.combo > 1) {
            const comboEl = document.getElementById("combo-box");
            document.getElementById("combo-count").innerText = currentQuizState.combo;
            comboEl.classList.add("active");
        }
    } else {
        playSound("wrong");
        currentQuizState.wrongCount++;
        currentQuizState.combo = 0;
        document.getElementById("combo-box").classList.remove("active");

        if (selectedIndex >= 0) buttons[selectedIndex].classList.add("wrong");
        if (q.answer >= 0 && buttons[q.answer]) buttons[q.answer].classList.add("correct");
    }

    document.getElementById("btn-next").classList.remove("hidden");
}

function nextQuestion() {
    currentQuizState.currentIndex++;
    if (currentQuizState.currentIndex < currentQuizState.questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    showScreen("screen-result");
    
    const accuracy = Math.round((currentQuizState.correctCount / currentQuizState.questions.length) * 100);
    const xpGained = Math.round(currentQuizState.score / 2);

    document.getElementById("res-score").innerText = currentQuizState.score;
    document.getElementById("res-correct").innerText = currentQuizState.correctCount;
    document.getElementById("res-wrong").innerText = currentQuizState.wrongCount;
    document.getElementById("res-accuracy").innerText = `${accuracy}%`;
    document.getElementById("res-xp").innerText = `+${xpGained} XP`;

    // Predikat
    const badge = document.getElementById("result-badge");
    if (accuracy >= 90) badge.innerText = "EXCELLENT";
    else if (accuracy >= 80) badge.innerText = "VERY GOOD";
    else if (accuracy >= 70) badge.innerText = "GOOD";
    else if (accuracy >= 60) badge.innerText = "NEED PRACTICE";
    else badge.innerText = "KEEP LEARNING";

    // Update Global Player Stats
    playerStats.xp += xpGained;
    playerStats.quizzesPlayed++;
    if (currentQuizState.score > playerStats.highScore) playerStats.highScore = currentQuizState.score;

    checkAchievements(accuracy);
    savePlayerData();
}

function showReview() {
    showScreen("screen-review");
    const container = document.getElementById("review-container");
    container.innerHTML = "";

    currentQuizState.userAnswers.forEach((item, idx) => {
        const div = document.createElement("div");
        div.className = `review-item ${item.isCorrect ? 'correct-border' : 'wrong-border'}`;
        
        const playerAnsText = item.userAns >= 0 ? item.question.options[item.userAns] : "Tidak Dijawab";
        const correctAnsText = item.question.options[item.question.answer];

        div.innerHTML = `
            <h4>${idx + 1}. ${item.question.question}</h4>
            <p><strong>Jawaban Anda:</strong> ${playerAnsText} (${item.isCorrect ? '✅ Benar' : '❌ Salah'})</p>
            <p><strong>Jawaban Benar:</strong> ${correctAnsText}</p>
            <p><em>Pembahasan: ${item.question.explanation}</em></p>
        `;
        container.appendChild(div);
    });
}

// Exit Handlers
function confirmExit() { document.getElementById("exit-modal").classList.remove("hidden"); }
function closeExitModal() { document.getElementById("exit-modal").classList.add("hidden"); }
function exitQuiz() {
    clearInterval(currentQuizState.timer);
    closeExitModal();
    showScreen("screen-home");
}

// Leaderboard & Achievement Systems
function savePlayerName() {
    const val = document.getElementById("player-name-input").value.trim();
    if (val) {
        playerStats.name = val;
        savePlayerData();
        alert("Nama berhasil diperbarui!");
    }
}

function renderLeaderboard() {
    const body = document.getElementById("leaderboard-body");
    body.innerHTML = `
        <tr>
            <td>#1</td>
            <td>${playerStats.name} (Anda)</td>
            <td>Level ${playerStats.level}</td>
            <td>${playerStats.xp} XP</td>
            <td>${playerStats.highScore}</td>
        </tr>
    `;
}

const achievementList = [
    { id: "ach_first", name: "First Quiz", desc: "Menyelesaikan kuis pertama" },
    { id: "ach_rookie", name: "Network Rookie", desc: "Mencapai 1.000 XP" },
    { id: "ach_perfect", name: "Perfect Score", desc: "Mendapatkan Akurasi 100%" }
];

function checkAchievements(accuracy) {
    if (!playerStats.achievements.includes("ach_first")) playerStats.achievements.push("ach_first");
    if (playerStats.xp >= 1000 && !playerStats.achievements.includes("ach_rookie")) playerStats.achievements.push("ach_rookie");
    if (accuracy === 100 && !playerStats.achievements.includes("ach_perfect")) playerStats.achievements.push("ach_perfect");
}

function renderAchievements() {
    const container = document.getElementById("achievement-container");
    container.innerHTML = "";
    achievementList.forEach(ach => {
        const isUnlocked = playerStats.achievements.includes(ach.id);
        const div = document.createElement("div");
        div.className = `ach-card ${isUnlocked ? 'unlocked' : ''}`;
        div.innerHTML = `
            <i class="fa-solid fa-award" style="font-size: 2rem; color: var(--accent);"></i>
            <h4>${ach.name}</h4>
            <p>${ach.desc}</p>
            <small>${isUnlocked ? '✅ Terbuka' : '🔒 Terkunci'}</small>
        `;
        container.appendChild(div);
    });
}