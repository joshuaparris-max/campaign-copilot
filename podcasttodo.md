# Podcast Integration TODO

**Decision:** Add — strong fit.  
**Status:** ✅ Core one-click podcast bank added 13 September 2026.
**Topic bank:** dungeon mastering, campaign prep, improv, encounter design, worldbuilding, RPG writing.

## TODO
- [x] Use the shared 25-episode D&D/DM Spotify bank from JoshHub.
- [x] Add a collapsed bottom dock: **🎲 Listen to a different DM podcast**.
- [x] One tap selects/loads another episode; persist recent choices and avoid immediate repeats.
- [x] Use Spotify embed/deep links without assuming autoplay.
- [x] Shared episode tags cover prep, improv, encounters, NPCs, worldbuilding and story craft.
- [x] Collapse when standard HTML audio/video begins and while the user is typing into campaign forms.
- [x] Keep campaign-planning controls primary through the collapsed dock design.
- [x] Shared dock supplies mobile/a11y, reduced-motion and persistence behaviour; app-specific automated tests can be added later.

## Implementation
`index.html` loads JoshHub's shared `dnd` catalogue through `podcast-dock-universal.js` with `data-quiet-on-input="true"`.
