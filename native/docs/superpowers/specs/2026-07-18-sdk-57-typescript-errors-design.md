# SDK 57 TypeScript Error Fix Design

## Goal

Make `npx tsc --noEmit` pass after the Expo SDK 57 migration without weakening strict type checking or changing visible application behavior.

## Scope

The implementation will address the four current error groups:

1. Normalize React Native's `ColorSchemeName` value `unspecified` to `light` in the shared color-scheme hooks.
2. Type `ExternalLink` URLs as Expo Router `ExternalPathString` values.
3. Narrow the non-iOS icon mapping to string symbol names and use the style type accepted by `MaterialIcons`.
4. Import Jest globals explicitly in the snapshot test.

The existing Expo Router migration and the user-modified development port remain unchanged. Unrelated refactoring and dependency upgrades are out of scope.

## Implementation

Color-scheme normalization will happen at the hook boundary so all consumers receive only `light` or `dark`. This removes repeated assertions and gives `unspecified` a deterministic fallback.

`ExternalLink` will continue accepting external URL strings, but its public type will match Expo Router's typed-link contract. The icon mapping will retain its current runtime values while using `satisfies` to validate keys and values without broadening the literal mapping type. Jest globals will be module imports rather than global TypeScript configuration.

## Verification

The existing failing `npx tsc --noEmit` command is the regression test. After each focused change, type checking will be rerun. Final verification will include the project tests and an iOS Expo export to ensure the type-only changes do not break bundling.
