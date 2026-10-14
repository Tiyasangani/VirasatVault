// Applies the saved (or system) colour theme before the first paint, so the page never flashes the wrong colours.
// This is a separate file (not inline) because the server's content-security policy only allows scripts from its own files.
(function () {
  try {
    var t = localStorage.getItem('vv_theme');
    if (t !== 'dark' && t !== 'light') t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
