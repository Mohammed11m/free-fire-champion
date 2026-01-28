// --- إعدادات FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBFAY0L2awgYLZgRlxjCXQDuZ_hTQ0U6Ew",
    authDomain: "ff-home-4a36a.firebaseapp.com",
    projectId: "ff-home-4a36a",
    storageBucket: "ff-home-4a36a.firebasestorage.app",
    messagingSenderId: "388521388228",
    appId: "1:388521388228:web:5e2bb5a5928ce8b2c2c191",
    measurementId: "G-FKR3XK8J2Y"
};

// تهيئة الاتصال
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let isAdmin = false;
let adminTimer;
let currentTournamentId = null;

let appData = {
    globalStats: [],
    mvps: [],
    players: [],
    tournaments: []
};

// --- التزامن اللحظي ---
db.ref('royalArenaData').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        appData = data;
        // تحديث الصفحة الحالية تلقائياً عند أي تغيير في قاعدة البيانات
        const activePage = document.querySelector('.page.active').id;
        if (activePage === 'tourney-details' && currentTournamentId) {
            openTournament(currentTournamentId);
        } else {
            renderPageContent(activePage);
        }
    }
});

function syncToCloud() {
    if (isAdmin) {
        db.ref('royalArenaData').set(appData)
            .then(() => console.log("تم الحفظ بنجاح"))
            .catch(err => console.error("خطأ في الحفظ:", err));
    }
}

// --- وظائف العرض والتنقل ---
function showPage(pageId) {
    currentTournamentId = null;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    const navLink = document.getElementById('nav-' + (pageId === 'tourney-details' ? 'home' : pageId));
    if(navLink) navLink.classList.add('active');
    
    renderPageContent(pageId);
}

function renderPageContent(pageId) {
    if(pageId === 'home') renderHome();
    if(pageId === 'players') renderPlayers();
    if(pageId === 'general-stats') renderStats();
}

function renderHome() {
    const list = document.getElementById('tournaments-list');
    if(!list) return;
    list.innerHTML = (appData.tournaments || []).map(t => `
        <div class="tourney-card" onclick="openTournament(${t.id})">
            <div class="banner-small" style="background-image: url('${t.banner || ''}'); height:150px; background-size:cover;"></div>
            <div class="card-body">
                <h3>${t.name}</h3>
                <p style="color:var(--primary-gold);">${t.type === 'league' ? 'نظام دوري' : 'نظام إقصاء'}</p>
            </div>
        </div>
    `).join('');
}

function openTournament(id) {
    const t = appData.tournaments.find(x => x.id === id);
    if(!t) return;
    currentTournamentId = id;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('tourney-details').classList.add('active');
    document.getElementById('det-title').innerText = t.name;
    renderTournamentDetails(t);
}

