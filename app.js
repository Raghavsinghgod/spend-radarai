var subs = JSON.parse(localStorage.getItem("subs") || "[]");
var exps = JSON.parse(localStorage.getItem("exps") || "[]");
var settings = JSON.parse(localStorage.getItem("set") || '{"monthlyBudget":0}');

function saveSubs() { localStorage.setItem("subs", JSON.stringify(subs)); }
function saveExps() { localStorage.setItem("exps", JSON.stringify(exps)); }
function saveSet() { localStorage.setItem("set", JSON.stringify(settings)); }

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayStr() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function daysBetween(a, b) {
  var da = new Date(a);
  var db = new Date(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return Math.round((db - da) / 86400000);
}

function fmtMoney(n) {
  return "₹" + Number(n).toFixed(2);
}

function toMonthly(price, cycle) {
  if (cycle === "weekly") return price * 52 / 12;
  if (cycle === "yearly") return price / 12;
  return price;
}

function daysLeft(renewalDate) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var r = new Date(renewalDate);
  r.setHours(0, 0, 0, 0);
  return Math.round((r - today) / 86400000);
}

function daysLeftBadge(days) {
  if (days <= 1) return '<span class="badge badge-red badge-pulse">' + days + 'd left</span>';
  if (days <= 3) return '<span class="badge badge-orange badge-pulse">' + days + 'd left</span>';
  if (days <= 7) return '<span class="badge badge-yellow badge-pulse">' + days + 'd left</span>';
  return '<span class="badge badge-grey">' + days + 'd left</span>';
}

function isThisMonth(dateStr) {
  var d = new Date(dateStr);
  var now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisWeek(dateStr) {
  var d = new Date(dateStr);
  var now = new Date();
  var startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d >= startOfWeek && d <= now;
}

function isToday(dateStr) {
  return dateStr === todayStr();
}

function monthExpenses() {
  return exps.filter(function(e) { return isThisMonth(e.date); });
}

function monthTotal() {
  return monthExpenses().reduce(function(s, e) { return s + Number(e.amount); }, 0);
}

function weekTotal() {
  return exps.filter(function(e) { return isThisWeek(e.date); }).reduce(function(s, e) { return s + Number(e.amount); }, 0);
}

function todayTotal() {
  return exps.filter(function(e) { return isToday(e.date); }).reduce(function(s, e) { return s + Number(e.amount); }, 0);
}

function biggestExpense() {
  if (exps.length === 0) return null;
  return exps.reduce(function(a, b) { return Number(a.amount) >= Number(b.amount) ? a : b; });
}

// icons
var icons = {
  coin: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d61f1f" stroke-width="1.2" stroke-linecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v6"/><path d="M5.5 5.5h3a1 1 0 0 1 0 2h-4a1 1 0 0 0 0 2h4"/></svg>',
  flame: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d61f1f" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1c0 2-3 3-3 6a3.5 3.5 0 0 0 6 0c0-3-3-4-3-6z"/><path d="M7 8c0-1 1-1.5 1-2.5a1.5 1.5 0 0 0-3 0C5 6.5 6 7 6 8a1 1 0 0 0 1 1z"/></svg>',
  calendar: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d61f1f" stroke-width="1.2" stroke-linecap="round"><rect x="1.5" y="2.5" width="11" height="10" rx="1"/><path d="M1.5 5.5h11"/><path d="M4.5 1v3"/><path d="M9.5 1v3"/></svg>',
  pen: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d61f1f" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2l2 2-7.5 7.5H2.5v-2L10 2z"/><path d="M8.5 3.5l2 2"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d61f1f" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h10"/><path d="M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4"/><path d="M3.5 4l.5 8h6l.5-8"/></svg>',
  warning: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#d61f1f" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.5L1 12.5h12L7 1.5z"/><path d="M7 6v3"/><circle cx="7" cy="10.5" r="0.3" fill="#d61f1f"/></svg>'
};

// tabs
var tabBtns = document.querySelectorAll(".tab");
var panels = document.querySelectorAll(".panel");

tabBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    tabBtns.forEach(function(b) { b.classList.remove("active"); });
    panels.forEach(function(p) { p.classList.remove("active"); });
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "dashboard") renderDashboard();
    if (btn.dataset.tab === "budget") renderBudget();
  });
});

