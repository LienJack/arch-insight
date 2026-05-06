# Release Guide

This document defines the standard release workflow for `arch-insight`.

## Release Rules

- Every npm release must use a **new semantic version**.
- Do not publish from a dirty working tree.
- Always publish from `main` after syncing with `origin/main`.
- Every release should have a matching git tag (`vX.Y.Z`).

## Versioning Policy

- `patch` (`0.2.0` -> `0.2.1`): bugfixes, docs fixes, non-breaking small improvements.
- `minor` (`0.2.0` -> `0.3.0`): backward-compatible new features.
- `major` (`0.2.0` -> `1.0.0`): breaking changes.

## Pre-release Checklist

1. Make sure the branch is clean:
   ```bash
   git status --short
   ```
2. Sync main:
   ```bash
   git checkout main
   git pull --rebase origin main
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Build release artifacts:
   ```bash
   npm run build:release
   ```

## Standard Release Flow

1. Bump version and create commit + tag:
   ```bash
   npm version patch
   ```
   Use `minor` or `major` when needed:
   ```bash
   npm version minor
   npm version major
   ```
2. Publish to npm:
   ```bash
   npm publish
   ```
   If account policy requires OTP:
   ```bash
   npm publish --otp <6-digit-code>
   ```
3. Push commit and tags:
   ```bash
   git push origin main
   git push origin --tags
   ```

## Post-release Verification

1. Verify the published version:
   ```bash
   npm view arch-insight version
   ```
2. Verify install path:
   ```bash
   npx arch-insight install-release --platform codex
   ```
3. Confirm the git tag exists remotely:
   ```bash
   git ls-remote --tags origin | tail
   ```

## Rollback Notes

- npm packages cannot be overwritten at the same version.
- If a bad release is published:
  1. `npm deprecate arch-insight@<bad-version> "<reason>"`
  2. Fix code on `main`
  3. Bump to next version and publish again

## Token / Auth Notes

- `npm whoami` should return your username before release.
- If using a granular token, it must include:
  - package permission: `Read and write`
  - `Bypass two-factor authentication (2FA)` (if publish is blocked by 2FA policy)
