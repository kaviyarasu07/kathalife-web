# Update Notes

## Feature: Dark Theme Login & Signup Redesign

**Route:** `/src/app/(auth)/login/page.tsx`

### Follow-up Corrections

1. **Login Link & Back Button Cleanup**
   * Removed the hero back button from the login/signup screen.
   * Forced the login screen `Forgot password?` link to white across normal, hover, active, and visited states so browser default blue styling cannot leak through.

2. **Forgot Password Screen Redesign**
   * Removed the old back button from the forgot password screen.
   * Rebuilt the forgot password page with the same dark mobile-first shell as login and added a recovery-themed inline mock illustration showing a secure email/password reset.
   * Kept the existing OTP, resend cooldown, password validation, reset flow, and routing behavior intact.

3. **Verification**
   * `npx tsc --noEmit` passes.
   * `npm run lint -- "src/app/(auth)/login/page.tsx" "src/app/(auth)/forgot-password/page.tsx"` passes.

### Previous Corrections

1. **Single-Screen Fit**
   * Changed the auth page and shell from minimum-height sizing to fixed `100svh` sizing with hidden overflow.
   * Reduced hero height, illustration size, card padding, field height, and button height on compact browser heights so the login view fits within one viewport without page scrolling.

2. **Input Autofill Color Fix**
   * Added WebKit autofill overrides so saved email/password values remain on the dark input background with white text instead of Chrome/Edge painting them white.

3. **Contrast Improvements**
   * Changed the KathaLife heading accent, social icon accent, forgot password link, legal links, and bottom action link to white for clearer visibility on the dark card.

4. **Verification**
   * `npx tsc --noEmit` passes.
   * `npm run lint -- "src/app/(auth)/login/page.tsx"` passes.

### Key Architectural Decisions & Fixes

1. **Logic Preservation**
   * Preserved the existing `authService.login`, `authService.signup`, `AuthContext.login`, form state, password visibility state, validation branches, error handling, and post-auth routing.
   * Kept the existing signup requirement for password confirmation so the current validation behavior remains intact.

2. **Mobile-First Auth Layout**
   * Rebuilt the page into a centered max-width `480px` shell with a `40svh` illustration hero and `60svh` rounded form card.
   * Added the requested dark radial hero background, decorative sparkle marks, back button, and inline purple writing illustration.

3. **Dark Form System**
   * Restyled login and signup with dark elevated inputs, Lucide field icons, password reveal toggles, social auth button row, divider text, pill CTA, legal copy, and variant-specific bottom links.
   * Added token-matched focus and error states, including rose borders and inline `AlertCircle` field errors.

4. **Verification**
   * `npx tsc --noEmit` passes.
   * `npm run lint -- "src/app/(auth)/login/page.tsx"` passes.
   * `npm run build` passes with elevated permission to update `.next` artifacts.

## Feature: KathaLife Dark Theme Design Tokens

**Routes/Files:** `/src/app/globals.css`, `/src/app/layout.tsx`, `/src/components/UserMenuDropdown.tsx`, `/tailwind.config.ts`

### Key Architectural Decisions & Fixes

1. **Global Token System**
   * Added the KathaLife dark theme variables for background layers, purple brand scale, text colors, accents, radius, shadows, and mobile bottom navigation height.
   * Kept legacy aliases such as `--bg-app`, `--primary`, `--accent`, and `--border` mapped to the new dark theme tokens so existing screens can migrate gradually.

2. **Font Token Wiring**
   * Loaded `DM Sans`, `Playfair Display`, and `Lora` through `next/font/google`.
   * Added CSS font tokens (`--font-body`, `--font-display`, `--font-journal`) and matching Tailwind font-family aliases.

3. **User Menu Dark Theme Migration**
   * Updated `UserMenuDropdown` from the old warm brown palette to the new dark purple surface, border, glow, and text tokens.
   * Replaced hard-coded menu danger styling with the new `--accent-rose` token.

4. **Verification**
   * `npx tsc --noEmit` passes.
   * `npm run build` passed once with elevated permission; later sandboxed reruns were blocked by `.next` file permissions.
   * `npm run lint` is still blocked by pre-existing unrelated lint issues in auth, services, and landing page files.

## Feature: Bio Profile Page Implementation

**Route:** `/src/app/(protected)/bio/page.tsx`

### Key Architectural Decisions

1. **Config-Driven Forms (`bioFields`)**
   * Built an array-based config approach for form inputs (`fullName`, `dateOfBirth`, `hometown`, `occupation`, `familyNotes`).
   * This dramatically improves extensibility: To add a new field such as "Hobbies", developers only need to add an object to the `bioFields` array rather than writing explicit JSX inputs.

