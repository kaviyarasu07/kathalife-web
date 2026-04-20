# Changes Made — Automated Additions

Date: 2026-04-14

This document summarizes all files added/modified by the recent automated change set.

## New files

- `src/types/index.ts`
  - All backend DTOs as TypeScript interfaces.
  - Includes: Auth types, User/Bio/LifeSummary types, Language types, Journal types, and `ApiResponse<T>` wrapper.

- `src/services/api.ts`
  - Axios instance configured with `baseURL` using `NEXT_PUBLIC_API_URL` fallback.
  - Request interceptor that attaches `Authorization: Bearer <accessToken>` (client-side only).
  - Response interceptor handling HTTP 401 by attempting a token refresh at `/v1/auth/refresh`. If refresh fails, clears storage and redirects to `/login`.
  - Type adjustments made to satisfy TS/Axios types (use `InternalAxiosRequestConfig` and ensure headers exist before assignment).

- `src/services/authService.ts`
  - Pure service methods: `signup`, `login`, `forgotPassword`, `resetPassword`, `logout`.
  - Uses `api` instance and returns strongly typed results; includes error parsing to produce meaningful Error objects.

- `src/services/userService.ts`
  - Pure service methods: `getCurrentUser`, `getBioProfile`, `updateBioProfile`, `getLifeSummary`, `updateLifeSummary`, `getLanguages`.
  - All methods return typed responses and handle errors consistently.

- `src/services/journalService.ts`
  - Pure service methods for journal activities: `saveActivity`, `getActivityByDate`, `getWeekActivities`, `deleteActivity`, `restoreActivity`, `getDeletedActivities`.
  - Returns typed DTOs and handles errors.

- `src/context/AuthContext.tsx`
  - Client-side React context/provider for authentication state.
  - Exposes: `isAuthenticated`, `isLoading`, `userId`, `email`, `bioCompleted`, `login`, `logout`, `setBioCompleted`.
  - Persists tokens and user metadata to `localStorage` and initializes state on mount (client-only checks included).

- `.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:8080/api`

## Important implementation notes

- TypeScript strict: no `any` was introduced in the added files.
- All API calls include error handling; services throw Error objects with backend messages when available.
- Axios interceptors were typed to avoid compilation issues and to ensure headers are present when assigning the Authorization header.
- Client-side checks (`typeof window !== 'undefined'`) guard access to `localStorage`.

## Verification / Next steps

1. Ensure dependencies are installed: `npm install`.
2. Start the dev server: `npm run dev`.
3. Test flows in the browser (login/signup, token refresh, protected API calls). Check browser console and Network tab for errors.

If you want, I can also:
- Create a small sample login page wired to `authService` and `AuthContext`.
- Add unit tests for the service layer.
- Add a CHANGELOG entry or more formal release notes.

