/** Build a silent 15-second photo montage. Usage: node scripts/create-homepage-reel.cjs /path/to/ffmpeg */
const { spawnSync } = require("node:child_process");
const { mkdirSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ffmpeg = process.argv[2] || "ffmpeg";
const images = ["home-drone-flight.webp", "home-drone-operator.webp", "field-drone-editorial.webp"];
mkdirSync(path.join(root, "public", "videos"), { recursive: true });
const filters = images.map((_, index) => {
  const zoom = index === 1 ? "1.08-on*0.0005" : "1.015+on*0.0005";
  return `[${index}:v]scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,zoompan=z='${zoom}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=125:s=1280x720:fps=25,trim=duration=5,setpts=PTS-STARTPTS,setsar=1,format=yuv420p,fade=t=in:st=0:d=0.25,fade=t=out:st=4.75:d=0.25[v${index}]`;
});
filters.push("[v0][v1][v2]concat=n=3:v=1:a=0[out]");
const args = ["-y", "-hide_banner", "-loglevel", "warning", "-filter_complex_threads", "1"];
for (const image of images) args.push("-i", path.join(root, "public", "assets", image));
args.push("-filter_complex", filters.join(";"), "-map", "[out]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "25", "-threads", "2", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(root, "public", "videos", "manakrishi-field-reel.mp4"));
const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
