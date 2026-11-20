(function () {
  'use strict';

  // ---------- Booking settings: edit these two lines ----------
  // BOOKING_URL: your scheduling page, e.g. 'https://calendly.com/your-name/free-consultation'.
  // While it is empty, finished requests open an email to CONTACT_EMAIL instead.
  var BOOKING_URL = '';
  var CONTACT_EMAIL = 'hello@example.com';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(n) { return Math.abs(n).toLocaleString('en-CA'); }
  function money(n) { return n < 0 ? '(' + fmt(n) + ')' : fmt(n); }

  // ---------- Mobile navigation ----------
  var toggle = $('.nav-toggle');
  var nav = $('#site-nav');
  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setNav(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) { if (mq.matches) setNav(false); });
  }

  // ---------- Scroll progress ----------
  var bar = $('#scroll-bar');
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---------- Scrollspy for the main nav ----------
  var spyLinks = $$('[data-spy]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) spy.observe(target);
    });
  }

  // ---------- Hero persona + example ledger ----------
  var SVC = {
    personal: ['svc-tab-1', 'Personal tax returns'],
    selfemp: ['svc-tab-2', 'Self-employed & small business tax'],
    corp: ['svc-tab-3', 'Corporate tax & year-end'],
    books: ['svc-tab-4', 'Bookkeeping'],
    payroll: ['svc-tab-5', 'Payroll'],
    setup: ['svc-tab-6', 'Business set-up & incorporation'],
    planning: ['svc-tab-7', 'Tax planning'],
    cra: ['svc-tab-8', 'CRA support & catch-up filing'],
    cfo: ['svc-tab-9', 'Advisory & fractional CFO']
  };

  var PERSONAS = {
    employee: {
      type: 'T1 · Employee',
      handle: 'Your T1 return, RRSP and credits, and a benefits check',
      services: ['personal', 'planning'], ptype: 'personal',
      rows: [
        ['Employment income (T4)', 72400],
        ['RRSP deduction', -6000],
        ['Taxable income', 66400, 'sub'],
        ['Tax withheld by employer', 12990],
        ['Tax payable after credits', -10850],
        ['Estimated refund', 2140, 'total']
      ]
    },
    selfemployed: {
      type: 'T1 + T2125 · Self-employed',
      handle: 'Your T1 and T2125, GST/HST filings, and an instalment plan',
      services: ['selfemp', 'books', 'planning'], ptype: 'business',
      rows: [
        ['Gross sales', 96000],
        ['Business expenses', -31500],
        ['Net business income', 64500, 'sub'],
        ['Income tax and CPP', -15400],
        ['Instalments already paid', 12000],
        ['Balance owing by Apr 30', -3400, 'total']
      ]
    },
    owner: {
      type: 'T2 · Corporation (CCPC)',
      handle: 'Bookkeeping, payroll, your T2 return, and salary vs. dividend planning',
      services: ['corp', 'books', 'payroll'], ptype: 'business',
      rows: [
        ['Revenue', 480000],
        ['Operating expenses', -318000],
        ['Owner salary', -72000],
        ['Net income before tax', 90000, 'sub'],
        ['Corporate tax, 12.2% small business rate (ON)', -10980],
        ['Retained in the business', 79020, 'total']
      ]
    },
    newcomer: {
      type: 'T1 · Newcomer, part-year resident',
      handle: 'Your first Canadian return, part-year residency, and benefit applications',
      services: ['personal'], ptype: 'personal',
      rows: [
        ['Canadian employment income (Sep–Dec)', 18600],
        ['Income before arriving in Canada', 'Reported, not taxed'],
        ['Tax withheld by employer', 2450],
        ['Tax payable after credits', -1120],
        ['Estimated refund', 1330, 'total']
      ]
    }
  };

  var ledgerRows = $('#ledger-rows');
  var stamp = $('#stamp');

  function renderLedger(p) {
    var frag = document.createDocumentFragment();
    p.rows.forEach(function (r, i) {
      var tr = document.createElement('tr');
      if (r[2]) tr.className = r[2];
      if (!reduceMotion) { tr.classList.add('row-in'); tr.style.animationDelay = (i * 70) + 'ms'; }
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = r[0];
      var td = document.createElement('td');
      td.className = 'num';
      var value = typeof r[1] === 'number' ? money(r[1]) : r[1];
      if (r[2] === 'total') {
        var span = document.createElement('span');
        span.textContent = value;
        td.appendChild(span);
      } else {
        td.textContent = value;
      }
      tr.appendChild(th);
      tr.appendChild(td);
      frag.appendChild(tr);
    });
    ledgerRows.textContent = '';
    ledgerRows.appendChild(frag);
    $('#ledger-type').textContent = p.type;
    stamp.classList.remove('stamp-in');
    void stamp.offsetWidth;
    stamp.classList.add('stamp-in');
  }

  function swapText(el, text) {
    el.textContent = text;
    el.classList.remove('swap');
    void el.offsetWidth;
    el.classList.add('swap');
  }

  function renderServiceLinks(container, keys) {
    container.textContent = '';
    keys.forEach(function (k) {
      var a = document.createElement('a');
      a.href = '#services';
      a.className = 'svc-link';
      a.setAttribute('data-svc', SVC[k][0]);
      a.textContent = SVC[k][1];
      container.appendChild(a);
    });
    container.classList.remove('swap');
    void container.offsetWidth;
    container.classList.add('swap');
  }

  $$('input[name="persona"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var p = PERSONAS[radio.value];
      swapText($('#pr-handle'), p.handle);
      renderServiceLinks($('#pr-services'), p.services);
      var cta = $('#hero-cta');
      cta.setAttribute('data-plan', SVC[p.services[0]][1]);
      cta.setAttribute('data-type', p.ptype);
      renderLedger(p);
    });
  });

  // ---------- Count-up stats ----------
  var counters = $$('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countObs.unobserve(entry.target);
        var el = entry.target;
        var end = +el.getAttribute('data-count');
        var start = performance.now();
        var dur = 1300;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(end * eased).toLocaleString('en-CA');
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  }

  // ---------- Tabs (services, checklist) ----------
  function selectTab(tab, focus) {
    var list = tab.closest('[role="tablist"]');
    var tabs = $$('[role="tab"]', list);
    tabs.forEach(function (t, i) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
      if (selected && list.hasAttribute('data-active')) list.setAttribute('data-active', String(i));
    });
    if (focus) tab.focus();
  }

  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  });

  // Service links (hero, Who we help) open the matching service
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-svc]');
    if (!link) return;
    var tab = document.getElementById(link.getAttribute('data-svc'));
    if (tab) selectTab(tab);
  });

  // ---------- How it works: draw the timeline once it scrolls into view ----------
  var timeline = $('#timeline');
  if (timeline && !reduceMotion && 'IntersectionObserver' in window) {
    var rect = timeline.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      timeline.classList.add('pre');
      var tlObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          timeline.classList.remove('pre');
          tlObs.disconnect();
        }
      }, { threshold: 0.4 });
      tlObs.observe(timeline);
    }
  }

  // ---------- CRA deadlines: countdown, past and next ----------
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var next = null;
  $$('#deadlines li').forEach(function (li) {
    var parts = li.getAttribute('data-date').split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    if (d < today) li.classList.add('is-past');
    else if (!next) { next = { li: li, date: d }; li.classList.add('is-next'); }
  });
  if (next) {
    var days = Math.round((next.date - today) / 86400000);
    var label = next.li.querySelector('time').textContent;
    var shortLabel = label.replace(/, \d{4}$/, '');
    $('#cd-days').textContent = days;
    $('#cd-unit').textContent = days === 1 ? 'day' : 'days';
    $('#cd-what').textContent = label + ' · ' + next.li.getAttribute('data-short');
    $('#chip-date').textContent = shortLabel;
    $('#chip-days').textContent = days === 0 ? 'today' : days + (days === 1 ? ' day' : ' days');
  } else {
    $('.countdown').hidden = true;
    $('.deadline-chip').hidden = true;
  }

  // ---------- Document checklist: counter + ring ----------
  var CIRC = 2 * Math.PI * 18;
  $$('.checklist').forEach(function (panel) {
    var boxes = $$('input[type="checkbox"]', panel);
    var count = $('.cl-count span', panel);
    var ring = $('.ring-fg', panel);
    var ringNum = $('.ring-num', panel);
    ring.style.strokeDasharray = CIRC;
    ring.style.strokeDashoffset = CIRC;
    panel.addEventListener('change', function () {
      var done = boxes.filter(function (b) { return b.checked; }).length;
      var pct = done / boxes.length;
      count.textContent = done;
      ring.style.strokeDashoffset = CIRC * (1 - pct);
      ringNum.textContent = Math.round(pct * 100) + '%';
      panel.classList.toggle('complete', done === boxes.length);
    });
  });

  // ---------- FAQ: accordion ----------
  var items = $$('.acc-item');
  var triggers = items.map(function (item) { return $('.acc-trigger', item); });
  items.forEach(function (item, index) {
    var btn = triggers[index];
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    btn.addEventListener('keydown', function (e) {
      var visible = triggers.filter(function (t) { return !t.closest('.acc-item').classList.contains('match-hidden'); });
      var i = visible.indexOf(btn);
      var target = null;
      if (e.key === 'ArrowDown') target = visible[(i + 1) % visible.length];
      else if (e.key === 'ArrowUp') target = visible[(i - 1 + visible.length) % visible.length];
      else if (e.key === 'Home') target = visible[0];
      else if (e.key === 'End') target = visible[visible.length - 1];
      if (target) { e.preventDefault(); target.focus(); }
    });
  });

  // ---------- FAQ: search ----------
  var faqQ = $('#faq-q');
  if (faqQ) {
    faqQ.addEventListener('input', function () {
      var q = faqQ.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var match = !q || item.textContent.toLowerCase().indexOf(q) > -1;
        item.classList.toggle('match-hidden', !match);
        if (match) shown++;
        if (q && match && !item.classList.contains('open')) {
          item.classList.add('open');
          $('.acc-trigger', item).setAttribute('aria-expanded', 'true');
        }
      });
      $('#faq-empty').hidden = shown > 0;
      $('#faq-count').textContent = q ? (shown + (shown === 1 ? ' question matches' : ' questions match')) : '';
    });
  }

  // ---------- Intake form (3 steps) ----------
  var form = $('#intake');
  var success = $('#intake-success');
  var steps = $$('.step', form);
  var fill = $('.progress-fill', form);
  var track = $('.progress-track', form);
  var stepLabel = $('#step-label');
  var stepName = $('#step-name');
  var planNote = $('#plan-note');
  var fitResult = $('#fit-result');
  var current = 1;
  var chosenPlan = '';

  function clientType() {
    var r = $('input[name="clientType"]:checked', form);
    return r ? r.value : '';
  }
  function checked(name) {
    return $$('input[name="' + name + '"]:checked', form).map(function (c) { return c.value; });
  }
  var OPTION_SERVICES = {
    employment: ['personal'], investments: ['personal', 'planning'], student: ['personal'], newcomer: ['personal'],
    rental: ['personal', 'planning'], selfemployed: ['selfemp'], sold: ['personal', 'planning'], behind: ['cra'],
    soleprop: ['selfemp'], corp: ['corp'], planning: ['setup'], books: ['books'], gst: ['selfemp'],
    payroll: ['payroll'], cfo: ['cfo'], cra: ['cra']
  };
  function suggestion() {
    var type = clientType();
    var picks = [];
    if (type === 'personal' || type === 'both') picks = picks.concat(checked('personal'));
    if (type === 'business' || type === 'both') picks = picks.concat(checked('business'));
    var keys = [];
    picks.forEach(function (v) {
      (OPTION_SERVICES[v] || []).forEach(function (k) { if (keys.indexOf(k) === -1) keys.push(k); });
    });
    var order = Object.keys(SVC);
    keys.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    return keys.map(function (k) { return SVC[k][1]; }).join(' · ');
  }
  function updateFit() { fitResult.textContent = suggestion() || 'Select what applies to see the matching services'; }
  function updateGroups() {
    var type = clientType();
    $$('.check-group', form).forEach(function (g) {
      var group = g.getAttribute('data-group');
      g.hidden = !(type === 'both' || type === group);
    });
    updateFit();
  }
  function showStep(n, focus) {
    current = n;
    steps.forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
    var step = steps[n - 1];
    stepLabel.textContent = 'Step ' + n + ' of ' + steps.length;
    stepName.textContent = step.getAttribute('data-name');
    fill.style.width = (n / steps.length * 100) + '%';
    track.setAttribute('aria-valuenow', String(n));
    if (focus) $('.step-title', step).focus();
  }
  function setError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phonePattern = /^[+()\-.\s\d]{7,20}$/;
  var fieldRules = {
    name: function (v) {
      if (!v) return 'Please enter your name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: function (v) {
      if (!v) return 'Please enter your email address.';
      if (!emailPattern.test(v)) return 'Enter a valid email, for example name@example.com.';
      return '';
    },
    phone: function (v) {
      if (v && !phonePattern.test(v)) return 'Enter a valid phone number, for example (555) 010-0000.';
      return '';
    }
  };
  function validateField(input) {
    var msg = fieldRules[input.name](input.value.trim());
    input.closest('.field').classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    setError(input.name + '-error', msg);
    return !msg;
  }
  function validateStep(n) {
    if (n === 1) {
      var ok = !!clientType();
      setError('clientType-error', ok ? '' : 'Please choose who this is for.');
      if (!ok) $('input[name="clientType"]', form).focus();
      return ok;
    }
    if (n === 2) {
      var ok2 = !!suggestion();
      setError('situation-error', ok2 ? '' : 'Select at least one option that applies to you.');
      return ok2;
    }
    var first = null;
    Object.keys(fieldRules).forEach(function (name) {
      var input = form.elements[name];
      if (!validateField(input) && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }

  if (form) {
    $$('input[name="clientType"]', form).forEach(function (r) {
      r.addEventListener('change', function () { setError('clientType-error', ''); updateGroups(); });
    });
    $$('.check-group input', form).forEach(function (c) {
      c.addEventListener('change', function () { setError('situation-error', ''); updateFit(); });
    });
    $$('[data-next]', form).forEach(function (btn) {
      btn.addEventListener('click', function () { if (validateStep(current)) showStep(current + 1, true); });
    });
    $$('[data-back]', form).forEach(function (btn) {
      btn.addEventListener('click', function () { showStep(current - 1, true); });
    });
    Object.keys(fieldRules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () {
        if (input.value.trim() || input.closest('.field').classList.contains('invalid')) validateField(input);
      });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (current !== steps.length) {
        if (validateStep(current)) showStep(current + 1, true);
        return;
      }
      if (!validateStep(3)) return;
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var firstName = name.split(/\s+/)[0];
      var services = suggestion() || chosenPlan;
      var summary = [
        'Client type: ' + (clientType() || 'not given'),
        'Services: ' + (services || 'not sure yet'),
        'Phone: ' + (form.elements.phone.value.trim() || 'not given'),
        'Province: ' + (form.elements.province.value || 'not given'),
        'Notes: ' + (form.elements.message.value.trim() || 'none')
      ].join('\n');
      var link = $('#booking-link');
      if (BOOKING_URL) {
        // Calendly (and most schedulers) accept name, email and a first answer as query parameters.
        var sep = BOOKING_URL.indexOf('?') === -1 ? '?' : '&';
        link.href = BOOKING_URL + sep + 'name=' + encodeURIComponent(name) +
          '&email=' + encodeURIComponent(email) + '&a1=' + encodeURIComponent(summary);
        link.setAttribute('target', '_blank');
        link.innerHTML = 'Choose your time <span class="arrow" aria-hidden="true">\u2192</span>';
        $('#success-title').textContent = 'Thanks, ' + firstName + '! One last step.';
        $('#success-text').textContent = 'Pick a time for your free 20-minute call' +
          (services ? ' about ' + services : '') + '. Your details are already filled in.';
      } else {
        link.href = 'mailto:' + CONTACT_EMAIL +
          '?subject=' + encodeURIComponent('Free consultation request: ' + name) +
          '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n' + summary +
            '\n\nPlease suggest a few times for my free 20-minute call.');
        link.removeAttribute('target');
        link.innerHTML = 'Send my request <span class="arrow" aria-hidden="true">\u2192</span>';
        $('#success-title').textContent = 'Thanks, ' + firstName + '! One last step.';
        $('#success-text').textContent = 'Send your request and we\u2019ll reply to ' + email +
          ' with times for your free 20-minute call' + (services ? ' about ' + services : '') + '.';
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    $('#intake-reset').addEventListener('click', function () {
      form.reset();
      chosenPlan = '';
      planNote.hidden = true;
      $$('.field', form).forEach(function (f) { f.classList.remove('invalid'); });
      $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      $$('.error', form).forEach(function (el) { el.textContent = ''; });
      updateGroups();
      showStep(1);
      success.hidden = true;
      form.hidden = false;
      $('.step-title', steps[0]).focus();
    });

    // Any "Choose"/"Book this service" button pre-fills the intake form
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-plan]');
      if (!btn) return;
      chosenPlan = btn.getAttribute('data-plan');
      var type = btn.getAttribute('data-type');
      var radio = type ? $('input[name="clientType"][value="' + type + '"]', form) : null;
      if (radio) radio.checked = true;
      setError('clientType-error', '');
      updateGroups();
      planNote.textContent = 'You\u2019re asking about: ' + chosenPlan + '.';
      planNote.hidden = false;
      if (!form.hidden) showStep(clientType() ? 2 : 1);
    });

    updateGroups();
    showStep(1);
  }

  // ---------- Newsletter ----------
  var nl = $('#newsletter-form');
  if (nl) {
    var nlInput = $('#nl-email');
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = nlInput.value.trim();
      var msg = !v ? 'Please enter your email address.' : (!emailPattern.test(v) ? 'Enter a valid email, for example name@example.com.' : '');
      setError('nl-error', msg);
      nlInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) { nlInput.focus(); return; }
      nl.reset();
      nlInput.removeAttribute('aria-invalid');
      $('#nl-success').hidden = false;
    });
  }

  // ---------- Hide the mobile contact bar while the booking form is on screen ----------
  var mobileCta = $('#mobile-cta');
  var book = $('#book');
  if (mobileCta && book && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      mobileCta.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.15 }).observe(book);
  }

  // ---------- Software logos: seamless, gap-free loop at any width ----------
  var marquee = $('#marquee');
  if (marquee && !reduceMotion) {
    var track = $('.marquee-track', marquee);
    var original = $('.marquee-group', track);
    var SPEED = 45; // pixels per second

    var fillMarquee = function () {
      $$('.marquee-group[data-clone]', track).forEach(function (g) { g.remove(); });
      var groupWidth = original.getBoundingClientRect().width;
      if (!groupWidth) return;
      // Copies needed so the strip is always full while one set scrolls out.
      var copies = Math.max(2, Math.ceil(marquee.clientWidth / groupWidth) + 1);
      $$('.marquee-group', track).forEach(function (g) { if (g !== original) g.remove(); });
      for (var i = 1; i < copies; i++) {
        var clone = original.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-clone', '');
        $$('img', clone).forEach(function (img) { img.alt = ''; });
        track.appendChild(clone);
      }
      track.style.setProperty('--shift', groupWidth + 'px');
      track.style.setProperty('--duration', (groupWidth / SPEED) + 's');
    };

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fillMarquee, 150);
    });
    window.addEventListener('load', fillMarquee);
    fillMarquee();
  }

  // ---------- Footer year ----------
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
