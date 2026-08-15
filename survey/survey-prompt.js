/*
 * survey-prompt.js — drop-in PACT feedback prompt.
 *
 * Shows a small, dismissible toast inviting the reader to fill in ONE relevant survey.
 * Nothing is ever shown to someone who already sent that survey, and never more than
 * once per cooldown window, so it can sit on a page permanently without nagging.
 *
 * ---------------------------------------------------------------------------
 * USE 1 — a page about one topic (pin the survey):
 *
 *   <script src="https://chompy78.github.io/pact-guide-public/survey/survey-prompt.js"
 *           data-survey="spellcasting" defer></script>
 *
 * USE 2 — a long multi-section document like the Player's Guide (pick by what the
 * reader is actually looking at):
 *
 *   <script src="https://chompy78.github.io/pact-guide-public/survey/survey-prompt.js"
 *           data-survey="auto" defer></script>
 *
 * USE 3 — fire it yourself, e.g. from a DM console or at the end of a tool's flow.
 * This is the integration seam for the separate PACT tools project; nothing else in
 * that project needs to know how surveys work.
 *
 *   PactSurveyPrompt.show('tools');            // respects cooldown + already-sent
 *   PactSurveyPrompt.show('tools', {force:true});  // always show (e.g. a DM button)
 *
 * ---------------------------------------------------------------------------
 * Options (all optional, set as data- attributes on the script tag):
 *   data-survey    survey key, or "auto"        (default "auto")
 *   data-chance    0..1, odds per eligible view (default 0.25)
 *   data-cooldown  days before re-asking        (default 7)
 *   data-base      URL of the survey page       (default: alongside this script)
 *   data-delay     ms before it appears         (default 20000)
 *
 * NOTE ON SHARED STATE: "already sent" is read from localStorage, which is shared
 * per-origin, not per-path. Pages served from the same host as the survey (any
 * chompy78.github.io/... path) see the same record. A tool served from a different
 * host will not, and will prompt independently.
 */
