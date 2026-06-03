(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.K4iReadAloud = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var SKIP_SELECTORS = [
    '.toc',
    '.highlight',
    '.clipboard',
    'pre',
    'code',
    'script',
    'style',
    'textarea',
    'mjx-container',
    '.MathJax',
  ];

  var LABELS = {
    en: {
      title: 'Read aloud',
      play: 'Play',
      resume: 'Resume',
      pause: 'Pause',
      stop: 'Stop',
      speed: 'Speed',
      voice: 'Voice',
      autoVoice: 'Auto',
      ready: 'Ready',
      loading: 'Preparing',
      reading: 'Reading',
      paused: 'Paused',
      stopped: 'Stopped',
      unsupported: 'Read aloud is not supported in this browser',
      empty: 'No readable article text found',
    },
    zh: {
      title: '朗读',
      play: '播放',
      resume: '继续',
      pause: '暂停',
      stop: '停止',
      speed: '语速',
      voice: '声音',
      autoVoice: '自动',
      ready: '准备朗读',
      loading: '正在准备',
      reading: '正在朗读',
      paused: '已暂停',
      stopped: '已停止',
      unsupported: '当前浏览器不支持朗读',
      empty: '没有找到可朗读的正文',
    },
  };

  function getLabels(lang) {
    return /^zh/i.test(lang || '') ? LABELS.zh : LABELS.en;
  }

  function normalizeSpeechLang(lang) {
    return /^zh/i.test(lang || '') ? 'zh-CN' : 'en-US';
  }

  var STORAGE_KEY = 'k4i-read-aloud';
  var DEFAULT_RATE = '1';

  function getDefaultRate() {
    return DEFAULT_RATE;
  }

  function pickBestVoice(voices, lang, savedVoiceName) {
    if (!voices || voices.length === 0) return null;
    if (savedVoiceName) {
      var savedVoice = voices.find(function (voice) {
        return voice.name === savedVoiceName;
      });
      if (savedVoice) return savedVoice;
    }

    var normalized = normalizeSpeechLang(lang).toLowerCase();
    var prefix = normalized.split('-')[0];

    return voices.find(function (voice) {
      return String(voice.lang || '').toLowerCase() === normalized;
    }) || voices.find(function (voice) {
      return String(voice.lang || '').toLowerCase().indexOf(prefix) === 0;
    }) || null;
  }

  function loadPreferences(storage) {
    if (!storage) return {};
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function savePreferences(storage, preferences) {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({
        rate: preferences.rate || '',
        voiceName: preferences.voiceName || '',
      }));
    } catch (error) {
      // Ignore storage failures; playback should still work.
    }
  }

  function getVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
  }

  function findVoice(lang, savedVoiceName) {
    return pickBestVoice(getVoices(), lang, savedVoiceName);
  }

  function isElementHidden(element) {
    if (!element) return true;
    if (element.hidden || element.getAttribute && element.getAttribute('aria-hidden') === 'true') {
      return true;
    }
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      var style = window.getComputedStyle(element);
      return style.display === 'none' || style.visibility === 'hidden';
    }
    return false;
  }

  function shouldSkip(element, skipSelectors) {
    if (!element || isElementHidden(element)) return true;
    if (!element.matches) return false;
    return skipSelectors.some(function (selector) {
      return element.matches(selector);
    });
  }

  function normalizeText(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractReadableText(rootElement, options) {
    if (!rootElement) return '';

    var skipSelectors = options && options.skipSelectors ? options.skipSelectors : SKIP_SELECTORS;
    var parts = [];
    var blockTags = {
      P: true,
      LI: true,
      H2: true,
      H3: true,
      H4: true,
      H5: true,
      H6: true,
      BLOCKQUOTE: true,
      FIGCAPTION: true,
      TD: true,
      TH: true,
    };

    function collectText(node) {
      if (!node) return '';
      if (node.nodeType === 3) return node.textContent || '';
      if (shouldSkip(node, skipSelectors)) return '';

      var childNodes = Array.prototype.slice.call(node.childNodes || []);
      if (childNodes.length === 0) return node.textContent || '';

      return childNodes.map(collectText).join('');
    }

    function walk(element, isRoot) {
      if (shouldSkip(element, skipSelectors)) return;

      if (!isRoot && blockTags[String(element.tagName || '').toUpperCase()]) {
        var text = normalizeText(collectText(element));
        if (text) parts.push(text);
        return;
      }

      Array.prototype.slice.call(element.children || []).forEach(function (child) {
        walk(child, false);
      });
    }

    walk(rootElement, true);

    return parts.join('\n\n');
  }

  function splitIntoUtterances(text, maxLength) {
    var limit = maxLength || 180;
    var normalized = normalizeText(text);
    if (!normalized) return [];

    var sentences = normalized.match(/[^.!?。！？]+[.!?。！？]?/g) || [normalized];
    var chunks = [];
    var current = '';

    sentences.forEach(function (sentence) {
      var next = normalizeText(sentence);
      if (!next) return;
      if (current && current.length + next.length + 1 > limit) {
        chunks.push(current);
        current = next;
      } else {
        current = current ? current + ' ' + next : next;
      }
    });

    if (current) chunks.push(current);
    return chunks;
  }

  function getProgressPercent(index, total) {
    if (!total || total <= 1) return 0;
    var clampedIndex = Math.max(0, Math.min(index, total - 1));
    return Math.round((clampedIndex / (total - 1)) * 100);
  }

  function getChunkIndexFromProgress(percent, total) {
    if (!total || total <= 1) return 0;
    var clampedPercent = Math.max(0, Math.min(Number(percent) || 0, 100));
    return Math.round((clampedPercent / 100) * (total - 1));
  }

  function setText(element, text) {
    if (element) element.textContent = text;
  }

  function initPlayer(player) {
    var lang = player.getAttribute('data-lang') || document.documentElement.lang || 'en';
    var labels = getLabels(lang);
    var synth = window.speechSynthesis;
    var article = document.querySelector('.single__contents');
    var title = document.querySelector('.single__title');
    var playButton = player.querySelector('[data-read-aloud-action="play"]');
    var pauseButton = player.querySelector('[data-read-aloud-action="pause"]');
    var stopButton = player.querySelector('[data-read-aloud-action="stop"]');
    var rateInput = player.querySelector('[data-read-aloud-rate]');
    var rateLabel = player.querySelector('[data-read-aloud-rate-label]');
    var voiceInput = player.querySelector('[data-read-aloud-voice]');
    var voiceLabel = player.querySelector('[data-read-aloud-voice-label]');
    var progressInput = player.querySelector('[data-read-aloud-progress]');
    var progressText = player.querySelector('[data-read-aloud-progress-text]');
    var playerLabel = player.querySelector('[data-read-aloud-label]');
    var status = player.querySelector('[data-read-aloud-status]');
    var storage = window.localStorage;
    var preferences = loadPreferences(storage);
    var voice = null;
    var chunks = [];
    var index = 0;
    var paused = false;
    var suppressEnd = false;
    var defaultRate = Number(player.getAttribute('data-rate')) || Number(getDefaultRate());

    setText(playerLabel, labels.title);
    setText(playButton, labels.play);
    setText(pauseButton, labels.pause);
    setText(stopButton, labels.stop);
    setText(rateLabel, labels.speed);
    setText(voiceLabel, labels.voice);
    setText(status, labels.ready);

    if (rateInput) {
      rateInput.value = preferences.rate || String(defaultRate);
    }
    if (voiceInput && voiceInput.options.length > 0) {
      voiceInput.options[0].textContent = labels.autoVoice;
    }

    if (!synth || typeof window.SpeechSynthesisUtterance === 'undefined') {
      setText(status, labels.unsupported);
      [playButton, pauseButton, stopButton, rateInput].forEach(function (control) {
        if (control) control.disabled = true;
      });
      return;
    }

    function updateStatus(stateLabel) {
      var voiceSuffix = voice && voice.name ? ' · ' + voice.name : '';
      setText(status, stateLabel + voiceSuffix);
    }

    function updateProgress() {
      var total = chunks.length;
      if (progressInput) {
        progressInput.disabled = total === 0;
        progressInput.value = String(getProgressPercent(index, total));
      }
      if (progressText) {
        setText(progressText, total === 0 ? '0/0' : String(Math.min(index + 1, total)) + '/' + String(total));
      }
    }

    function saveCurrentPreferences() {
      savePreferences(storage, {
        rate: rateInput ? rateInput.value : String(defaultRate),
        voiceName: voiceInput ? voiceInput.value : '',
      });
    }

    function populateVoices() {
      if (!voiceInput) return;
      var voices = getVoices().filter(function (candidate) {
        var voiceLang = String(candidate.lang || '').toLowerCase();
        return voiceLang.indexOf(normalizeSpeechLang(lang).split('-')[0].toLowerCase()) === 0;
      });
      var selected = voiceInput.value || preferences.voiceName || '';

      while (voiceInput.options.length > 1) {
        voiceInput.remove(1);
      }

      voices.forEach(function (candidate) {
        var option = document.createElement('option');
        option.value = candidate.name;
        option.textContent = candidate.name + (candidate.lang ? ' (' + candidate.lang + ')' : '');
        voiceInput.appendChild(option);
      });

      if (selected && Array.prototype.some.call(voiceInput.options, function (option) {
        return option.value === selected;
      })) {
        voiceInput.value = selected;
      }
    }

    function refreshVoice() {
      populateVoices();
      voice = findVoice(lang, voiceInput ? voiceInput.value || preferences.voiceName : preferences.voiceName);
      if (voiceInput && voice) {
        voiceInput.value = voice.name;
      }
      return voice;
    }

    function updateButtons(state) {
      if (playButton) playButton.disabled = state === 'reading';
      if (pauseButton) pauseButton.disabled = state !== 'reading';
      if (stopButton) stopButton.disabled = state === 'ready' || state === 'stopped';
    }

    function prepareChunks(resetIndex) {
      var titleText = title ? normalizeText(title.textContent) : '';
      var bodyText = extractReadableText(article);
      var fullText = [titleText, bodyText].filter(Boolean).join('. ');
      chunks = splitIntoUtterances(fullText);
      if (resetIndex || index >= chunks.length) {
        index = 0;
      }
      updateProgress();
      return chunks.length > 0;
    }

    function speakNext() {
      if (index >= chunks.length) {
        updateButtons('stopped');
        updateStatus(labels.stopped);
        setText(playButton, labels.play);
        updateProgress();
        return;
      }

      var utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = normalizeSpeechLang(lang);
      if (voice || refreshVoice()) {
        utterance.voice = voice;
      }
      utterance.rate = Number(rateInput && rateInput.value) || defaultRate;
      utterance.onend = function () {
        if (!paused && !suppressEnd) {
          index += 1;
          updateProgress();
          speakNext();
        }
      };
      utterance.onerror = function () {
        updateButtons('stopped');
        updateStatus(labels.stopped);
      };

      updateButtons('reading');
      updateStatus(labels.reading);
      updateProgress();
      window.setTimeout(function () {
        synth.speak(utterance);
      }, 60);
    }

    function cancelSpeech() {
      suppressEnd = true;
      synth.cancel();
      window.setTimeout(function () {
        suppressEnd = false;
      }, 0);
    }

    function play() {
      if (paused) {
        paused = false;
        synth.resume();
        updateButtons('reading');
        updateStatus(labels.reading);
        setText(playButton, labels.play);
        return;
      }

      setText(status, labels.loading);
      refreshVoice();
      if (synth.speaking || synth.pending) {
        cancelSpeech();
      }

      if (chunks.length === 0 && !prepareChunks(false)) {
        setText(status, labels.empty);
        updateButtons('ready');
        return;
      }

      speakNext();
    }

    function pause() {
      if (!synth.speaking) return;
      paused = true;
      synth.pause();
      updateButtons('paused');
      updateStatus(labels.paused);
      setText(playButton, labels.resume);
    }

    function stop() {
      paused = false;
      cancelSpeech();
      index = 0;
      updateButtons('stopped');
      updateStatus(labels.stopped);
      setText(playButton, labels.play);
      updateProgress();
    }

    function seekToProgress(progressValue) {
      if (chunks.length === 0 && !prepareChunks(false)) return;
      var wasReading = synth.speaking || synth.pending;
      index = getChunkIndexFromProgress(progressValue, chunks.length);
      updateProgress();

      if (wasReading) {
        paused = false;
        cancelSpeech();
        window.setTimeout(speakNext, 80);
      } else {
        updateStatus(labels.ready);
        updateButtons('ready');
        setText(playButton, labels.play);
      }
    }

    if (playButton) playButton.addEventListener('click', play);
    if (pauseButton) pauseButton.addEventListener('click', pause);
    if (stopButton) stopButton.addEventListener('click', stop);
    if (rateInput) rateInput.addEventListener('change', function () {
      saveCurrentPreferences();
    });
    if (voiceInput) voiceInput.addEventListener('change', function () {
      preferences.voiceName = voiceInput.value;
      refreshVoice();
      saveCurrentPreferences();
      stop();
    });
    if (progressInput) {
      progressInput.addEventListener('input', function () {
        if (chunks.length === 0) prepareChunks(false);
        index = getChunkIndexFromProgress(progressInput.value, chunks.length);
        updateProgress();
      });
      progressInput.addEventListener('change', function () {
        seekToProgress(progressInput.value);
      });
    }

    updateButtons('ready');
    refreshVoice();
    prepareChunks(true);
    updateStatus(labels.ready);
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = function () {
        refreshVoice();
        updateStatus(labels.ready);
      };
    }
  }

  function init() {
    if (typeof document === 'undefined') return;
    var player = document.querySelector('[data-read-aloud]');
    if (player) initPlayer(player);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return {
    extractReadableText: extractReadableText,
    splitIntoUtterances: splitIntoUtterances,
    getLabels: getLabels,
    normalizeSpeechLang: normalizeSpeechLang,
    getProgressPercent: getProgressPercent,
    getChunkIndexFromProgress: getChunkIndexFromProgress,
    getDefaultRate: getDefaultRate,
    pickBestVoice: pickBestVoice,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences,
    init: init,
  };
});
