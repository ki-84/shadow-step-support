(() => {
  'use strict';
  const audios = [...document.querySelectorAll('audio')];
  const controls = [...document.querySelectorAll('[data-play]')];
  const status = document.querySelector('.audio-status');
  const labels = new Map(controls.map(button => [button, button.getAttribute('aria-label')]));
  function update(audio) {
    const button = controls.find(item => item.dataset.play === audio.id);
    if (!button) return;
    const playing = !audio.paused && !audio.ended;
    button.querySelector('span').textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', playing ? '再生を一時停止' : labels.get(button));
    button.closest('.clip')?.classList.toggle('playing', playing);
  }
  audios.forEach(audio => {
    audio.addEventListener('play', () => {
      audios.forEach(other => { if (other !== audio) other.pause(); });
      if (status) status.textContent = '';
      update(audio);
    });
    ['pause', 'ended'].forEach(event => audio.addEventListener(event, () => update(audio)));
    audio.addEventListener('error', () => {
      if (status) status.textContent = '音声を読み込めませんでした。接続を確認し、もう一度お試しください。';
      update(audio);
    });
  });
  controls.forEach(button => button.addEventListener('click', async () => {
    const audio = document.getElementById(button.dataset.play);
    if (!audio.paused) { audio.pause(); return; }
    if (audio.ended) audio.currentTime = 0;
    try { await audio.play(); }
    catch (error) {
      if (error.name !== 'AbortError' && status) status.textContent = '音声を再生できませんでした。もう一度再生ボタンを押してください。';
    }
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) audios.forEach(audio => audio.pause()); });
  const clips = [...document.querySelectorAll('.clip')];
  let clipIndex = 0;
  function selectClip(index) {
    clipIndex = Math.max(0, Math.min(clips.length - 1, index));
    audios.forEach(audio => audio.pause());
    clips.forEach((clip, position) => { clip.hidden = position !== clipIndex; });
    const audio = clips[clipIndex].querySelector('audio');
    if (audio.readyState > 0) audio.currentTime = 0;
    document.getElementById('clip-position').textContent = `${String(clipIndex + 1).padStart(2, '0')} / ${String(clips.length).padStart(2, '0')}`;
    document.querySelector('[data-clip-direction="-1"]').disabled = clipIndex === 0;
    document.querySelector('[data-clip-direction="1"]').disabled = clipIndex === clips.length - 1;
    if (status) status.textContent = '';
  }
  if (clips.length) {
    selectClip(0);
    document.querySelectorAll('[data-clip-direction]').forEach(button => {
      button.addEventListener('click', () => selectClip(clipIndex + Number(button.dataset.clipDirection)));
    });
  }
  document.querySelectorAll('.translation').forEach(translation => { translation.hidden = true; });
  document.querySelector('.translation-toggle')?.addEventListener('click', event => {
    const button = event.currentTarget;
    const visible = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(visible));
    button.textContent = visible ? '日本語訳を隠す' : '日本語訳を表示';
    document.querySelectorAll('.translation').forEach(translation => { translation.hidden = !visible; });
  });
  const steps = [
    ['まずは、耳だけで。', '英文を見ずに聴いて、内容を確かめる。'],
    ['意味と音が、つながる。', '対訳と解説で、聞き取れなかった言葉を確認。'],
    ['1文ずつ、自分の声で。', 'お手本を聴いて録音。自分の声を聴き返す。'],
    ['お手本と、一緒に。', '英文を見ながら、音声に重ねて読む。'],
    ['文字を離れて、話す。', '少し遅れて追いかける。録音を比べて、もう一度。']
  ];
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectStep(tab) {
    const index = Number(tab.dataset.step);
    tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    document.getElementById('step-panel').setAttribute('aria-labelledby', tab.id);
    document.getElementById('step-number').textContent = String(index + 1).padStart(2, '0');
    document.querySelector('.step-display-number').textContent = String(index + 1).padStart(2, '0');
    document.getElementById('step-title').textContent = steps[index][0];
    document.getElementById('step-description').textContent = steps[index][1];
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStep(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].focus(); selectStep(tabs[next]); }
    });
  });
  document.querySelector('.share-button')?.addEventListener('click', async () => {
    const message = document.querySelector('.share-status');
    try {
      await navigator.clipboard.writeText('https://ki-84.github.io/shadow-step-support/');
      message.textContent = 'リンクをコピーしました。';
    } catch (_) { message.textContent = 'アドレスバーのURLをコピーしてご紹介ください。'; }
  });
})();
