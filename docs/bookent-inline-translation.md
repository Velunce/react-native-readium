# Bookent inline translation extension

This fork adds an opt-in iOS integration used by the Bookent reader application.
The upstream reader behavior is unchanged unless the application registers a
selection action with the ID `get-word`.

## Interaction flow

1. A stationary 500 ms press resolves the word at the touch coordinates without
   creating a WebKit selection.
2. The extension wraps the word in an inline container and renders the translated
   text as an absolutely positioned overlay.
3. The EPUB web view posts a `BookentTranslationRequest` notification to the host
   application.
4. The host application posts `BookentTranslationResult` with the same request ID.
5. Tapping the translated word posts `BookentTranslationPresentationRequest` so the
   host application can present its detailed translation UI.

The overlay does not participate in text layout, so it does not change EPUB line
breaking or pagination.

## Host application contract

The host is responsible for translating the request and posting the result. The
notification payloads use these keys:

- Request: `id`, `word`, `sentence`, `wordStart`, `wordLength`,
  `sourceLanguage`, `targetLanguage`.
- Result: `id`, `translation`, `sentenceTranslation`, and optional `error`.
- Presentation: `text`, `translation`, `sentence`, `sentenceTranslation`,
  `sourceLanguage`, `targetLanguage`.

The host can update the translation font scale by storing
`BookentInlineTranslationFontScale` in `UserDefaults` and posting
`BookentTranslationAppearanceChanged` with a `fontScale` value. The extension
clamps the scale to `0.4...0.92`; the default is `0.85` of the EPUB root font
size.

## Maintenance boundaries

- Keep translation and presentation business logic in the host application.
- Keep this fork limited to EPUB interaction, positioning, and the WebKit bridge.
- Rebase upstream releases in a dedicated branch and run the inline translation
  tests before updating the application dependency.
- Do not add `patch-package` on top of this fork.
