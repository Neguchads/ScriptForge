# CI / release automation — Stage 2

This repository contains **Web frontend**.

## Browser tests
Home and public legal-page smoke tests without YouTube, database or AI credentials.

## Version/changelog proposals
The `Version and changelog proposal` workflow runs on default-branch pushes and can also be run manually. It proposes version bumps and changelogs from Conventional Commits. `skip-github-release: true` is mandatory: merging the proposal does **not** automatically publish a GitHub Release or deploy the app. The repository must allow GitHub Actions to open pull requests; if this is disabled, enable the relevant Actions setting before expecting Release Please PRs.

## Source inventory and signed evidence
Use Actions → `Package integrity and SBOM (manual)` → `Run workflow`. This workflow is opt-in and never publishes a Release. The manual action builds and attests dist/public (static frontend only; no backend or deploy).

The resulting workflow artifact contains an SPDX-JSON SBOM, a SHA-256 checksum and a package/evidence archive. GitHub's attestation service signs the package's provenance and SBOM. Verify with GitHub CLI after downloading the archive:

```sh
gh attestation verify ./PACKAGE_NAME -R Neguchads/ScriptForge
sha256sum -c PACKAGE_NAME.sha256
```

Replace PACKAGE_NAME with the archived filename and run the SHA-256 command in the directory containing the downloaded archive. Attestations prove *which workflow produced the bytes*, not that third-party licenses or program behavior are correct.

## Safety boundaries
- Never put credentials, real user content, proprietary ROMs, BIOS or generated game code into workflows.
- Each workflow uses a minimal applicable GitHub token permission set and SHA-pinned external actions.
- Human review remains mandatory before enabling a production release or uploading anything to a software store.
- For external websites or paid APIs, end-to-end smoke tests are intentionally limited to public or synthetic fixtures.
