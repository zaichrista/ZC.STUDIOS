/* Enquiry form: posts to a Google Apps Script web app that appends a row to a Google Sheet.
   Set ENDPOINT (see google-sheet-form/README.md). Until it is set, the form falls back to opening an email. */
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxhOoga5SFeJAe2VOA0OH-aTdtAnT5lmhfGKIU4wnrjQETEGqD4zWZIHzb0b8X81A2VqQ/exec';
  var f = document.getElementById('enquiry');
  if (!f) return;
  // ?service=Venue%20diagnosis preselects the option
  var sel = f.querySelector('select[name=service]'), q = new URLSearchParams(location.search).get('service');
  if (sel && q) [].forEach.call(sel.options, function (o) { if (o.value === q || o.text === q) sel.value = o.value; });
  var status = f.querySelector('.enq-status'), btn = f.querySelector('button');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var data = new FormData(f);
    if (data.get('company')) return; // honeypot
    if (!ENDPOINT) {
      var body = ['Name: ', 'Email: ', 'Venue: ', 'Website: ', 'Service: ', ''].map(function (l, i) {
        return i < 5 ? l + data.get(['name', 'email', 'venue', 'website', 'service'][i]) : '';
      }).join('\n') + '\n' + data.get('message');
      location.href = 'mailto:zairachristastudios@gmail.com?subject=' + encodeURIComponent('Enquiry: ' + data.get('service')) + '&body=' + encodeURIComponent(body);
      return;
    }
    btn.disabled = true; status.textContent = 'Sending…';
    fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error();
        f.reset(); status.textContent = 'Thank you. We will reply personally.';
      })
      .catch(function () { status.textContent = 'Something went wrong. Please email zairachristastudios@gmail.com instead.'; })
      .then(function () { btn.disabled = false; });
  });
})();
