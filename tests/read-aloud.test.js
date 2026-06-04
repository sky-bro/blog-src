const assert = require('assert');
const readAloud = require('../assets/js/read-aloud.js');

function text(value) {
  return {
    nodeType: 3,
    textContent: value,
  };
}

function element(tagName, children, attrs) {
  const node = {
    nodeType: 1,
    tagName,
    hidden: false,
    childNodes: children || [],
    children: (children || []).filter((child) => child.nodeType === 1),
    textContent: (children || []).map((child) => child.textContent || '').join(''),
    getAttribute(name) {
      return attrs && Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
    },
    matches(selector) {
      if (selector === String(tagName).toLowerCase()) return true;
      if (selector === String(tagName).toUpperCase()) return true;
      return Boolean(attrs && attrs.class && selector === '.' + attrs.class);
    },
  };

  return node;
}

function test(name, fn) {
  try {
    fn();
    console.log('ok - ' + name);
  } catch (error) {
    console.error('not ok - ' + name);
    throw error;
  }
}

test('extractReadableText replaces raw inline math with a speech label', () => {
  const root = element('div', [
    element('p', [
      text('Energy is '),
      text('$E=mc^2$'),
      text(' in this example.'),
    ]),
  ]);

  const actual = readAloud.extractReadableText(root, { mathLabel: 'formula' });

  assert.strictEqual(actual, 'Energy is formula in this example.');
});

test('extractReadableText replaces raw display math with a speech label', () => {
  const root = element('div', [
    element('p', [
      text('The recurrence is $$T(n)=2T(n/2)+n$$ before simplification.'),
    ]),
  ]);

  const actual = readAloud.extractReadableText(root, { mathLabel: '数学公式' });

  assert.strictEqual(actual, 'The recurrence is 数学公式 before simplification.');
});

test('extractReadableText prefers MathJax speech labels for rendered math', () => {
  const root = element('div', [
    element('p', [
      text('Energy is '),
      element('mjx-container', [text('E=mc2')], {
        'aria-label': 'E equals m c squared',
      }),
      text(' in this example.'),
    ]),
  ]);

  const actual = readAloud.extractReadableText(root, { mathLabel: 'formula' });

  assert.strictEqual(actual, 'Energy is E equals m c squared in this example.');
});

test('extractReadableText prefers clean MathJax speech-none labels', () => {
  const root = element('div', [
    element('p', [
      text('The value is '),
      element('mjx-container', [text('1/2')], {
        'data-semantic-speech-none': '1 divided by 2',
        'data-semantic-speech': '<mark name="0"/> 1 <mark name="1"/> divided by <mark name="2"/> 2',
      }),
      text('.'),
    ]),
  ]);

  const actual = readAloud.extractReadableText(root, { mathLabel: 'formula' });

  assert.strictEqual(actual, 'The value is 1 divided by 2.');
});

test('extractReadableText strips MathJax speech markup when only tagged speech exists', () => {
  const root = element('div', [
    element('p', [
      text('The variable is '),
      element('mjx-container', [text('x')], {
        'data-semantic-speech': '<mark name="0"/> <say-as interpret-as="character">x</say-as>',
      }),
      text('.'),
    ]),
  ]);

  const actual = readAloud.extractReadableText(root, { mathLabel: 'formula' });

  assert.strictEqual(actual, 'The variable is x.');
});

test('getVoiceChangeAction restarts only active speech without resetting progress', () => {
  assert.strictEqual(readAloud.getVoiceChangeAction({ speaking: true, pending: false }, false), 'restart-current');
  assert.strictEqual(readAloud.getVoiceChangeAction({ speaking: false, pending: true }, false), 'restart-current');
  assert.strictEqual(readAloud.getVoiceChangeAction({ speaking: true, pending: false }, true), 'pause-current');
  assert.strictEqual(readAloud.getVoiceChangeAction({ speaking: false, pending: false }, true), 'pause-current');
  assert.strictEqual(readAloud.getVoiceChangeAction({ speaking: false, pending: false }, false), 'idle');
});

test('bindSpeechCancellationOnPageExit cancels browser speech on navigation', () => {
  const handlers = {};
  let cancelCount = 0;
  const target = {
    addEventListener(name, handler) {
      handlers[name] = handler;
    },
  };
  const synth = {
    cancel() {
      cancelCount += 1;
    },
  };

  readAloud.bindSpeechCancellationOnPageExit(synth, target);
  handlers.pagehide();
  handlers.beforeunload();

  assert.strictEqual(cancelCount, 2);
});

test('pickBestVoice ignores a saved voice from another language', () => {
  const voices = [
    { name: 'English Voice', lang: 'en-US' },
    { name: 'Chinese Voice', lang: 'zh-CN' },
  ];

  const actual = readAloud.pickBestVoice(voices, 'zh', 'English Voice');

  assert.strictEqual(actual.name, 'Chinese Voice');
});

test('buildReadAloudChunks keeps the title separate from the body', () => {
  const chunks = readAloud.buildReadAloudChunks('Short title', 'First body sentence. Second body sentence.', 180);

  assert.strictEqual(chunks[0], 'Short title');
  assert.strictEqual(chunks[1], 'First body sentence. Second body sentence.');
});
