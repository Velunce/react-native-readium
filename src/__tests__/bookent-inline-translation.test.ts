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

describe('Bookent inline translation integration', () => {
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
      '#bookent-translation-layer, ruby, rt, a, button, input, textarea, select'
    );
  });

  it('renders overlays without modifying the publication text DOM', () => {
    expect(source).toContain("const LAYER_ID = 'bookent-translation-layer'");
    expect(source).toContain('range: range.cloneRange()');
    expect(source).toContain('annotation.range.getClientRects()');
    expect(source).toContain('rect.left + rect.width / 2');
    expect(source).toContain('position: fixed !important');
    expect(source).toContain('transform: translateX(-50%) !important');
    expect(source).toContain(
      'font-size: calc(1rem * var(--bookent-translation-scale)) !important'
    );
    expect(source).not.toContain('range.deleteContents()');
    expect(source).not.toContain('range.insertNode(');
    expect(source).not.toContain('span.bookent-ruby');
  });

  it('uses the Bookent native translation and presentation channels', () => {
    expect(source).toContain('BookentTranslationRequest');
    expect(source).toContain('BookentTranslationResult');
    expect(source).toContain('BookentTranslationPresentationRequest');
    expect(source).toContain('BookentTranslationAppearanceChanged');
    expect(source).not.toMatch(/Wordin|wordin/);
  });

  it('reflows every existing translation after typography changes settle', () => {
    expect(source).toContain(
      'window.__bookentRelayoutTranslations = relayoutAllAnnotations'
    );
    expect(source).toContain('new ResizeObserver(relayoutAllAnnotations)');
    expect(source).toContain('new MutationObserver(relayoutAllAnnotations)');
    expect(source).toContain('for (const delay of [50, 150, 300, 600])');
    expect(source).toContain('annotations.forEach(updateAnnotationPosition)');
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
