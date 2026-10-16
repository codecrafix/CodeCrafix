/* CodeCrafix admin guard: keeps paid products working while payments are not live.
   While CODECRAFIX_CONFIG.paymentsLive is not true, a paid product (price above 0) must use "Link" delivery with a
   redirect URL, because Buy sends the visitor straight to that URL. This script switches the product form to Link
   automatically and explains it, so saving from the admin panel never produces a Buy button that cannot work. */
(function () {
  var CFG = window.CODECRAFIX_CONFIG || {};
  function setup() {
    var del = document.getElementById('f-del'), price = document.getElementById('f-price'), link = document.getElementById('d-link');
    if (!del || !price || !link || del.getAttribute('data-cf-guard')) { return; }
    del.setAttribute('data-cf-guard', '1');
    var lab = link.querySelector('label'), hint = link.querySelector('.hint');
    var oldLab = lab ? lab.textContent : '', oldHint = hint ? hint.textContent : '';
    var note = document.createElement('div');
    note.className = 'hint'; note.style.color = '#fbbf24'; note.hidden = true;
    del.parentNode.appendChild(note);
    function refresh() {
      var paid = parseFloat(price.value || '0') > 0, live = CFG.paymentsLive === true;
      if (paid && !live) {
        if (del.value !== 'link') { del.value = 'link'; del.dispatchEvent(new Event('change')); }
        if (lab) { lab.textContent = 'Redirect URL (required for paid products) *'; }
        if (hint) { hint.textContent = 'Payments are not live yet. When a visitor clicks Buy, they go straight to this URL (no name/email form).'; }
        note.hidden = false; note.textContent = 'Paid product: delivery is set to Link so the Buy button can open your redirect URL.';
      } else {
        if (lab) { lab.textContent = oldLab; }
        if (hint) { hint.textContent = oldHint; }
        note.hidden = true;
      }
    }
    price.addEventListener('input', refresh);
    price.addEventListener('change', refresh);
    del.addEventListener('change', refresh);
    refresh();
  }
  new MutationObserver(setup).observe(document.documentElement, { childList: true, subtree: true });
  setup();
})();
