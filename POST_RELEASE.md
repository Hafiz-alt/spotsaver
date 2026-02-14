# Post-Release Guide

## EAS Update (Over-The-Air Updates)

EAS Update allows you to push JavaScript-only updates to your app without going through the Play Store review process. This is perfect for bug fixes, UI tweaks, and minor feature additions.

### Setup EAS Update

1. **Install EAS Update:**
```bash
npx expo install expo-updates
```

2. **Configure `eas.json`:**

The `eas.json` file already has update configuration. Verify it includes:

```json
{
  "cli": {
    "version": ">= 16.32.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

3. **Configure `app.json`:**

Add updates configuration:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### Publishing an OTA Update

**For production users:**

```bash
# Publish an update to the production channel
eas update --branch production --message "Fix: Resolved photo save issue"
```

**For preview/testing:**

```bash
# Publish to preview channel first
eas update --branch preview --message "Test: New feature"
```

### When to Use OTA Updates

✅ **Good for OTA:**
- Bug fixes
- UI text changes
- Style/layout updates
- JavaScript logic changes
- Adding new screens (JS only)

❌ **Requires new build:**
- Native code changes
- New native dependencies
- Permission changes
- app.json configuration changes
- SDK version upgrades

### OTA Update Workflow

1. **Fix the bug** in your code
2. **Test locally:** `npx expo start`
3. **Publish update:** `eas update --branch production --message "Fix: [description]"`
4. **Monitor:** Check EAS dashboard for update adoption
5. **Verify:** Users will get the update next time they open the app

### Update Rollback

If an update causes issues:

```bash
# Republish the previous working version
eas update --branch production --message "Rollback to previous version"
```

---

## Monitoring & Analytics

### Option 1: Sentry (Recommended)

Sentry provides crash reporting and error tracking.

**Setup:**

1. **Install Sentry:**
```bash
npx expo install @sentry/react-native
```

2. **Initialize in App.tsx:**
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: false,
});
```

3. **Wrap your app:**
```typescript
export default Sentry.wrap(App);
```

**Benefits:**
- Real-time crash reports
- Error stack traces
- User impact metrics
- Performance monitoring

**Cost:** Free tier available (up to 5,000 events/month)

### Option 2: Google Play Console (Built-in)

Google Play Console provides basic crash reporting for free.

**Access:**
1. Go to Play Console
2. Navigate to "Quality" → "Android vitals"
3. View crash reports and ANRs

**Limitations:**
- Less detailed than Sentry
- Delayed reporting
- No custom error tracking

### Option 3: Firebase Analytics (Optional)

For user behavior analytics:

