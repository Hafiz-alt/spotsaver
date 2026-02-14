# Store Assets Generation Instructions

## Required Assets for Google Play Store

### 1. App Icon (512x512 PNG)

**File:** `assets/store/icon-512.png`

**Specifications:**
- Dimensions: 512x512 pixels
- Format: PNG (32-bit)
- No transparency
- No rounded corners (Google Play adds them automatically)

**Design Guidelines:**
- Use the SpotSaver branding colors (blue #007AFF, green #00C853)
- Include a location pin icon or car icon
- Keep it simple and recognizable at small sizes
- Ensure good contrast

**How to Create:**
1. Use your existing `assets/icon.png` as a base
2. Resize to 512x512 pixels
3. Ensure it looks good at small sizes (48x48)
4. Export as PNG

**Tools:**
- Figma, Adobe Illustrator, or Canva
- Online tool: https://www.figma.com or https://www.canva.com

---

### 2. Feature Graphic (1024x500 PNG)

**File:** `assets/store/feature-1024x500.png`

**Specifications:**
- Dimensions: 1024x500 pixels
- Format: PNG or JPEG
- No transparency

**Design Guidelines:**
- Showcase the app name "SpotSaver"
- Include tagline: "Never Forget Where You Parked"
- Use gradient background (dark blue to blue)
- Include visual elements: location pin, car icon, phone mockup
- Make it eye-catching and professional

**Design Ideas:**
- Left side: App name + tagline
- Right side: Phone mockup showing the app
- Background: Gradient with subtle patterns

**Example Layout:**
```
┌─────────────────────────────────────────────────┐
│  📍 SpotSaver                    [Phone Mockup] │
│  Never Forget Where You Parked   [showing app]  │
│  [Gradient Background]                          │
└─────────────────────────────────────────────────┘
```

---

### 3. Phone Screenshots (5-8 images)

**Directory:** `assets/store/screenshots/`

**Specifications:**
- Minimum 2 screenshots required (recommended: 5-8)
- Format: PNG or JPEG
- Dimensions: 
  - Minimum: 320px on shortest side
  - Maximum: 3840px on longest side
  - Recommended: 1080x1920 (portrait) or 1920x1080 (landscape)
- Aspect ratio: 16:9 to 2:1

**Recommended Screenshots:**

1. **screenshot_1_home.png** — Home Screen
   - Show the main save button
   - Display active vehicle
   - Show distance indicator (if available)

2. **screenshot_2_save_spot.png** — Save Spot Flow
   - Show photo capture
   - Display parking notes input
   - Highlight the save button

3. **screenshot_3_saved_spot.png** — Saved Spot Details
   - Show photo of parking spot
   - Display location coordinates
   - Show navigation buttons (Google Maps/Waze)

4. **screenshot_4_vehicles.png** — Multi-Vehicle Support
   - Show vehicle list
   - Display different vehicles
   - Highlight active vehicle selection

5. **screenshot_5_history.png** — Parking History
   - Show list of past parking spots
   - Display thumbnails and dates
   - Show organized history view

**How to Create Screenshots:**

**Option 1: Real Device**
1. Run the app on a real Android device
2. Navigate to each screen
3. Take screenshots using device screenshot function
4. Transfer to computer

**Option 2: Emulator**
1. Run `npx expo start --android`
2. Use Android Studio emulator
3. Take screenshots from emulator
4. Save to `assets/store/screenshots/`

**Option 3: Design Tool**
1. Use Figma or Adobe XD
2. Create phone mockups (1080x1920)
3. Place app screenshots inside
4. Add annotations or highlights if desired
5. Export as PNG

**Screenshot Enhancement Tips:**
- Add device frames for a professional look
- Use consistent device frame across all screenshots
- Add captions/annotations to highlight features
- Ensure text is readable
- Show realistic data (not "Lorem Ipsum")

---

## Asset Checklist

Before uploading to Play Console:

- [ ] App icon (512x512 PNG) created and saved
- [ ] Feature graphic (1024x500 PNG) created and saved
- [ ] At least 2 phone screenshots created
- [ ] All screenshots are high quality and representative
- [ ] All images are properly sized
- [ ] All images are saved in `assets/store/` directory
- [ ] Images look good on different screen sizes

---

## Quick Generation Using Existing Assets

If you want to quickly generate placeholder assets:

### App Icon
```bash
# Use your existing icon.png
cp assets/icon.png assets/store/icon-512.png
# Resize to 512x512 if needed using an image editor
```

### Feature Graphic
Use an online tool like Canva:
1. Create new design (1024x500)
2. Add text: "SpotSaver - Never Forget Where You Parked"
3. Add location pin icon
4. Use gradient background
5. Download as PNG

### Screenshots
1. Run the app: `npx expo start`
2. Open on device or emulator
3. Navigate through key screens
4. Take screenshots
5. Save to `assets/store/screenshots/`

---

## Professional Asset Creation Services (Optional)

If you want professional-quality assets:

- **Fiverr:** Search for "app icon design" or "play store graphics"
- **99designs:** Run a design contest
- **Upwork:** Hire a freelance designer
- **Canva Pro:** Use premium templates

**Budget:** $50-200 for complete asset package

---

## Testing Your Assets

Before final upload:

1. **Preview at different sizes:**
   - View icon at 48x48, 96x96, 192x192
   - Ensure it's recognizable at all sizes

2. **Check on dark backgrounds:**
   - Play Store uses dark theme
   - Ensure assets look good on dark backgrounds

3. **Get feedback:**
   - Show to friends/colleagues
   - Ask: "Does this make you want to download the app?"

---

## Next Steps

Once assets are created:

1. Place all files in `assets/store/` directory
2. Verify file names and dimensions
3. Proceed with Play Console upload (see `PLAY_CONSOLE_UPLOAD.md`)
4. Upload assets during store listing setup

---

**Note:** The app already has basic icon assets in the `assets/` directory. You can use these as a starting point and enhance them for the Play Store listing.
