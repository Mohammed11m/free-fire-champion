let isAdmin = false;
let adminTimer;
let currentTournamentId = null;

let appData = {
    globalStats: [
        { label: "بطولة مكتملة", value: "24" },
        { label: "إجمالي القتلى", value: "1,240" }
    ],
    mvps: [
        { icon: "🎯", title: "ملك القتلات", name: "يحيى", stat: "150 KILLS" }
    ],
    players: [
        { name: "يحيى", id: "5122900", kills: 45, hs: "70%" }
    ],
    tournaments: [
        {
            id: 1, name: "دوري النقاط الملكي", type: "league", 
            banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400", 
            data: [{ name: "فريق النخبة", booyah: 2, kills: 24, points: 50 }], 
            matches: [], records: { topKills: "-", topHS: "0%" }
        }
    ]
};

function showPage(pageId) {
    currentTournamentId = null;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
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
    list.innerHTML = appData.tournaments.map(t => `
        <div class="tourney-card" onclick="openTournament(${t.id})">
            <div class="banner-small" style="background-image: url('${t.banner || ''}');"></div>
            <div class="card-body">
                <h3>${t.name}</h3>
                <p style="color:var(--primary-gold); font-size:0.8rem;">${t.type === 'league' ? 'نظام دوري' : 'نظام إقصاء'}</p>
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
    
    document.getElementById('match-list').innerHTML = t.matches.map((m, i) => `
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:8px; font-size:0.9rem; display:flex; align-items:center; gap:5px;">
            ${isAdmin ? `<input class="edit-input" style="width:70px" value="${m.t1}" onchange="updateMatch(${t.id},${i},'t1',this.value)">` : `<b>${m.t1}</b>`} VS 
            ${isAdmin ? `<input class="edit-input" style="width:70px" value="${m.t2}" onchange="updateMatch(${t.id},${i},'t2',this.value)">` : `<b>${m.t2}</b>`}
            <span style="color:var(--primary-gold); margin-right:auto;">
                ${isAdmin ? `<input class="edit-input" style="width:70px" value="${m.time}" onchange="updateMatch(${t.id},${i},'time',this.value)">` : m.time}
            </span>
            ${isAdmin ? `<button onclick="deleteMatch(${t.id},${i})" style="color:red; background:none; border:none;">X</button>` : ''}
        </div>
    `).join('') || '<p style="opacity:0.5; text-align:center;">لا توجد مباريات</p>';

    document.getElementById('stats-content').innerHTML = `
        <p>أكثر قتلات: ${isAdmin ? `<input class="edit-input" value="${t.records.topKills}" onchange="updateTourneyRecord(${t.id},'topKills',this.value)">` : t.records.topKills}</p>
        <p>أعلى هيدشوت: ${isAdmin ? `<input class="edit-input" value="${t.records.topHS}" onchange="updateTourneyRecord(${t.id},'topHS',this.value)">` : t.records.topHS}</p>
    `;

    if(t.type === 'league') {
        title.innerText = "📊 جدول الترتيب";
        content.innerHTML = `
            <div class="admin-only" style="margin-bottom:10px;"><button onclick="addLeagueTeam(${t.id})" class="btn-admin" style="background:#28a745; width:100%;">+ إضافة فريق</button></div>
            <div class="table-responsive">
                <table>
                    <thead><tr><th>الفريق</th><th>بوياه</th><th>كيلات</th><th>نقاط</th><th class="admin-only">X</th></tr></thead>
                    <tbody>${t.data.map((team, idx) => `
                        <tr>
                            <td>${isAdmin ? `<input class="edit-input" value="${team.name}" onchange="updateLeague(${t.id},${idx},'name',this.value)">` : team.name}</td>
                            <td>${isAdmin ? `<input type="number" class="edit-input" value="${team.booyah}" onchange="updateLeague(${t.id},${idx},'booyah',this.value)">` : team.booyah}</td>
                            <td>${isAdmin ? `<input type="number" class="edit-input" value="${team.kills}" onchange="updateLeague(${t.id},${idx},'kills',this.value)">` : team.kills}</td>
                            <td>${isAdmin ? `<input type="number" class="edit-input" value="${team.points}" onchange="updateLeague(${t.id},${idx},'points',this.value)">` : team.points}</td>
                            <td class="admin-only"><button onclick="deleteLeagueTeam(${t.id},${idx})" style="color:red; background:none; border:none;">🗑️</button></td>
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
        <div class="bracket-match">
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
    return `<div class="bracket-container">
        <div class="bracket-round"><div class="bracket-round-title">ربع النهائي</div>${d.quarter.map((m,i)=>matchUI(m,'quarter',i)).join('')}</div>
        <div class="bracket-round"><div class="bracket-round-title">نصف النهائي</div>${d.semi.map((m,i)=>matchUI(m,'semi',i)).join('')}</div>
        <div class="bracket-round"><div class="bracket-round-title">النهائي</div>${matchUI(d.final,'final',0)}</div>
    </div>`;
}

// مؤقت المسؤول 7 ثواني
function startAdminTimer() { adminTimer = setTimeout(() => { document.getElementById('admin-modal').style.display='flex'; }, 7000); }
function clearAdminTimer() { clearTimeout(adminTimer); }

function checkPassword() {
    if(document.getElementById('admin-password').value === '02580258') {
        isAdmin = true; document.body.classList.add('admin-mode'); closeModal('admin-modal');
        currentTournamentId ? openTournament(currentTournamentId) : renderPageContent('home');
    } else alert('خطأ!');
}

function logoutAdmin() { isAdmin = false; document.body.classList.remove('admin-mode'); showPage('home'); }
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
    appData.tournaments.push({ id: Date.now(), name, type, banner, data, matches: [], records: { topKills: "-", topHS: "0%" } });
    closeModal('tourney-modal'); renderHome();
}

// بقية وظائف التحديث (اختصاراً)
function updateLeague(id, idx, f, v) { appData.tournaments.find(x=>x.id==id).data[idx][f] = (f=='name'?v:parseInt(v)); }
function addLeagueTeam(id) { appData.tournaments.find(x=>x.id==id).data.push({name:"جديد",booyah:0,kills:0,points:0}); openTournament(id); }
function deleteLeagueTeam(id, idx) { appData.tournaments.find(x=>x.id==id).data.splice(idx,1); openTournament(id); }
function updateKnockout(id, r, idx, f, v) {
    const t = appData.tournaments.find(x=>x.id==id);
    const target = (r=='final') ? t.data[r] : t.data[r][idx];
    target[f] = (f=='t1'||f=='t2'?v:parseInt(v));
    openTournament(id);
}
function updateMatch(id, idx, f, v) { appData.tournaments.find(x=>x.id==id).matches[idx][f]=v; }
function addMatch() { appData.tournaments.find(x=>x.id==currentTournamentId).matches.push({t1:"-",t2:"-",time:"00:00"}); openTournament(currentTournamentId); }
function deleteMatch(id, idx) { appData.tournaments.find(x=>x.id==id).matches.splice(idx,1); openTournament(id); }
function updateTourneyRecord(id, f, v) { appData.tournaments.find(x=>x.id==id).records[f]=v; }
function renameTourney() {
    const n = prompt("الاسم:", appData.tournaments.find(x=>x.id==currentTournamentId).name);
    if(n) { appData.tournaments.find(x=>x.id==currentTournamentId).name = n; openTournament(currentTournamentId); }
}
function changeTourneyBanner() {
    const b = prompt("الرابط:", appData.tournaments.find(x=>x.id==currentTournamentId).banner);
    if(b!==null) { appData.tournaments.find(x=>x.id==currentTournamentId).banner = b; openTournament(currentTournamentId); }
}
function deleteCurrentTournament() { if(confirm('حذف؟')){ appData.tournaments=appData.tournaments.filter(x=>x.id!=currentTournamentId); showPage('home'); }}

function renderPlayers() {
    document.getElementById('players-list-body').innerHTML = appData.players.map((p, i) => `
        <tr>
            <td>${isAdmin ? `<input class="edit-input" value="${p.name}" onchange="appData.players[${i}].name=this.value">` : p.name}</td>
            <td>${isAdmin ? `<input class="edit-input" value="${p.id}" onchange="appData.players[${i}].id=this.value">` : p.id}</td>
            <td>${isAdmin ? `<input type="number" class="edit-input" value="${p.kills}" onchange="appData.players[${i}].kills=this.value">` : p.kills}</td>
            <td>${isAdmin ? `<input class="edit-input" value="${p.hs}" onchange="appData.players[${i}].hs=this.value">` : p.hs}</td>
            <td class="admin-only"><button onclick="appData.players.splice(${i},1); renderPlayers();">X</button></td>
        </tr>`).join('');
}

function renderStats() {
    document.getElementById('main-stats-container').innerHTML = appData.globalStats.map((s, i) => `
        <div class="glass-card" style="text-align:center;">
            ${isAdmin ? `<input class="edit-input" value="${s.value}" onchange="appData.globalStats[${i}].value=this.value">` : `<h3>${s.value}</h3>`}
            ${isAdmin ? `<input class="edit-input" value="${s.label}" onchange="appData.globalStats[${i}].label=this.value">` : `<p>${s.label}</p>`}
        </div>`).join('');
    
    document.getElementById('general-mvp-list').innerHTML = appData.mvps.map((m, i) => `
        <div class="glass-card" style="text-align:center;">
            <span>${m.icon}</span>
            <p>${m.title}</p>
            <h3>${m.name}</h3>
            <b>${m.stat}</b>
        </div>`).join('');
}

function addNewPlayer() { appData.players.push({name:"لاعب", id:"000", kills:0, hs:"0%"}); renderPlayers(); }
function addGlobalStat() { appData.globalStats.push({ label: "إحصائية", value: "0" }); renderStats(); }
function addGlobalMVP() { appData.mvps.push({ icon: "🏆", title: "لقب", name: "الاسم", stat: "0" }); renderStats(); }

window.onload = () => renderHome();