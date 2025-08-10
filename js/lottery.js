// メイン抽選アプリケーション
class LotteryApp {
  constructor() {
    this.pool = new Map();
    this.lastWinners = [];
    this.confettiContainer = null;
    this.confettiInterval = null;
    this.productIndex = 1;
    this.resultsResizeObserver = null;
    this.CONFETTI_ENABLED = false;
    
    this.initializeElements();
    this.bindEvents();
    this.initializeApp();
  }
  
  // DOM要素の初期化
  initializeElements() {
    this.$ = id => document.getElementById(id);
    
    // フォーム要素
    this.listA = this.$("listA");
    this.listB = this.$("listB");
    this.listC = this.$("listC");
    this.pointsA = this.$("pointsA");
    this.pointsB = this.$("pointsB");
    this.pointsC = this.$("pointsC");
    this.exclude = this.$("exclude");
    this.uniquePerList = this.$("uniquePerList");
    this.minPoints = this.$("minPoints");
    
    // UI要素
    this.productsContainer = this.$("productsContainer");
    this.btnAddProduct = this.$("btnAddProduct");
    this.statsLeft = this.$("statsLeft");
    this.statsRight = this.$("statsRight");
    this.tableWrap = this.$("tableWrap");
    
    // モーダル要素
    this.resultsPanel = this.$("resultsPanel");
    this.resultsOverlay = this.$("resultsOverlay");
    this.winnersBadges = this.$("winnersBadges");
    this.resultsTitle = this.$("resultsTitle");
    this.btnCopyNames = this.$("btnCopyNames");
    this.btnCopyCSV = this.$("btnCopyCSV");
    this.closeResults = this.$("closeResults");
    
    // ボタン要素
    this.btnTheme = this.$("btnTheme");
    this.btnSave = this.$("btnSave");
    this.btnReset = this.$("btnReset");
  }
  
  // イベントバインディング
  bindEvents() {
    this.$("btnPreview").onclick = () => this.preview();
    this.$("btnDraw").onclick = () => this.draw();
    
    // モーダルイベント
    this.closeResults.onclick = () => this.hideResultsModal();
    this.resultsOverlay.onclick = () => this.hideResultsModal();
    
    // 保存・リセット
    this.btnSave.onclick = () => this.saveData();
    this.btnReset.onclick = () => this.resetData();
    
    // 商品管理
    this.btnAddProduct.onclick = () => this.addProduct();
    
    // テーマ切り替え
    this.btnTheme.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      this.applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
    
    // リサイズ時の位置調整
    window.addEventListener('resize', () => {
      this.updateCopyActionsMode();
      this.positionCopyActions();
      this.updateCopyActionsViewportOffset();
    });

    // iOS等でのソフトキーボード表示に追従
    try{
      if(window.visualViewport){
        visualViewport.addEventListener('resize', () => this.updateCopyActionsViewportOffset());
        visualViewport.addEventListener('scroll', () => this.updateCopyActionsViewportOffset());
      }
    }catch(e){}
  }
  
  // アプリケーション初期化
  initializeApp() {
    this.initTheme();
    this.loadData();
    this.initAdvancedSection();
    this.initMobileMenu();
    this.initFormatterTool();
    this.initHelp();
    this.updateListCounts();
    
    // リストの変更監視
    [this.listA, this.listB, this.listC, this.exclude].forEach(el => {
      if (el) el.addEventListener('input', () => this.updateListCounts());
    });
  }
  
  // リストのパース
  parseList(txt) {
    if (!txt) return [];
    return txt.split(/\r?\n|\r/).map(s => s.trim()).filter(Boolean);
  }
  
  // 文字列の正規化
  normalize(s) {
    try {
      return s.trim().normalize('NFKC').toLowerCase();
    } catch (e) {
      return s.trim().toLowerCase();
    }
  }
  
  // プールの構築
  buildPool() {
    this.pool.clear();
    const excludes = new Set(this.parseList(this.exclude.value).map(this.normalize));
    const lists = [
      { rows: this.parseList(this.listA.value), p: parseFloat(this.pointsA.value) || 0 },
      { rows: this.parseList(this.listB.value), p: parseFloat(this.pointsB.value) || 0 },
      { rows: this.parseList(this.listC.value), p: parseFloat(this.pointsC.value) || 0 }
    ];
    
    for (const { rows, p } of lists) {
      const seen = new Set();
      for (const raw of rows) {
        const key = this.normalize(raw);
        if (!key || excludes.has(key)) continue;
        if (this.uniquePerList.checked && seen.has(key)) continue;
        seen.add(key);
        const cur = this.pool.get(key) || { name: raw.trim(), points: 0 };
        cur.points += p;
        if (raw.trim().length > cur.name.length) cur.name = raw.trim();
        this.pool.set(key, cur);
      }
    }
    
    const min = parseFloat(this.minPoints.value) || 0;
    if (min > 0) {
      for (const [k, v] of this.pool) {
        if (v.points < min) this.pool.delete(k);
      }
    }
  }
  