function renderTournamentDetails(t) {
    const content = document.getElementById('standing-content');
    const title = document.getElementById('standing-title');
    
    // المواعيد
    document.getElementById('match-list').innerHTML = (t.matches || []).map((m, i) => `
        <div class="match-item" style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:8px; display:flex; align-items:center;">
            ${isAdmin ? `<input class="edit-input" style="width:70px" value="${m.t1}" onchange="updateMatch(${t.id},${i},'t1',this.value)">` : `<b>${m.t1}</b>`} 
            <span style="margin:0 10px;">VS</span> 
            ${isAdmin ? `<input class="edit-input" style="width:70px" value="${m.t2}" onchange="updateMatch(${t.id},${i},'t2',this.value)">` : `<b>${m.t2}</b>`}
            <span style="color:var(--primary-gold); margin-right:auto;">
                ${isAdmin ? `<input class="edit-input" style="width:70px" value="${m.time}" onchange="updateMatch(${t.id},${i},'time',this.value)">` : m.time}
            </span>
            ${isAdmin ? `<button onclick="deleteMatch(${t.id},${i})" style="color:red; background:none; border:none; margin-left:10px;">X</button>` : ''}
        </div>
    `).join('') || '<p style="opacity:0.5; text-align:center;">لا توجد مباريات</p>';

    // الأرقام القياسية
    document.getElementById('stats-content').innerHTML = `
        <p>أكثر قتلات: ${isAdmin ? `<input class="edit-input" value="${t.records.topKills}" onchange="updateTourneyRecord(${t.id},'topKills',this.value)">` : t.records.topKills}</p>
        <p>أعلى هيدشوت: ${isAdmin ? `<input class="edit-input" value="${t.records.topHS}" onchange="updateTourneyRecord(${t.id},'topHS',this.value)">` : t.records.topHS}</p>
    `;

    if(t.type === 'league') {
        title.innerText = "📊 جدول الترتيب";
        content.innerHTML = `
            ${isAdmin ? `<button onclick="addLeagueTeam(${t.id})" style="background:#28a745; width:100%; color:white; padding:10px; border:none; border-radius:5px; margin-bottom:10px; cursor:pointer;">+ إضافة فريق للجدول</button>` : ''}
            <div class="table-responsive">
                <table>
                    <thead><tr><th>الفريق</th><th>بوياه</th><th>كيلات</th><th>نقاط</th>${isAdmin ? '<th>X</th>' : ''}</tr></thead>
                    <tbody>${(t.data || []).map((team, idx) => `
                        <tr>
                            <td>${isAdmin ? `<input class="edit-input" value="${team.name}" onchange="updateLeague(${t.id},${idx},'name',this.value)">` : team.name}</td>
                            <td>${isAdmin ? `<input type="number" class="edit-input" value="${team.booyah}" onchange="updateLeague(${t.id},${idx},'booyah',this.value)">` : team.booyah}</td>
                            <td>${isAdmin ? `<input type="number" class="edit-input" value="${team.kills}" onchange="updateLeague(${t.id},${idx},'kills',this.value)">` : team.kills}</td>
                            <td>${isAdmin ? `<input type="number" class="edit-input" value="${team.points}" onchange="updateLeague(${t.id},${idx},'points',this.value)">` : team.points}</td>
                            ${isAdmin ? `<td><button onclick="deleteLeagueTeam(${t.id},${idx})" style="color:red; background:none; border:none;">🗑️</button></td>` : ''}
                        </tr>`).join('')}</tbody>
                </table>
            </div>
        `;
    } else {
        title.innerText = "🌳 شجرة الإقصاء";
        content.innerHTML = renderBracketHTML(t);
    }
}

function renderBracketHTML(t) {
    const d = t.data;
    const matchUI = (match, round, idx) => `
        <div class="bracket-match" style="border:1px solid rgba(255,255,255,0.1); margin:5px; padding:5px;">
            <div class="team-slot ${match.w==1?'winner':''}">
                ${isAdmin ? `<input class="edit-input" style="width:60%" value="${match.t1}" onchange="updateKnockout(${t.id},'${round}',${idx},'t1',this.value)">` : match.t1}
                <span class="score">${isAdmin ? `<input type="number" class="edit-input" style="width:35px" value="${match.s1}" onchange="updateKnockout(${t.id},'${round}',${idx},'s1',this.value)">` : match.s1}</span>
                ${isAdmin ? `<input type="radio" name="${round}_${idx}" ${match.w==1?'checked':''} onclick="updateKnockout(${t.id},'${round}',${idx},'w',1)">` : ''}
            </div>
            <div class="team-slot ${match.w==2?'winner':''}">
                ${isAdmin ? `<input class="edit-input" style="width:60%" value="${match.t2}" onchange="updateKnockout(${t.id},'${round}',${idx},'t2',this.value)">` : match.t2}
                <span class="score">${isAdmin ? `<input type="number" class="edit-input" style="width:35px" value="${match.s2}" onchange="updateKnockout(${t.id},'${round}',${idx},'s2',this.value)">` : match.s2}</span>
                ${isAdmin ? `<input type="radio" name="${round}_${idx}" ${match.w==2?'checked':''} onclick="updateKnockout(${t.id},'${round}',${idx},'w',2)">` : ''}
            </div>
        </div>
    `;
    return `<div class="bracket-container" style="display:flex; overflow-x:auto;">
        <div class="bracket-round"><h4>ربع النهائي</h4>${(d.quarter || []).map((m,i)=>matchUI(m,'quarter',i)).join('')}</div>
        <div class="bracket-round"><h4>نصف النهائي</h4>${(d.semi || []).map((m,i)=>matchUI(m,'semi',i)).join('')}</div>
        <div class="bracket-round"><h4>النهائي</h4>${matchUI(d.final,'final',0)}</div>
    </div>`;
}

