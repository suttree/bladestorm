# bladestorm — CrazyGames build

Single-file submission build (`index.html`) — no separate asset folder needed,
since all art is drawn procedurally on canvas and all audio is synthesized
with the Web Audio API. Just upload `index.html` as-is.

## What's wired up

- **SDK**: `crazygames-sdk-v3.js` loaded via `<script src>`, initialized in a
  fire-and-forget async block that never blocks the Start button. Every SDK
  call is wrapped in `sdkReady` checks + try/catch, so the game plays
  identically (with local `localStorage` only) when tested outside
  crazygames.com — confirmed via the SDK's own `sdkDisabled` response when
  loaded from a non-whitelisted domain.
- **Data module**: `bladestorm_best` (high score) and `bladestorm_muted` are
  written to `localStorage` immediately and mirrored to
  `SDK.data.setItem`/`getItem` once the SDK is ready, with cloud values
  reconciled against local on load (`syncCloudData`). This survives iframe
  storage partitioning and syncs across devices, which plain `localStorage`
  can't do once embedded.
- **Game events**: `gameplayStart()` fires when Start/Retry begins a run,
  `gameplayStop()` fires on death, and `happytime()` fires on a new high
  score.
- **Ads**: a `midgame` ad is requested right as the game-over screen would
  otherwise appear (natural break point — the run just ended). Audio ducks
  to silent for the ad's duration and restores afterward (respecting the
  player's own mute setting). A 6-second safety timeout guarantees the
  overlay reveals itself even if the ad callback never fires or ads are
  blocked/sitelocked in the test environment.

## Store listing copy

**Title:** BLADESTORM

**Description:**
> Pilot a lone ship against an endless robot horde. Zap enemies with your
> crackling energy orb, hurl it out as a wide plasma globe that boomerangs
> back, and unleash a repel to scatter a crowd before it overwhelms you.
> Newtonian flight, screen-wrapping arena, and a bullet-hell boss every 5
> waves.

**Tagline (short card / search result):**
> Horde-mode survival with a boomeranging plasma orb and Newtonian
> dogfighting.

## Cover art

`cover-square-800x800.png`, `cover-landscape-1920x1080.png`, and
`cover-portrait-800x1200.png` are included in this folder, at the exact
pixel dimensions CrazyGames expects. They're vector compositions rendered
straight from the game's own visual language (same ship/bot/boss silhouettes,
same neon palette) rather than photos or hand-drawn art — sources are in
`../covers/src-*.html` if the copy or composition ever needs to change.

## Gameplay preview video

`preview-landscape-1920x1080.mp4` and `preview-portrait-1080x1920.mp4` are
included in this folder — real recorded gameplay, not a mockup. They were
captured with Playwright driving the actual `index.html` build headlessly:
scripted keyboard input flies the ship, swings, throws the orb, and repels
for ~28 seconds while Chromium's video recorder captures the canvas at
native resolution (portrait uses touch emulation so the mobile joystick/
SWING/THROW/REPEL buttons are visible, matching what a phone player sees).
No manual screen capture, no editing.

Source/regeneration script: `../covers/video-src/record.js`. To re-record
(e.g. after a gameplay change):
```
cd covers/video-src
npm install
npx playwright install ffmpeg   # one-time, only if not already cached
node record.js
```
This produces `.webm` files; convert to `.mp4` with:
```
ffmpeg -i out/landscape.webm -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart landscape.mp4
```

## Testing checklist before upload

- [ ] Play a full run end-to-end on crazygames.com's test upload flow to
      confirm the SDK actually initializes there (`sdkReady: true`) and the
      midgame ad fires
- [ ] Confirm `bladestorm_best` persists across a page reload and (once live)
      across devices when logged into a CrazyGames account
- [ ] Test on mobile viewport — touch controls (joystick + SWING/THROW/REPEL
      buttons) are already wired up and mutually exclusive with the
      desktop control hints