// subscriptions
var subForm = document.getElementById("subForm");
var subName = document.getElementById("subName");
var subPrice = document.getElementById("subPrice");
var subCycle = document.getElementById("subCycle");
var subRenewal = document.getElementById("subRenewal");
var subCategory = document.getElementById("subCategory");
var subTrial = document.getElementById("subTrial");
var subNote = document.getElementById("subNote");
var subEditId = document.getElementById("subEditId");
var subSaveBtn = document.getElementById("subSaveBtn");
var subList = document.getElementById("subList");
var subSearch = document.getElementById("subSearch");
var subFilterCat = document.getElementById("subFilterCat");

subRenewal.value = todayStr();

subForm.addEventListener("submit", function(e) {
  e.preventDefault();
  var data = {
    id: subEditId.value || uid(),
    name: subName.value.trim(),
    price: parseFloat(subPrice.value) || 0,
    cycle: subCycle.value,
    renewalDate: subRenewal.value,
    category: subCategory.value,
    isTrial: subTrial.checked,
    note: subNote.value.trim()
  };
  if (subEditId.value) {
    var idx = subs.findIndex(function(s) { return s.id === subEditId.value; });
    if (idx !== -1) subs[idx] = data;
    subEditId.value = "";
    subSaveBtn.textContent = "add subscription";
  } else {
    subs.push(data);
  }
  saveSubs();
  resetSubForm();
  renderSubList();
});

function resetSubForm() {
  subName.value = "";
  subPrice.value = "";
  subCycle.value = "monthly";
  subRenewal.value = todayStr();
  subCategory.value = "entertainment";
  subTrial.checked = false;
  subNote.value = "";
  subEditId.value = "";
  subSaveBtn.textContent = "add subscription";
}

function editSub(id) {
  var s = subs.find(function(x) { return x.id === id; });
  if (!s) return;
  subName.value = s.name;
  subPrice.value = s.price;
  subCycle.value = s.cycle;
  subRenewal.value = s.renewalDate;
  subCategory.value = s.category;
  subTrial.checked = s.isTrial;
  subNote.value = s.note || "";
  subEditId.value = s.id;
  subSaveBtn.textContent = "update";
}

function deleteSub(id) {
  subs = subs.filter(function(s) { return s.id !== id; });
  saveSubs();
  renderSubList();
  renderDashboard();
}