  // 総ポイントの計算
  totals() {
    let total = 0;
    this.pool.forEach(v => total += v.points);
    return total;
  }
  
  // テーブルの描画
  renderTable() {
    const totalPts = this.totals();
    const rows = [...this.pool.values()].sort((a, b) => b.points - a.points);
    this.statsLeft.textContent = i18n.t('candidates') + ' ' + rows.length + ' ' + i18n.t('people');
    this.statsRight.textContent = i18n.t('totalPoints') + ' ' + totalPts.toFixed(2);
    
    if (rows.length === 0) {
      this.tableWrap.innerHTML = '';
      return;
    }
    
    const html = `
      <table>
        <thead><tr><th data-i18n="name">${i18n.t('name')}</th><th class="mono" data-i18n="points">${i18n.t('points')}</th><th class="mono" data-i18n="probability">${i18n.t('probability')}</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td>${this.escapeHtml(r.name)}</td><td class="mono">${r.points.toFixed(2)}</td><td class="mono">${totalPts ? (r.points / totalPts * 100).toFixed(2) : '0.00'}</td></tr>`).join('')}
        </tbody>
      </table>`;
    this.tableWrap.innerHTML = html;
  }
  
  // HTMLエスケープ
  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  
  // 暗号化乱数生成
  getRandom() {
    if (window.crypto && window.crypto.getRandomValues) {
      try {
        const arr = new Uint32Array(2);
        window.crypto.getRandomValues(arr);
        const a = arr[0] >>> 5, b = arr[1] >>> 6;
        return (a * 67108864 + b) / 9007199254740992;
      } catch (e) {
        console.warn('暗号化乱数生成失敗:', e);
      }
    }
    return Math.random();
  }
  
  // 重み付き選択
  weightedPick(arr) {
    const total = arr.reduce((s, e) => s + e.points, 0);
    if (total <= 0) return null;
    let r = this.getRandom() * total;
    for (const e of arr) {
      if ((r -= e.points) <= 0) return e;
    }
    return arr[arr.length - 1] || null;
  }
  
  // プレビュー
  preview() {
    this.buildPool();
    this.renderTable();
  }
  
  // 商品情報の取得
  getProducts() {
    const products = [];
    document.querySelectorAll('.product-item').forEach((item, index) => {
      const rawName = item.querySelector('.product-name').value;
      const name = rawName
        .replace(/[\u0000-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFEFF]/g, '')
        .trim()
        .slice(0, 50);
      const winners = Math.max(1, Math.min(1000, parseInt(item.querySelector('.product-winners').value) || 1));
      const productName = name || (winners === 1 ? 
        i18n.t('autoPlace', { index: index + 1 }) : 
        i18n.t('autoPlaceMultiple', { index: index + 1, count: winners }));
      products.push({ name: productName, winners });
    });
    return products.length > 0 ? products : [{ name: i18n.t('autoPlace', { index: 1 }), winners: 1 }];
  }
  
  // 抽選実行
  draw() {
    this.buildPool();
    const arr = [...this.pool.values()].filter(e => e.points > 0);
    if (arr.length === 0) {
      alert(i18n.t('noTargets'));
      return;
    }
    
    const products = this.getProducts();
    const allWinners = [];
    const availableCandidates = [...arr];
    
    for (const product of products) {
      const productWinners = [];
      for (let i = 0; i < product.winners; i++) {
        if (availableCandidates.length === 0) break;
        const winner = this.weightedPick(availableCandidates);
        if (!winner) break;
        
        productWinners.push(winner);
        const idx = availableCandidates.findIndex(e => this.normalize(e.name) === this.normalize(winner.name));
        if (idx >= 0) availableCandidates.splice(idx, 1);
      }
      if (productWinners.length > 0) {
        allWinners.push({
          product: product.name,
          winners: productWinners
        });
      }
    }
    
    this.lastWinners = allWinners;
    this.showResultsWithAnimation();
    this.renderTable();
  }
  
  // 結果の更新
  updateResults() {
    if (!this.lastWinners || this.lastWinners.length === 0) {
      this.resultsTitle.textContent = i18n.t('noWinners');
      this.winnersBadges.innerHTML = `<span class="badge" data-i18n="noWinnersMessage">${i18n.t('noWinnersMessage')}</span>`;
      return;
    }
    
    if (this.lastWinners[0] && this.lastWinners[0].product) {
      const totalWinners = this.lastWinners.reduce((sum, p) => sum + p.winners.length, 0);
      this.resultsTitle.textContent = i18n.t('winnerCount', { count: totalWinners });
      
      let badgesHtml = '';
      this.lastWinners.forEach(productResult => {
        badgesHtml += `<div style="margin-bottom:16px;"><h4 style="margin:0 0 8px;color:white;font-size:16px;">${this.escapeHtml(productResult.product)}</h4>`;
        badgesHtml += productResult.winners.map(winner => `<span class="badge">${this.escapeHtml(winner.name)}</span>`).join(' ');
        badgesHtml += '</div>';
      });
      this.winnersBadges.innerHTML = badgesHtml;
      
      const names = this.lastWinners.map(p =>
        `${p.product}:\n${p.winners.map(w => w.name).join('\n')}`
      ).join('\n\n');
      
      const csv = 'product,name,points\n' + this.lastWinners.map(p =>
        p.winners.map(w => `${this.csvq(p.product)},${this.csvq(w.name)},${w.points}`).join('\n')
      ).join('\n');
      
      this.btnCopyNames.onclick = () => this.doCopy(names, i18n.t('namesCopied'));
      this.btnCopyCSV.onclick = () => this.doCopy(csv, i18n.t('csvCopied'));
    } else {
      const n = this.lastWinners.length;
      this.resultsTitle.textContent = n > 0 ? i18n.t('winnerCount', { count: n }) : i18n.t('noWinners');
      this.winnersBadges.innerHTML = n ? 
        this.lastWinners.map(p => `<span class="badge">${this.escapeHtml(p.name)}</span>`).join('') : 
        `<span class="badge" data-i18n="noWinnersMessage">${i18n.t('noWinnersMessage')}</span>`;
      
      const names = this.lastWinners.map(p => p.name).join("\n");
      const csv = 'name,points\n' + this.lastWinners.map(p => `${this.csvq(p.name)},${p.points}`).join("\n");
      this.btnCopyNames.onclick = () => this.doCopy(names, i18n.t('namesCopied'));
      this.btnCopyCSV.onclick = () => this.doCopy(csv, i18n.t('csvCopied'));
    }
  }
  
  // 結果モーダル表示
  showResultsModal() {
    this.resultsOverlay.classList.add('show');
    this.resultsPanel.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    const copyActions = document.querySelector('.copy-actions');
    if (copyActions) {
      copyActions.classList.add('show');
      this.updateCopyActionsMode();
      this.positionCopyActions();
      requestAnimationFrame(() => {
        this.positionCopyActions();
        this.updateCopyActionsViewportOffset();
      });
    }
    
    if (window.ResizeObserver && !this.resultsResizeObserver) {
      this.resultsResizeObserver = new ResizeObserver(() => {
        this.positionCopyActions();
      });
      this.resultsResizeObserver.observe(this.resultsPanel);
      const badges = document.getElementById('winnersBadges');
      if (badges) this.resultsResizeObserver.observe(badges);
    }
  }
  
  // 結果モーダル非表示
  hideResultsModal() {
    this.resultsOverlay.classList.remove('show');
    this.resultsPanel.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    const copyActions = document.querySelector('.copy-actions');
    if (copyActions) copyActions.classList.remove('show');
    
    if (this.resultsResizeObserver) {
      try { this.resultsResizeObserver.disconnect(); } catch (e) { }
      this.resultsResizeObserver = null;
    }
    
    this.stopConfetti();
  }
  
  // アニメーション付き結果表示
  showResultsWithAnimation() {
    this.showResultsModal();
    this.updateResults();
    setTimeout(() => this.positionCopyActions(), 0);
    
    if (this.CONFETTI_ENABLED && this.lastWinners.length > 0) {
      this.startContinuousConfetti();
    }
    
    this.resultsPanel.classList.add('success-pulse');
    setTimeout(() => this.resultsPanel.classList.remove('success-pulse'), 800);
  }
  
  // コピーボタンの位置調整
  positionCopyActions() {
    const actions = document.querySelector('.copy-actions');
    if(!actions || !actions.classList.contains('show')) return;
    // モバイルはCSSで固定ボトムにする
    if(window.innerWidth <= 600){
      return;
    }
    const panelRect = this.resultsPanel.getBoundingClientRect();
    // モーダル幅を適用
    actions.style.width = panelRect.width + 'px';
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = 16; // 余白
    let left = panelRect.left;
    let top = panelRect.bottom + s;
    actions.style.left = Math.round(left) + 'px';
    actions.style.top = Math.round(top) + 'px';
    // 上に逃がす判定（スペース不足）
    const aRect = actions.getBoundingClientRect();
    if(top + aRect.height > vh - s){
      const newTop = panelRect.top - aRect.height - s;
      if(newTop >= s){
        actions.style.top = Math.round(newTop) + 'px';
      }
    }
    // 横はみ出し調整
    const afterRect = actions.getBoundingClientRect();
    if(afterRect.left < s){
      actions.style.left = s + 'px';
      actions.style.width = Math.min(panelRect.width, vw - s*2) + 'px';
    } else if(afterRect.right > vw - s){
      actions.style.left = Math.max(s, vw - afterRect.width - s) + 'px';
      actions.style.width = Math.min(panelRect.width, vw - s*2) + 'px';
    }
  }

  // 画面幅に応じてコピー操作の配置を切替
  updateCopyActionsMode(){
    const actions = document.querySelector('.copy-actions');
    if(!actions) return;
    const small = window.innerWidth <= 600;
    if(small){
      actions.classList.add('bottom');
      actions.classList.remove('below');
    } else {
      actions.classList.remove('bottom');
      actions.classList.add('below');
    }
  }

  // モバイルでキーボード出現時にボトムが隠れないよう補正
  updateCopyActionsViewportOffset(){
    const actions = document.querySelector('.copy-actions');
    if(!actions) return;
    if(!(window.innerWidth <= 600)){
      actions.style.bottom = '';
      return;
    }
    try{
      if(window.visualViewport){
        const vv = window.visualViewport;
        const offset = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));
        const base = 12; // CSS側のベース余白(px)
        actions.style.bottom = (offset > 0) ? (base + offset) + 'px' : '';
      } else {
        actions.style.bottom = '';
      }
    } catch(e) {
      actions.style.bottom = '';
    }
  }
  
  // 紙吹雪開始
  startContinuousConfetti() {
    this.stopConfetti();
    
    this.confettiContainer = document.createElement('div');
    this.confettiContainer.style.position = 'fixed';
    this.confettiContainer.style.top = '0';
    this.confettiContainer.style.left = '0';
    this.confettiContainer.style.width = '100vw';
    this.confettiContainer.style.height = '100vh';
    this.confettiContainer.style.pointerEvents = 'none';
    this.confettiContainer.style.zIndex = '1500';
    document.body.appendChild(this.confettiContainer);
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#fd79a8', '#00b894', '#e17055', '#00cec9', '#a29bfe', '#fd79a8', '#fdcb6e', '#e84393'];
    const shapes = ['rect', 'circle', 'triangle'];
    
    this.createConfettiBatch(40, colors, shapes);
    
    this.confettiInterval = setInterval(() => {
      this.createConfettiBatch(6, colors, shapes);
    }, 1200);
  }
  
  // 紙吹雪バッチ作成
  createConfettiBatch(count, colors, shapes) {
    if (!this.confettiContainer) return;
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.className = `confetti ${shape}`;
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-50px';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      
      if (shape === 'triangle') {
        confetti.style.borderBottomColor = color;
      } else {
        confetti.style.backgroundColor = color;
      }
      
      const scale = Math.random() * 0.8 + 0.5;
      confetti.style.transform = `scale(${scale})`;
      
      this.confettiContainer.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti && confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 4000);
    }
  }
  
  // 紙吹雪停止
  stopConfetti() {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
      this.confettiInterval = null;
    }
    
    if (this.confettiContainer && this.confettiContainer.parentNode) {
      this.confettiContainer.parentNode.removeChild(this.confettiContainer);
      this.confettiContainer = null;
    }
  }
  
  // CSV用クォート
  csvq(s) {
    return '"' + String(s).replace(/"/g, '""') + '"';
  }
  
  // コピー実行
  async doCopy(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast(okMsg);
    } catch (e) {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.left = '-999999px';
      tempTextArea.style.top = '-999999px';
      document.body.appendChild(tempTextArea);
      tempTextArea.focus();
      tempTextArea.select();
      
      try {
        document.execCommand('copy');
        this.toast(okMsg);
      } catch (e) {
        this.toast(i18n.t('copyFailed'));
      }
      document.body.removeChild(tempTextArea);
    }
  }
  
  // トースト通知
  toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.position = 'fixed';
    t.style.right = '16px';
    t.style.bottom = '16px';
    t.style.padding = '10px 14px';
    t.style.border = '1px solid var(--border)';
    t.style.background = 'var(--panel-soft)';
    t.style.borderRadius = '10px';
    t.style.boxShadow = 'var(--shadow)';
    t.style.opacity = '0';
    t.style.transition = 'all .25s ease';
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateY(-4px)';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(0)';
      setTimeout(() => t.remove(), 250);
    }, 1200);
  }
  
  // テーマ適用
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.btnTheme.textContent = theme === 'light' ? i18n.t('darkTheme') : i18n.t('lightTheme');
    localStorage.setItem('lottery_theme', theme);
    if (i18n) i18n.updateThemeButton();
  }
  
  // テーマ初期化
  initTheme() {
    const saved = localStorage.getItem('lottery_theme');
    const theme = saved || 'light';
    this.applyTheme(theme);
  }
  
  // 商品追加
  addProduct() {
    const productHtml = `
      <div class="product-item" data-index="${this.productIndex}">
        <div class="form-row">
          <span class="pill"><span data-i18n="productName">${i18n.t('productName')}</span> <input type="text" class="product-name" value="" placeholder="${i18n.t('productNamePlaceholder')}"></span>
          <span class="pill"><span data-i18n="winners">${i18n.t('winners')}</span> <input type="number" class="product-winners" value="1" min="1"></span>
          <button type="button" class="btn ghost remove-product" onclick="lottery.removeProduct(${this.productIndex})" data-i18n="removeProduct">${i18n.t('removeProduct')}</button>
        </div>
      </div>
    `;
    this.productsContainer.insertAdjacentHTML('beforeend', productHtml);
    this.productIndex++;
    this.updateRemoveButtons();
  }
  
  // 商品削除
  removeProduct(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (item) item.remove();
    this.updateRemoveButtons();
  }
  
  // 削除ボタンの表示更新
  updateRemoveButtons() {
    const items = document.querySelectorAll('.product-item');
    items.forEach((item, idx) => {
      const removeBtn = item.querySelector('.remove-product');
      removeBtn.style.display = items.length > 1 ? 'inline-block' : 'none';
    });
  }
  
  // データ保存
  saveData() {
    const products = [];
    document.querySelectorAll('.product-item').forEach(item => {
      const rawName = item.querySelector('.product-name').value;
      const cleanName = rawName
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim()
        .slice(0, 50);
      products.push({
        name: cleanName,
        winners: Math.max(1, parseInt(item.querySelector('.product-winners').value) || 1)
      });
    });
    
    const data = {
      listA: this.listA.value,
      listB: this.listB.value,
      listC: this.listC.value,
      exclude: this.exclude.value,
      pointsA: this.pointsA.value,
      pointsB: this.pointsB.value,
      pointsC: this.pointsC.value,
      uniquePerList: this.uniquePerList.checked,
      minPoints: this.minPoints.value,
      products: products
    };
    
    try {
      localStorage.setItem('lottery_data', JSON.stringify(data));
      this.toast(i18n.t('dataSaved'));
    } catch (e) {
      this.toast(i18n.t('saveFailed'));
    }
    this.updateListCounts();
  }
  
  // データリセット
  resetData() {
    if (!confirm(i18n.t('resetConfirm'))) {
      return;
    }
    
    this.listA.value = '';
    this.listB.value = '';
    this.listC.value = '';
    this.exclude.value = '';
    this.pointsA.value = '1';
    this.pointsB.value = '1';
    this.pointsC.value = '1';
    this.uniquePerList.checked = true;
    this.minPoints.value = '1';
    
    this.productsContainer.innerHTML = `
      <div class="product-item" data-index="0">
        <div class="form-row">
          <span class="pill"><span data-i18n="productName">${i18n.t('productName')}</span> <input type="text" class="product-name" value="" placeholder="${i18n.t('productNamePlaceholder')}"></span>
          <span class="pill"><span data-i18n="winners">${i18n.t('winners')}</span> <input type="number" class="product-winners" value="1" min="1"></span>
          <button type="button" class="btn ghost remove-product" style="display:none;" data-i18n="removeProduct">${i18n.t('removeProduct')}</button>
        </div>
      </div>
    `;
    this.productIndex = 1;
    
    localStorage.removeItem('lottery_data');
    
    this.lastWinners = [];
    this.pool.clear();
    
    this.renderTable();
    this.hideResultsModal();
    
    this.toast(i18n.t('resetComplete'));
    this.updateListCounts();
  }
  
  // データ読み込み
  loadData() {
    try {
      const saved = localStorage.getItem('lottery_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.listA.value = data.listA || '';
        this.listB.value = data.listB || '';
        this.listC.value = data.listC || '';
        this.exclude.value = data.exclude || '';
        this.pointsA.value = data.pointsA || '1';
        this.pointsB.value = data.pointsB || '1';
        this.pointsC.value = data.pointsC || '1';
        this.uniquePerList.checked = data.uniquePerList !== false;
        this.minPoints.value = data.minPoints || '1';
        
        if (data.products && data.products.length > 0) {
          this.productsContainer.innerHTML = '';
          data.products.forEach((product, index) => {
            const productHtml = `
              <div class="product-item" data-index="${index}">
                <div class="form-row">
                  <span class="pill"><span data-i18n="productName">${i18n.t('productName')}</span> <input type="text" class="product-name" value="${product.name || ''}" placeholder="${i18n.t('productNamePlaceholder')}"></span>
                  <span class="pill"><span data-i18n="winners">${i18n.t('winners')}</span> <input type="number" class="product-winners" value="${product.winners || 1}" min="1"></span>
                  <button type="button" class="btn ghost remove-product" onclick="lottery.removeProduct(${index})" style="display:${data.products.length > 1 ? 'inline-block' : 'none'}" data-i18n="removeProduct">${i18n.t('removeProduct')}</button>
                </div>
              </div>
            `;
            this.productsContainer.insertAdjacentHTML('beforeend', productHtml);
          });
          this.productIndex = data.products.length;
        }
        this.toast(i18n.t('dataLoaded'));
      }
    } catch (e) {
      console.log('保存データの読み込みに失敗:', e);
    }
    
    try {
      const savedOpen = localStorage.getItem('lottery_adv_open');
      const hasExtras = (this.listB.value.trim() || this.listC.value.trim() || this.exclude.value.trim());
      this.setAdvancedOpen(savedOpen ? savedOpen === '1' : !!hasExtras);
    } catch (e) { }
    this.updateListCounts();
  }
  
  // 行数カウント
  countLines(text) {
    return String(text || '').split(/\r?\n|\r/).filter(s => s.trim()).length;
  }
  
  // リスト行数更新
  updateListCounts() {
    const cA = this.$('countA');
    const cB = this.$('countB');
    const cC = this.$('countC');
    const cE = this.$('countExclude');
    if (cA) cA.textContent = this.countLines(this.listA.value) + ' ' + i18n.t('lines');
    if (cB) cB.textContent = this.countLines(this.listB.value) + ' ' + i18n.t('lines');
    if (cC) cC.textContent = this.countLines(this.listC.value) + ' ' + i18n.t('lines');
    if (cE) cE.textContent = this.countLines(this.exclude.value) + ' ' + i18n.t('lines');
  }
  
  // アドバンス機能の初期化（次のメソッドで実装）
  initAdvancedSection() {
    // モバイルメニューと併せて実装
  }
  
  // モバイルメニューの初期化（次のメソッドで実装） 
  initMobileMenu() {
    // 実装予定
  }
  
  // 整形ツールの初期化（次のメソッドで実装）
  initFormatterTool() {
    // 実装予定
  }
  
  // ヘルプシステムの初期化（次のメソッドで実装）
  initHelp() {
    // 実装予定
  }
  
  // アドバンス設定開閉
  setAdvancedOpen(open) {
    const advancedSection = this.$('advancedSection');
    const toggleAdvancedBtn = this.$('toggleAdvanced');
    if (!advancedSection || !toggleAdvancedBtn) return;
    advancedSection.hidden = !open;
    toggleAdvancedBtn.textContent = open ? i18n.t('hideAdvanced') : i18n.t('showAdvanced');
    localStorage.setItem('lottery_adv_open', open ? '1' : '0');
  }
}

// グローバルにインスタンスを公開
window.lottery = null;