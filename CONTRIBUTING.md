# Contributing to IPL Auction Room 🏏

First off, thank you for considering contributing to IPL Auction Room! It's open-source projects like this that make the cricket and web development communities such amazing places to learn and build together.

## 🚀 How Can I Contribute?

### 1. Reporting Bugs
- Search existing issues to avoid duplicates.
- Use the **Bug Report** issue template.
- Include step-by-step instructions to reproduce the bug, expected vs actual behavior, and error tracebacks.

### 2. Suggesting Enhancements
- Use the **Feature Request** issue template.
- Explain clearly why this enhancement would be useful to IPL auction players or room hosts.

### 3. Submitting Pull Requests
1. Fork the repo and create your branch from `main`:
   ```bash
   git checkout -b feature/my-amazing-feature
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes and write/update tests as needed.
4. Run validation checks locally before pushing:
   ```bash
   npm run type-check
   npm run test
   npm run build
   ```
5. Commit your changes with clear, descriptive commit messages.
6. Push to your fork and submit a Pull Request to `main`.

---

## 🎨 Coding & Architectural Guidelines

- **TypeScript Strictness**: Do not use `any` types unless strictly necessary. Maintain full type safety.
- **Design System**: Use Vanilla CSS / Tailwind CSS matching the existing dark glassmorphism theme (`amber-400`, `slate-950`, `slate-900`).
- **Server Authoritative**: All auction state modifications must originate from `AuctionEngine` methods, never mutated directly on the client.
- **Verification**: Never submit a PR without running `npm run type-check` and `npm run test`.

Thank you for helping make IPL Auction Room awesome!
