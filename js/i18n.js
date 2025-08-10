// 多言語対応システム
const i18n = {
  // 現在の言語
  currentLang: 'ja',
  
  // 言語辞書
  dict: {
    ja: {
      // アプリケーションタイトル
      appTitle: 'ポイント制 抽選ツール',
      
      // ヘッダー
      formatTool: '🧹 整形',
      save: '💾 保存',
      reset: '🔄 リセット',
      darkTheme: '🌙 ダーク',
      lightTheme: '☀️ ライト',
      menu: 'メニュー',
      
      // リスト
      listA: 'リスト A',
      listB: 'リスト B',
      listC: 'リスト C',
      excludeList: '除外リスト',
      excludeChip: 'EXCLUDE',
      placeholder: '1行に1名を貼り付け',
      excludePlaceholder: '対象外の名前（1行に1名）',
      points: 'ポイント',
      lines: '行',
      
      // 設定
      lotterySettings: '抽選設定',
      uniquePerList: '同一リスト内の重複行は1件として扱う',
      minPoints: '最小ポイント',
      productSettings: '商品・景品設定',
      productName: '商品名',
      productNamePlaceholder: '空欄で自動設定',
      winners: '当選人数',
      addProduct: '+ 商品を追加',
      removeProduct: '削除',
      
      // ボタン
      calculateProbability: '確率を計算',
      draw: '抽選する',
      showAdvanced: '＋ 追加のリスト/除外を表示',
      hideAdvanced: '− 追加のリスト/除外を隠す',
      format: '🧹 整形',
      
      // 統計
      candidates: '候補',
      people: '名',
      totalPoints: '総ポイント',
      
      // テーブル
      name: '名前',
      probability: '当選確率(%)',
      
      // 結果
      resultWinners: '当選',
      noWinners: '😅 当選なし',
      winnerCount: '🎉 当選 {count} 名',
      noWinnersMessage: '今回は当選者がいませんでした',
      
      // コピー
      copyNames: '📋 名前をコピー',
      copyCSV: '📊 CSVをコピー',
      copyNamesShort: '名前をコピー',
      copyCSVShort: 'CSVをコピー',
      namesCopied: '✅ 名前をコピーしました',
      csvCopied: '✅ CSVをコピーしました',
      copyFailed: 'コピーに失敗しました',
      
      // 整形ツール
      formatToolTitle: '🧹 リスト整形ツール',
      formatDescription: 'ごちゃ混ぜのテキストから「＠で始まる行」だけを抽出します。',
      pasteHere: 'ここに貼り付け',
      removeDuplicates: '重複を削除',
      extractAtLines: '＠で始まる行だけ抽出',
      clearInput: '入力クリア',
      extractResult: '抽出結果',
      result: '結果',
      copyResult: '結果をコピー',
      formatResultCopied: '✅ 整形結果をコピーしました',
      atLinesExtracted: '＠始まり {count} 件',
      noChanges: '変更はありませんでした',
      formatConfirm: '{label}を整形しますか？\n総 {before} 行 → ＠始まり {after} 行（重複除去）',
      formatted: '🧹 整形しました: {count} 行',
      
      // メッセージ
      noTargets: '抽選対象者がいません',
      dataSaved: '💾 データを保存しました',
      saveFailed: '❌ 保存に失敗しました',
      resetConfirm: 'すべてのデータを初期状態に戻しますか？',
      resetComplete: '🔄 リセット完了',
      dataLoaded: '📂 保存データを読み込みました',
      
      // ヘルプ
      helpTitle: '📖 使い方ガイド',
      helpStep1: '1. リスト入力: まずはリストAに参加者名を1行ずつ入力。リストB/Cにも同一参加者名を追加で当選確率アップ。除外も設定可能。B/Cや除外は「＋ 追加のリスト/除外を表示」で開けます。',
      helpStep2: '2. 商品設定: 商品名と当選人数を設定。「+ 商品を追加」で複数商品に対応。',
      helpStep3: '3. 抽選実行: 「抽選する」で開始。結果モーダル隣のボタンから「名前/CSV」をコピーできます。',
      helpPoints: 'ポイント設定: 各リストのポイントを入力して当選しやすさを調整。',
      helpProbability: '確率確認: 「確率を計算」で候補者と当選確率を確認。',
      helpSaveReset: '保存/リセット/テーマ: 右上から操作。保存した内容は次回読み込み。',
      
      // 自動設定
      autoPlace: '{index}等',
      autoPlaceMultiple: '{index}等 ({count}名)'
    },
    
    en: {
      // Application title
      appTitle: 'Point-based Lottery Tool',
      
      // Header
      formatTool: '🧹 Format',
      save: '💾 Save',
      reset: '🔄 Reset',
      darkTheme: '🌙 Dark',
      lightTheme: '☀️ Light',
      menu: 'Menu',
      
      // Lists
      listA: 'List A',
      listB: 'List B', 
      listC: 'List C',
      excludeList: 'Exclude List',
      excludeChip: 'EXCLUDE',
      placeholder: 'One name per line',
      excludePlaceholder: 'Excluded names (one per line)',
      points: 'Points',
      lines: 'lines',
      
      // Settings
      lotterySettings: 'Lottery Settings',
      uniquePerList: 'Treat duplicate lines within the same list as one entry',
      minPoints: 'Minimum Points',
      productSettings: 'Product/Prize Settings',
      productName: 'Product Name',
      productNamePlaceholder: 'Leave blank for auto-naming',
      winners: 'Winners',
      addProduct: '+ Add Product',
      removeProduct: 'Remove',
      
      // Buttons
      calculateProbability: 'Calculate Probability',
      draw: 'Draw Lottery',
      showAdvanced: '＋ Show Additional Lists/Exclude',
      hideAdvanced: '− Hide Additional Lists/Exclude',
      format: '🧹 Format',
      
      // Statistics
      candidates: 'Candidates',
      people: 'people',
      totalPoints: 'Total Points',
      
      // Table
      name: 'Name',
      probability: 'Win Probability(%)',
      
      // Results
      resultWinners: 'Winners',
      noWinners: '😅 No Winners',
      winnerCount: '🎉 {count} Winners',
      noWinnersMessage: 'No winners this time',
      
      // Copy
      copyNames: '📋 Copy Names',
      copyCSV: '📊 Copy CSV',
      copyNamesShort: 'Copy Names',
      copyCSVShort: 'Copy CSV',
      namesCopied: '✅ Names copied',
      csvCopied: '✅ CSV copied',
      copyFailed: 'Copy failed',
      
      // Format Tool
      formatToolTitle: '🧹 List Formatter',
      formatDescription: 'Extract only lines starting with "@" from mixed text.',
      pasteHere: 'Paste here',
      removeDuplicates: 'Remove duplicates',
      extractAtLines: 'Extract @ lines only',
      clearInput: 'Clear Input',
      extractResult: 'Extract Result',
      result: 'Result',
      copyResult: 'Copy Result',
      formatResultCopied: '✅ Format result copied',
      atLinesExtracted: '{count} @ lines extracted',
      noChanges: 'No changes made',
      formatConfirm: 'Format {label}?\n{before} lines → {after} @ lines (duplicates removed)',
      formatted: '🧹 Formatted: {count} lines',
      
      // Messages
      noTargets: 'No lottery targets available',
      dataSaved: '💾 Data saved',
      saveFailed: '❌ Save failed',
      resetConfirm: 'Reset all data to initial state?',
      resetComplete: '🔄 Reset complete',
      dataLoaded: '📂 Saved data loaded',
      
      // Help
      helpTitle: '📖 User Guide',
      helpStep1: '1. List Input: Enter participant names in List A (one per line). Add same names to List B/C to increase win probability. Exclude settings available. Open B/C and exclude with "＋ Show Additional Lists/Exclude".',
      helpStep2: '2. Product Settings: Set product names and winner counts. Use "+ Add Product" for multiple products.',
      helpStep3: '3. Draw Lottery: Click "Draw Lottery" to start. Copy "Names/CSV" from buttons next to result modal.',
      helpPoints: 'Point Settings: Enter points for each list to adjust win likelihood.',
      helpProbability: 'Probability Check: Use "Calculate Probability" to view candidates and win rates.',
      helpSaveReset: 'Save/Reset/Theme: Access from top-right. Saved content loads next time.',
      
      // Auto-naming
      autoPlace: '{index} Place',
      autoPlaceMultiple: '{index} Place ({count} winners)'
    }
  },
  
  // 現在のブラウザ言語を検出
  detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    // 日本語の場合は ja、それ以外は en
    return browserLang.startsWith('ja') ? 'ja' : 'en';
  },
  
  // 言語を設定
  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('lottery_language', lang);
    this.updateUI();
  },
  
  // 翻訳関数
  t(key, params = {}) {
    const translation = this.dict[this.currentLang]?.[key] || this.dict.ja[key] || key;
    
    // パラメータの置換
    return translation.replace(/{(\w+)}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  },
  
  // UI要素を更新
  updateUI() {
    // data-i18n属性を持つ要素を更新
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const params = el.getAttribute('data-i18n-params');
      const parsedParams = params ? JSON.parse(params) : {};
      
      if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
        el.value = this.t(key, parsedParams);
      } else if (el.hasAttribute('placeholder')) {
        el.placeholder = this.t(key, parsedParams);
      } else if (el.hasAttribute('title')) {
        el.title = this.t(key, parsedParams);
      } else {
        el.textContent = this.t(key, parsedParams);
      }
    });
    
    // テーマボタンの更新
    this.updateThemeButton();
  },
  
  // テーマボタンのテキストを更新
  updateThemeButton() {
    const btnTheme = document.getElementById('btnTheme');
    const menuTheme = document.getElementById('menuTheme');
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    
    if (btnTheme) {
      btnTheme.textContent = theme === 'light' ? this.t('darkTheme') : this.t('lightTheme');
    }
    if (menuTheme) {
      menuTheme.textContent = theme === 'light' ? this.t('darkTheme') : this.t('lightTheme');
    }
  },
  
  // 初期化
  init() {
    // 保存された言語設定を読み込み、なければ自動検出
    const savedLang = localStorage.getItem('lottery_language');
    this.currentLang = savedLang || this.detectLanguage();
    
    // 言語切り替えボタンを追加する場合
    this.addLanguageToggle();
    
    // UI を更新
    setTimeout(() => this.updateUI(), 0);
  },
  
  // 言語切り替えボタンを追加
  addLanguageToggle() {
    const toolbar = document.querySelector('.toolbar');
    if (toolbar && !document.getElementById('btnLang')) {
      const langBtn = document.createElement('button');
      langBtn.id = 'btnLang';
      langBtn.className = 'btn ghost';
      langBtn.textContent = this.currentLang === 'ja' ? '🌐 EN' : '🌐 JP';
      langBtn.title = this.currentLang === 'ja' ? 'Switch to English' : '日本語に切り替え';
      langBtn.addEventListener('click', () => {
        const newLang = this.currentLang === 'ja' ? 'en' : 'ja';
        this.setLanguage(newLang);
        langBtn.textContent = newLang === 'ja' ? '🌐 EN' : '🌐 JP';
        langBtn.title = newLang === 'ja' ? 'Switch to English' : '日本語に切り替え';
      });
      toolbar.appendChild(langBtn);
    }
    
    // モバイルメニューにも追加
    const menuDropdown = document.getElementById('menuDropdown');
    if (menuDropdown && !document.querySelector('[data-action="language"]')) {
      const langMenuItem = document.createElement('button');
      langMenuItem.className = 'menu-item';
      langMenuItem.setAttribute('data-action', 'language');
      langMenuItem.textContent = this.currentLang === 'ja' ? '🌐 English' : '🌐 Japanese';
      menuDropdown.appendChild(langMenuItem);
    }
  }
};

// グローバルに公開
window.i18n = i18n;