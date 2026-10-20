(() => {
  'use strict';
  const localization = JSON.parse(document.getElementById('site-localization')?.textContent || '{}');
  const t = value => localization.strings?.[value] ?? value;
  const audios = [...document.querySelectorAll('audio')];
  const controls = [...document.querySelectorAll('[data-play]')];
  const status = document.querySelector('.audio-status');
  const labels = new Map(controls.map(button => [button, button.getAttribute('aria-label')]));
  function update(audio) {
    const button = controls.find(item => item.dataset.play === audio.id);
    if (!button) return;
    const playing = !audio.paused && !audio.ended;
    button.querySelector('span').textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', playing ? t('再生を一時停止') : labels.get(button));
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
      if (status) status.textContent = t('音声を読み込めませんでした。接続を確認し、もう一度お試しください。');
      update(audio);
    });
  });
  controls.forEach(button => button.addEventListener('click', async () => {
    const audio = document.getElementById(button.dataset.play);
    if (!audio.paused) { audio.pause(); return; }
    if (audio.ended) audio.currentTime = 0;
    try { await audio.play(); }
    catch (error) {
      if (error.name !== 'AbortError' && status) status.textContent = t('音声を再生できませんでした。もう一度再生ボタンを押してください。');
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
    button.textContent = visible ? t('対訳を隠す') : t('対訳を表示');
    document.querySelectorAll('.translation').forEach(translation => { translation.hidden = !visible; });
  });
  const steps = [
    [t('まずは、耳だけで。'), t('英文を見ずに聴いて、内容を確かめる。')],
    [t('意味と音が、つながる。'), t('対訳と解説で、聞き取れなかった言葉を確認。')],
    [t('1文ずつ、自分の声で。'), t('お手本を聴いて録音。自分の声を聴き返す。')],
    [t('お手本と、一緒に。'), t('英文を見ながら、音声に重ねて読む。')],
    [t('文字を離れて、話す。'), t('少し遅れて追いかける。録音を比べて、もう一度。')]
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
      const rtl = document.documentElement.dir === 'rtl';
      if (event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].focus(); selectStep(tabs[next]); }
    });
  });
  document.querySelector('.share-button')?.addEventListener('click', async () => {
    const message = document.querySelector('.share-status');
    try {
      await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]')?.href || location.href);
      message.textContent = t('リンクをコピーしました。');
    } catch (_) { message.textContent = t('アドレスバーのURLをコピーしてご紹介ください。'); }
  });
})();
