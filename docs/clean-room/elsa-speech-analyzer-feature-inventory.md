# Feature inventory: speechanalyzer.elsaspeak.com (clean-room input)

Purpose: behavioural/feature requirements only. No code, assets, models or
private APIs from the source site are to be copied. Implementation is designed
independently.

## Method and limits
- REA `capture_browser_scenario` failed twice (Chrome, Edge; `cleanup_incomplete`),
  so no DOM, screenshot or network capture exists.
- Evidence = the public landing HTML (HTTP 200, 12.7 KB), read statically.
  The JS bundles were NOT analysed.
- Everything below is **inferred from route-chunk names** in `<link rel=prefetch>`
  tags. Screens, flows, scoring logic and data shapes are **unknown**.

## Observed (from the HTML)
- Single-page app (Vue-style chunking, `<div id="app">`), title "Speech Analyzer".
- Client-side audio recording (`recorder.min.js`), onboarding tour library (`driver.min.js`).
- Stripe for payments; Apple sign-in script; Google Tag Manager.

## Inferred feature areas (by route name)
| Area | Route chunks | Candidate module |
|---|---|---|
| Auth | sign-in, sign-up, guest-onboarding, voice-registration | `identity` |
| Free practice | self-practice, recording, recordings, speech, no-result | `practice` / `recording` |
| Skill analysis | pronunciation(-home), fluency(-pace/-pausing/-hesitation), intonation-home, grammar-home, vocabulary-home | `assessment` |
| Guided practice | guided-practice(-home/-interview/-sound-natural(-topic)) | `lesson` |
| Exam prep | english-test: IELTS (parts), GEPT, Eiken | `lesson` (exam tracks) |
| Work English / org | english-for-works(-lesson/-exercise), org/course/module | `course` |
| Billing | pricing, payment, payment-detail, WelcomeMinutesFree | `billing` |
| Misc | settings, faq, contact-us | `settings` |

## Next steps (need user decisions)
1. Backend ports to design: `SpeechAssessmentPort` (adapter: Azure Pronunciation
   Assessment or open-source model), `RecordingStoragePort`, `LessonRepositoryPort`.
2. To learn real screens/flows, capture them with a working browser (retry REA, or a
   manual HAR) rather than guessing.
