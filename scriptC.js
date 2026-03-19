// _______________________________calculator_____________________________ 

(function () {

  // ── stream data ────────────────────────────────────────────────
  const STREAMS = {
    LS: {
      divisor: 28,
      subjects: [
        { name: 'Biology',    max: 100 },
        { name: 'Math',       max: 80  },
        { name: 'Physics',    max: 80  },
        { name: 'Chemistry',  max: 80  },
        { name: 'Arabic',     max: 50  },
        { name: 'English',    max: 40  },
        { name: 'Philosophy', max: 40  },
        { name: 'History',    max: 30  },
        { name: 'Geography',  max: 30  },
        { name: 'Civic',      max: 30  },
      ]
    },
    GS: {
      divisor: 28.5,
      subjects: [
        { name: 'Math',       max: 160 },
        { name: 'Physics',    max: 110 },
        { name: 'Chemistry',  max: 80  },
        { name: 'Arabic',     max: 50  },
        { name: 'English',    max: 40  },
        { name: 'Philosophy', max: 40  },
        { name: 'History',    max: 30  },
        { name: 'Geography',  max: 30  },
        { name: 'Civic',      max: 30  },
      ]
    },
    SE: {
      divisor: 26.5,
      subjects: [
        { name: 'Economics',  max: 80 },
        { name: 'Sociology',  max: 80 },
        { name: 'Math',       max: 70 },
        { name: 'Arabic',     max: 60 },
        { name: 'Philosophy', max: 50 },
        { name: 'English',    max: 40 },
        { name: 'History',    max: 30 },
        { name: 'Geography',  max: 30 },
        { name: 'Civic',      max: 30 },
        { name: 'Biology',    max: 20 },
        { name: 'Chemistry',  max: 20 },
        { name: 'Physics',    max: 20 },
      ]
    },
  };

  let currentStream  = 'LS';
  let currentSem     = '1';

  // custom school state
  // customSubjects = [ { name, max } ]  — the subject list (no marks here)
  // customMarks    = { '1': [mark, mark, ...], '2': [mark, mark, ...] }
  let customSubjects  = [];
  let customMarks     = { '1': [], '2': [] };
  let customSaved     = false; // true after user clicks "Save Subjects"

  // ── helpers ────────────────────────────────────────────────────

  function getMaxTotal(stream) {
    return stream.subjects.reduce(function (s, sub) { return s + sub.max; }, 0);
  }

  function getCustomDivisor() {
    const total = customSubjects.reduce(function (s, sub) { return s + sub.max; }, 0);
    return total / 20;
  }

  // ── render subjects ────────────────────────────────────────────

  function renderSubjects() {
    const customArea = document.getElementById('custom-area');
    if (!customArea) { return; }

    if (currentStream === 'custom') {
      customArea.style.display = 'block';
      document.getElementById('subjects-1').innerHTML = '';
      document.getElementById('subjects-2').innerHTML = '';

      if (!customSaved) {
        // step 1 — setup mode
        renderCustomSetup();
      } else {
        // step 2 — fill marks mode
        renderCustomMarks();
      }
      return;
    }

    // normal streams
    customArea.style.display = 'none';
    const stream = STREAMS[currentStream];

    ['1', '2'].forEach(function (sem) {
      let html = '<table class="subjects-table">';
      html += '<thead><tr><th>Subject</th><th>Max</th><th>Your Mark</th></tr></thead><tbody>';
      stream.subjects.forEach(function (s, i) {
        html += '<tr>'
          + '<td>' + s.name + '</td>'
          + '<td><span class="coef-badge">' + s.max + '</span></td>'
          + '<td><input type="number" id="mark-' + sem + '-' + i
          + '" min="0" max="' + s.max
          + '" step="0.5" placeholder="0 – ' + s.max + '" /></td>'
          + '</tr>';
      });
      html += '</tbody></table>';
      document.getElementById('subjects-' + sem).innerHTML = html;
    });

    // attach input listeners
    document.querySelectorAll('input[type="number"][id^="mark-"]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const max = parseFloat(inp.max);
        if (inp.value !== '' && parseFloat(inp.value) > max) { inp.value = max; }
        calculate();
      });
    });
  }

  // ── custom setup (step 1) ──────────────────────────────────────

  function renderCustomSetup() {
    const area = document.getElementById('custom-area');
    if (!area) { return; }

    let html = '<div class="custom-setup">';
    html += '<p class="custom-hint">📋 <strong>Step 1:</strong> Add your subjects and their max mark, then click <strong>Save Subjects</strong>.</p>';

    // existing subjects list
    if (customSubjects.length > 0) {
      html += '<table class="subjects-table" style="margin-bottom:0.75rem;">';
      html += '<thead><tr><th>Subject</th><th>Max</th><th></th></tr></thead><tbody>';
      customSubjects.forEach(function (s, i) {
        html += '<tr>'
          + '<td>' + s.name + '</td>'
          + '<td><span class="coef-badge">' + s.max + '</span></td>'
          + '<td><button class="custom-delete" data-i="' + i + '">✕</button></td>'
          + '</tr>';
      });
      html += '</tbody></table>';
    }

    // add row
    html += '<div class="custom-add-row">'
      + '<input type="text"   id="new-subj-name" placeholder="Subject name" />'
      + '<input type="number" id="new-subj-coef" placeholder="Max mark" min="1" max="999" />'
      + '<button class="btn btn-secondary" id="addSubjBtn">+ Add</button>'
      + '</div>';

    // save button
    if (customSubjects.length > 0) {
      html += '<button class="btn btn-primary" id="saveSubjectsBtn" style="margin-top:1rem; width:100%;">💾 Save Subjects</button>';
    }

    html += '</div>';
    area.innerHTML = html;

    // delete buttons
    area.querySelectorAll('.custom-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        customSubjects.splice(parseInt(btn.dataset.i), 1);
        renderCustomSetup();
      });
    });

    // add button
    const addBtn = document.getElementById('addSubjBtn');
    if (addBtn) { addBtn.addEventListener('click', addCustomSubject); }

    // enter key
    const nameInput = document.getElementById('new-subj-name');
    if (nameInput) {
      nameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { addCustomSubject(); }
      });
    }

    // save subjects button
    const saveBtn = document.getElementById('saveSubjectsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if (customSubjects.length === 0) { return; }
        // init empty marks for both semesters
        customMarks['1'] = customSubjects.map(function () { return null; });
        customMarks['2'] = customSubjects.map(function () { return null; });
        customSaved = true;
        renderSubjects();
        calculate();
      });
    }
  }

  // ── custom marks fill (step 2) ─────────────────────────────────

  function renderCustomMarks() {
    const area = document.getElementById('custom-area');
    if (!area) { return; }

    // show edit button at top of custom area
    area.innerHTML = '<div style="display:flex; justify-content:flex-end; margin-bottom:0.75rem;">'
      + '<button class="btn btn-secondary" id="editSubjectsBtn" style="font-size:0.8rem;">✏️ Edit Subjects</button>'
      + '</div>';

    const editBtn = document.getElementById('editSubjectsBtn');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        // go back to setup — keep subject list, clear marks
        customSaved = false;
        customMarks = { '1': [], '2': [] };
        renderSubjects();
        calculate();
      });
    }

    // render marks table for each semester
    ['1', '2'].forEach(function (sem) {
      let html = '<table class="subjects-table">';
      html += '<thead><tr><th>Subject</th><th>Max</th><th>Your Mark</th></tr></thead><tbody>';
      customSubjects.forEach(function (s, i) {
        const val = customMarks[sem][i] !== null ? customMarks[sem][i] : '';
        html += '<tr>'
          + '<td>' + s.name + '</td>'
          + '<td><span class="coef-badge">' + s.max + '</span></td>'
          + '<td><input type="number" id="cmark-' + sem + '-' + i
          + '" min="0" max="' + s.max
          + '" step="0.5" placeholder="0 – ' + s.max
          + '" value="' + val + '" /></td>'
          + '</tr>';
      });
      html += '</tbody></table>';
      document.getElementById('subjects-' + sem).innerHTML = html;
    });

    // attach input listeners for both semesters independently
    ['1', '2'].forEach(function (sem) {
      customSubjects.forEach(function (s, i) {
        const inp = document.getElementById('cmark-' + sem + '-' + i);
        if (!inp) { return; }
        inp.addEventListener('input', function () {
          const max = parseFloat(inp.max);
          if (inp.value !== '' && parseFloat(inp.value) > max) { inp.value = max; }
          customMarks[sem][i] = inp.value !== '' ? parseFloat(inp.value) : null;
          calculate();
        });
      });
    });
  }

  // ── add custom subject (setup mode) ───────────────────────────

  function addCustomSubject() {
    const nameEl = document.getElementById('new-subj-name');
    const maxEl  = document.getElementById('new-subj-coef');
    if (!nameEl || !maxEl) { return; }
    const name = nameEl.value.trim();
    const max  = parseFloat(maxEl.value) || 20;
    if (!name) { nameEl.focus(); return; }
    customSubjects.push({ name: name, max: max });
    nameEl.value = '';
    maxEl.value  = '';
    renderCustomSetup();
  }

  // ── get marks for a semester ───────────────────────────────────

  function getMarks(sem) {
    if (currentStream === 'custom') {
      if (!customSaved) { return []; }
      return customSubjects
        .map(function (s, i) {
          return { name: s.name, max: s.max, mark: customMarks[sem][i] };
        })
        .filter(function (m) { return m.mark !== null; });
    }

    const stream = STREAMS[currentStream];
    const result = [];
    stream.subjects.forEach(function (s, i) {
      const el = document.getElementById('mark-' + sem + '-' + i);
      if (el && el.value !== '') {
        result.push({ name: s.name, max: s.max, mark: parseFloat(el.value) });
      }
    });
    return result;
  }

  // ── calculate total and average ────────────────────────────────

  function calcResult(marks, divisor) {
    if (marks.length === 0) { return null; }
    const total = marks.reduce(function (sum, m) { return sum + m.mark; }, 0);
    return { total: total, avg: total / divisor };
  }

  // ── grade label ────────────────────────────────────────────────

  function getGrade(avg) {
    if (avg >= 17) { return { label: '🏆 Excellent', cls: 'grade-excellent' }; }
    if (avg >= 14) { return { label: '⭐ Very Good',  cls: 'grade-verygood'  }; }
    if (avg >= 12) { return { label: '👍 Good',       cls: 'grade-good'      }; }
    if (avg >= 10) { return { label: '✅ Pass',        cls: 'grade-pass'      }; }
    return           { label: '❌ Needs Work',          cls: 'grade-fail'      };
  }

  // ── main calculate ─────────────────────────────────────────────

  function calculate() {
    const isCustom = currentStream === 'custom';
    const divisor  = isCustom
      ? getCustomDivisor()
      : STREAMS[currentStream].divisor;

    const maxTotal = isCustom
      ? customSubjects.reduce(function (s, sub) { return s + sub.max; }, 0)
      : getMaxTotal(STREAMS[currentStream]);

    const marks1  = getMarks('1');
    const marks2  = getMarks('2');
    const result1 = calcResult(marks1, divisor);
    const result2 = calcResult(marks2, divisor);

    const currentMarks  = getMarks(currentSem);
    const currentResult = calcResult(currentMarks, divisor);

    // ── update score display ─────────────────────────────────────
    const scoreEl     = document.getElementById('result-score');
    const labelEl     = document.getElementById('result-label');
    const gradeEl     = document.getElementById('result-grade');
    const fillEl      = document.getElementById('progress-fill');
    const breakdownEl = document.getElementById('breakdown');

    if (!currentResult) {
      scoreEl.textContent   = '—';
      labelEl.textContent   = 'Enter marks and hit Calculate';
      gradeEl.style.display = 'none';
      fillEl.style.width    = '0%';
      breakdownEl.innerHTML = '<p class="breakdown-empty">No data yet.</p>';
    } else {
      const grade = getGrade(currentResult.avg);
      const pct   = (currentResult.avg / 20) * 100;

      scoreEl.textContent   = currentResult.avg.toFixed(2) + ' / 20';
      labelEl.textContent   = 'Total: ' + currentResult.total.toFixed(1) + ' / ' + maxTotal;
      gradeEl.style.display = 'inline-block';
      gradeEl.textContent   = grade.label;
      gradeEl.className     = 'result-grade ' + grade.cls;
      fillEl.style.width    = Math.min(pct, 100).toFixed(1) + '%';

      // breakdown
      let bHTML = '';
      currentMarks.forEach(function (m) {
        const cls = (m.mark / m.max) >= 0.5 ? 'breakdown-score-pass' : 'breakdown-score-fail';
        bHTML += '<div class="breakdown-row">'
          + '<span>' + m.name + ' / ' + m.max + '</span>'
          + '<span class="' + cls + '">' + m.mark + '</span>'
          + '</div>';
      });
      breakdownEl.innerHTML = bHTML;
    }

    // ── semester summary ─────────────────────────────────────────
    const s1El    = document.getElementById('sem1-avg');
    const s2El    = document.getElementById('sem2-avg');
    const finalEl = document.getElementById('final-avg');

    s1El.textContent = result1 ? result1.avg.toFixed(2) : '—';
    s2El.textContent = result2 ? result2.avg.toFixed(2) : '—';

    if (result1 && result2) {
      finalEl.textContent = ((result1.avg + result2.avg) / 2).toFixed(2);
    } else if (result1) {
      finalEl.textContent = result1.avg.toFixed(2);
    } else {
      finalEl.textContent = '—';
    }
  }

  // ── clear ──────────────────────────────────────────────────────

  function clearAll() {
    document.querySelectorAll('input[type="number"][id^="mark-"], input[type="number"][id^="cmark-"]').forEach(function (el) {
      el.value = '';
    });
    if (customSaved) {
      customMarks['1'] = customSubjects.map(function () { return null; });
      customMarks['2'] = customSubjects.map(function () { return null; });
    }
    calculate();
  }

  // ── init ───────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {

    // stream tabs
    document.querySelectorAll('.stream-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.stream-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentStream = tab.dataset.stream;
        renderSubjects();
        calculate();
      });
    });

    // semester tabs
    document.querySelectorAll('.sem-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.sem-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentSem = tab.dataset.sem;
        document.querySelectorAll('.sem-panel').forEach(function (p) { p.classList.remove('active'); });
        document.getElementById('panel-' + currentSem).classList.add('active');
        calculate();
      });
    });

    // calculate + clear buttons
    const calcBtn  = document.getElementById('calcBtn');
    const clearBtn = document.getElementById('clearBtn');
    if (calcBtn)  { calcBtn.addEventListener('click',  calculate); }
    if (clearBtn) { clearBtn.addEventListener('click', clearAll);  }

    renderSubjects();

  });

})();