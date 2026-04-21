# Clarified Intent

## Interpreted intent

The standalone face-verification (FV) intro flow currently lives inside a monolithic `IntroScreen.jsx` that also houses deprecated local-native flow components (`Intro`, `IntroReVerification`). The `standalone/AppRouter` reaches back into the main `faceVerification` package index to import `FaceVerificationIntro`, pulling in all that dead code. This bounty does two things together: (1) **extract** the standalone intro components into `standalone/screens/IntroScreen.jsx` and **delete** the deprecated native-flow code (confirmed deleted), leaving `screens/IntroScreen.jsx` empty and removable; and (2) **improve** the UX within the new file by routing first-time users and reverifying users to distinct screens — reverify users skip the overview, see a wallet block with "Last verified" instead of "Valid until", get the over-18 checkbox added, and go straight to FV on confirm.

## Assumptions

- "Standalone flow" = the app running via `standalone/AppRouter.jsx` with `FVFlowProvider` context — `isFVFlow === true` everywhere inside it.
- "First-time user" = `isReverify === false` (derived at line 447: `expiryDate?.lastAuthenticated?.isZero() === false`).
- "Last verified" date = formatted from `expiryDate.lastAuthenticated` (BigNumber unix timestamp from `useIdentityExpiryDate`).
- `Intro` and `IntroReVerification` (local native flow) are **confirmed deleted** in this PR.
- With those deleted, `screens/IntroScreen.jsx` becomes empty and should be deleted; `faceVerification/index.js` should have `FaceVerificationIntro` removed.
- `WalletDeletedPopupText` (used by `useDisposingState` in `IntroScreen`) must travel with the standalone screen, not be dropped.
- The new standalone screen handles `isReverify` routing directly — no `isFVFlow` flag needed anywhere.
- Standalone-only styles (`standalone*`-prefixed keys in `getStylesFromProps`, plus `walletBlock`, `blockHeader`, `warningBlock`, etc.) move into the new file.

## Clarifying questions

### Must-answer (blocking)

_None — the codebase provides enough context and the request is sufficiently specific._

### Should-answer

- **Last verified format** — `moment().format('l')` (locale short) or something like `MMM D, YYYY`?
- **Wallet Linked box on reverify** — show wallet address (shortened) alongside the date, or date only?
- **Button label on reverify** — keep "Verify Me" or change (e.g. "Re-verify")?
- **"How verification works" link** — keep or remove on the reverify action screen?
- **`withStyles` to use** — `standalone/theme/withStyles.js` or the app-wide `lib/styles` version? (Follow whatever `FVFlowSuccess.jsx` uses.)

### Nice-to-have

- Should the "How verification works" link remain on the reverify action screen?
- Any design mock-up or Figma reference for the reverify screen layout?

## Required context & documents

- [x] `src/components/faceVerification/screens/IntroScreen.jsx` — all components to migrate/delete live here
- [x] `src/components/faceVerification/standalone/AppRouter.jsx` — import to rewire
- [x] `src/components/faceVerification/standalone/index.js` — barrel to update
- [x] `src/components/faceVerification/index.js` — `FaceVerificationIntro` export to remove
- [x] `src/components/faceVerification/standalone/context/FVFlowContext.jsx` — context the new screen should consume
- [x] `src/components/faceVerification/standalone/screens/FVFlowSuccess.jsx` — reference pattern for standalone screen structure
- [x] `useIdentityExpiryDate` from `@gooddollar/web3sdk-v2` — provides `lastAuthenticated` BigNumber
- [ ] Design mock-up for the updated reverify screen layout (optional)

## Provisional acceptance criteria (draft)

- [ ] `standalone/screens/IntroScreen.jsx` exists; contains only standalone-relevant components with no `isFVFlow` references.
- [ ] `standalone/AppRouter.jsx` imports from `standalone/screens/` — not from `faceVerification/index.js`.
- [ ] `Intro`, `IntroReVerification` deleted from `screens/IntroScreen.jsx`; file deleted; `FaceVerificationIntro` removed from `faceVerification/index.js`.
- [ ] First-time users see the existing two-screen sequence (Overview → Action) unchanged.
- [ ] Reverifying users skip Overview and land directly on the action screen.
- [ ] The reverify action screen includes the Wallet Linked box with "Last verified: {date}".
- [ ] The reverify action screen shows both checkboxes ("I'm over 18" + GoodDollar-only consent), both required.
- [ ] Confirming on the reverify screen starts FaceVerification immediately.
- [ ] All `standalone*`-prefixed styles removed from the original file and live in the new one.
- [ ] Tests passing; snapshot updated; at least one test case covers `isReverify === true`.

## Next step

Scan the repo for all touch points across `IntroScreen.jsx`, the standalone directory, and both barrel files to produce a full context report.
