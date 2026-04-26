(function () {
  'use strict';

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function initReadingProgress() {
    var wrapper = document.querySelector('.wrapper');
    var isPostPage = wrapper &&
      wrapper.getAttribute('data-type') === 'posts' &&
      wrapper.getAttribute('data-kind') === 'page';

    if (!isPostPage) {
      return;
    }

    var progress = document.createElement('div');
    var bar = document.createElement('div');

    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    bar.className = 'reading-progress__bar';

    progress.appendChild(bar);
    document.body.appendChild(progress);

    function updateProgress() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;

      bar.style.transform = 'scaleX(' + clamp(ratio, 0, 1) + ')';
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingProgress);
  } else {
    initReadingProgress();
  }
}());
