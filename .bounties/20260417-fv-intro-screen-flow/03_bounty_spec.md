## 1) Summary

The standalone face-verification intro flow currently lives inside a monolithic `screens/IntroScreen.jsx` that also houses deprecated local-native flow components (`Intro`, `IntroReVerification`). The standalone `AppRouter` reaches back into the main package index to import `FaceVerificationIntro`, dragging in all that dead code. This bounty extracts the standalone intro into its own file at `standalone/screens/IntroScreen.jsx`, deletes the deprecated native components, and improves the UX so that first-time users and reverifying users see distinct, purpose-built screens rather than the same generic two-screen sequence.

## 2) Desired behavior (acceptance criteria)

- `standalone/AppRouter.jsx` imports the intro screen from `standalone/screens/` — not from `faceVerification/index.js`.
- The new standalone intro file has no `isFVFlow` check anywhere — it is always the FV-flow context.
- First-time users (`isReverify === false`) see the existing two-screen sequence (Overview → Action) with behaviour unchanged.
- Reverifying users (`isReverify === true`) skip the Overview screen and land directly on the action screen.
- The reverify action screen includes the **Wallet Linked** box showing the wallet address and "Last verified: {date}" (not "Valid until").
- The reverify action screen shows **both** consent checkboxes — "I'm over 18" **and** the GoodDollar-only consent — and both are required before "Verify Me" is enabled.
- Confirming on the reverify screen triggers FaceVerification immediately (no additional intermediate screen).
- `Intro`, `IntroReVerification`, and `WalletDeletedPopupText` are removed from `screens/IntroScreen.jsx`; `WalletDeletedPopupText` moves with the standalone components that use it.
- `screens/IntroScreen.jsx` is deleted and `FaceVerificationIntro` is removed from `faceVerification/index.js`.
- Styles used only by standalone components are defined in the new file; none remain in the deleted original.

## 3) Scope (in / out)

**In scope**

- **New file** `src/components/faceVerification/standalone/screens/IntroScreen.jsx` — migrated and improved standalone intro (contains `IntroFVFlowOverview`, `IntroFVFlowAction`, routing wrapper, `WarningBlock`, `WalletDeletedPopupText`, `shortenWalletAddress`, own `getStylesFromProps`).
- `standalone/AppRouter.jsx` — rewire intro import.
- `standalone/index.js` — add export for new intro screen.
- `src/components/faceVerification/screens/IntroScreen.jsx` — **delete** `Intro`, `IntroReVerification`, migrated standalone components, and the `IntroScreen` wrapper; delete file when empty.
- `src/components/faceVerification/index.js` — remove `FaceVerificationIntro` export.
- `IntroFVFlowAction` reverify branch — add Wallet Linked box with "Last verified" date; remove `!isReverify` guard on over-18 checkbox; update button `disabled` condition.
- Thread `lastAuthenticated` (formatted) and `walletAddress` into the action screen.
- Add/update tests for the new standalone intro.

**Out of scope**

- Any changes to `FaceVerification` (the camera/scan screen), `FaceVerificationError`, or other standalone screens.
- Analytics event taxonomy.
- Backend, contracts, or SDK changes.
- Any redesign of `IntroFVFlowOverview` beyond what is needed for the migration.

## 4) Starting points (top paths + notes)

- `src/components/faceVerification/screens/IntroScreen.jsx:208` — `IntroFVFlowOverview`: migrate verbatim; no logic changes for new-user path.
- `src/components/faceVerification/screens/IntroScreen.jsx:313` — `IntroFVFlowAction`: migrate + add reverify wallet block (lines 234–259 of Overview are the source), remove `!isReverify` guard (line 368), update `disabled` (line 389).
- `src/components/faceVerification/screens/IntroScreen.jsx:412` — `IntroFVFlow`: migrate + add `isReverify` routing guard to skip Overview; drop `isFVFlow` check entirely.
- `src/components/faceVerification/screens/IntroScreen.jsx:439` — `IntroScreen` wrapper: contains gate hooks (`useDisposingState`, `useFVLoginInfoCheck`, camera permission logic) and `lastAuthenticated` / `walletAddress` — these must be preserved in the new standalone screen, not silently dropped.
- `src/components/faceVerification/standalone/screens/FVFlowSuccess.jsx` — reference pattern: own `withStyles`, consumes `FVFlowContext`, no `isFVFlow` checks.
- `src/components/faceVerification/standalone/AppRouter.jsx:5` — single-line import change.
- `src/components/faceVerification/__tests__/IntroScreen.jsx` — existing snapshot test to update or replace with a new test file in `standalone/screens/__tests__/`.

## 5) Definition of Done (DoD) + How to test

**DoD**

- [ ] `standalone/screens/IntroScreen.jsx` created; no `isFVFlow` references; contains all migrated + improved standalone intro logic.
- [ ] `standalone/AppRouter.jsx` imports intro from `standalone/screens/` (not from of `faceVerification/index.js`).
- [ ] `IntroFVFlow` skips `IntroFVFlowOverview` when `isReverify === true`.
- [ ] Reverify action screen renders Wallet Linked box with `"Last verified: {date}"` (`moment.unix(lastAuthenticated.toNumber()).format('l')`; zero-value fallback present).
- [ ] Over-18 checkbox visible and required for reverify users; button `disabled` until both checkboxes ticked.
- [ ] Gate hooks (`useDisposingState`, `useFVLoginInfoCheck`) and camera permission logic present in the new standalone screen.
- [ ] `screens/IntroScreen.jsx` deleted; `FaceVerificationIntro` removed from `faceVerification/index.js`.
- [ ] `yarn lint` and `yarn test` pass; snapshot regenerated; at least one test covers `isReverify === true` path.
- [ ] PR includes screenshots for both user paths (mobile + desktop).

**How to test**

```bash
# Install
yarn install

# Lint
yarn lint src/components/faceVerification/

# Test (update snapshots on first run)
yarn test --testPathPattern=IntroScreen -u

# Manual QA — start dev server
yarn start

# Path A (new user):  wallet with lastAuthenticated == 0
#   → Overview screen visible → "Get Started" → Action screen → both checkboxes → FV starts
# Path B (reverify):  wallet with lastAuthenticated != 0
#   → Overview NOT shown → Action with Wallet Linked box ("Last verified: {date}")
#   → over-18 + GD consent both required → "Verify Me" → FV starts immediately
```

---

> **Contribution guidelines:** https://github.com/GoodDollar/GoodDAPP/blob/master/CONTRIBUTING.md
> For questions, use the Builders Telegram channel or comment on the GitHub issue.
