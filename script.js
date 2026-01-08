// ==========================================
// 1. قسم تعديل البيانات
// ==========================================

// أ- بيانات شجرة خروج المغلوب (Knockout)
const knockoutData = {
    quarter: [
        { t1: "يامن", s1: 0, t2: "لؤي", s2: 0, w: 0 }, 
        { t1: "يحيى", s1: 0, t2: "احمد", s2: 0, w: 0 },
        { t1: "راشد", s1: 0, t2: "محمد نور", s2: 0, w: 0 },
        { t1: "فتحي", s1: 0, t2: "محمد لؤي", s2: 0, w: 0 }
    ],
    semi: [
        { t1: "_", s1: 0, t2: "_", s2: 0, w: 0 },
        { t1: "_", s1: 0, t2: "_", s2: 0, w: 0 }
    ],
    final: { t1: "_", s1: "-", t2: "_", s2: "-", w: 0 }, 
    third: { t1: "_", s1: "-", t2: "_", s2: "-", w: 0 }
};

// ب- بيانات دوري النقاط (League)
const leagueTeams = [
    { name: "يامن", booyah: 0, kills: 0, points: 0 },
    { name: "لؤي", booyah: 0, kills: 0, points: 0 },
    { name: "يحيى", booyah: 0, kills: 0, points: 0 },
    { name: "فتحي", booyah: 0, kills: 0, points: 0 },
    { name: "راشد", booyah: 0, kills: 0, points: 0 },
    { name: "محمد نور", booyah: 0, kills: 0, points: 0 },
    { name: "أحمد", booyah: 0, kills: 0, points: 0 },
    { name: "محمد لؤي", booyah: 0, kills: 0, points: 0 }
];

// ج- مباريات اليوم
const dailyMatches = [
    { team1: "_", team2: "_", time: "09:00م", status: "upcoming" },
    { team1: "_", team2: "_", time: "10:30م", status: "upcoming" }
];

// د- الإحصائيات العامة والجوائز
const mvpData = [
    { icon: "🎯", title: "ملك القتلات", name: "_", stat: "0 KILLS" },
    { icon: "💥", title: "الأكثر دمجاً", name: "_", stat: "0 DMG" },
    { icon: "💀", title: "ملك الهيدشوت", name: "_", stat: "0 HS" },
    { icon: "🏃", title:"أكثر لاعب فاز", name: "_", stat: "0 Booyah" }
];

// ==========================================
// 2. المحرك البرمجي (الوظائف)
// ==========================================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    const navLink = document.getElementById('nav-' + pageId);
    if(navLink) navLink.classList.add('active');
    window.scrollTo(0,0);
}

function renderKnockout() {
    return `
        <div class="bracket-container">
            <div class="bracket-round">
                <div class="bracket-round-title">ربع النهائي</div>
                ${knockoutData.quarter.map(m => `
                    <div class="bracket-match">
                        <div class="team-slot ${m.w===1?'winner':''}">${m.t1} <span class="score">${m.s1}</span></div>
                        <div class="team-slot ${m.w===2?'winner':''}">${m.t2} <span class="score">${m.s2}</span></div>
                    </div>
                `).join('')}
            </div>
            <div class="bracket-round">
                <div class="bracket-round-title">نصف النهائي</div>
                ${knockoutData.semi.map(m => `
                    <div class="bracket-match">
                        <div class="team-slot ${m.w===1?'winner':''}">${m.t1} <span class="score">${m.s1}</span></div>
                        <div class="team-slot ${m.w===2?'winner':''}">${m.t2} <span class="score">${m.s2}</span></div>
                    </div>
                `).join('')}
            </div>
            <div class="bracket-round">
                <div class="bracket-round-title">النهائي</div>
                <div class="bracket-match final-box">
                    <div class="team-slot ${knockoutData.final.w===1?'winner':''}">${knockoutData.final.t1} <span class="score">${knockoutData.final.s1}</span></div>
                    <div class="team-slot ${knockoutData.final.w===2?'winner':''}">${knockoutData.final.t2} <span class="score">${knockoutData.final.s2}</span></div>
                </div>
                <div class="bracket-round-title" style="margin-top:20px;">المركز الثالث</div>
                <div class="bracket-match third-place">
                    <div class="team-slot ${knockoutData.third.w===1?'winner':''}">${knockoutData.third.t1} <span class="score">${knockoutData.third.s1}</span></div>
                    <div class="team-slot ${knockoutData.third.w===2?'winner':''}">${knockoutData.third.t2} <span class="score">${knockoutData.third.s2}</span></div>
                </div>
            </div>
        </div>
    `;
}

