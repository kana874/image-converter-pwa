(() => {
  let deferredInstallPrompt = null;

  const isStandalone = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  const isIOS = () => {
    const ua = window.navigator.userAgent || '';
    return /iPhone|iPad|iPod/i.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  };

  const showIOSInstallGuide = () => {
    window.alert(
      'iPhone / iPadでは共有メニューからホーム画面に追加します。\n\n' +
      '1. ブラウザの「共有」ボタン（□↑）をタップ\n' +
      '2. 「ホーム画面に追加」をタップ\n' +
      '3. 右上の「追加」をタップ\n\n' +
      '「ホーム画面に追加」が見つからない場合は、共有メニューを下へスクロールしてください。'
    );
  };

  const ensureInstallButton = () => {
    let button = document.getElementById('btnInstallApp');
    if (button) return button;

    const host = document.querySelector('.header-actions');
    if (!host) return null;

    button = document.createElement('button');
    button.id = 'btnInstallApp';
    button.type = 'button';
    button.textContent = isIOS() ? 'ホーム画面に追加する方法' : 'アプリとしてインストール';
    button.setAttribute('aria-label', button.textContent);
    button.hidden = isStandalone() || !isIOS();
    button.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try {
          await deferredInstallPrompt.userChoice;
        } finally {
          deferredInstallPrompt = null;
          button.hidden = true;
        }
        return;
      }
      if (isIOS()) showIOSInstallGuide();
    });
    host.appendChild(button);
    return button;
  };

  ensureInstallButton();

  window.addEventListener('beforeinstallprompt', event => {
    if (isStandalone()) return;
    event.preventDefault();
    deferredInstallPrompt = event;
    const button = ensureInstallButton();
    if (button) {
      button.textContent = 'アプリとしてインストール';
      button.setAttribute('aria-label', button.textContent);
      button.hidden = false;
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const button = document.getElementById('btnInstallApp');
    if (button) button.hidden = true;
  });

  const parts = ['./js/app-part-01.txt', './js/app-part-02.txt', './js/app-part-03.txt', './js/app-part-04.txt', './js/app-part-05.txt', './js/app-part-06.txt'];
  (async () => {
    try {
      const chunks = [];
      for (const path of parts) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
        chunks.push(await response.text());
      }
      (0, eval)(chunks.join(""));
    } catch (error) {
      console.error("Application loader failed:", error);
      const status = document.getElementById("status");
      if (status) {
        status.textContent = "アプリ本体の読み込みに失敗しました。オンライン状態で再読み込みしてください。";
        status.className = "status error";
      }
    }
  })();
})();