function renderSubList() {
  var q = subSearch.value.toLowerCase();
  var cat = subFilterCat.value;
  var filtered = subs.filter(function(s) {
    if (cat && s.category !== cat) return false;
    if (q && s.name.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
  filtered.sort(function(a, b) {
    return new Date(a.renewalDate) - new Date(b.renewalDate);
  });
  if (filtered.length === 0) {
    subList.innerHTML = '<div class="empty">no subscriptions yet</div>';
    return;
  }
  var html = "";
  filtered.forEach(function(s) {
    var dl = daysLeft(s.renewalDate);
    var badge = daysLeftBadge(dl);
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-name">' + esc(s.name) + '</span>';
    html += '<div class="card-actions"><button class="btn-icon" onclick="editSub(\'' + s.id + '\')">' + icons.pen + '</button>';
    html += '<button class="btn-icon" onclick="deleteSub(\'' + s.id + '\')">' + icons.trash + '</button></div></div>';
    html += '<div class="card-details">' + icons.coin + ' ' + fmtMoney(s.price) + '/' + s.cycle + ' · ' + s.category + '</div>';
    html += '<div class="card-details">' + icons.calendar + ' renew: ' + s.renewalDate + ' ' + badge + '</div>';
    if (s.isTrial && dl <= 7) {
      html += '<div class="trial-warning">' + icons.warning + ' trial ending soon - cancel before you get charged</div>';
    }
    if (s.note) html += '<div class="card-note">' + esc(s.note) + '</div>';
    html += '</div>';
  });
  subList.innerHTML = html;
}

subSearch.addEventListener("input", renderSubList);
subFilterCat.addEventListener("change", renderSubList);

// expenses
var expForm = document.getElementById("expForm");
var expTitle = document.getElementById("expTitle");
var expAmount = document.getElementById("expAmount");
var expDate = document.getElementById("expDate");
var expCategory = document.getElementById("expCategory");
var expMethod = document.getElementById("expMethod");
var expNote = document.getElementById("expNote");
var expEditId = document.getElementById("expEditId");
var expSaveBtn = document.getElementById("expSaveBtn");
var expList = document.getElementById("expList");
var expSearch = document.getElementById("expSearch");
var expFilterCat = document.getElementById("expFilterCat");
var expSortBtn = document.getElementById("expSortBtn");

expDate.value = todayStr();

var expSortMode = "newest";

expForm.addEventListener("submit", function(e) {
  e.preventDefault();
  var data = {
    id: expEditId.value || uid(),
    title: expTitle.value.trim(),
    amount: parseFloat(expAmount.value) || 0,
    date: expDate.value,
    category: expCategory.value,
    method: expMethod.value,
    note: expNote.value.trim()
  };
  if (expEditId.value) {
    var idx = exps.findIndex(function(x) { return x.id === expEditId.value; });
    if (idx !== -1) exps[idx] = data;
    expEditId.value = "";
    expSaveBtn.textContent = "add expense";
  } else {
    exps.push(data);
  }
  saveExps();
  resetExpForm();
  renderExpList();
  renderDashboard();
});

function resetExpForm() {
  expTitle.value = "";
  expAmount.value = "";
  expDate.value = todayStr();
  expCategory.value = "food";
  expMethod.value = "upi";
  expNote.value = "";
  expEditId.value = "";
  expSaveBtn.textContent = "add expense";
}

function editExp(id) {
  var x = exps.find(function(e) { return e.id === id; });
  if (!x) return;
  expTitle.value = x.title;
  expAmount.value = x.amount;
  expDate.value = x.date;
  expCategory.value = x.category;
  expMethod.value = x.method;
  expNote.value = x.note || "";
  expEditId.value = x.id;
  expSaveBtn.textContent = "update";
}

function deleteExp(id) {
  exps = exps.filter(function(e) { return e.id !== id; });
  saveExps();
  renderExpList();
  renderDashboard();
}

function renderExpList() {
  var q = expSearch.value.toLowerCase();
  var cat = expFilterCat.value;
  var activeChip = document.querySelector(".chip.active");
  var chipFilter = activeChip ? activeChip.dataset.chip : "";

  var filtered = exps.filter(function(x) {
    if (cat && x.category !== cat) return false;
    if (q && x.title.toLowerCase().indexOf(q) === -1) return false;
    if (chipFilter === "today" && !isToday(x.date)) return false;
    if (chipFilter === "week" && !isThisWeek(x.date)) return false;
    if (chipFilter === "month" && !isThisMonth(x.date)) return false;
    return true;
  });

  if (chipFilter === "biggest") {
    filtered.sort(function(a, b) { return Number(b.amount) - Number(a.amount); });
    filtered = filtered.slice(0, 1);
  } else if (expSortMode === "newest") {
    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  } else {
    filtered.sort(function(a, b) { return Number(b.amount) - Number(a.amount); });
  }

  if (filtered.length === 0) {
    expList.innerHTML = '<div class="empty">no expenses yet</div>';
    return;
  }
  var html = "";
  filtered.forEach(function(x) {
    html += '<div class="card">';
    html += '<div class="card-header"><span class="card-name">' + esc(x.title) + '</span>';
    html += '<div class="card-actions"><button class="btn-icon" onclick="editExp(\'' + x.id + '\')">' + icons.pen + '</button>';
    html += '<button class="btn-icon" onclick="deleteExp(\'' + x.id + '\')">' + icons.trash + '</button></div></div>';
    html += '<div class="card-details">' + icons.coin + ' ' + fmtMoney(x.amount) + ' · ' + x.category + ' · ' + x.method + '</div>';
    html += '<div class="card-details">' + icons.calendar + ' ' + x.date + '</div>';
    if (x.note) html += '<div class="card-note">' + esc(x.note) + '</div>';
    html += '</div>';
  });
  expList.innerHTML = html;
}

expSearch.addEventListener("input", renderExpList);
expFilterCat.addEventListener("change", renderExpList);

expSortBtn.addEventListener("click", function() {
  if (expSortMode === "newest") {
    expSortMode = "highest";
    expSortBtn.textContent = "sort: highest";
  } else {
    expSortMode = "newest";
    expSortBtn.textContent = "sort: newest";
  }
  renderExpList();
});

// chips
document.querySelectorAll(".chip").forEach(function(chip) {
  chip.addEventListener("click", function() {
    if (chip.classList.contains("active")) {
      chip.classList.remove("active");
    } else {
      document.querySelectorAll(".chip").forEach(function(c) { c.classList.remove("active"); });
      chip.classList.add("active");
    }
    renderExpList();
  });
});

// dashboard
function renderDashboard() {
  var monthlySubTotal = subs.reduce(function(s, x) { return s + toMonthly(x.price, x.cycle); }, 0);
  var yearlySubTotal = subs.reduce(function(s, x) { return s + (x.cycle === "yearly" ? x.price : x.price * (x.cycle === "weekly" ? 52 : 12)); }, 0);
  var activeCount = subs.length;

  var nextCharge = null;
  var sortedSubs = subs.slice().sort(function(a, b) { return new Date(a.renewalDate) - new Date(b.renewalDate); });
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  for (var i = 0; i < sortedSubs.length; i++) {
    if (new Date(sortedSubs[i].renewalDate) >= today) {
      nextCharge = sortedSubs[i];
      break;
    }
  }

  var statsHtml = '<div class="stat-card"><div class="label">' + icons.coin + ' total per month</div><div class="value">' + fmtMoney(monthlySubTotal) + '</div></div>';
  statsHtml += '<div class="stat-card"><div class="label">' + icons.flame + ' total per year</div><div class="value">' + fmtMoney(yearlySubTotal) + '</div></div>';
  statsHtml += '<div class="stat-card"><div class="label">' + icons.calendar + ' active subs</div><div class="value">' + activeCount + '</div></div>';
  var nextText = nextCharge ? nextCharge.name + " · " + nextCharge.renewalDate : "none";
  statsHtml += '<div class="stat-card"><div class="label">' + icons.warning + ' next charge</div><div class="value" style="font-size:13px">' + nextText + '</div></div>';
  statsHtml += '<div class="stat-card"><div class="label">spent today</div><div class="value">' + fmtMoney(todayTotal()) + '</div></div>';
  statsHtml += '<div class="stat-card"><div class="label">spent this week</div><div class="value">' + fmtMoney(weekTotal()) + '</div></div>';
  statsHtml += '<div class="stat-card"><div class="label">spent this month</div><div class="value">' + fmtMoney(monthTotal()) + '</div></div>';
  document.getElementById("dashStats").innerHTML = statsHtml;

  // alerts
  var dueItems = subs.filter(function(s) { var dl = daysLeft(s.renewalDate); return dl >= 0 && dl <= 7; });
  var alertHtml = "";
  if (dueItems.length > 0) {
    alertHtml = '<div class="alert-strip"><div class="title">' + icons.warning + ' due within 7 days</div>';
    dueItems.forEach(function(s) {
      alertHtml += '<div class="alert-item">' + esc(s.name) + ' - ' + fmtMoney(s.price) + ' on ' + s.renewalDate + ' (' + daysLeft(s.renewalDate) + 'd)</div>';
    });
    alertHtml += '</div>';
  }
  document.getElementById("alertStrip").innerHTML = alertHtml;

  // category bar chart
  var catTotals = {};
  monthExpenses().forEach(function(x) {
    catTotals[x.category] = (catTotals[x.category] || 0) + Number(x.amount);
  });
  var cats = Object.keys(catTotals).sort(function(a, b) { return catTotals[b] - catTotals[a]; });
  var maxCat = cats.length > 0 ? catTotals[cats[0]] : 1;
  var chartHtml = "";
  if (cats.length === 0) {
    chartHtml = '<div class="empty">no expenses this month</div>';
  } else {
    cats.forEach(function(c) {
      var pct = (catTotals[c] / maxCat * 100).toFixed(0);
      chartHtml += '<div class="bar-row"><div class="bar-label">' + c + '</div>';
      chartHtml += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>';
      chartHtml += '<div class="bar-amount">' + fmtMoney(catTotals[c]) + '</div></div>';
    });
  }
  document.getElementById("categoryChart").innerHTML = chartHtml;
}

// budget
var budgetInput = document.getElementById("budgetInput");
var budgetSaveBtn = document.getElementById("budgetSaveBtn");
var budgetDisplay = document.getElementById("budgetDisplay");

budgetInput.value = settings.monthlyBudget || "";

budgetSaveBtn.addEventListener("click", function() {
  settings.monthlyBudget = parseFloat(budgetInput.value) || 0;
  saveSet();
  renderBudget();
});

function renderBudget() {
  var budget = settings.monthlyBudget;
  var spent = monthTotal();
  var left = budget - spent;
  var pct = budget > 0 ? (spent / budget * 100) : 0;

  var color = "#d61f1f";
  if (pct > 100) color = "#d61f1f";
  else if (pct > 80) color = "#d97706";
  else color = "#22c55e";

  var html = '<div class="card">';
  if (budget > 0) {
    html += '<div class="budget-bar-track"><div class="budget-bar-fill" style="width:' + Math.min(pct, 100) + '%;background:' + color + '"></div></div>';
    html += '<div class="budget-info"><span>spent: ' + fmtMoney(spent) + ' (' + pct.toFixed(1) + '%)</span><span>left: ' + fmtMoney(Math.max(left, 0)) + '</span></div>';
  } else {
    html += '<div class="empty">set a monthly budget above to track spending</div>';
  }
  html += '</div>';
  budgetDisplay.innerHTML = html;
}

// export csv
document.getElementById("exportCsvBtn").addEventListener("click", function() {
  var csv = "type,name,price/cycle,amount,category,date,method,trial,renewal,note\n";
  subs.forEach(function(s) {
    csv += "subscription," + csvEsc(s.name) + "," + s.price + "/" + s.cycle + ",," + csvEsc(s.category) + ",," + "," + s.isTrial + "," + s.renewalDate + "," + csvEsc(s.note || "") + "\n";
  });
  exps.forEach(function(x) {
    csv += "expense," + csvEsc(x.title) + ",," + x.amount + "," + csvEsc(x.category) + "," + x.date + "," + x.method + ",,," + csvEsc(x.note || "") + "\n";
  });
  var blob = new Blob([csv], { type: "text/csv" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "spendradar-export.csv";
  a.click();
});

function csvEsc(s) {
  if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

// load sample data
document.getElementById("loadSampleBtn").addEventListener("click", function() {
  if (subs.length > 0 || exps.length > 0) {
    if (!confirm("this will add sample data to your existing data. continue?")) return;
  }
  var today = new Date();
  function dateOff(days) {
    var d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function datePast(days) {
    var d = new Date(today);
    d.setDate(d.getDate() - days);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  var sampleSubs = [
    { id: uid(), name: "netflix", price: 649, cycle: "monthly", renewalDate: dateOff(3), category: "video", isTrial: false, note: "family plan" },
    { id: uid(), name: "spotify", price: 119, cycle: "monthly", renewalDate: dateOff(1), category: "music", isTrial: false, note: "" },
    { id: uid(), name: "figma", price: 0, cycle: "monthly", renewalDate: dateOff(5), category: "design", isTrial: true, note: "trial ends soon" },
    { id: uid(), name: "github pro", price: 400, cycle: "yearly", renewalDate: dateOff(45), category: "software", isTrial: false, note: "" },
    { id: uid(), name: "cloud backup", price: 99, cycle: "monthly", renewalDate: dateOff(12), category: "cloud", isTrial: false, note: "google one" },
    { id: uid(), name: "gym", price: 500, cycle: "monthly", renewalDate: dateOff(20), category: "fitness", isTrial: false, note: "" }
  ];
  var sampleExps = [
    { id: uid(), title: "chai and samosa", amount: 45, date: todayStr(), category: "food", method: "cash", note: "" },
    { id: uid(), title: "auto to office", amount: 120, date: todayStr(), category: "transport", method: "upi", note: "" },
    { id: uid(), title: "lunch", amount: 250, date: todayStr(), category: "food", method: "card", note: "team lunch" },
    { id: uid(), title: "phone case", amount: 499, date: datePast(1), category: "shopping", method: "upi", note: "" },
    { id: uid(), title: "electricity bill", amount: 1850, date: datePast(2), category: "bills", method: "upi", note: "" },
    { id: uid(), title: "medicine", amount: 320, date: datePast(3), category: "health", method: "cash", note: "cold tablets" },
    { id: uid(), title: "groceries", amount: 780, date: datePast(3), category: "food", method: "card", note: "big basket" },
    { id: uid(), title: "movie tickets", amount: 400, date: datePast(5), category: "entertainment", method: "upi", note: "" },
    { id: uid(), title: "petrol", amount: 1200, date: datePast(6), category: "transport", method: "card", note: "" },
    { id: uid(), title: "dinner out", amount: 950, date: datePast(8), category: "food", method: "card", note: "birthday dinner" }
  ];
  sampleSubs.forEach(function(s) { subs.push(s); });
  sampleExps.forEach(function(x) { exps.push(x); });
  saveSubs();
  saveExps();
  settings.monthlyBudget = 15000;
  saveSet();
  budgetInput.value = 15000;
  renderSubList();
  renderExpList();
  renderDashboard();
  renderBudget();
});

// clear all
document.getElementById("clearAllBtn").addEventListener("click", function() {
  if (!confirm("are you sure you want to delete all data? this cannot be undone.")) return;
  subs = [];
  exps = [];
  settings = { monthlyBudget: 0 };
  saveSubs();
  saveExps();
  saveSet();
  budgetInput.value = "";
  resetSubForm();
  resetExpForm();
  renderSubList();
  renderExpList();
  renderDashboard();
  renderBudget();
});

// init
renderSubList();
renderExpList();
renderDashboard();
renderBudget();
