// Remote Code website — language, theme, latest DMG, TestFlight QR, copy buttons, motion.
(function () {
  'use strict';

  // ---- Configuration -------------------------------------------------------
  // Public repository with the code, the release DMGs and the Homebrew cask.
  var REPO = 'ardasnturk/remote-code';
  // Public TestFlight link of the iPhone and iPad app.
  var TESTFLIGHT_URL = 'https://testflight.apple.com/join/6CE4VRRE';
  // The link takes testers since Apple's beta review went through; set to false
  // to hide the QR code and say the app is coming instead.
  var TESTFLIGHT_READY = true;
  // --------------------------------------------------------------------------

  var RELEASES_URL = 'https://github.com/' + REPO + '/releases';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- Language ------------------------------------------------------------
  var dynamicEn = { 'dl.mac.version': 'Latest: {v}', 'copied': 'Copied' };
  var en = {};
  var lang = 'en';
  var select = document.getElementById('lang-select');

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    en[el.getAttribute('data-i18n')] = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var p = pair.split(':');
      en[p[1]] = el.getAttribute(p[0]);
    });
  });
  en['meta.title'] = document.title;
  en['meta.description'] = document.querySelector('meta[name="description"]').content;
  Object.keys(dynamicEn).forEach(function (k) { en[k] = dynamicEn[k]; });

  function t(key) {
    var dict = lang === 'en' ? en : (window.PH_STRINGS[lang] || {});
    return dict[key] != null ? dict[key] : en[key];
  }

  // Wraps the words of the headline so they can rise in one after the other.
  function splitWords(el) {
    var i = 0;
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) { wrap(child); return; }
        if (child.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var span = document.createElement('span');
          span.className = 'word';
          span.style.setProperty('--i', i++);
          span.textContent = part;
          frag.appendChild(span);
        });
        node.replaceChild(frag, child);
      });
    }
    wrap(el);
  }

  function applyLang(next) {
    lang = window.PH_STRINGS[next] || next === 'en' ? next : 'en';
    document.documentElement.lang = lang;
    select.value = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
      if (el.hasAttribute('data-split')) splitWords(el);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        el.setAttribute(p[0], t(p[1]));
      });
    });
    // App screenshots exist in both languages.
    document.querySelectorAll('[data-shot]').forEach(function (img) {
      img.src = 'assets/shots/' + img.getAttribute('data-shot') + '-' + lang + '.webp';
    });
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]').content = t('meta.description');
    renderVersion();
  }

  // Other languages load on demand; the first one was chosen in <head>.
  function loadLang(next, done) {
    if (next === 'en' || window.PH_STRINGS[next]) { done(); return; }
    var script = document.createElement('script');
    script.src = 'i18n/' + next + '.js';
    script.onload = done;
    document.head.appendChild(script);
  }

  select.addEventListener('change', function () {
    var next = select.value;
    store.set('ph-lang', next);
    // Keep a ?lang= in the address bar in step, so reloads and shared links match.
    var url = new URL(location.href);
    if (url.searchParams.has('lang')) { url.searchParams.set('lang', next); history.replaceState(null, '', url); }
    loadLang(next, function () { applyLang(next); });
  });

  // ---- Theme ---------------------------------------------------------------
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function effectiveTheme() { return root.dataset.theme || (media.matches ? 'dark' : 'light'); }
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    // Going back to what the system prefers clears the override.
    if ((next === 'dark') === media.matches) { delete root.dataset.theme; store.set('ph-theme', ''); }
    else { root.dataset.theme = next; store.set('ph-theme', next); }
  });

  // ---- Repository links & Homebrew ----------------------------------------
  document.getElementById('releases-link').href = RELEASES_URL;
  document.getElementById('issues-link').href = 'https://github.com/' + REPO + '/issues';
  document.getElementById('source-link').href = 'https://github.com/' + REPO;
  document.getElementById('brew-cmd').textContent =
    'brew tap ' + REPO.split('/')[0] + '/remote-code https://github.com/' + REPO + '\n' +
    'brew install --cask remote-code';

  // ---- Latest DMG ----------------------------------------------------------
  var dmgLink = document.getElementById('dmg-link');
  var heroMac = document.getElementById('hero-mac');
  var latestVersion = null;
  dmgLink.href = RELEASES_URL + '/latest';

  function renderVersion() {
    var el = document.getElementById('dmg-version');
    el.textContent = latestVersion ? t('dl.mac.version').replace('{v}', latestVersion) : '';
  }

  if (window.fetch) {
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rel) {
        var dmg = (rel.assets || []).filter(function (a) { return /\.dmg$/i.test(a.name); })[0];
        if (!dmg) return;
        dmgLink.href = dmg.browser_download_url;
        heroMac.href = dmg.browser_download_url;
        latestVersion = (rel.tag_name || '').replace(/^v/, '');
        renderVersion();
      })
      .catch(function () { /* keep the releases-page fallback */ });
  }

  // ---- TestFlight ----------------------------------------------------------
  var tfLink = document.getElementById('tf-link');
  var qrBox = document.getElementById('tf-qr');
  if (TESTFLIGHT_READY) {
    tfLink.href = TESTFLIGHT_URL;
  } else {
    // No QR for a link that does not exist yet: it would open "Beta not found".
    document.getElementById('tf-ready').hidden = true;
    document.getElementById('tf-unavailable').hidden = false;
  }
  if (TESTFLIGHT_READY && window.QRCode) {
    new window.QRCode(qrBox, {
      text: TESTFLIGHT_URL, width: 256, height: 256,
      colorDark: '#0d1b1e', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M
    });
    // The library adds a title tooltip; the container already has an aria-label.
    qrBox.removeAttribute('title');
    var img = qrBox.querySelector('img');
    if (img) img.alt = '';
  }

  // ---- Copy buttons --------------------------------------------------------
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = document.getElementById(btn.getAttribute('data-copy')).textContent;
      var done = function () {
        btn.textContent = t('copied');
        setTimeout(function () { btn.textContent = t('copy'); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  applyLang(window.PH_LANG);

  // ---- Reveal on scroll ----------------------------------------------------
  var reveals = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !calm) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revealer.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(function (el) {
      // Neighbours in a row arrive one after the other.
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
      el.style.setProperty('--d', Math.min(siblings.indexOf(el), 5) * 70 + 'ms');
      revealer.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Scroll: progress bar, nav, setup line ---------------------
  var nav = document.querySelector('.nav');
  var bar = document.getElementById('progress');
  var steps = document.getElementById('steps');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 24);
    var box = steps.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (vh * .85 - box.top) / (vh * .55)));
    steps.style.setProperty('--p', calm ? 1 : p);
  }
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  // ---- iPhone story: the phone follows the step in the middle of the screen -
  var storySteps = document.querySelectorAll('.story-step');
  var storyImgs = document.querySelectorAll('.story-img');
  var sheet = document.getElementById('sheet');
  // Step → screen; step 2 (approve) plays over the chat.
  var stepScreens = [0, 1, 1, 2, 3];

  function showStep(i) {
    storySteps.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
    storyImgs.forEach(function (img, n) { img.classList.toggle('is-on', n === stepScreens[i]); });
    sheet.classList.toggle('on', i === 2);
  }
  if ('IntersectionObserver' in window) {
    var storyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) showStep(Number(e.target.getAttribute('data-step')));
      });
    }, { rootMargin: '-46% 0px -46% 0px' });
    storySteps.forEach(function (s) { storyObserver.observe(s); });
  }
  showStep(0);

  // ---- The Mac desk leans towards the pointer -----------------------------
  var desk = document.getElementById('desk');
  if (!calm && window.matchMedia('(hover: hover)').matches) {
    document.querySelector('.hero').addEventListener('pointermove', function (e) {
      var r = desk.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      desk.style.setProperty('--ry', (-5 + x * 7).toFixed(2) + 'deg');
      desk.style.setProperty('--rx', (2 - y * 5).toFixed(2) + 'deg');
    });
  }

  // ---- Spotlight on the tiles -----------------------------------------------
  document.querySelectorAll('[data-spot]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--x', e.clientX - r.left + 'px');
      el.style.setProperty('--y', e.clientY - r.top + 'px');
    });
  });

  // ---- A scripted session in the Mac desk ----------------------------------
  // The same demo session the iPhone app shows: a flaky test, an approval, a pass.
  var term = document.getElementById('term');
  var panel = document.getElementById('panel');
  var allow = document.getElementById('ask-allow');
  var working = document.getElementById('stat-working');
  var chatDot = document.getElementById('chat-dot');
  var script = [
    ['dim', '$ claude'],
    ['', '> LoginTests fails about once'],
    ['', '  in five runs. Find out why.'],
    ['tool', '● Read  LoginTests.swift'],
    ['tool', '● Edit  RetryPolicy.swift'],
    ['ok', '  ✓ +1 −0'],
    ['wait', '● Run   swift test'],
    ['ok', '  ✓ passes 50 runs in a row']
  ];
  var approvalLine = 6;

  function setBusy(busy) {
    working.textContent = busy ? '1' : '0';
    chatDot.classList.toggle('busy', busy);
  }

  function renderTerm(lines, partial) {
    term.textContent = '';
    lines.forEach(function (line, n) {
      var span = document.createElement('span');
      span.className = line[0];
      span.textContent = n === lines.length - 1 && partial != null ? line[1].slice(0, partial) : line[1];
      term.appendChild(span);
      if (n < lines.length - 1) term.appendChild(document.createTextNode('\n'));
    });
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    term.appendChild(cursor);
  }

  if (calm) {
    renderTerm(script);
    setBusy(true);
    panel.classList.add('asking');
  } else {
    var line = 0, ch = 0;
    var typing = function () {
      // Don't work while nobody can see it.
      if (document.hidden || window.scrollY > window.innerHeight) { setTimeout(typing, 700); return; }
      if (line === 0 && ch === 0) { setBusy(true); }
      var current = script.slice(0, line + 1);
      renderTerm(current, ch);
      var text = script[line][1];
      if (ch < text.length) {
        ch += 2;
        setTimeout(typing, 26);
        return;
      }
      renderTerm(current);
      var finished = line;
      line++;
      ch = 0;
      if (finished === approvalLine) {
        // The menu asks, the Allow button gets pressed, the turn goes on.
        panel.classList.add('asking');
        setTimeout(function () { allow.classList.add('press'); }, 2300);
        setTimeout(function () {
          allow.classList.remove('press');
          panel.classList.remove('asking');
          setTimeout(typing, 500);
        }, 2600);
        return;
      }
      if (line < script.length) { setTimeout(typing, 380); return; }
      setBusy(false);
      line = 0;
      setTimeout(typing, 4200);
    };
    setBusy(true);
    typing();
  }
})();
