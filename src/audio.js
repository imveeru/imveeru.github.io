export function createSound(button) {
  let context, master, toneBus, noise;
  let enabled = false, ready = false, timer, nextBeat, beat = 0;
  let changing = false;
  const voices = new Set();
  const step = 60 / 72 / 2;
  const chords = [[130.81, 155.56, 196, 233.08], [103.83, 130.81, 155.56, 196],
    [87.31, 103.83, 130.81, 155.56], [98, 123.47, 146.83, 174.61]];

  function track(source, gain, ...nodes) {
    source.connect(gain);
    gain.connect(toneBus);
    voices.add(source);
    source.onended = () => {
      voices.delete(source);
      [source, gain, ...nodes].forEach(node => node.disconnect());
    };
  }

  function note(frequency, time, duration, volume, type = 'sine') {
    const source = context.createOscillator();
    const gain = context.createGain();
    source.type = type;
    source.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    track(source, gain);
    source.start(time);
    source.stop(time + duration + .05);
  }

  function percussion(time, kick) {
    const source = kick ? context.createOscillator() : context.createBufferSource();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = kick ? 'lowpass' : 'highpass';
    filter.frequency.value = kick ? 180 : 5500;
    if (kick) {
      source.frequency.setValueAtTime(90, time);
      source.frequency.exponentialRampToValueAtTime(42, time + .16);
    } else source.buffer = noise;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(kick ? .22 : .045, time + .004);
    gain.gain.exponentialRampToValueAtTime(.0001, time + (kick ? .3 : .08));
    track(source, gain, filter);
    gain.disconnect();
    gain.connect(filter);
    filter.connect(master);
    source.start(time);
    source.stop(time + (kick ? .35 : .1));
  }

  function schedule() {
    nextBeat = Math.max(nextBeat, context.currentTime + .01);
    while (nextBeat < context.currentTime + .15) {
      const chord = chords[Math.floor(beat / 8) % chords.length];
      const position = beat % 8;
      const time = nextBeat + (position % 2 ? .035 : 0);
      if (position === 0) {
        chord.forEach((frequency, index) => {
          note(frequency * 2, time + index * .018, step * 7.8, .07, 'triangle');
          note(frequency * 4, time + index * .018, step * 3, .015);
        });
      }
      if (position === 0 || position === 4) {
        note(chord[0] / 2, time, step * 2.8, .13);
        percussion(time, true);
      }
      if (position % 2) percussion(time, false);
      if (position === 3 || position === 6) note(chord[position === 3 ? 2 : 3] * 4, time, step * 1.6, .035);
      nextBeat += step;
      beat++;
    }
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    if (!context) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0, context.currentTime, .08);
    voices.forEach(source => source.stop(context.currentTime + .3));
  }

  function play() {
    if (!enabled || document.hidden || context.state !== 'running') return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(.22, context.currentTime, .4);
    if (!ready || timer) return;
    nextBeat = context.currentTime + .05;
    beat = 0;
    schedule();
    timer = setInterval(schedule, 50);
  }

  function cue(index = 0) {
    if (!enabled || document.hidden || context.state !== 'running') return;
    const time = context.currentTime + .01;
    note([523.25, 622.25, 783.99][index], time, 1.2, .11);
    note([523.25, 622.25, 783.99][index] * 1.5, time + .07, .9, .035);
  }

  function update(failed = false) {
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
    button.querySelector('.sound-label').textContent = failed ? 'Sound unavailable' : enabled ? 'Sound on' : 'Sound off';
  }

  button.addEventListener('click', async () => {
    if (changing) return;
    changing = true;
    let failed = false;
    try {
      if (!context) {
        context = new AudioContext();
        master = context.createGain();
        master.gain.value = 0;
        const compressor = context.createDynamicsCompressor();
        master.connect(compressor);
        compressor.connect(context.destination);
        toneBus = context.createBiquadFilter();
        toneBus.type = 'lowpass';
        toneBus.frequency.value = 2200;
        toneBus.connect(master);
        const delay = context.createDelay(1);
        const feedback = context.createGain();
        const wet = context.createGain();
        delay.delayTime.value = step * .75;
        feedback.gain.value = .22;
        wet.gain.value = .16;
        toneBus.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        wet.connect(master);
        noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      }
      if (enabled) {
        enabled = false;
        stop();
      } else {
        await context.resume();
        enabled = context.state === 'running';
        play();
        if (!ready) cue();
      }
    } catch {
      enabled = false;
      failed = true;
      stop();
    } finally {
      changing = false;
      update(failed);
    }
  });

  document.addEventListener('visibilitychange', async () => {
    if (!context || !enabled) return;
    if (document.hidden) {
      stop();
      await context.suspend().catch(() => {});
    } else {
      await context.resume().catch(() => { enabled = false; update(true); });
      play();
    }
  });
  return { cue, finishIntro() { ready = true; if (context) play(); } };
}