2. **Parallel Data Fetching**
   * Used `Promise.all()` in the initialization effect to fetch both the user profile (`userService.getBioProfile`) and the available languages (`userService.getLanguages`) simultaneously, resolving the loading spinner much faster.

3. **Partial Updates**
   * Built payload sanitization before calling the `userService.updateBioProfile` API, effectively stripping out completely blank values. This allows for clean "partial updates" so unwritten fields aren't inadvertently wiped clean server-side.

4. **UI Styling (Soft Dawn Theme)**
   * Adopted all global CSS classes like `.auth-card`, `.auth-page`, and `.input`.
   * Set specific local overrides for the `<textarea />` inputs via the config map block (e.g. enforcing height limits) without needing entirely new CSS properties.
   * Designed the main page loader to inherit the primary border color so it shows vividly on light background views.

5. **Flow Control**
   * On successful update, calls `setBioCompleted(true)` context to ensure global app layout states recognize the user has completed their onboarding flow before softly routing them back to `/journal`.

## Feature: Diary-Style Journal UI

**Route:** `/src/app/(protected)/journal/page.tsx`

### Key Architectural Decisions

1. **Immersive Diary Aesthetics**
   * Built a custom CSS class `.diary-paper` using `repeating-linear-gradient` to create a realistic ruled notebook paper background.
   * Imported the Google Font `Patrick Hand` and integrated it globally via Next.js `layout.tsx` to give user entries an emotional, handwritten feel.
   * Line height mapping (32px) directly synchronizes the text spacing to sit perfectly flush upon the dotted lines from the CSS background layer.

2. **Fluid Auto-Expanding Input**
   * Integrated a seamless JS `onChange` event in the `textarea` reference so the box expands dynamically with the user's content as they write instead of using ugly browser scrollbars. 
   * Configured strict `storyLocked` visual and logical restraints directly disabling the input bounds when historical edits are restricted.

## Feature: Journal API Integration & UI Enhancements

**Routes:** `/src/app/(protected)/journal/page.tsx` & `/src/services/journalService.ts`

### Key Architectural Decisions & Fixes

1. **Real API Integration**
   * Replaced the placeholder mock service with real Axios calls pointing to `GET /v1/journal/activities?date=YYYY-MM-DD` and `POST /v1/journal/activities`.

2. **Response Unwrapping Fix (`data.data`)**
   * Discovered that the backend wraps successful responses in a standard payload envelope (`{ success, message, data, timestamp }`). 
   * Updated the Axios `api.get` call to return `response.data.data` so the UI component receives the actual journal entity instead of the wrapper object.

3. **Type Alignment (`activityDate`)**
   * Fixed a TypeScript schema mismatch where the frontend expected `date` but the backend provided and required `activityDate`.

4. **Deterministic Day Numbers**
   * Replaced random day number generation with a stable, math-based calculation tracking the difference in days from a fixed start date (`2026-04-01`), ensuring historical entries consistently show the correct "Day X" label.

5. **Navigation & Menus**
   * Integrated a native `<input type="date" />` picker for exact-date historical navigation.
   * Added a floating top-right profile dropdown menu containing quick links to "Edit Bio" and "Logout".

## Feature: Weekly Dashboard Implementation

**Route:** `/src/app/(protected)/week/page.tsx`

### Key Architectural Decisions

1. **Dual-Layer Weekly UI**
   * Created a distinct "Week Strip" for quick visual tracking of the 7 days (Mon-Sun), indicating entry presence (✅ / ○) and highlighting the current day.
   * Beneath the strip, stacked rich Day Cards containing 35-character previews to provide immediate context for existing journal entries without needing to navigate into them.

2. **Contextual Date Parsing**
   * Prevented local timezone shifting by isolating day derivations directly from string extraction (`parseInt(dateStr.split('-')[2])`) rather than parsing historical strings through standard JS `Date` constructors.

3. **Gamified Story Triggers**
   * Built UI states and derived logical calculations restricting the core "Create My Story" action to users who have met threshold conditions (`totalEntries >= 5` or trigger override on Saturdays) to encourage consistent daily engagement.

## Feature: Journal Header UX Redesign

**Route:** `/src/app/(protected)/journal/page.tsx`

1. **Layout Organization**: Centered the `Day X` text perfectly using absolute centering constraints while shifting the strict date values to the left column.
2. **Calendar Popover Panel**: Replaced the native `<input type="date">` top-level placement with an interactive dropdown calendar module offering the exact same date jump functionality, preventing layout shifting on mobile screens.
3. **Weekly Navigation Integration**: Injected a contextual routing button inside the calendar panel to cross-navigate to `/week`, binding related temporal contexts into a single visual anchor.
