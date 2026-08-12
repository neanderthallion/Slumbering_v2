// Flips a single .phone-frame mockup between light/dark preview — scoped to
// that mockup only, so the catalog chrome (sidebar, notes) stays legible.
function toggleMockupTheme(btn) {
  var frame = btn.closest('.mockup-col').querySelector('.phone-frame');
  var next = frame.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  frame.setAttribute('data-theme', next);
  btn.textContent = next === 'dark' ? 'Preview: light' : 'Preview: dark';
}

// Switches labeled state/variant panes on multi-state screen pages.
function showState(groupId, stateId, btn) {
  var group = document.getElementById(groupId);
  group.querySelectorAll('.state-pane').forEach(function (el) { el.classList.remove('active'); });
  group.querySelectorAll('.state-tab').forEach(function (el) { el.classList.remove('active'); });
  document.getElementById(stateId).classList.add('active');
  btn.classList.add('active');
}
