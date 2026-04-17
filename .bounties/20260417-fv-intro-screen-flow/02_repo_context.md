# Repo Context Report

## Repo & package targets

- Repo(s): `GoodDAPP` (https://github.com/GoodDollar/GoodDAPP)
- Package(s)/workspaces: root workspace (single package)
- Primary paths: `src/components/faceVerification/screens/IntroScreen.jsx`, `src/components/faceVerification/standalone/`
- Build/test/lint commands found: `yarn test`, `yarn lint`, `yarn build`

## Closest existing patterns (paths)

- `src/components/faceVerification/standalone/screens/FVFlowSuccess.jsx` — example of a standalone-only screen living in `standalone/screens/`; new intro screen should follow this file's pattern (own styles, no `isFVFlow` gate)
- `src/components/faceVerification/standalone/screens/FVFlowError.jsx` — same pattern; both exported from `standalone/index.js`
- `src/components/faceVerification/standalone/context/FVFlowContext.jsx` — provides `firstName`, `isFVFlow`, `isDelta`, `externalAccount`; already consumed by all standalone screens
- `src/components/faceVerification/screens/IntroScreen.jsx:208` — `IntroFVFlowOverview` (source to migrate)
- `src/components/faceVerification/screens/IntroScreen.jsx:313` — `IntroFVFlowAction` (source to migrate + modify)
- `src/components/faceVerification/screens/IntroScreen.jsx:412` — `IntroFVFlow` routing wrapper (source to migrate + simplify)

## Likely change points (ranked)

### Core logic / services

- None — no service-layer changes required.

### UI / components

- **NEW** `src/components/faceVerification/standalone/screens/IntroScreen.jsx` — new file; contains migrated `IntroFVFlowOverview`, modified `IntroFVFlowAction` (adds reverify wallet block + over-18 checkbox), and simplified `IntroFVFlow` routing wrapper (no `isFVFlow` check). Owns its own `getStylesFromProps` function with only standalone-relevant styles.
- `src/components/faceVerification/standalone/AppRouter.jsx:5` — replace `FaceVerificationIntro` import from `'..'` to the new standalone screen (e.g., `'./screens/IntroScreen'` or via updated `standalone/index.js`).
- `src/components/faceVerification/standalone/index.js` — add export for the new standalone intro screen.
- `src/components/faceVerification/screens/IntroScreen.jsx` — **delete**: migrate standalone components, delete `Intro` + `IntroReVerification` (confirmed deprecated), delete the now-empty file.
- `src/components/faceVerification/index.js` — **remove** `FaceVerificationIntro` export (no longer backed by a file).

### Hooks / state

- `useIdentityExpiryDate` (consumed at `IntroScreen.jsx:446`) — the new standalone screen needs `expiryDate.lastAuthenticated` (BigNumber); pass via prop or re-hook inside the new file; follow the same `moment.unix(n.toNumber()).format('l')` pattern used for `connectedUntil`.
- `useFVLoginInfoCheck`, `useDisposingState` — currently in the monolithic `IntroScreen`; need to remain accessible for both flows. Confirm whether these are standalone-specific (they import from `standalone/hooks/`) or shared.

### SDK / API wrappers

- None required.

### Contracts / onchain

- None required.

### Config / env

- None required.

## Dependencies & integration notes

- **`moment`** — already imported in `IntroScreen.jsx`; import in new file too.
- **`@gooddollar/web3sdk-v2` `useIdentityExpiryDate`** — `lastAuthenticated` is BigNumber; guard against zero.
- **`shortenWalletAddress`** helper (line 205) — small pure function; copy or extract to a shared utils file.
- **`WarningBlock`** component (line 182) — used by both `IntroFVFlowOverview` and `IntroFVFlowAction`; extract to `standalone/components/` or inline in the new file.
- **`withStyles`** — current file uses the app-wide `lib/styles` version. The standalone directory has its own `standalone/theme/withStyles.js`; consider using that for the new file if it already wraps the correct theme provider.
- **`FVFlowContext`** — already used by existing standalone screens; the new intro screen should consume it for `firstName`, `externalAccount`, `isDelta`, etc., rather than relying on the monolithic `IntroScreen`'s prop chain.
- **`GDLogoSVG`, `BillyVerifies`, `BillySecurity`** — assets already used by the inline components; import them directly in the new file.

## Testing & verification plan

- **Unit/integration**: `src/components/faceVerification/__tests__/IntroScreen.jsx` — existing single snapshot test; update to point at the old `IntroScreen` (legacy path) or add a new test file for the standalone intro at `standalone/screens/__tests__/IntroScreen.jsx`.
- **New test cases needed**:
  - `isReverify === false` path: Overview renders, Action renders after "Get Started".
  - `isReverify === true` path: Overview is NOT rendered; Action renders immediately with Wallet Linked box, "Last verified" label, and over-18 checkbox.
- **Snapshot**: Regenerate with `yarn test -u`.
- **Manual QA**:
  1. New user standalone flow: Overview screen → action screen → FV starts.
  2. Reverify standalone flow: directly on action screen → Wallet Linked box with "Last verified" → both checkboxes required → FV starts immediately.
  3. Legacy native flow (if still active): unchanged.

## Risks & edge cases

- **High**: `AppRouter.jsx` import change — if the old `FaceVerificationIntro` from `..` is removed and other parts of the app still import from that path, a runtime error will occur. Confirm only `AppRouter.jsx` consumes `FaceVerificationIntro` for the standalone path.
- **Medium**: `useFVLoginInfoCheck` and `useDisposingState` are called in the monolithic `IntroScreen` — ensure the new standalone screen also calls them (or that they're not relevant to the standalone context).
- **Medium**: Standalone-prefixed styles in `IntroScreen.jsx` (`standaloneTitle`, `standaloneBlocks`, `walletBlock`, `standaloneConsentWrapper`, etc.) — must be moved wholesale to the new file; removing them from the original breaks the legacy components if any share them (audit before deleting).
- **Low**: `lastAuthenticated.toNumber()` — safe for realistic unix timestamps; add `isZero()` fallback.
- **Low**: `shortenWalletAddress` is defined as a module-level function in `IntroScreen.jsx`; if kept private it needs to be re-declared or moved to a shared util.

## Open questions (blocking only)

_None — legacy component deletion confirmed in scope. `Intro`, `IntroReVerification`, `screens/IntroScreen.jsx`, and the `FaceVerificationIntro` barrel export are all deleted as part of this PR._

## Handoff summary

Create `src/components/faceVerification/standalone/screens/IntroScreen.jsx` by migrating `IntroFVFlowOverview`, `IntroFVFlowAction`, `IntroFVFlow`, `WarningBlock`, `WalletDeletedPopupText`, `shortenWalletAddress`, and all gate hooks / camera permission logic out of the monolithic `screens/IntroScreen.jsx`. Add the UX changes (reverify routing, wallet block, "Last verified", over-18 checkbox for reverify). Wire `standalone/AppRouter.jsx` to import directly from the new file. Delete `Intro`, `IntroReVerification`, and the now-empty `screens/IntroScreen.jsx`; remove `FaceVerificationIntro` from `faceVerification/index.js`. The result is a self-contained standalone intro with zero dependency on deprecated native-flow code.
