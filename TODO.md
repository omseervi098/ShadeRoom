# ShadeRoom TODO List

## UI/UX Improvements
- [x] Add clear visual feedback when a mask is selected (highlight, border, etc.)
- [] Refactor action bar to support more actions (apply texture/color, duplicate, etc.)
- [ ] Implement keyboard shortcuts for common actions (delete, deselect, etc.)
- [ ] Show helpful hint in action bar when no mask is selected (e.g., "Select a region to see actions")
- [ ] Make sure action bar is mobile-friendly (touch targets, layout)

## Mask Management
- [ ] Add confirmation dialog for mask deletion (optional, for safety)
- [x] Allow undo for mask actions (add, delete)

## Color/Texture Application
- [x] Integrate color/texture picker into side bar
- [ ] Apply color/texture to selected mask(s) and update canvas in real-time
- [x] Support saving/loading user-defined color/texture palettes 
- [ ] How to apply texture while maintaining perspective transformation

## Backend/ML
- [x] Optimize backend mask embedding generation for speed
- [ ] Look for SAM 2.1, if we could use it

---

## General
- [ ] Add user onboarding/help overlay for new users
- [ ] Review and update README with new features and UX patterns
- [ ] Review whole codebase see if we can make it faster.

