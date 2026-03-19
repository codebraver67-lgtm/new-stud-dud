// scriptA.js

// _______________________________preloader_____________________________ 

window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hide');
  }, 1800);
});

// _______________________________theme (runs before paint — no flash)_____________________________ 

(function () {
  const saved = localStorage.getItem('sd-theme') || 'default';
  document.documentElement.setAttribute('data-theme', saved);
})();

// _______________________________dom ready_____________________________ 

document.addEventListener('DOMContentLoaded', () => {

  // _______________________________date_____________________________ 

  const fmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
  const dateStr = fmt.format(new Date());

  const navDateEl    = document.getElementById('navDate');
  const mobileDateEl = document.getElementById('mobileDateDisplay');
  if (navDateEl)    navDateEl.textContent    = dateStr;
  if (mobileDateEl) mobileDateEl.textContent = dateStr;

  // _______________________________theme switcher_____________________________ 

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('sd-theme', t);
  }

  const themeBtn      = document.getElementById('themeBtn');
  const themeDropdown = document.getElementById('themeDropdown');
  const sectionsBtn      = document.getElementById('sectionsBtn');
  const sectionsDropdown = document.getElementById('sectionsDropdown');

  if (themeBtn && themeDropdown) {
    themeBtn.addEventListener('click', e => {
      e.stopPropagation();
      themeDropdown.classList.toggle('open');
      if (sectionsDropdown) sectionsDropdown.classList.remove('open');
      if (sectionsBtn)      sectionsBtn.classList.remove('active');
    });

    themeDropdown.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        setTheme(opt.dataset.theme);
        themeDropdown.classList.remove('open');
      });
    });
  }

  // mobile theme buttons
  document.querySelectorAll('.mobile-theme-opt').forEach(opt => {
    opt.addEventListener('click', () => setTheme(opt.dataset.theme));
  });

  // _______________________________sections dropdown_____________________________ 

  if (sectionsBtn && sectionsDropdown) {
    sectionsBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = sectionsDropdown.classList.toggle('open');
      sectionsBtn.classList.toggle('active', isOpen);
      if (themeDropdown) themeDropdown.classList.remove('open');
    });

    sectionsDropdown.addEventListener('click', e => e.stopPropagation());
  }

  // _______________________________3-dash button_____________________________ 

  const threeDash      = document.getElementById('threeDash');
  const mobileDropdown = document.getElementById('mobileDropdown');

  if (threeDash && mobileDropdown) {
    threeDash.addEventListener('click', e => {
      e.stopPropagation();
      threeDash.classList.toggle('open');
      mobileDropdown.classList.toggle('open');
    });

    // close mobile dropdown when a link inside is clicked
    mobileDropdown.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        threeDash.classList.remove('open');
        mobileDropdown.classList.remove('open');
      });
    });
  }

  // _______________________________close all dropdowns on outside click_____________________________ 

  document.addEventListener('click', () => {
    if (themeDropdown)    themeDropdown.classList.remove('open');
    if (sectionsDropdown) sectionsDropdown.classList.remove('open');
    if (sectionsBtn)      sectionsBtn.classList.remove('active');
  });

});
// _______________________________footer year_____________________________ 

  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = '© ' + new Date().getFullYear() + ' Study Dudy';
  }