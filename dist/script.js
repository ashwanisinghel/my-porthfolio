document.querySelectorAll('.detail-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;
    button.querySelector('span').textContent = expanded ? '+' : '−';
  });
});
document.getElementById('year').textContent = new Date().getFullYear();
