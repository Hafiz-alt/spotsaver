# Google Play Console Upload Instructions

## Prerequisites

Before you begin, ensure you have:
- [ ] A Google Play Console account (https://play.google.com/console)
- [ ] The production AAB file from EAS Build
- [ ] All store assets ready (icon, feature graphic, screenshots)
- [ ] Privacy policy hosted (GitHub Pages or your own domain)

---

## Step 1: Create Your App in Play Console

1. Go to https://play.google.com/console
2. Click **"Create app"**
3. Fill in the details:
   - **App name:** SpotSaver
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Accept the declarations and click **"Create app"**

---

## Step 2: Set Up Store Listing

### App Details
1. Navigate to **"Store presence" → "Main store listing"**
2. Fill in the required fields:

**Short description** (max 80 characters):
```
Never forget where you parked. Save your spot with photo, notes & navigation.
```

**Full description** (copy from `STORE_DESCRIPTION.md`):
- Copy the "Full Description" section from `STORE_DESCRIPTION.md`
- Paste into the full description field

**App icon:**
- Upload `assets/store/icon-512.png` (512x512 PNG)

**Feature graphic:**
- Upload `assets/store/feature-1024x500.png` (1024x500 PNG)

**Phone screenshots:**
- Upload 5 screenshots from `assets/store/screenshots/`
- Minimum 2 screenshots required
- Recommended: 5-8 screenshots showing key features

### Categorization
- **App category:** Tools
- **Tags:** parking, navigation, utilities (optional)

### Contact Details
- **Email:** support@spotsaver.app (or your email)
- **Phone:** (optional)
- **Website:** (optional, or link to GitHub repo)

### Privacy Policy
- **Privacy policy URL:** 
  - Option 1: Host `PRIVACY_POLICY.md` on GitHub Pages
  - Option 2: Convert to HTML and host on your own domain
  - Example: `https://yourusername.github.io/spotsaver/privacy-policy.html`

3. Click **"Save"**

---

## Step 3: Content Rating

1. Navigate to **"Policy" → "App content"**
2. Click **"Start questionnaire"** under Content rating
3. Answer the questionnaire:
   - **App category:** Utility, Productivity, Communication, or Other
   - **Does your app contain violence?** No
   - **Does your app contain sexual content?** No
   - **Does your app contain language?** No
   - **Does your app allow users to interact?** No
   - **Does your app share user location?** No (data stays on device)
   - **Does your app access sensitive device data?** Yes → Location (explain: "For saving parking spot coordinates locally")
4. Submit and receive your content rating

---

## Step 4: Target Audience and Content

1. Navigate to **"Policy" → "App content" → "Target audience and content"**
2. Select target age groups:
   - Recommended: **13+** or **Everyone**
3. Complete the questionnaire about children's content
4. Save

---

## Step 5: Data Safety

1. Navigate to **"Policy" → "App content" → "Data safety"**
2. Answer questions about data collection:
   - **Does your app collect or share user data?** No
   - Explanation: "All data is stored locally on the user's device. No data is transmitted to servers."
3. Complete the data safety section
4. Save

---

## Step 6: Upload Your AAB (Internal Testing)

### Create Internal Testing Track
1. Navigate to **"Release" → "Testing" → "Internal testing"**
2. Click **"Create new release"**
3. Upload your AAB:
   - Click **"Upload"**
   - Select the AAB file downloaded from EAS Build
   - Wait for upload to complete
4. **Release name:** `1.0.0 (1)` (version name + version code)
5. **Release notes** (copy from `RELEASE_NOTES.md`):
   - Copy the content from `RELEASE_NOTES.md`
   - Paste into the "What's new" field
6. Click **"Save"**
7. Click **"Review release"**
8. Review all details and click **"Start rollout to Internal testing"**

### Add Internal Testers
1. Go to **"Testing" → "Internal testing" → "Testers"**
2. Create an email list of internal testers
3. Add email addresses (your own email at minimum)
4. Save

### Share Test Link
1. Copy the internal testing link
2. Share with your testers
3. Testers can install and test the app

---

## Step 7: Internal Testing Phase

**Duration:** 1-7 days (recommended minimum: 2-3 days)

During this phase:
- [ ] Install the app on multiple devices
- [ ] Test all core features:
  - [ ] Save parking spot with photo
  - [ ] View saved spot
  - [ ] Navigate to spot (Google Maps/Waze)
  - [ ] Add/edit/delete vehicles
  - [ ] Set parking timers
  - [ ] View parking history
- [ ] Check for crashes or bugs
- [ ] Verify permissions work correctly
- [ ] Test on different Android versions (if possible)

**If issues are found:**
1. Fix the bugs in your code
2. Build a new AAB with incremented versionCode
3. Upload the new AAB to internal testing
4. Repeat testing

---

## Step 8: Promote to Production (Staged Rollout)

Once internal testing is successful:

### Create Production Release
1. Navigate to **"Release" → "Production"**
2. Click **"Create new release"**
3. Click **"Use release from another track"**
4. Select your internal testing release
5. Or upload the AAB again directly

### Configure Staged Rollout
1. Under "Rollout percentage", select **"Staged rollout"**
2. Start with **10%** of users
3. Click **"Save"**
4. Click **"Review release"**
5. Review all details carefully
6. Click **"Start rollout to Production"**

### Monitor and Increase Rollout
**Day 1-2: 10% rollout**
- Monitor crash reports in Play Console
- Check user reviews
- Watch for critical bugs

**Day 3-4: Increase to 25%**
- If no major issues, increase to 25%
- Continue monitoring

**Day 5-7: Increase to 50%**
- If stable, increase to 50%

**Day 8+: Full rollout (100%)**
- If everything looks good, complete rollout to 100%

---

## Step 9: Post-Release Monitoring

### Check Play Console Daily
1. **Crashes & ANRs:** Monitor crash reports
2. **User reviews:** Respond to user feedback
3. **Statistics:** Track installs and uninstalls

### Respond to Reviews
- Thank users for positive reviews
- Address negative reviews promptly
- Fix reported bugs in future updates

---

## Step 10: Future Updates

When you need to release an update:

1. Increment `versionCode` in `app.json` (e.g., from 1 to 2)
2. Update `version` if needed (e.g., from 1.0.0 to 1.0.1)
3. Build new AAB: `eas build -p android --profile production`
4. Upload to Production track
5. Add release notes describing changes
6. Use staged rollout again (10% → 25% → 50% → 100%)

---

## Troubleshooting

### Common Issues

**"Your app bundle contains native code, and you've not uploaded debug symbols"**
- This is a warning, not an error
- You can safely ignore it for now
- For production apps, consider uploading debug symbols later

**"Your app is missing required permissions declarations"**
- Ensure all permissions in `app.json` have corresponding usage descriptions
- Check that permission descriptions are clear and user-friendly

**"Privacy policy URL is invalid"**
- Ensure your privacy policy is publicly accessible
- URL must use HTTPS
- Test the URL in an incognito browser window

**"Screenshots don't meet requirements"**
- Minimum 2 screenshots required
- Must be PNG or JPEG
- Minimum dimensions: 320px
- Maximum dimensions: 3840px
- Aspect ratio between 16:9 and 2:1

---

## Quick Reference: Required Assets

- [ ] App icon: 512x512 PNG
- [ ] Feature graphic: 1024x500 PNG
- [ ] Phone screenshots: 2-8 images (portrait recommended)
- [ ] Short description: max 80 characters
- [ ] Full description: max 4000 characters
- [ ] Privacy policy: publicly accessible URL
- [ ] Content rating: completed questionnaire
- [ ] Data safety: completed form
- [ ] AAB file: from EAS Build

---

## Support

If you encounter issues:
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev/

---

**Good luck with your launch! 🚀**
