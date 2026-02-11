window.SFX = (function () {
  var ctx = null, masterGain = null, volume = 0.5, muted = false, initialized = false, noiseBuffer = null;
  var ambientNodes = null, ambientPlaying = false;

  function ensureContext() {
    if (ctx && ctx.state === 'running') return true;
    if (ctx && ctx.state === 'suspended') { ctx.resume(); return true; }
    return initialized;
  }

  function init() {
    if (initialized && ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : volume;
    masterGain.connect(ctx.destination);
    initialized = true;
  }

  function now() { return ctx ? ctx.currentTime : 0; }

  function setVolume(level) {
    volume = Math.max(0, Math.min(1, level));
    if (masterGain && !muted) masterGain.gain.setValueAtTime(volume, now());
  }

  function setMuted(bool) {
    muted = !!bool;
    if (masterGain) masterGain.gain.setValueAtTime(muted ? 0 : volume, now());
    if (muted && ambientPlaying) {
      stopAmbient();
    }
  }

  function getNoiseBuffer() {
    if (noiseBuffer && ctx) return noiseBuffer;
    var length = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  function cleanup(nodes, dur) {
    setTimeout(function () {
      for (var i = 0; i < nodes.length; i++) {
        try { if (nodes[i].stop) nodes[i].stop(); } catch (e) {}
        try { if (nodes[i].disconnect) nodes[i].disconnect(); } catch (e) {}
      }
    }, (dur + 0.1) * 1000);
  }

  /* --- Ambient ocean sound --- */
  function startAmbient() {
    if (!ensureContext()) return;
    if (ambientPlaying) return;

    var t = now();

    /* White noise source, looping */
    var noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer();
    noise.loop = true;

    /* Low-pass filter to shape noise into ocean rumble */
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    lp.Q.value = 0.7;

    /* Band-pass for a mid wave hiss */
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 800;
    bp.Q.value = 0.5;

    /* LFO to modulate the low-pass cutoff — creates wave-like surges */
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; /* slow wave rhythm */
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 200; /* modulation depth in Hz */
    lfo.connect(lfoGain);
    lfoGain.connect(lp.frequency);

    /* Second slower LFO for gentle volume swell */
    var lfo2 = ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.07;
    var lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 0.03;

    /* Ambient gain — kept low so it sits underneath everything */
    var ambGain = ctx.createGain();
    ambGain.gain.value = 0.08;

    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(ambGain.gain);

    /* Second noise path through band-pass for wave hiss texture */
    var noise2 = ctx.createBufferSource();
    noise2.buffer = getNoiseBuffer();
    noise2.loop = true;

    var hissGain = ctx.createGain();
    hissGain.gain.value = 0.03;

    noise.connect(lp);
    lp.connect(ambGain);
    noise2.connect(bp);
    bp.connect(hissGain);
    hissGain.connect(ambGain);
    ambGain.connect(masterGain);

    noise.start(t);
    noise2.start(t);
    lfo.start(t);
    lfo2.start(t);

    ambientNodes = [noise, noise2, lp, bp, lfo, lfoGain, lfo2, lfo2Gain, ambGain, hissGain];
    ambientPlaying = true;
  }

  function stopAmbient() {
    if (!ambientPlaying || !ambientNodes) return;
    for (var i = 0; i < ambientNodes.length; i++) {
      try { if (ambientNodes[i].stop) ambientNodes[i].stop(); } catch (e) {}
      try { if (ambientNodes[i].disconnect) ambientNodes[i].disconnect(); } catch (e) {}
    }
    ambientNodes = null;
    ambientPlaying = false;
  }

  /* --- Existing sound effects --- */

  function hit() {
    if (!ensureContext()) return;
    var t = now(), dur = 0.45, nodes = [];
    var noise = ctx.createBufferSource(); noise.buffer = getNoiseBuffer();
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(800, t); bp.frequency.exponentialRampToValueAtTime(200, t + dur); bp.Q.value = 1.2;
    var ng = ctx.createGain(); ng.gain.setValueAtTime(0.7, t); ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(bp); bp.connect(ng); ng.connect(masterGain); noise.start(t); noise.stop(t + dur); nodes.push(noise, bp, ng);
    var bass = ctx.createOscillator(); bass.type = 'sine'; bass.frequency.setValueAtTime(80, t); bass.frequency.exponentialRampToValueAtTime(30, t + dur);
    var bg = ctx.createGain(); bg.gain.setValueAtTime(0.5, t); bg.gain.exponentialRampToValueAtTime(0.001, t + dur);
    bass.connect(bg); bg.connect(masterGain); bass.start(t); bass.stop(t + dur); nodes.push(bass, bg);
    var crackle = ctx.createBufferSource(); crackle.buffer = getNoiseBuffer();
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    var cg = ctx.createGain(); cg.gain.setValueAtTime(0.3, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    crackle.connect(hp); hp.connect(cg); cg.connect(masterGain); crackle.start(t); crackle.stop(t + 0.1); nodes.push(crackle, hp, cg);
    cleanup(nodes, dur);
  }

  function miss() {
    if (!ensureContext()) return;
    var t = now(), dur = 0.5, nodes = [];
    var noise = ctx.createBufferSource(); noise.buffer = getNoiseBuffer();
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.setValueAtTime(600, t); hp.frequency.exponentialRampToValueAtTime(2000, t + dur);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(6000, t); lp.frequency.exponentialRampToValueAtTime(1500, t + dur);
    var sg = ctx.createGain(); sg.gain.setValueAtTime(0.001, t); sg.gain.linearRampToValueAtTime(0.35, t + 0.04); sg.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(hp); hp.connect(lp); lp.connect(sg); sg.connect(masterGain); noise.start(t); noise.stop(t + dur); nodes.push(noise, hp, lp, sg);
    var thud = ctx.createOscillator(); thud.type = 'sine'; thud.frequency.setValueAtTime(120, t); thud.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    var tg = ctx.createGain(); tg.gain.setValueAtTime(0.2, t); tg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    thud.connect(tg); tg.connect(masterGain); thud.start(t); thud.stop(t + 0.2); nodes.push(thud, tg);
    cleanup(nodes, dur);
  }

  function sunk() {
    if (!ensureContext()) return;
    var t = now(), dur = 1.8, nodes = [];
    var rn = ctx.createBufferSource(); rn.buffer = getNoiseBuffer();
    var rbp = ctx.createBiquadFilter(); rbp.type = 'bandpass'; rbp.frequency.setValueAtTime(300, t); rbp.frequency.exponentialRampToValueAtTime(60, t + 1.0); rbp.Q.value = 0.8;
    var rg = ctx.createGain(); rg.gain.setValueAtTime(0.6, t); rg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    rn.connect(rbp); rbp.connect(rg); rg.connect(masterGain); rn.start(t); rn.stop(t + 1.3); nodes.push(rn, rbp, rg);
    var bd = ctx.createOscillator(); bd.type = 'sine'; bd.frequency.setValueAtTime(100, t); bd.frequency.exponentialRampToValueAtTime(20, t + 1.0);
    var bdg = ctx.createGain(); bdg.gain.setValueAtTime(0.5, t); bdg.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    bd.connect(bdg); bdg.connect(masterGain); bd.start(t); bd.stop(t + 1.1); nodes.push(bd, bdg);
    var creak = ctx.createOscillator(); creak.type = 'sawtooth'; creak.frequency.setValueAtTime(400, t + 0.3); creak.frequency.linearRampToValueAtTime(150, t + 1.2);
    var cm = ctx.createOscillator(); cm.type = 'sine'; cm.frequency.value = 6;
    var cmg = ctx.createGain(); cmg.gain.value = 50; cm.connect(cmg); cmg.connect(creak.frequency);
    var cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 800; cf.Q.value = 4;
    var ckg = ctx.createGain(); ckg.gain.setValueAtTime(0.001, t); ckg.gain.linearRampToValueAtTime(0.15, t + 0.5); ckg.gain.linearRampToValueAtTime(0.1, t + 1.0); ckg.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    creak.connect(cf); cf.connect(ckg); ckg.connect(masterGain); creak.start(t + 0.3); creak.stop(t + 1.5); cm.start(t + 0.3); cm.stop(t + 1.5); nodes.push(creak, cm, cmg, cf, ckg);
    var bub = ctx.createOscillator(); bub.type = 'sine'; bub.frequency.setValueAtTime(600, t + 0.8); bub.frequency.exponentialRampToValueAtTime(200, t + dur);
    var bm = ctx.createOscillator(); bm.type = 'sine'; bm.frequency.value = 15;
    var bmg = ctx.createGain(); bmg.gain.value = 100; bm.connect(bmg); bmg.connect(bub.frequency);
    var bubg = ctx.createGain(); bubg.gain.setValueAtTime(0.001, t + 0.8); bubg.gain.linearRampToValueAtTime(0.12, t + 1.0); bubg.gain.exponentialRampToValueAtTime(0.001, t + dur);
    bub.connect(bubg); bubg.connect(masterGain); bub.start(t + 0.8); bub.stop(t + dur); bm.start(t + 0.8); bm.stop(t + dur); nodes.push(bub, bm, bmg, bubg);
    cleanup(nodes, dur);
  }

  function place() {
    if (!ensureContext()) return;
    var t = now(), dur = 0.2, nodes = [];
    var click = ctx.createOscillator(); click.type = 'square'; click.frequency.setValueAtTime(1200, t); click.frequency.exponentialRampToValueAtTime(400, t + 0.03);
    var cg = ctx.createGain(); cg.gain.setValueAtTime(0.25, t); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    click.connect(cg); cg.connect(masterGain); click.start(t); click.stop(t + 0.06); nodes.push(click, cg);
    var thud = ctx.createOscillator(); thud.type = 'sine'; thud.frequency.setValueAtTime(200, t); thud.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    var tg = ctx.createGain(); tg.gain.setValueAtTime(0.2, t); tg.gain.exponentialRampToValueAtTime(0.001, t + dur);
    thud.connect(tg); tg.connect(masterGain); thud.start(t); thud.stop(t + dur); nodes.push(thud, tg);
    cleanup(nodes, dur);
  }

  function victory() {
    if (!ensureContext()) return;
    var t = now(), freqs = [523.25, 659.25, 783.99, 1046.50], noteLen = 0.18, gap = 0.14, dur = freqs.length * (noteLen + gap) + 0.5, nodes = [];
    for (var i = 0; i < freqs.length; i++) {
      var start = t + i * (noteLen + gap);
      var osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freqs[i];
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4000;
      var og = ctx.createGain(); og.gain.setValueAtTime(0.001, start); og.gain.linearRampToValueAtTime(0.2, start + 0.02); og.gain.setValueAtTime(0.2, start + noteLen * 0.6); og.gain.exponentialRampToValueAtTime(0.001, start + noteLen + 0.3);
      osc.connect(lp); lp.connect(og); og.connect(masterGain); osc.start(start); osc.stop(start + noteLen + 0.35); nodes.push(osc, lp, og);
    }
    var cs = t + freqs.length * (noteLen + gap);
    for (var j = 0; j < freqs.length; j++) {
      var co = ctx.createOscillator(); co.type = 'triangle'; co.frequency.value = freqs[j];
      var cg2 = ctx.createGain(); cg2.gain.setValueAtTime(0.001, cs); cg2.gain.linearRampToValueAtTime(0.1, cs + 0.05); cg2.gain.exponentialRampToValueAtTime(0.001, cs + 0.5);
      co.connect(cg2); cg2.connect(masterGain); co.start(cs); co.stop(cs + 0.55); nodes.push(co, cg2);
    }
    cleanup(nodes, dur);
  }

  function defeat() {
    if (!ensureContext()) return;
    var t = now(), freqs = [523.25, 415.30, 349.23, 261.63], noteLen = 0.25, gap = 0.18, dur = freqs.length * (noteLen + gap) + 0.8, nodes = [];
    for (var i = 0; i < freqs.length; i++) {
      var start = t + i * (noteLen + gap);
      var osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freqs[i];
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200 - i * 200;
      var og = ctx.createGain(); og.gain.setValueAtTime(0.001, start); og.gain.linearRampToValueAtTime(0.2, start + 0.04); og.gain.setValueAtTime(0.18, start + noteLen * 0.5); og.gain.exponentialRampToValueAtTime(0.001, start + noteLen + 0.4);
      osc.connect(lp); lp.connect(og); og.connect(masterGain); osc.start(start); osc.stop(start + noteLen + 0.45); nodes.push(osc, lp, og);
      var sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = freqs[i] / 2;
      var sg = ctx.createGain(); sg.gain.setValueAtTime(0.001, start); sg.gain.linearRampToValueAtTime(0.08, start + 0.04); sg.gain.exponentialRampToValueAtTime(0.001, start + noteLen + 0.3);
      sub.connect(sg); sg.connect(masterGain); sub.start(start); sub.stop(start + noteLen + 0.35); nodes.push(sub, sg);
    }
    var ds = t + freqs.length * (noteLen + gap);
    var drone = ctx.createOscillator(); drone.type = 'sine'; drone.frequency.value = 130.81;
    var dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 400;
    var dg = ctx.createGain(); dg.gain.setValueAtTime(0.001, ds); dg.gain.linearRampToValueAtTime(0.15, ds + 0.1); dg.gain.exponentialRampToValueAtTime(0.001, ds + 0.7);
    drone.connect(dlp); dlp.connect(dg); dg.connect(masterGain); drone.start(ds); drone.stop(ds + 0.75); nodes.push(drone, dlp, dg);
    cleanup(nodes, dur);
  }

  function hover() {
    if (!ensureContext()) return;
    var t = now(), dur = 0.04, nodes = [];
    var osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 1800;
    var og = ctx.createGain(); og.gain.setValueAtTime(0.05, t); og.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(og); og.connect(masterGain); osc.start(t); osc.stop(t + dur + 0.01); nodes.push(osc, og);
    cleanup(nodes, dur);
  }

  /* --- New sound: turnStart — sonar ping --- */
  function turnStart() {
    if (!ensureContext()) return;
    var t = now(), dur = 0.6, nodes = [];

    /* Primary ping — sine that sweeps up quickly then decays */
    var ping = ctx.createOscillator();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(1200, t);
    ping.frequency.exponentialRampToValueAtTime(1600, t + 0.05);
    ping.frequency.exponentialRampToValueAtTime(1400, t + dur);

    var pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(0.001, t);
    pingGain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    /* Band-pass to give it a narrow sonar character */
    var pingBp = ctx.createBiquadFilter();
    pingBp.type = 'bandpass';
    pingBp.frequency.value = 1400;
    pingBp.Q.value = 8;

    ping.connect(pingBp);
    pingBp.connect(pingGain);
    pingGain.connect(masterGain);
    ping.start(t);
    ping.stop(t + dur);
    nodes.push(ping, pingBp, pingGain);

    /* Subtle echo/tail — delayed quieter copy */
    var echo = ctx.createOscillator();
    echo.type = 'sine';
    echo.frequency.value = 1400;

    var echoGain = ctx.createGain();
    echoGain.gain.setValueAtTime(0.001, t);
    echoGain.gain.setValueAtTime(0.001, t + 0.12);
    echoGain.gain.linearRampToValueAtTime(0.06, t + 0.14);
    echoGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    var echoBp = ctx.createBiquadFilter();
    echoBp.type = 'bandpass';
    echoBp.frequency.value = 1400;
    echoBp.Q.value = 12;

    echo.connect(echoBp);
    echoBp.connect(echoGain);
    echoGain.connect(masterGain);
    echo.start(t);
    echo.stop(t + dur);
    nodes.push(echo, echoBp, echoGain);

    cleanup(nodes, dur);
  }

  /* --- New sound: achievement — triumphant brass chord --- */
  function achievement() {
    if (!ensureContext()) return;
    var t = now(), dur = 1.2, nodes = [];

    /* Major chord: C5, E5, G5, C6 played as brass-like sawtooth with low-pass */
    var chordFreqs = [523.25, 659.25, 783.99, 1046.50];

    for (var i = 0; i < chordFreqs.length; i++) {
      /* Primary sawtooth — brass-like timbre */
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = chordFreqs[i];

      /* Low-pass to soften — opens up then closes for brass envelope */
      var lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(500, t);
      lpf.frequency.linearRampToValueAtTime(3000, t + 0.15);
      lpf.frequency.exponentialRampToValueAtTime(800, t + dur);
      lpf.Q.value = 1.5;

      var og = ctx.createGain();
      og.gain.setValueAtTime(0.001, t);
      og.gain.linearRampToValueAtTime(0.12, t + 0.08);
      og.gain.setValueAtTime(0.1, t + 0.4);
      og.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(lpf);
      lpf.connect(og);
      og.connect(masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.1);
      nodes.push(osc, lpf, og);

      /* Sub-octave reinforcement for richness */
      var sub = ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.value = chordFreqs[i] / 2;

      var subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(0.04, t + 0.1);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);

      sub.connect(subGain);
      subGain.connect(masterGain);
      sub.start(t);
      sub.stop(t + dur);
      nodes.push(sub, subGain);
    }

    /* Bright shimmer on top — high sine cluster that fades quickly */
    var shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 2093; /* C7 */
    var shimGain = ctx.createGain();
    shimGain.gain.setValueAtTime(0.001, t);
    shimGain.gain.linearRampToValueAtTime(0.06, t + 0.05);
    shimGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    shimmer.connect(shimGain);
    shimGain.connect(masterGain);
    shimmer.start(t);
    shimmer.stop(t + 0.5);
    nodes.push(shimmer, shimGain);

    cleanup(nodes, dur);
  }

  return {
    init: init,
    hit: hit,
    miss: miss,
    sunk: sunk,
    place: place,
    victory: victory,
    defeat: defeat,
    hover: hover,
    setVolume: setVolume,
    setMuted: setMuted,
    startAmbient: startAmbient,
    stopAmbient: stopAmbient,
    turnStart: turnStart,
    achievement: achievement
  };
})();
