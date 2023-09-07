## fastlane documentation

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### generate_git_tag

```sh
[bundle exec] fastlane generate_git_tag
```

Generate a git tag locally for version or build number bump

### get_previous_tag

```sh
[bundle exec] fastlane get_previous_tag
```

Get previous local git tag value

### push_tag_to_remote

```sh
[bundle exec] fastlane push_tag_to_remote
```

Push last generated local git tag to remote

### update_android_version

```sh
[bundle exec] fastlane update_android_version
```

Update android versioning

### update_ios_version

```sh
[bundle exec] fastlane update_ios_version
```

Update ios versioning

### commit_android_version_bump

```sh
[bundle exec] fastlane commit_android_version_bump
```

Commit android version bump

### commit_ios_version_bump

```sh
[bundle exec] fastlane commit_ios_version_bump
```

Commit ios version bump

### get_git_tag_array

```sh
[bundle exec] fastlane get_git_tag_array
```

Get git tag array

### upload_android_sourcemaps

```sh
[bundle exec] fastlane upload_android_sourcemaps
```

Upload android sourcemaps

### upload_ios_sourcemaps

```sh
[bundle exec] fastlane upload_ios_sourcemaps
```

Upload ios sourcemaps

---

## iOS

### ios build

```sh
[bundle exec] fastlane ios build
```

Build iOS app

### ios appcenter

```sh
[bundle exec] fastlane ios appcenter
```

Upload iOS app to App Center

### ios dev

```sh
[bundle exec] fastlane ios dev
```

iOS Development version distribution flow

### ios sit

```sh
[bundle exec] fastlane ios sit
```

iOS SIT version distribution flow

### ios uat

```sh
[bundle exec] fastlane ios uat
```

iOS UAT version distribution flow

### ios stg

```sh
[bundle exec] fastlane ios stg
```

iOS STG version distribution flow

### ios cind

```sh
[bundle exec] fastlane ios cind
```

iOS CIND version distribution flow

### ios ntt

```sh
[bundle exec] fastlane ios ntt
```

iOS NTT version distribution flow

### ios kldc

```sh
[bundle exec] fastlane ios kldc
```

iOS KLDC version distribution flow

### ios production

```sh
[bundle exec] fastlane ios production
```

iOS Production version distribution flow

---

## Android

### android build

```sh
[bundle exec] fastlane android build
```

Build the Android application

### android appcenter

```sh
[bundle exec] fastlane android appcenter
```

Upload Android app to App Center

### android dev

```sh
[bundle exec] fastlane android dev
```

Android Development version distribution flow

### android sit

```sh
[bundle exec] fastlane android sit
```

Android SIT version distribution flow

### android huaweisit

```sh
[bundle exec] fastlane android huaweisit
```

Android SIT Huawei version distribution flow

### android uat

```sh
[bundle exec] fastlane android uat
```

Android UAT version distribution flow

### android huaweiuat

```sh
[bundle exec] fastlane android huaweiuat
```

Android UAT Huawei version distribution flow

### android huaweistg

```sh
[bundle exec] fastlane android huaweistg
```

Android Staging Huawei version distribution flow

### android stg

```sh
[bundle exec] fastlane android stg
```

Android Staging version distribution flow

### android cind

```sh
[bundle exec] fastlane android cind
```

Android CIND version distribution flow

### android ntt

```sh
[bundle exec] fastlane android ntt
```

Android NTT version distribution flow

### android kldc

```sh
[bundle exec] fastlane android kldc
```

Android KLDC version distribution flow

### android production

```sh
[bundle exec] fastlane android production
```

Android Production version distribution flow

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
