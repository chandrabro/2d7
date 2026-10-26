# StoryStage – 2D Story Animator

Make 2D animated stories entirely in your browser. No install, no server, no API keys.

- **Characters**: 40+ ready-made characters (Indian farmer, Nepali farmer, Nepali / Indian police, pilot, air hostess, doctor, nurse, teacher, students, kids, chef, king, queen, pirate, wizard, astronaut, bride, groom, monk, grandparents…) or build your own: gender, age, body, skin tone, 16 hair styles, hair / eye colour, facial hair, glasses, 15 tops, bottoms, shoes, 23 hats (dhaka topi, turban, police cap, pilot cap, crown, hijab…), accessories.
- **50 scenes** in 6 categories (home, farm & nature, city, school & work, fantasy & adventure, events) with day / dawn / sunset / night lighting, weather (rain, snow, fog, sun rays, leaves) and colour filters.
- **65+ actions**: all 50 requested (digging, watering, chopping wood, crying, laughing, walking, running, dancing, sweeping, cooking, typing, sword, magic, sleeping…) plus salute, namaste, bow, shrug, cheer, selfie and more. Characters walk/run to any point you choose and turn automatically.
- **Up to 3 characters per scene**, drag them on the stage, set facing (left / right / to camera), size and depth.
- **Camera per scene**: wide, medium, close-up, low / high angle, pans, zooms, dolly, handheld shake or fully custom start → end.
- **Dialog**: browser text-to-speech (free, no setup), microphone recording, or upload mp3/wav. Every line has its own start time, so characters **never talk over each other** unless you want them to; the timeline marks overlaps in red and *Auto-sequence* fixes them in one click. Lip-sync follows the real audio. Speech bubbles with 4 styles.
- **Extras**: captions & titles, scene transitions (fade, dissolve, slide, wipe, iris), background music, 16:9 / 9:16 / 1:1 / 4:3, undo/redo, autosave, project files with embedded audio, PNG snapshots.
- **Export**: real MP4 (H.264 + AAC) rendered frame-by-frame in the browser with WebCodecs. Also a live recording mode that captures the tab's audio so browser TTS voices end up in the video, and a WebM fallback.

## Measure all voices (one click) – fixes cut-off lines and early lip-sync

Browser voices (Web Speech API) are only *estimated* by the editor, and online "Natural" voices (Edge: Sagar, Hemkala, Madhur…) need a moment before the first sound. That caused (1) scenes ending in the middle of a line and (2) mouths moving before the voice was heard.

Click **⏱ Measure voices** in the top bar (or Dialog tab → *Measure all voices*):

1. Every browser-voice line of every scene is spoken silently once and timed (real length + start-up delay of the voice). It takes about as long as the story itself, so keep the tab open and in front. Finished lines are remembered (`mSig`/`mDur`/`mLat` in the project), so cancelling and re-running continues where it stopped; edited lines are re-measured automatically.
2. Each scene is re-laid out: lines one after another with your chosen pause, every line gets its real length (+0.1 s safety), the scene length = last line + quiet end. Actions and captions are re-timed so they still match the same lines (narration subtitles snap exactly to their line).
3. The start-up delay (median per voice) is stored as `lead` on every dialog. During preview and *Live recording with tab audio*, the voice is started `lead` seconds early so sound and mouth begin together.
4. Fine-tune everything at once with **Settings → Voice sync offset**, or one line with **Dialog → Voice pre-start**.

Ctrl+Z undoes the whole operation. Changes in this version: `js/audio/retime.js` (new), `js/ui/measureAllPanel.js` (new), `js/audio/tts.js` (voice lookup by exact name / language / distinctive name word, `measureSpeech`), `js/audio/player.js`, `js/state.js`, `js/ui/dialogPanel.js`, `js/ui/settingsPanel.js`, `js/export/exporter.js` (video clock now starts together with the voices), `index.html`, `js/main.js`.

## Video has no sound? (browser voices are hard to record)

Browser voices (Web Speech: Edge "Natural", Google, Windows voices) are played by the browser / operating system, **not** by the page. Many browsers therefore do **not** include them in "tab audio", so *Live recording with tab audio* can produce a silent video even though you ticked "Share tab audio". The export window now shows a **sound meter** while recording and a red warning at the end if nothing was captured.

Three ways to get sound, best first:

1. **Real voice files (recommended, most reliable, fast MP4 export)** – `make_voices.py` (in the separate **voice-tools** download – it is NOT part of the website, so Vercel/GitHub only see static files) creates the same Microsoft neural voices as real MP3 files and embeds them in the project:
   ```
   pip install edge-tts mutagen
   python make_voices.py maya-ko-jat-hudaina.storystage.json
   ```
   It writes `…voiced.storystage.json` (needs internet, ~1–2 minutes). Open that file with **Open…** and use **Export → MP4 – fast, frame-perfect**: voices, exact scene lengths and lip-sync are all included. Voice mapping: सागर/Sagar → `ne-NP-SagarNeural`, हेमकला/Hemkala → `ne-NP-HemkalaNeural`, Madhur → `hi-IN-MadhurNeural`, Swara → `hi-IN-SwaraNeural` (add more with `--map "name part=xx-XX-NameNeural"`; list voices with `edge-tts --list-voices`).
