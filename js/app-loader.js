(async () => {
  const parts = ['./js/app-part-01.txt', './js/app-part-02.txt', './js/app-part-03.txt', './js/app-part-04.txt', './js/app-part-05.txt', './js/app-part-06.txt'];
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
