# Nokia NOC Mobile App - Build Instructions

Complete guide for building and deploying the Nokia NOC mobile application on Android and iOS platforms.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Android Studio** - [Download](https://developer.android.com/studio)
  - Android SDK (API level 24 or higher)
  - Android SDK Build-Tools
  - Android Emulator (optional, for testing)
- **Xcode** (macOS only, for iOS) - [Download](https://apps.apple.com/us/app/xcode/id497799835)
- **CocoaPods** (macOS only, for iOS) - Install via: `sudo gem install cocoapods`

### Environment Setup
1. Install Android Studio and configure Android SDK
2. Add Android SDK tools to your PATH
3. Accept Android SDK licenses: `sdkmanager --licenses`

---

## Building the Mobile App

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure API URL

The app needs to connect to your backend server. Update the API URL in one of these ways:

#### Option A: Environment Variable (Recommended)
Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000
```

Replace `YOUR_LOCAL_IP` with your computer's local network IP address. To find it:
- **Windows**: Run `ipconfig` in Command Prompt, look for "IPv4 Address"
- **macOS/Linux**: Run `ifconfig` or `ip addr`, look for inet address

#### Option B: Direct Configuration
Edit `frontend/src/config.js` and update the IP address in the `isCapacitor` conditional:
```javascript
if (isCapacitor) {
  return 'http://192.168.1.100:8000'; // Update this IP
}
```

### Step 3: Build the Web Bundle

```bash
npm run export
```

This creates a static export in the `out/` directory.

### Step 4: Sync to Native Platforms

```bash
# Sync to all platforms
npx cap sync

# Or sync to specific platform
npx cap sync android
npx cap sync ios
```

---

## Running on Android

### Option A: Using Android Emulator

1. **Open Android Studio:**
   ```bash
   npm run cap:android
   ```
   or
   ```bash
   npx cap open android
   ```

2. **Wait for Gradle Sync** to complete (first time may take several minutes)

3. **Select a Device:**
   - Click the device dropdown in the toolbar
   - Choose an existing emulator or create a new one
   - Recommended: Pixel 6 with API 33 or higher

4. **Run the App:**
   - Click the green "Run" button (▶️)
   - Or press `Shift + F10`

5. **App should launch** on the emulator within 30-60 seconds

### Option B: Using a Physical Device

1. **Enable Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → System → Developer Options
   - Enable "USB Debugging"

2. **Connect Device** via USB cable

3. **Trust Computer** (prompt on device)

4. **Verify Connection:**
   ```bash
   adb devices
   ```

5. **Open in Android Studio** and select your device from the dropdown

6. **Run the App** (same as emulator steps above)

---

## Running on iOS (macOS Only)

### Step 1: Add iOS Platform (if not added)

```bash
npx cap add ios
npm run cap:sync
```

### Step 2: Install CocoaPods Dependencies

```bash
cd ios/App
pod install
cd ../..
```

### Step 3: Open in Xcode

```bash
npm run cap:ios
```
or
```bash
npx cap open ios
```

### Step 4: Configure Signing

1. In Xcode, select the `App` project in the navigator
2. Select the `App` target
3. Go to "Signing & Capabilities" tab
4. Select your development team
5. Xcode will automatically manage provisioning

### Step 5: Select Device and Run

1. Choose a simulator or connected iOS device
2. Click the "Play" button (▶️) or press `Cmd + R`

---

## Creating Release Builds

### Android APK/AAB

1. **Generate Signing Key** (first time only):
   ```bash
   cd android
   keytool -genkey -v -keystore nokia-noc-release.keystore -alias nokia-noc -keyalg RSA -keysize 2048 -validity 10000
   cd ..
   ```

2. **Configure Signing** in `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("../nokia-noc-release.keystore")
               storePassword "YOUR_PASSWORD"
               keyAlias "nokia-noc"
               keyPassword "YOUR_PASSWORD"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

4. **Build Release AAB (for Play Store):**
   ```bash
   ./gradlew bundleRelease
   ```
   AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS IPA

1. **Archive in Xcode:**
   - Select "Generic iOS Device" as the build destination
   - Product → Archive
   - Wait for archiving to complete

2. **Export IPA:**
   - In Organizer, select your archive
   - Click "Distribute App"
   - Choose distribution method (Ad Hoc, Enterprise, or App Store)
   - Follow the wizard to export

---

## Updating the App

When you make changes to the web code:

1. **Rebuild and Sync:**
   ```bash
   npm run cap:sync
   ```

2. **For native code changes** (Capacitor config, plugins):
   ```bash
   npx cap sync
   ```

3. **Reopen** the project in Android Studio/Xcode and run again

---

## Troubleshooting

### Build Errors

**"Gradle sync failed"**
- Clean the project: `cd android && ./gradlew clean`
- Invalidate caches in Android Studio: File → Invalidate Caches / Restart

**"Unable to load content from URL"**
- Check that your backend is running
- Verify the API URL is correct in `.env.local` or `config.js`
- Ensure your device/emulator is on the same network as the backend
- Check firewall settings

**"Module not found" errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Runtime Issues

**App crashes on launch**
- Check Android Logcat in Android Studio
- Look for JavaScript errors in Chrome DevTools (chrome://inspect for Android)

**Network requests failing**
- Open the app, go to Settings → About
- Verify API endpoint is reachable
- Try accessing the API URL in the device's browser

**3D graphs not rendering**
- This may be expected on low-end devices
- The app includes automatic performance detection
- Try on a different device or reduce complexity

### Performance

**App is slow**
- Enable hardware acceleration in Android emulator
- Test on a physical device (emulators are often slower)
- Check Network tab in DevTools for slow API calls

---

## Advanced Configuration

### Changing App Name

Edit `capacitor.config.ts`:
```typescript
appName: 'Your App Name'
```

### Changing Bundle ID

Edit `capacitor.config.ts`:
```typescript
appId: 'com.yourcompany.yourapp'
```

Then run:
```bash
npx cap sync
```

### Adding Splash Screen / Icons

Place your icon files in:
- **Android**: `android/app/src/main/res/` (various `mipmap-*` folders)
- **iOS**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Use tools like [capacitor-assets](https://github.com/ionic-team/capacitor-assets) to generate all sizes:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0a0e1a' --splashBackgroundColor '#0a0e1a'
```

---

## Testing Checklist

- [ ] Backend API is accessible from mobile device
- [ ] All dashboard panels load correctly
- [ ] 3D network graph renders and is interactive
- [ ] Upload functionality works
- [ ] AI chat responds correctly
- [ ] App survives background/foreground transitions
- [ ] Network connectivity changes are detected
- [ ] Orientation changes work smoothly
- [ ] No memory leaks after extended use
- [ ] Touch targets are comfortable (minimum 44x44px)

---

## Need Help?

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Studio**: https://developer.android.com/studio/intro
- **Xcode**: https://developer.apple.com/xcode/

For project-specific issues, check the main [README.md](../README.md).