2. **Live recording with SYSTEM audio** (Windows / ChromeOS, Chrome or Edge) – in the share dialog choose **Entire screen** and tick **Also share system audio**. Records every sound the PC plays, including OS / Edge voices. Close other sounds first.
3. **Live recording with tab audio** – only works if your browser puts its voices into the tab's audio. Watch the meter.

## Run it

Just open the folder on any static host. Locally you can run `python3 -m http.server` in the folder and open http://localhost:8000 (ES modules need http://, not file://).

### Deploy on GitHub + Vercel (no software needed)

1. Create a new repository on https://github.com/new (for example `story-animator`).
2. On the empty repository page click **uploading an existing file**, drag **all files and folders** of this project in (index.html, css/, js/, vercel.json, README.md) and press **Commit changes**.
3. Go to https://vercel.com, sign in with GitHub, click **Add New → Project**, pick the repository and press **Deploy**. Framework preset: *Other*. No build command, no output directory needed.
4. Vercel gives you a URL like `https://story-animator.vercel.app`. Every time you upload new files to GitHub, Vercel redeploys automatically.

GitHub Pages also works (Settings → Pages → Deploy from branch → main / root).

## Browser support

| Feature | Chrome / Edge / Brave (desktop) | Safari | Firefox |
|---|---|---|---|
| Editor & preview | ✅ | ✅ | ✅ |
| MP4 export (WebCodecs) | ✅ | ⚠️ partial | ❌ use WebM fallback |
| Live export with tab audio (TTS) | ✅ | ❌ | ❌ |
| Browser voices (TTS) | ✅ | ✅ | ✅ |
| Mic recording | ✅ | ✅ | ✅ |

Use desktop Chrome or Edge for the full experience. The MP4 encoder library (Mediabunny, MIT) is loaded from a CDN the first time you export; everything else is in this folder.

## How TTS and export work together

The fast MP4 export renders every frame offline and mixes recorded / uploaded audio and music. Browser voices (Web Speech API) cannot be captured offline, so for dialogs that use a browser voice you have two options:

1. **Export → "Live recording with tab audio"**: the movie plays in real time while Chrome records the tab, including the voices. Choose *this tab* in the share dialog and enable *Share tab audio*.
2. Record the line with your microphone (Dialog → Voice source → Record) or upload an audio file. Those are always included in the fast export, with lip-sync.

## Project structure

```
index.html            app shell
css/app.css           theme
js/main.js            state, playback, undo, persistence
js/state.js           project model + demo story
js/engine/            pure rendering engine (deterministic: same time → same pixels)
  renderer.js         frame composition, camera, bubbles, captions, transitions
  character.js        2D rig (body, limbs, outfits)  face.js (expressions, hair, hats)  props.js
  actions.js          65+ keyframed actions         presets.js (ready-made characters)
  scenery.js          drawing helpers               scenes/*.js (50 backgrounds)
js/audio/             audio store (IndexedDB), player, TTS, recorder, offline mixer
js/export/exporter.js MP4 (WebCodecs + Mediabunny), WebM and live-capture export
js/ui/                editor panels
test/                 gallery pages used to check scenes / actions (open test/gallery.html?file=all)
```

## Keyboard

`Space` play/pause · `←` `→` step 0.1 s (`Shift` = 1 s) · `Home` / `End` · `Ctrl+Z` / `Ctrl+Y` undo / redo · `Esc` cancel · `Ctrl + wheel` zoom timeline · double-click a timeline track to add an action / dialog.

## License

MIT. Fonts from Google Fonts, MP4 muxing by [Mediabunny](https://mediabunny.dev) (MIT).

## 🎙 Cast voices (Gemini / AI Studio) – one place for all characters

Click **🎙 Cast voices** in the top bar.

1. Paste your free key from https://aistudio.google.com (Get API key). It is stored only in this browser, never in the project file. Press **Test key & voice**.
2. For the **Narrator** and for **each character**, choose an engine:
   - **Keep as is** – lines are not touched.
   - **Browser voice** – Edge/Chrome voice, optional rate/pitch (blank = keep the line's own value).
   - **Gemini (AI Studio)** – pick one of 30 voices and an optional *Style / acting* text (e.g. "Say slowly in a deep, old man's voice").
3. Use **▶ Preview** to hear a voice on that character's first line.
4. Press **▶ Apply to all scenes & generate**. Every Gemini line is generated, stored inside the project as audio, and each scene is re-timed to the real length of the speech, so lip-sync and scene ends match exactly.

Notes
- Free keys have rate limits: the app pauses between requests and waits/retries automatically. Press the button again to retry only failed lines. Already generated lines are skipped unless text, voice or style changed.
- If you see "404 model not found", copy the current text-to-speech model name from AI Studio into the Model box.
- Gemini lines are real audio, so the fast MP4 export includes the sound. Browser-voice lines still need **⏱ Measure voices** and the live export.
- Lines you recorded or uploaded yourself are never changed.