// --- نظام الإدارة ---
function startAdminTimer() { adminTimer = setTimeout(() => { document.getElementById('admin-modal').style.display='flex'; }, 7000); }
function clearAdminTimer() { clearTimeout(adminTimer); }

function checkPassword() {
    if(document.getElementById('admin-password').value === '02580258') {
        isAdmin = true; 
        document.body.classList.add('admin-mode'); 
        closeModal('admin-modal');
        currentTournamentId ? openTournament(currentTournamentId) : renderPageContent('home');
    } else alert('كلمة السر خاطئة!');
}

function logoutAdmin() { 
    isAdmin = false; 
    document.body.classList.remove('admin-mode'); 
    showPage('home'); 
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openAddTourneyModal() { document.getElementById('tourney-modal').style.display = 'flex'; }

function confirmAddTournament() {
    const name = document.getElementById('new-t-name').value;
    const banner = document.getElementById('new-t-banner').value;
    const type = document.getElementById('new-t-type').value;
    if(!name) return;
    
    let data = type === 'league' ? [] : {
        quarter: Array(4).fill(null).map(() => ({ t1: "-", s1: 0, t2: "-", s2: 0, w: 0 })),
        semi: Array(2).fill(null).map(() => ({ t1: "-", s1: 0, t2: "-", s2: 0, w: 0 })),
        final: { t1: "-", s1: 0, t2: "-", s2: 0, w: 0 }
    };
    
    if(!appData.tournaments) appData.tournaments = [];
    appData.tournaments.push({ id: Date.now(), name, type, banner, data, matches: [], records: { topKills: "-", topHS: "0%" } });
    syncToCloud(); 
    closeModal('tourney-modal');
}

// --- دوال التحديث (معدلة) ---
function addLeagueTeam(id) { 
    const t = appData.tournaments.find(x => x.id == id);
    if(t) {
        if(!Array.isArray(t.data)) t.data = [];
        t.data.push({name: "فريق جديد", booyah: 0, kills: 0, points: 0}); 
        syncToCloud(); 
    }
}

function updateLeague(id, idx, f, v) { 
    const t = appData.tournaments.find(x=>x.id==id);
    t.data[idx][f] = (f=='name' ? v : parseInt(v) || 0); 
    syncToCloud(); 
}

function deleteLeagueTeam(id, idx) { 
    appData.tournaments.find(x=>x.id==id).data.splice(idx,1); 
    syncToCloud(); 
}

function updateKnockout(id, r, idx, f, v) {
    const t = appData.tournaments.find(x=>x.id==id);
    const target = (r=='final') ? t.data[r] : t.data[r][idx];
    target[f] = (f=='t1'||f=='t2' ? v : parseInt(v) || 0);
    syncToCloud();
}

function updateMatch(id, idx, f, v) { 
    appData.tournaments.find(x=>x.id==id).matches[idx][f]=v; 
    syncToCloud(); 
}

function addMatch() { 
    const t = appData.tournaments.find(x=>x.id==currentTournamentId);
    if(!t.matches) t.matches = [];
    t.matches.push({t1:"-",t2:"-",time:"00:00"}); 
    syncToCloud(); 
}

function deleteMatch(id, idx) { 
    appData.tournaments.find(x=>x.id==id).matches.splice(idx,1); 
    syncToCloud(); 
}

function updateTourneyRecord(id, f, v) { 
    appData.tournaments.find(x=>x.id==id).records[f]=v; 
    syncToCloud(); 
}

function renderPlayers() {
    const body = document.getElementById('players-list-body');
    if(!body) return;
    body.innerHTML = (appData.players || []).map((p, i) => `
        <tr>
            <td>${isAdmin ? `<input class="edit-input" value="${p.name}" onchange="appData.players[${i}].name=this.value; syncToCloud();">` : p.name}</td>
            <td>${isAdmin ? `<input class="edit-input" value="${p.id}" onchange="appData.players[${i}].id=this.value; syncToCloud();">` : p.id}</td>
            <td>${isAdmin ? `<input type="number" class="edit-input" value="${p.kills}" onchange="appData.players[${i}].kills=parseInt(this.value); syncToCloud();">` : p.kills}</td>
            <td>${isAdmin ? `<input class="edit-input" value="${p.hs}" onchange="appData.players[${i}].hs=this.value; syncToCloud();">` : p.hs}</td>
            ${isAdmin ? `<td><button onclick="appData.players.splice(${i},1); syncToCloud();" style="color:red; background:none; border:none;">X</button></td>` : ''}
        </tr>`).join('');
}

function renderStats() {
    const mainContainer = document.getElementById('main-stats-container');
    const mvpContainer = document.getElementById('general-mvp-list');
    
    if(mainContainer) {
        mainContainer.innerHTML = (appData.globalStats || []).map((s, i) => `
            <div class="glass-card" style="text-align:center; padding:15px; border-radius:10px; background:rgba(255,255,255,0.05);">
                ${isAdmin ? `<input class="edit-input" style="font-size:1.5rem; text-align:center;" value="${s.value}" onchange="appData.globalStats[${i}].value=this.value; syncToCloud();">` : `<h3>${s.value}</h3>`}
                ${isAdmin ? `<input class="edit-input" style="text-align:center;" value="${s.label}" onchange="appData.globalStats[${i}].label=this.value; syncToCloud();">` : `<p>${s.label}</p>`}
            </div>`).join('');
    }
    
    if(mvpContainer) {
        mvpContainer.innerHTML = (appData.mvps || []).map((m, i) => `
            <div class="glass-card" style="text-align:center; position:relative; padding:15px; background:rgba(255,255,255,0.05);">
                ${isAdmin ? `<button onclick="appData.mvps.splice(${i},1); syncToCloud();" style="position:absolute; top:5px; left:5px; color:red; background:none; border:none;">X</button>` : ''}
                <span style="font-size:2rem;">${m.icon}</span>
                <p>${isAdmin ? `<input class="edit-input" style="text-align:center;" value="${m.title}" onchange="appData.mvps[${i}].title=this.value; syncToCloud();">` : m.title}</p>
                <h3>${isAdmin ? `<input class="edit-input" style="text-align:center;" value="${m.name}" onchange="appData.mvps[${i}].name=this.value; syncToCloud();">` : m.name}</h3>
                <b>${isAdmin ? `<input class="edit-input" style="text-align:center;" value="${m.stat}" onchange="appData.mvps[${i}].stat=this.value; syncToCloud();">` : m.stat}</b>
            </div>`).join('');
    }
}

// أزرار الإضافة العامة
function addNewPlayer() { 
    if(!appData.players) appData.players = [];
    appData.players.push({name:"لاعب جديد", id:"000000", kills:0, hs:"0%"}); 
    syncToCloud(); 
}
function addGlobalStat() { 
    if(!appData.globalStats) appData.globalStats = [];
    appData.globalStats.push({ label: "إحصائية جديدة", value: "0" }); 
    syncToCloud(); 
}
function addGlobalMVP() { 
    if(!appData.mvps) appData.mvps = [];
    appData.mvps.push({ icon: "🏆", title: "لقب جديد", name: "الاسم", stat: "0" }); 
    syncToCloud(); 
}

window.onload = () => {
    showPage('home');
};
