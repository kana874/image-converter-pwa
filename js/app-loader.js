(() => {
  let deferredInstallPrompt = null;

  const isStandalone = () =>
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  const ensureInstallButton = () => {
    let button = document.getElementById('btnInstallApp');
    if (button) return button;

    const host = document.querySelector('.header-actions');
    if (!host) return null;

    button = document.createElement('button');
    button.id = 'btnInstallApp';
    button.type = 'button';
    button.textContent = 'アプリとしてインストール';
    button.hidden = true;
    button.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try {
        await deferredInstallPrompt.userChoice;
      } finally {
        deferredInstallPrompt = null;
        button.hidden = true;
      }
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
    if (button) button.hidden = false;
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