function openTournament(name, type) {
    document.getElementById('det-title').innerText = name;
    const standingContent = document.getElementById('standing-content');
    const standingTitle = document.getElementById('standing-title');
    
    document.getElementById('match-list').innerHTML = dailyMatches.map(m => `
        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;">
            ${m.team1} 🆚 ${m.team2} 
            <span style="float:left; color:${m.status === 'upcoming' ? 'var(--primary-gold)' : '#888'};">${m.time}</span>
        </div>
    `).join('');

    document.getElementById('stats-content').innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>أكثر فريق إقصاءً:</span><b style="color: var(--primary-gold);">يامن (52)</b>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <span>أعلى نسبة هيدشوت:</span><b style="color: var(--primary-gold);">يحيى (94%)</b>
        </div>
    `;

    if(type === 'league') {
        standingTitle.innerText = "📊 جدول ترتيب النقاط";
        standingContent.innerHTML = `
            <table>
                <thead><tr><th>#</th><th>الفريق</th><th>بوياه</th><th>كيلات</th><th>النقاط</th></tr></thead>
                <tbody>
                    ${leagueTeams.map((t, i) => `
                        <tr><td>${i+1}</td><td>${t.name}</td><td>${t.booyah}</td><td>${t.kills}</td><td>${t.points}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        standingTitle.innerText = "🌳 شجرة التصفيات";
        standingContent.innerHTML = renderKnockout();
    }
    showPage('tourney-details');
}

function initApp() {
    // قائمة اللاعبين
    const players = [
        {n: "يامن", id: "5122900", k: 145, h: "70%"},
        {n: "لؤي", id: "6671022", k: 130, h: "55%"},
        {n: "يحيى", id: "9910023", k: 112, h: "92%"},
        {n: "فتحي", id: "4421099", k: 98, h: "40%"}
    ];
    const playersListBody = document.getElementById('players-list-body');
    if(playersListBody) {
        playersListBody.innerHTML = players.map(p => `
            <tr><td><b>${p.n}</b></td><td style="color:var(--primary-gold)">${p.id}</td><td>${p.k}</td><td>${p.h}</td></tr>
        `).join('');
    }

    // جوائز MVP
    const mvpList = document.getElementById('general-mvp-list');
    if(mvpList) {
        mvpList.innerHTML = mvpData.map(m => `
            <div class="mvp-card">
                <span class="mvp-icon">${m.icon}</span>
                <div class="mvp-title">${m.title}</div>
                <div class="mvp-name">${m.name}</div>
                <div class="mvp-stat">${m.stat}</div>
            </div>
        `).join('');
    }

    // الأرقام الكبيرة
    const statsGrid = document.getElementById('main-stats-grid');
    if(statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card" style="text-align:center; background:rgba(255,255,255,0.05); padding:20px; border-radius:10px;">
                <div style="font-size:2rem; color:var(--primary-gold); font-weight:900;">24</div>
                <div style="font-size:0.8rem;">بطولة مكتملة</div>
            </div>
            <div class="stat-card" style="text-align:center; background:rgba(255,255,255,0.05); padding:20px; border-radius:10px;">
                <div style="font-size:2rem; color:var(--primary-gold); font-weight:900;">1,240</div>
                <div style="font-size:0.8rem;">إجمالي القتلى</div>
            </div>
        `;
    }
}

window.onload = initApp;