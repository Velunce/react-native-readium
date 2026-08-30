import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.join(__dirname, '../../ios/Reader/EPUB/EPUBViewController.swift'),
  'utf8'
);

const commonReaderSource = fs.readFileSync(
  path.join(__dirname, '../../ios/Reader/Common/ReaderViewController.swift'),
  'utf8'
);

describe('ShuYi inline translation integration', () => {
  it('uses a cancellable 500ms long press without creating a WebKit selection', () => {
    expect(source).toContain('const HOLD_MS = 500');
    expect(source).toContain('const MAX_MOVE = 10');
    expect(source).toContain('caretRangeFromPoint');
    expect(source).toContain('Intl.Segmenter');
    expect(source).toContain('navigator.clearSelection()');
    expect(source).not.toContain('getSelection().addRange');
  });

  it('recognizes hyphenated compounds and blocks links and controls', () => {
    expect(source).toContain('const compoundPattern');
    expect(source).toContain('\\\\u2010\\\\u2011');
    expect(source).toContain(
      'span.shuyi-ruby, ruby, rt, a, button, input, textarea, select'
    );
  });

  it('renders a centered translation overlay without changing text layout', () => {
    expect(source).toContain('display: inline !important');
    expect(source).toContain('position: relative');
    expect(source).toContain('position: absolute');
    expect(source).toContain('top: calc(100% + 0.04rem)');
    expect(source).toContain('left: 50%');
    expect(source).toContain('transform: translateX(-50%)');
    expect(source).toContain(
      'font-size: calc(1rem * var(--shuyi-translation-scale)) !important'
    );
  });

  it('uses the ShuYi native translation and presentation channels', () => {
    expect(source).toContain('ShuYiTranslationRequest');
    expect(source).toContain('ShuYiTranslationResult');
    expect(source).toContain('ShuYiTranslationPresentationRequest');
    expect(source).toContain('ShuYiTranslationAppearanceChanged');
    expect(source).not.toMatch(/Wordin|wordin/);
  });

  it('consumes translated-word taps before page navigation', () => {
    expect(source).toContain("action: 'consumeTap'");
    expect(source).toContain('suppressNextNavigatorTap()');
    expect(commonReaderSource).toContain('suppressNavigatorTapUntil');
    expect(commonReaderSource).toContain(
      'Date() < self.suppressNavigatorTapUntil'
    );
  });
});
