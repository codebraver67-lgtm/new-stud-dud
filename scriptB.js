// scriptB.js

// _______________________________home — rotating quote_____________________________ 

(function () {
  const el = document.getElementById('quote-text');
  if (!el) { return; }

  const quotes = [
    '"The secret of getting ahead is getting started." — Mark Twain',
    '"Push yourself, because no one else is going to do it for you."',
    '"Great things never come from comfort zones."',
    '"The harder you work for something, the greater you\'ll feel when you achieve it."',
    '"Don\'t stop when you\'re tired. Stop when you\'re done."',
    '"Wake up with determination. Go to bed with satisfaction."',
    '"Dream it. Wish it. Do it."',
    '"Success doesn\'t just find you. You have to go out and get it."',
    '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
    '"It always seems impossible until it\'s done." — Nelson Mandela',
  ];

  el.textContent = quotes[Math.floor(Math.random() * quotes.length)];

})();



















