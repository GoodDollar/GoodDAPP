# Review DoD — 20260417-fv-intro-screen-flow

## 1) Review Context

- Bounty: Extract standalone FV intro screen and clean up deprecated native flow
- Reviewer: TBD (pipeline pre-review)
- Date: 2026-04-17
- PR / Branch: TBD
- Related Issue(s): TBD
- Scope Reviewed: `03_bounty_spec.md` DoD against `01_clarified_intent.md` + `02_repo_context.md`
- Scope Excluded: Camera/scan screen, error screens, analytics, contracts
- Source DoD Artifact: `.bounties/20260417-fv-intro-screen-flow/03_bounty_spec.md`

## 2) DoD Status

1. `standalone/screens/IntroScreen.jsx created; no isFVFlow references`: **N/A (pre-implementation)**
   - Evidence: Pattern established by `FVFlowSuccess.jsx` and `FVFlowError.jsx` in same directory.
   - Notes: Contributor should follow those files' structure (own `withStyles`, standalone context imports).

2. `AppRouter.jsx imports intro from standalone/screens/ — not from faceVerification/index.js`: **N/A (pre-implementation)**
   - Evidence: Single import line change at `AppRouter.jsx:5`; low risk.
   - Notes: Verify no other caller still imports `FaceVerificationIntro` from `..` for the standalone path.

3. `IntroFVFlow skips IntroFVFlowOverview when isReverify === true`: **N/A (pre-implementation)**
   - Evidence: Routing guard is a simple conditional at the top of `IntroFVFlow`; `isReverify` is already a prop.
   - Notes: Straightforward; guard lives in `IntroFVFlow`, not inside `IntroFVFlowOverview`.

4. `Reverify action screen renders Wallet Linked box with "Last verified" and zero-value fallback`: **N/A (pre-implementation)**
   - Evidence: Wallet Linked box markup exists verbatim at `IntroFVFlowOverview:234–259`; needs `lastAuthenticated` + `walletAddress` threaded in.
   - Notes: `lastAuthenticated.isZero()` guard required before calling `.toNumber()`.

5. `Over-18 checkbox visible and required for reverify; both checkboxes gate button`: **N/A (pre-implementation)**
   - Evidence: Guard at line 368 (`!isReverify ? ... : null`) removed; `disabled` at line 389 updated to drop `!isReverify &&`.
   - Notes: Both `ageConfirmed` and `goodDollarOnlyConfirmed` state must be tracked for reverify path.

6. `Gate hooks (useDisposingState, useFVLoginInfoCheck) and camera permission logic present in new screen`: **N/A (pre-implementation)**
   - Evidence: These are called in the monolithic `IntroScreen` wrapper (lines 465, 484–514, 530); they must be preserved in the new standalone screen.
   - Notes: This is the highest-risk item — silently dropping these hooks would break wallet disposal detection and login info gating.

7. `screens/IntroScreen.jsx deleted; FaceVerificationIntro removed from faceVerification/index.js`: **N/A (pre-implementation)**
   - Evidence: Once all components are migrated/deleted, the file is empty; `index.js` reference becomes a dead export.
   - Notes: Confirm no other non-standalone caller imports `FaceVerificationIntro` before deleting.

8. `yarn lint and yarn test pass; snapshot regenerated; isReverify === true test case added`: **N/A (pre-implementation)**
   - Evidence: Existing test at `__tests__/IntroScreen.jsx` is a bare single snapshot; will need a new or augmented test targeting the standalone screen.
   - Notes: Snapshot must be regenerated (`yarn test -u`); add FVFlowContext mock with non-zero `lastAuthenticated` BigNumber.

9. `PR includes screenshots for both user paths (mobile + desktop)`: **N/A (pre-implementation)**
   - Evidence: Required per contribution guidelines.
   - Notes: Reviewer should block merge if absent.

## 3) DoD Coverage Summary

- Total DoD Items: 9
- Pass: 0 (pre-implementation review)
- Partial: 0
- Fail: 0
- N/A: 9

## 4) Findings (Primary Output)

### Critical

- [x] None

### High

- [ ] Finding: Gate hooks must be preserved in the new standalone screen
  - DoD Item: 6
  - Problem: `useDisposingState`, `useFVLoginInfoCheck`, camera permission, and emulator check are all in the monolithic `IntroScreen` wrapper (lines 465–530). If the contributor only migrates the visual components and forgets this logic, the standalone flow silently loses wallet disposal detection and login info gating.
  - Evidence: `IntroScreen.jsx:465` (`useDisposingState`), `490–514` (camera permission flow), `530` (`useFVLoginInfoCheck`).
  - Required Fix: These hooks and the `handleVerifyClick` callback must be re-implemented (or re-called) in the new `standalone/screens/IntroScreen.jsx`.

- [ ] Finding: `lastAuthenticated` zero-value guard
  - DoD Item: 4
  - Problem: `lastAuthenticated.toNumber()` will throw if the value is undefined or a BigNumber zero; even though `isReverify` guards this logically, defensive coding is required.
  - Evidence: `expiryDate?.lastAuthenticated` — optional chain present but BigNumber methods need the value.
  - Required Fix: `lastAuthenticated?.isZero() ? t\`N/A\` : moment.unix(lastAuthenticated.toNumber()).format('l')`.

