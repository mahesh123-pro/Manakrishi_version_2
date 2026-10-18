# Homepage field reel

`manakrishi-field-reel.mp4` is a silent, 15-second, 1280×720 H.264 photo montage. It animates three illustrative AI-generated photographs with gentle camera moves and fades. It is **not generated drone-flight footage or a recording of a real service visit**.

Sources, in order: `home-drone-flight.webp`, `home-drone-operator.webp`, `field-drone-editorial.webp` in `public/assets/`.

Rebuild with `node scripts/create-homepage-reel.cjs /path/to/ffmpeg`. No video library is added to the website runtime. The video loads when the fullscreen hero slideshow reaches its fourth slide, or a visitor selects that slide. The slideshow provides pause/play and previous/next controls. Playback pauses when the media leaves the viewport or the tab becomes hidden. Reduced-motion preferences disable autoplay until explicitly started.

To replace the montage with generated motion footage, connect a video-generation provider such as Runway. Suggested motion brief: a slow tracking shot of an agricultural drone spraying over a Telangana paddy field at sunrise; mechanically consistent six-rotor drone, subtle rotor blur and fine mist, natural crop movement, smooth restrained camera, no text or logos. A second shot can show the operator conducting a quiet pre-flight check beside the grounded drone. Preserve the page's image fallback and native playback controls.
