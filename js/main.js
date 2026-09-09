document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  // Custom cursor
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.querySelectorAll('a, button, audio').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Now playing indicator + single active track
  const allAudio = document.querySelectorAll('audio');

  allAudio.forEach(audio => {
    const indicator = audio.closest('.track-info').querySelector('.now-playing');

    audio.addEventListener('play', () => {
      allAudio.forEach(other => {
        if (other !== audio) {
          other.pause();
        }
      });
      indicator.classList.add('active');
      indicator.classList.remove('paused');
    });
    audio.addEventListener('pause', () => {
      indicator.classList.add('paused');
    });
    audio.addEventListener('ended', () => {
      indicator.classList.remove('active', 'paused');
    });
  });
});