### Medium

- [ ] Finding: `WarningBlock` and `WalletDeletedPopupText` travel with the standalone components
  - DoD Item: 1, 7
  - Problem: Both are defined in `IntroScreen.jsx` and used only by standalone components (`WarningBlock` at lines 301 and 364; `WalletDeletedPopupText` via `useDisposingState`). They must move to the new file or `standalone/components/`.
  - Evidence: `IntroScreen.jsx:60` (`WalletDeletedPopupText`), `IntroScreen.jsx:182` (`WarningBlock`).
  - Required Fix: Move both to the new standalone screen file (or extract to `standalone/components/` if reuse is anticipated).

- [ ] Finding: No test coverage for the reverify path currently
  - DoD Item: 8
  - Problem: The existing test uses no FVFlowContext mock; `isReverify`, `walletAddress`, and `lastAuthenticated` are all undefined, so the reverify branch is never exercised.
  - Evidence: `__tests__/IntroScreen.jsx` — bare `getWebRouterComponentWithMocks`, no context values.
  - Required Fix: Add a test case mocking `useIdentityExpiryDate` to return a non-zero `lastAuthenticated`; assert Overview absent, Wallet Linked box and both checkboxes present in the reverify snapshot.

### Low

- [ ] Finding: `shortenWalletAddress` helper must move
  - DoD Item: 7
  - Problem: Defined at `IntroScreen.jsx:205`; used only by standalone components. If file is deleted and helper not moved, build fails.
  - Evidence: Used in `IntroFVFlowOverview:210` and the new reverify wallet block.
  - Required Fix: Inline in new file or extract to `faceVerification/utils/`.

- [ ] Finding: `withStyles` — confirm which variant to use
  - DoD Item: 1
  - Problem: `standalone/theme/withStyles.js` exists; `IntroScreen.jsx` uses `lib/styles` version. Using the wrong one could cause theme gaps in the standalone app.
  - Evidence: `standalone/screens/FVFlowSuccess.jsx` — check which `withStyles` it imports and be consistent.
  - Required Fix: Match the `withStyles` import used by the other standalone screens.

## 5) Validation Summary

- Lint: `yarn lint src/components/faceVerification/`
- Typecheck: N/A (JavaScript project)
- Tests: `yarn test --testPathPattern=IntroScreen -u`
- Build: `yarn build` (or dev server)
- Manual QA: New-user path + reverify path, mobile + desktop screenshots

## 6) Decision

- Review Outcome: `Approved with follow-ups` _(scope is clear and well-bounded; two High findings must be addressed during implementation)_
- Blocking Items:
  - Gate hooks (`useDisposingState`, `useFVLoginInfoCheck`, camera permission) must be present in the new standalone screen.
  - `lastAuthenticated` zero-guard required.
  - Screenshots required before merge.
- Non-blocking Follow-ups:
  - Consider extracting `WarningBlock` to `standalone/components/` for future reuse.

## 7) Required Contributor Actions

1. Create `standalone/screens/IntroScreen.jsx`; migrate `IntroFVFlowOverview`, `IntroFVFlowAction`, `IntroFVFlow`, `WarningBlock`, `WalletDeletedPopupText`, `shortenWalletAddress`, and all gate hooks / camera permission logic from the old `IntroScreen` wrapper.
2. Add UX improvements: `isReverify` routing guard in `IntroFVFlow`; Wallet Linked box with "Last verified" date (+ zero-value fallback) in the reverify action branch; over-18 checkbox and updated `disabled` condition for reverify path.
3. Rewire `standalone/AppRouter.jsx` to import from `standalone/screens/`; update `standalone/index.js`.
4. Delete `Intro`, `IntroReVerification`, migrated components, and `standalone*`-prefixed styles from `screens/IntroScreen.jsx`; delete the file; remove `FaceVerificationIntro` from `faceVerification/index.js`.
5. Add `isReverify === true` test case with mocked context; regenerate snapshot.
6. Submit PR with screenshots for both user paths (mobile + desktop).

## 8) Reproducibility Notes

```bash
# Install
yarn install

# Lint
yarn lint src/components/faceVerification/

# Tests (update snapshot)
yarn test --testPathPattern=IntroScreen -u

# Start dev server for manual QA
yarn start
```

## 9) Open Questions

- [ ] Should `WarningBlock` be extracted to `standalone/components/` for reuse, or inlined in the new screen file?
- [ ] Which `withStyles` does `FVFlowSuccess.jsx` use — `standalone/theme/withStyles.js` or `lib/styles`? Contributor must check and match.
- [ ] Date format for "Last verified": `moment.format('l')` (locale short) or explicit format like `MMM D, YYYY`?

## 10) Sign-off

- Reviewer: TBD
- Final Comment: Spec is clear and well-scoped. The main risk is silently dropping gate hooks during the migration; the High finding covers this explicitly. All other changes are mechanical. Ready for implementation.
- Date: 2026-04-17
