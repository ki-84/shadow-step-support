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
    catch (_) { if (status) status.textContent = '音声を再生できませんでした。もう一度再生ボタンを押してください。'; }
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) audios.forEach(audio => audio.pause()); });
  document.querySelector('.translation-toggle')?.addEventListener('click', event => {
    const button = event.currentTarget;
    const visible = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(visible));
    button.textContent = visible ? '日本語訳を隠す' : '日本語訳を表示';
    document.querySelectorAll('.translation').forEach(translation => { translation.hidden = !visible; });
  });
  const steps = [
    ['まずは、耳だけで。', '英文を見ずに音声を聴き、短い問題で内容を確かめます。最初から全部聞き取れなくても大丈夫。'],
    ['意味と音をつなぐ。', '英文と日本語訳、語句や音の変化を確認します。「そう言っていたのか」を、一つずつ増やしていきます。'],
    ['1文ずつ、自分の声で。', 'お手本を聴いたら、その文を録音。自分の声を聴き返し、次の文へ。長い英文も、1文ずつ練習できます。'],
    ['お手本と、一緒に。', '英文を見ながら、お手本の音声と同時に声を出します。英語のまとまりや、強く読む言葉を意識してみましょう。'],
    ['文字を離れて、追いかける。', '英文を隠して、お手本から少し遅れて話します。録音を聴き比べ、次に練習する1点を確かめましょう。']
  ];
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectStep(tab) {
    const index = Number(tab.dataset.step);
    tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    document.getElementById('step-panel').setAttribute('aria-labelledby', tab.id);
    document.getElementById('step-number').textContent = String(index + 1).padStart(2, '0');
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