```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

**Use cases:**
- Track feature usage
- Monitor user flows
- A/B testing
- Custom events

---

## Post-Release Checklist

### Week 1: Launch Week

- [ ] **Day 1:** Monitor crash reports hourly
- [ ] **Day 1-2:** Respond to all user reviews
- [ ] **Day 3:** Check Play Console statistics
- [ ] **Day 5:** Review crash-free rate (target: >99%)
- [ ] **Day 7:** Analyze user feedback and plan fixes

### Week 2-4: Stabilization

- [ ] **Monitor daily:** Crash reports and ANRs
- [ ] **Respond to reviews:** Within 24 hours
- [ ] **Track metrics:**
  - Install rate
  - Uninstall rate
  - Crash-free users
  - Average rating
- [ ] **Plan updates:** Based on user feedback

### Monthly Tasks

- [ ] Review analytics and usage patterns
- [ ] Plan feature updates
- [ ] Update store listing if needed
- [ ] Respond to all reviews
- [ ] Check for security updates

---

## Update Strategy

### Version Numbering

Follow semantic versioning:
- **Major (1.x.x):** Breaking changes, major features
- **Minor (x.1.x):** New features, no breaking changes
- **Patch (x.x.1):** Bug fixes, minor improvements

**Examples:**
- `1.0.0` → Initial release
- `1.0.1` → Bug fix
- `1.1.0` → New feature (parking favorites)
- `2.0.0` → Major redesign

### Release Cadence

**Recommended:**
- **Patch releases:** As needed (bug fixes)
- **Minor releases:** Every 2-4 weeks (new features)
- **Major releases:** Every 3-6 months (big changes)

### Update Process

1. **Plan:** Gather user feedback and prioritize features
2. **Develop:** Implement changes locally
3. **Test:** Internal testing + preview build
4. **Release:** 
   - For JS-only: Use EAS Update
   - For native changes: New Play Store build
5. **Monitor:** Watch crash reports and reviews
6. **Iterate:** Fix issues quickly

---

## User Communication

### In-App Changelog

Consider adding a "What's New" screen:
- Show on first launch after update
- Highlight new features
- Link to full changelog

### Release Notes

Always include clear release notes:
- **Good:** "Fixed issue where photos weren't saving correctly"
- **Bad:** "Bug fixes and improvements"

### Social Media (Optional)

If you have social presence:
- Announce major updates
- Share user testimonials
- Highlight new features

---

## Performance Optimization

### Monitor These Metrics

1. **App Size:**
   - Target: <50MB
   - Check: Play Console → App size report

2. **Startup Time:**
   - Target: <2 seconds
   - Use: React Native Performance Monitor

3. **Memory Usage:**
   - Target: <100MB for typical usage
   - Monitor: Android Profiler

4. **Battery Usage:**
   - Target: Minimal background usage
   - Check: Play Console → Android vitals

### Optimization Tips

- Optimize images (already done with compression)
- Lazy load screens
- Minimize background tasks
- Use ProGuard for code shrinking (in production build)

---

## Security Updates

### Stay Updated

- [ ] Monitor Expo SDK releases
- [ ] Update dependencies quarterly
- [ ] Check for security advisories
- [ ] Test updates before deploying

### Update Command

```bash
# Update Expo SDK
npx expo upgrade

# Update dependencies
npm update

# Check for vulnerabilities
npm audit
```

---

## Backup & Recovery

### Code Backup

- [ ] Push to GitHub regularly
- [ ] Tag releases: `git tag v1.0.0`
- [ ] Keep production builds archived

### Data Migration

If you need to change data structure:
1. Increment `CURRENT_MIGRATION_VERSION` in `storage.ts`
2. Add migration logic
3. Test thoroughly before release

---

## Support & Maintenance

### User Support

**Email:** support@spotsaver.app

**Response time target:** 24-48 hours

**Common issues:**
- Permission problems → Link to settings
- Photo not saving → Check storage permission
- Navigation not working → Verify Maps/Waze installed

### Bug Reporting

Encourage users to:
1. Describe the issue
2. Include device model and Android version
3. Provide steps to reproduce
4. Attach screenshots if possible

---

## Growth & Marketing (Optional)

### App Store Optimization (ASO)

- Update keywords based on search trends
- A/B test screenshots
- Encourage satisfied users to leave reviews
- Respond to all reviews (positive and negative)

### Feature Requests

Track feature requests:
- Create GitHub Issues
- Use a public roadmap (Trello/Notion)
- Prioritize based on user demand

---

## Success Metrics

### Key Performance Indicators (KPIs)

- **Install rate:** Target 100+ in first month
- **Crash-free rate:** Target >99%
- **Average rating:** Target 4.5+
- **Retention (Day 7):** Target >40%
- **Retention (Day 30):** Target >20%

### Celebrate Milestones

- 100 installs
- 1,000 installs
- 10,000 installs
- 4.5+ rating
- Featured in Play Store (if applicable)

---

## Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Update Docs:** https://docs.expo.dev/eas-update/introduction/
- **Sentry Docs:** https://docs.sentry.io/platforms/react-native/
- **Play Console Help:** https://support.google.com/googleplay/android-developer

---

**Congratulations on launching SpotSaver! 🎉**

Remember: The launch is just the beginning. Continuous improvement based on user feedback is key to long-term success.
