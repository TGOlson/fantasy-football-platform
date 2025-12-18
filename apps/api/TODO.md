# API TODOs

## Future Authentication Enhancements

- [ ] **OAuth Support** - Add Google OAuth login
  - Consider adding other providers (GitHub, Apple, etc.)
  - Use Passport.js or similar OAuth library
  - Allow linking multiple auth methods to one account
- [ ] **Session management** - Consider refresh tokens for longer sessions
- [ ] **2FA support** - Two-factor authentication for security

## Notes

- Current implementation: Password-based auth with bcrypt + JWT
- Keep password auth as fallback even after adding OAuth
