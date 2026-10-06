import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSound } from '../src/audio.js';

test('audio needs opt-in, switches from chimes to ambient, and pauses in background', async () => {
  const original = { document: globalThis.document, AudioContext: globalThis.AudioContext,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval };
  const events = {}, attributes = {}, sources = [];
  const label = { textContent: 'Sound off' };
  let click, context, intervals = 0, rejectResume = false;
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
  const node = () => ({ gain: param(), frequency: param(), delayTime: param(), connect() {}, disconnect() {},
    start() { sources.push(this); }, stop() { this.stopped = true; } });
  globalThis.document = { hidden: false, addEventListener(name, handler) { events[name] = handler; } };
  globalThis.setInterval = () => { intervals++; return 1; };
  globalThis.clearInterval = id => { if (id) intervals--; };
  globalThis.AudioContext = class {
    constructor() { context = this; this.currentTime = 0; this.sampleRate = 8; this.state = 'suspended'; }
    createGain = node; createOscillator = node; createBufferSource = node;
    createBiquadFilter = node; createDelay = node; createDynamicsCompressor = node;
    createBuffer() { return { getChannelData: () => new Float32Array(8) }; }
    async resume() { if (rejectResume) throw Error('Blocked'); this.state = 'running'; }
    async suspend() { this.state = 'suspended'; }
  };
  const button = { querySelector: () => label, setAttribute: (key, value) => { attributes[key] = value; },
    addEventListener(name, handler) { click = handler; } };
  try {
    const sound = createSound(button);
    sound.cue();
    assert.equal(context, undefined);
    await click();
    assert.equal(attributes['aria-pressed'], 'true');
    assert.equal(sources.length, 2);
    assert.equal(intervals, 0);
    sound.finishIntro();
    assert.equal(intervals, 1);
    assert.ok(sources.length > 2);
    sound.finishIntro();
    assert.equal(intervals, 1);
    document.hidden = true;
    await events.visibilitychange();
    assert.equal(intervals, 0);
    assert.equal(context.state, 'suspended');
    document.hidden = false;
    await events.visibilitychange();
    assert.equal(intervals, 1);
    await click();
    assert.equal(intervals, 0);
    assert.equal(attributes['aria-pressed'], 'false');
    assert.ok(sources.every(source => source.stopped));
    rejectResume = true;
    await click();
    assert.equal(attributes['aria-pressed'], 'false');
    assert.equal(label.textContent, 'Sound unavailable');
    assert.equal(intervals, 0);
    rejectResume = false;
    const previousSources = sources.length;
    await click();
    assert.equal(sources.length - previousSources, 10);
    assert.equal(intervals, 1);
    await click();
    assert.equal(intervals, 0);
  } finally {
    Object.assign(globalThis, original);
  }
});

test('an unavailable audio API leaves the site usable and shows a clear status', async () => {
  const original = { document: globalThis.document, AudioContext: globalThis.AudioContext };
  let click;
  globalThis.document = { hidden: false, addEventListener() {} };
  globalThis.AudioContext = class { constructor() { throw Error('Unavailable'); } };
  const label = {};
  const sound = createSound({ querySelector: () => label, setAttribute() {}, addEventListener(_, handler) { click = handler; } });
  try {
    sound.finishIntro();
    await click();
    assert.equal(label.textContent, 'Sound unavailable');
  } finally { Object.assign(globalThis, original); }
});