(function(){
  'use strict';

  var VALID = ['chargen','rules','spellcasting','classes','campaign','tools'];
  var DONE_KEY   = 'pact_survey_done_v1';    // written by the survey page on success
  var PROMPT_KEY = 'pact_survey_prompt_v1';  // written here, when a prompt is shown
  var PROFILE_KEY = 'pact_survey_profile_v1';

  var LABEL = {
    chargen:      ['Got a minute on character creation?', 'How did building your character actually go?'],
    rules:        ['Got a minute on the rules?',          'Anything in the rules trip you up lately?'],
    spellcasting: ['Got a minute on spellcasting?',       'Foundation, Rank, slots — how\'s it reading?'],
    classes:      ['Got a minute on class abilities?',    'How are the class feature menus working out?'],
    campaign:     ['Got a minute on the campaign?',       'How\'s the game itself landing for you?'],
    tools:        ['Got a minute on the tools?',          'How are the generator and sheet treating you?']
  };

  // Which survey a section of the Player's Guide belongs to. Matched against the
  // nearest heading text above the reader, lowercased.
  var SECTION_MAP = [
    [/spellcast|spell slot|tradition|discipline|cantrip|foundation|rank/, 'spellcasting'],
    [/character creation|building a character|worked example|starting stat|origin class/, 'chargen'],
    [/class feature|barbarian|bard|cleric|druid|fighter|monk|paladin|ranger|rogue|sorcerer|warlock|wizard/, 'classes'],
    [/generator|character sheet|tool/, 'tools'],
    [/advancement|cost table|price|hit dice|downtime|gold/, 'rules']
  ];

  var script = document.currentScript || (function(){
    var all = document.getElementsByTagName('script');
    return all[all.length - 1];
  })();

  function attr(name, fallback){
    if (!script) return fallback;
    var v = script.getAttribute('data-' + name);
    return (v === null || v === '') ? fallback : v;
  }

  var CFG = {
    survey:   attr('survey', 'auto'),
    chance:   parseFloat(attr('chance', '0.25')),
    cooldown: parseFloat(attr('cooldown', '7')),
    delay:    parseInt(attr('delay', '20000'), 10),
    base:     attr('base', null)
  };

  // Default the survey URL to sitting alongside this script.
  if (!CFG.base){
    var src = (script && script.src) || '';
    CFG.base = src ? src.replace(/[^/]*$/, '') : '/survey/';
  }

  function readJSON(key){
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : {}; }
    catch (e) { return {}; }
  }
  function writeJSON(key, val){
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function daysSince(iso){
    if (!iso) return Infinity;
    var t = Date.parse(iso);
    if (isNaN(t)) return Infinity;
    return (Date.now() - t) / 86400000;
  }

  // Work out which survey suits what the reader is currently looking at.
  function detectSurvey(){
    var heads = document.querySelectorAll('h1,h2,h3');
    var best = null, bestTop = -Infinity;
    for (var i = 0; i < heads.length; i++){
      var top = heads[i].getBoundingClientRect().top;
      if (top < 120 && top > bestTop){ bestTop = top; best = heads[i]; }
    }
    var text = (best ? best.textContent : document.title || '').toLowerCase();
    for (var j = 0; j < SECTION_MAP.length; j++){
      if (SECTION_MAP[j][0].test(text)) return SECTION_MAP[j][1];
    }
    return null;
  }

  function eligible(key){
    if (VALID.indexOf(key) === -1) return false;
    var done = readJSON(DONE_KEY);
    if (done[key]) return false;                                  // already sent this one
    var profile = readJSON(PROFILE_KEY);
    if (key === 'spellcasting' && profile.hasCaster === 'no') return false;  // not a caster
    var shown = readJSON(PROMPT_KEY);
    if (daysSince(shown[key]) < CFG.cooldown) return false;       // asked recently
    return true;
  }

  var openNow = false;

  function show(key, opts){
    opts = opts || {};
    if (openNow) return false;
    if (!opts.force && !eligible(key)) return false;
    if (VALID.indexOf(key) === -1) return false;

    var copy = LABEL[key] || ['Got a minute?', 'Tell the DM how it\'s going.'];
    var host = document.createElement('div');
    host.setAttribute('role', 'dialog');
    host.setAttribute('aria-label', copy[0]);
    host.style.cssText = [
      'position:fixed','z-index:99999','left:16px','right:16px','bottom:16px','margin:0 auto',
      'max-width:380px','background:#FBF5E9','color:#3A2A18','border:1px solid #B89968',
      'border-radius:10px','box-shadow:0 6px 24px rgba(58,42,24,.28)','padding:14px 14px 12px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
      'font-size:14px','line-height:1.45','opacity:0','transform:translateY(10px)',
      'transition:opacity .25s ease,transform .25s ease'
    ].join(';');

    host.innerHTML =
      '<button type="button" aria-label="Dismiss" style="position:absolute;top:6px;right:8px;border:none;' +
        'background:none;font-size:20px;line-height:1;color:#766649;cursor:pointer;padding:2px 4px;">&times;</button>' +
      '<div style="font-family:\'Iowan Old Style\',\'Palatino Linotype\',Palatino,Georgia,serif;' +
        'font-weight:700;color:#58180D;margin:0 20px 3px 0;">' + copy[0] + '</div>' +
      '<div style="color:#766649;font-size:13px;margin-bottom:11px;">' + copy[1] + '</div>' +
      '<div style="display:flex;gap:8px;">' +
        '<a class="pact-go" href="' + CFG.base + '?s=' + key + '" style="flex:1;text-align:center;' +
          'padding:9px 12px;border-radius:8px;background:#882D17;color:#fff;text-decoration:none;' +
          'font-weight:600;">Sure</a>' +
        '<button type="button" class="pact-later" style="padding:9px 12px;border-radius:8px;' +
          'border:1px solid #882D17;background:transparent;color:#882D17;font-weight:600;' +
          'cursor:pointer;font-family:inherit;font-size:14px;">Not now</button>' +
      '</div>';

    document.body.appendChild(host);
    requestAnimationFrame(function(){ host.style.opacity = '1'; host.style.transform = 'translateY(0)'; });
    openNow = true;

    // Record that we asked, so the cooldown starts now regardless of the answer.
    var shown = readJSON(PROMPT_KEY);
    shown[key] = new Date().toISOString();
    writeJSON(PROMPT_KEY, shown);

    function close(){
      host.style.opacity = '0';
      host.style.transform = 'translateY(10px)';
      setTimeout(function(){ if (host.parentNode) host.parentNode.removeChild(host); }, 250);
      openNow = false;
    }
    host.querySelector('button[aria-label="Dismiss"]').addEventListener('click', close);
    host.querySelector('.pact-later').addEventListener('click', close);
    return true;
  }

  function auto(){
    var key = CFG.survey === 'auto' ? detectSurvey() : CFG.survey;
    if (!key) return;
    if (!eligible(key)) return;
    if (Math.random() > CFG.chance) return;   // the "random" part
    show(key);
  }

  window.PactSurveyPrompt = {
    show: show,
    eligible: eligible,
    detect: detectSurvey,
    surveys: VALID.slice()
  };

  if (script && script.getAttribute('data-manual') !== null) return;  // seam-only, no auto prompt
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(auto, CFG.delay); });
  } else {
    setTimeout(auto, CFG.delay);
  }
})();
