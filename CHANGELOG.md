# Changelog

## [0.26.6] - 2024-08-13

### Added

- Update connection method list

## [0.26.5] - 2024-07-20

### Added

- Show hint for browser issues

## [0.26.4] - 2024-07-18

### Added

- Enable opening of register screen for AuthCore users

## [0.26.3] - 2024-07-16

### Added

- Display reset password hint when hiding social login options

## [0.26.2] - 2024-03-08

### Added

- Add Authcore clientId in setting

## [0.26.1] - 2024-03-07

### Changed

- Upgrade @likecoin/authcore-js to 0.3.0-like.1

## [0.26.0] - 2024-01-26

### Breaking

- Rename current Liker Land App login method from Liker ID to Liker Land APP

### Added

- Add Authcore login support as Liker ID login
- Add redirect handler for method requiring redirection

### Changed

- Support storing method specific params in session

## [0.25.3] - 2023-11-14

### Changed

- Update default gas price steps by 1000

## [0.25.2-beta.0] - 2023-11-9

### Fixed

- Remove wcV1 uri in LikerId method

## [0.25.1-beta.0] - 2023-10-16

### Changed

- Use window.keplr automatically in keplr mobile in-app browser

## [0.25.0-beta.2] - 2023-10-10

### Changed

- Update MetaMask Snap Icon

## [0.25.0-beta.1] - 2023-10-09

### Fixed

- Fix missing await in metamask connectSnap

## [0.25.0-beta.0] - 2023-10-09

### Added

- Add metamask leap snap

## [0.24.0-beta.0] - 2023-10-05

### Changed

- Use walletconnect v2 for likerland app
- Override mobile check if installed (#38)

## [0.23.0-beta.1] - 2023-08-31

### Added

- Add events during connecting method (#36)
- Add recommend hint for method (#37)

### Changed

- Collapse installed tier 2 method
- Collapse mobile connection method in desktop

## [0.22.0-beta.1] - 2023-08-17

### Added

- Allow customizing text at connection dialog open

## [0.22.0-beta.0] - 2023-08-17

### Added

- Allow customizing text for connect wallet dialog
- Add install app button for mobile

### Fixed

- Prevent button inside button (#31)

### Changed

- Remove ledger unsupported message (#32)
- Change Keplr Mobile to tier 1

## [0.21.0-beta.4] - 2023-06-27

### Added

- Integrate WalletConnectV2 (#25)
- Add wc uri in likerland getapp button

## [0.20.3] - 2023-06-22

### Changed

- Pin @headlessui/react to 1.7.11

## [0.20.2] - 2023-06-22

### Changed

- Upgrade @headlessui/react to 1.7.15

## [0.20.1] - 2023-06-14

### Changed

- Show Keplr if no other wallet extensions detected

## [0.20.0] - 2023-04-23

### Added

- Integrate Leap Wallet (#22)

## [0.19.0] - 2023-04-21

### Added

- Support signArbitrary for Cosmostation and Keplr (#21)

## [0.18.0] - 2023-03-29

### Added

- Display wallet order by detected wallet in desktop env (#19)

### Changed

- Improve UX for Liker Land app (in-app) (#18)

## [0.17.3] - 2023-01-11

### Fixed

- [Liker ID] Fix install app button

### Fixed

- [Keplr] Fix config not allowed empty string

## [0.17.2] - 2023-01-06

### Added

- [Keplr] Support `walletURLForStaking` config
- [Keplr] Log `experimentalSuggestChain` error

### Fixed

- [Keplr] Fix config not allowed empty string

### Changed

- [Cosmostation] Skip method selection in in-app browser

## [0.17.1] - 2022-12-10

### Changed

- [Cosmostation] Skip method selection in in-app browser

## [0.17.0] - 2022-12-10

### Added

- [Cosmostation] Add button to open in in-app browser (#14)
- Support i18n (#12)
- [Cosmostation] Support Direct Sign using WalletConnect. (#11)

### Changed

- Move Cosmostation method to tier 1

## [0.16.0] - 2022-10-19

### Added

- [Cosmostation] Support Direct Sign using WalletConnect. (#11)

## [0.15.0] - 2022-09-28

### Added

- [Liker ID] Add Liker Land App install button. (#10)

### Changed

- [Keplr] Hide Ledger not supported hint if Keplr browser extension is not installed. (#10)

### Fixed

- [Cosmostation] Fix missing hint for Wallet Connect dialog.

## [0.14.1] - 2022-09-23

### Fixed

- Fix missing header in method selection dialog. (#9)

## [0.14.0] - 2022-09-23

### Added

- [Keplr] Add install CTA presets. (#5)

### Changed

- [Keplr] Move `gasPriceStep` into `feeCurrencies`. (#8)
- [Keplr] Add `coinGeckoId` config. (#8)

## [0.13.1-beta.0] - 2022-09-21

### Changed

- [Cosmostation] Changed to use `cos_supportedChainIds` instead of `cos_supportedChainNames` for checking supported chain. (#6)

### Fixed

- [Cosmostation] Fixed unable to request account with the Wallet Extension (#6)

## [0.13.0-beta.0] - 2022-09-20

### Added

- Support for Cosmostation Mobile Wallet. (#4)
- Config for Keplr Browser Extension installation URL. (#3)
