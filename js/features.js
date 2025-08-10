// 追加機能（モバイルメニュー、整形ツール、ヘルプシステム）

// アドバンス機能の拡張
Object.assign(LotteryApp.prototype, {
  // アドバンス機能の初期化
  initAdvancedSection() {
    const advancedSection = this.$('advancedSection');
    const toggleAdvancedBtn = this.$('toggleAdvanced');
    
    if (toggleAdvancedBtn) {
      toggleAdvancedBtn.addEventListener('click', () => {
        this.setAdvancedOpen(advancedSection.hidden);
      });
    }
  },
  
  // モバイルメニューの初期化
  initMobileMenu() {
    const btnMenu = this.$('btnMenu');
    const menuDropdown = this.$('menuDropdown');
    const menuTheme = this.$('menuTheme');
    
    const updateMenuThemeText = () => {
      if (!menuTheme) return;
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      menuTheme.textContent = theme === 'light' ? i18n.t('darkTheme') : i18n.t('lightTheme');
    };
    
    const openMenu = () => {
      if (!menuDropdown) return;
      menuDropdown.hidden = false;
      btnMenu.setAttribute('aria-expanded', 'true');
      updateMenuThemeText();
      setTimeout(() => {
        document.addEventListener('click', onDocClick);
      }, 0);
    };
    
    const closeMenu = () => {
      if (!menuDropdown) return;
      menuDropdown.hidden = true;
      btnMenu.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
    };
    
    const toggleMenu = () => {
      if (menuDropdown.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    };
    
    const onDocClick = (e) => {
      if (!menuDropdown.contains(e.target) && e.target !== btnMenu) {
        closeMenu();
      }
    };
    
    if (btnMenu) {
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    }
    
    if (menuDropdown) {
      menuDropdown.addEventListener('click', (e) => {
        const t = e.target.closest('.menu-item');
        if (!t) return;
        const action = t.getAttribute('data-action');
        
        if (action === 'save') this.saveData();
        if (action === 'reset') this.resetData();
        if (action === 'format') this.openFormatter();
        if (action === 'language') {
          const newLang = i18n.currentLang === 'ja' ? 'en' : 'ja';
          i18n.setLanguage(newLang);
          t.textContent = newLang === 'ja' ? '🌐 English' : '🌐 Japanese';
        }
        if (action === 'theme') {
          const cur = document.documentElement.getAttribute('data-theme') || 'dark';
          this.applyTheme(cur === 'dark' ? 'light' : 'dark');
        }
        
        closeMenu();
      });
    }
  },
  
  // 整形ツールの初期化
  initFormatterTool() {
    const btnFormat = this.$('btnFormat');
    const btnFormatInline = this.$('btnFormatInline');
    const btnFormatInlineB = this.$('btnFormatInlineB');
    const btnFormatInlineC = this.$('btnFormatInlineC');
    
    if (btnFormat) {
      btnFormat.addEventListener('click', () => this.openFormatter());
    }
    
    if (btnFormatInline) {
      btnFormatInline.addEventListener('click', () => this.formatListInline('listA', i18n.t('listA')));
    }
    if (btnFormatInlineB) {
      btnFormatInlineB.addEventListener('click', () => this.formatListInline('listB', i18n.t('listB')));
    }
    if (btnFormatInlineC) {
      btnFormatInlineC.addEventListener('click', () => this.formatListInline('listC', i18n.t('listC')));
    }
    
    // フォーマッターのグローバル関数
    window.extractAtLines = () => this.extractAtLines();
    window.copyFormatted = () => this.copyFormatted();
    
    // ESCキー対応
    const formatOverlay = this.$('formatOverlay');
    if (formatOverlay) {
      formatOverlay.addEventListener('click', (e) => {
        if (e.target === formatOverlay) this.closeFormatter();
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && formatOverlay.classList.contains('show')) {
          this.closeFormatter();
        }
      });
    }
  },
  
  // 整形ツールを開く
  openFormatter() {
    const ov = this.$('formatOverlay');
    if (!ov) return;
    ov.classList.add('show');
    this.updateFormatCount();
    
    if (!ov.dataset.bound) {
      ov.addEventListener('click', (e) => {
        if (e.target === ov) this.closeFormatter();
      });
      ov.dataset.bound = '1';
    }
    
    const onKey = (e) => {
      if (e.key === 'Escape') {
        this.closeFormatter();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);
  },
  
  // 整形ツールを閉じる
  closeFormatter() {
    const ov = this.$('formatOverlay');
    if (!ov) return;
    ov.classList.remove('show');
  },
  
  // @始まりの行を抽出
  extractAtLines() {
    const input = this.$('formatInput');
    const output = this.$('formatOutput');
    const dedupe = this.$('formatDedupe');
    
    if (!input || !output) return;
    
    const lines = String(input.value || '').split(/\r?\n|\r/);
    const kept = [];
    const seen = new Set();
    
    for (const raw of lines) {
      const s = raw.trim();
      if (!s) continue;
      if (s.startsWith('@')) {
        if (dedupe && dedupe.checked) {
          if (seen.has(s)) continue;
          seen.add(s);
        }
        kept.push(s);
      }
    }
    
    output.value = kept.join('\n');
    this.updateFormatCount();
    this.toast(i18n.t('atLinesExtracted', { count: kept.length }));
  },
  
  // 整形結果をコピー
  copyFormatted() {
    const output = this.$('formatOutput');
    if (!output) return;
    this.doCopy(output.value || '', i18n.t('formatResultCopied'));
  },
  
  // 整形結果の行数更新
  updateFormatCount() {
    const output = this.$('formatOutput');
    const counter = this.$('formatCount');
    if (!output || !counter) return;
    
    const n = String(output.value || '').split(/\r?\n|\r/).filter(Boolean).length;
    counter.textContent = i18n.t('result') + ': ' + n + ' ' + i18n.t('lines');
  },
  
  // インライン整形（指定リストを@始まりの行だけに整形）
  formatListInline(textareaId, label) {
    const ta = this.$(textareaId);
    if (!ta) return;
    
    const original = String(ta.value || '');
    const lines = original.split(/\r?\n|\r/);
    const kept = [];
    const seen = new Set();
    
    for (const raw of lines) {
      const s = raw.trim();
      if (!s) continue;
      if (s.startsWith('@')) {
        if (seen.has(s)) continue;
        seen.add(s);
        kept.push(s);
      }
    }
    
    const beforeCount = lines.filter(l => l.trim()).length;
    const afterCount = kept.length;
    const newText = kept.join('\n');
    const currentNormalized = lines.filter(l => l.trim()).join('\n');
    
    if (newText === currentNormalized) {
      this.toast(i18n.t('noChanges'));
      return;
    }
    
    const ok = confirm(i18n.t('formatConfirm', {
      label,
      before: beforeCount,
      after: afterCount
    }));
    
    if (!ok) return;
    
    ta.value = newText;
    this.toast(i18n.t('formatted', { count: afterCount }));
    this.updateListCounts();
  },
  
  // ヘルプシステムの初期化
  initHelp() {
    setTimeout(() => {
      const helpToggle = document.querySelector('.help-toggle');
      const helpOverlay = this.$('helpOverlay');
      
      window.toggleHelp = () => {
        if (helpOverlay) {
          helpOverlay.classList.toggle('show');
        }
      };
      
      if (helpToggle) {
        helpToggle.onclick = window.toggleHelp;
      }
      
      if (helpOverlay) {
        helpOverlay.onclick = (e) => {
          if (e.target === helpOverlay) window.toggleHelp();
        };
      }
      
      // ESCキーでヘルプを閉じる
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (helpOverlay && helpOverlay.classList.contains('show')) {
            window.toggleHelp();
          } else {
            this.hideResultsModal();
          }
        }
      });
    }, 100);
  }
});

// 既存の関数をグローバルに公開（後方互換性のため）
window.removeProduct = (index) => {
  if (window.lottery) {
    window.lottery.removeProduct(index);
  }
};