// scriptE.js — Calendar logic

// _______________________________state_____________________________ 

(function () {

  let events      = JSON.parse(localStorage.getItem('sd-events') || '[]');
  let selectedKey = null;
  const today     = new Date();
  let viewYear    = today.getFullYear();
  let viewMonth   = today.getMonth();

  // _______________________________helpers_____________________________ 

  function toKey(year, month, day) {
    return year + '-'
      + String(month + 1).padStart(2, '0') + '-'
      + String(day).padStart(2, '0');
  }

  function formatKey(key) {
    if (!key) { return '—'; }
    const d = new Date(key + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function saveEvents() {
    localStorage.setItem('sd-events', JSON.stringify(events));
  }

  // _______________________________add event_____________________________ 

  function addEvent() {
    const nameEl = document.getElementById('event-name');
    const typeEl = document.getElementById('event-type');
    const dateEl = document.getElementById('event-date');

    const name = nameEl.value.trim();
    const type = typeEl.value;
    const date = dateEl.value || selectedKey;

    if (!name)  { nameEl.focus(); return; }
    if (!date)  { alert('Please select a date.'); return; }

    events.push({ id: Date.now(), name, type, date });
    saveEvents();

    nameEl.value = '';
    renderCalendar();
    renderUpcoming();
  }

  // _______________________________delete event_____________________________ 

  function deleteEvent(id) {
    events = events.filter(function (e) { return e.id !== id; });
    saveEvents();
    renderCalendar();
    renderUpcoming();
  }

  // _______________________________select day_____________________________ 

  function selectDay(key) {
    selectedKey = key;

    // update label
    const lbl = document.getElementById('selectedDateLabel');
    if (lbl) { lbl.textContent = formatKey(key); }

    // update date input
    const dateEl = document.getElementById('event-date');
    if (dateEl) { dateEl.value = key; }

    renderCalendar();
  }

  // _______________________________render calendar_____________________________ 

  function renderCalendar() {
    const grid      = document.getElementById('calGrid');
    const titleEl   = document.getElementById('monthTitle');
    if (!grid || !titleEl) { return; }

    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ];

    titleEl.textContent = monthNames[viewMonth] + ' ' + viewYear;

    const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();
    const todayKey    = toKey(today.getFullYear(), today.getMonth(), today.getDate());

    let html = '';

    // previous month filler cells
    for (let i = firstDay - 1; i >= 0; i--) {
      html += '<div class="cal-cell other-month"><span class="day-num">' + (daysInPrev - i) + '</span></div>';
    }

    // current month cells
    for (let d = 1; d <= daysInMonth; d++) {
      const key         = toKey(viewYear, viewMonth, d);
      const dayEvents   = events.filter(function (e) { return e.date === key; });
      const isToday     = key === todayKey;
      const isSelected  = key === selectedKey;
      const hasEvent    = dayEvents.length > 0;

      let cls = 'cal-cell';
      if (isToday)    { cls += ' today'; }
      if (isSelected) { cls += ' selected'; }
      if (hasEvent)   { cls += ' has-event'; }

      // event pills (max 2 shown)
      let pillsHTML = '';
      if (dayEvents.length > 0) {
        pillsHTML = '<div class="cell-events">';
        dayEvents.slice(0, 2).forEach(function (e) {
          pillsHTML += '<div class="cell-event-pill pill-' + e.type + '">' + e.name + '</div>';
        });
        if (dayEvents.length > 2) {
          pillsHTML += '<div class="cell-event-pill pill-other">+' + (dayEvents.length - 2) + ' more</div>';
        }
        pillsHTML += '</div>';
      }

      html += '<div class="' + cls + '" data-key="' + key + '">'
        + '<span class="day-num">' + d + '</span>'
        + pillsHTML
        + '</div>';
    }

    // next month filler cells
    const totalCells = firstDay + daysInMonth;
    const remainder  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainder; i++) {
      html += '<div class="cal-cell other-month"><span class="day-num">' + i + '</span></div>';
    }

    grid.innerHTML = html;

    // click events on cells
    grid.querySelectorAll('.cal-cell:not(.other-month)').forEach(function (cell) {
      cell.addEventListener('click', function () {
        selectDay(cell.dataset.key);
      });
    });
  }

  // _______________________________render upcoming_____________________________ 

  function renderUpcoming() {
    const list = document.getElementById('upcomingList');
    if (!list) { return; }

    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

    // get upcoming + today events, sorted by date
    const upcoming = events
      .filter(function (e) { return e.date >= todayKey; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });

    if (upcoming.length === 0) {
      list.innerHTML = '<p class="upcoming-empty">No upcoming events.</p>';
      return;
    }

    list.innerHTML = upcoming.map(function (e) {
      return '<div class="upcoming-item">'
        + '<div class="upcoming-dot dot-' + e.type + '"></div>'
        + '<div class="upcoming-body">'
        + '<div class="upcoming-name">' + e.name + '</div>'
        + '<div class="upcoming-meta">' + formatKey(e.date) + ' · ' + e.type + '</div>'
        + '</div>'
        + '<button class="upcoming-delete" data-id="' + e.id + '">✕</button>'
        + '</div>';
    }).join('');

    // delete buttons
    list.querySelectorAll('.upcoming-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteEvent(parseInt(btn.dataset.id));
      });
    });
  }

  // _______________________________init_____________________________ 

  document.addEventListener('DOMContentLoaded', function () {

    // month navigation
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        renderCalendar();
      });
    }

    // add event button
    const addBtn = document.getElementById('addEventBtn');
    if (addBtn) { addBtn.addEventListener('click', addEvent); }

    // enter key on event name
    const nameInput = document.getElementById('event-name');
    if (nameInput) {
      nameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { addEvent(); }
      });
    }

    // select today by default
    const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
    selectDay(todayKey);

    renderCalendar();
    renderUpcoming();

  });

})();