"""Render the original KETHER ice archive plates as a silent, seamless 12s loop.

Requires Pillow and ffmpeg. The three source plates live in assets/cinema/.
"""

from __future__ import annotations

import math
import random
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PLATES = ROOT / "assets" / "cinema"
PUBLIC = ROOT / "public"
FPS = 24
WIDTH, HEIGHT = 1280, 720
DURATION = 12


def make_particles(directory: Path) -> None:
    rng = random.Random(99113)
    flakes = [
        (rng.random(), rng.random(), rng.uniform(0.18, 1), rng.random() * math.tau)
        for _ in range(105)
    ]
    for frame in range(FPS * DURATION):
        t = frame / FPS
        veil = Image.new("RGBA", (WIDTH // 2, HEIGHT // 2), (0, 0, 0, 0))
        draw = ImageDraw.Draw(veil, "RGBA")
        for x0, y0, depth, phase in flakes:
            x = int(((x0 + t * (0.006 + depth * 0.013) + math.sin(t * 0.9 + phase) * 0.013) % 1) * 640)
            y = int(((y0 + t * (0.022 + depth * 0.046)) % 1) * 360)
            radius = max(1, round(depth * 2.5))
            alpha = int(35 + depth * 105)
            color = (175, 244, 250, alpha) if depth < 0.8 else (240, 220, 178, alpha)
            draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=color)
            if depth > 0.8:
                draw.line((x, y, x-3-depth*5, y+5+depth*8), fill=(183, 238, 244, alpha // 2), width=1)

        # Energy impact near the right-side monolith. It rises and decays into
        # the next shot rather than flashing across the text and search field.
        power = max(0, 1 - abs(t - 6) / 1.05)
        if power:
            glow = Image.new("RGBA", veil.size, (0, 0, 0, 0))
            g = ImageDraw.Draw(glow, "RGBA")
            cx, cy = 485, 164
            radius = int(16 + (1 - power) * 195)
            for thickness, opacity in ((14, 34), (5, 100), (1, 165)):
                g.ellipse((cx-radius, cy-radius, cx+radius, cy+radius), outline=(111, 245, 255, int(opacity * power)), width=thickness)
            g.line((360, cy, 640, cy), fill=(157, 247, 255, int(66 * power)), width=2)
            veil = Image.alpha_composite(veil, glow.filter(ImageFilter.GaussianBlur(3)))
        veil.save(directory / f"{frame:03d}.png", optimize=True)


def render() -> None:
    a, b, c = (PLATES / f"shot-{name}.jpg" for name in "abc")
    for plate in (a, b, c):
        if not plate.is_file():
            raise SystemExit(f"Missing original scene plate: {plate}")

    with Image.open(a) as poster:
        poster.save(PUBLIC / "kether-cinema-iceblade-v1.webp", "WEBP", quality=82, method=6)

    with tempfile.TemporaryDirectory(prefix="kether-snow-") as snow:
        snow_dir = Path(snow)
        make_particles(snow_dir)
        sources = [a, b, c, b, a]
        command = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "warning"]
        for plate in sources:
            command += ["-loop", "1", "-framerate", str(FPS), "-t", "3", "-i", str(plate)]
        command += ["-framerate", str(FPS), "-i", str(snow_dir / "%03d.png")]
        filters = [
            "[0:v]zoompan=z='1.02+0.00075*on':x='(iw-iw/zoom)*0.5':y='(ih-ih/zoom)*0.5':d=1:s=1280x720:fps=24,trim=duration=3,setpts=PTS-STARTPTS[v0]",
            "[1:v]zoompan=z='1.055+0.0008*on':x='(iw-iw/zoom)*(0.3+0.004*on)':y='(ih-ih/zoom)*0.45':d=1:s=1280x720:fps=24,trim=duration=3,setpts=PTS-STARTPTS[v1]",
            "[2:v]zoompan=z='1.13-0.0007*on':x='(iw-iw/zoom)*(0.7-0.003*on)':y='(ih-ih/zoom)*0.48':d=1:s=1280x720:fps=24,trim=duration=3,setpts=PTS-STARTPTS[v2]",
            "[3:v]zoompan=z='1.11-0.0008*on':x='(iw-iw/zoom)*(0.58-0.003*on)':y='(ih-ih/zoom)*0.45':d=1:s=1280x720:fps=24,trim=duration=3,setpts=PTS-STARTPTS[v3]",
            "[4:v]zoompan=z='1.073-0.00075*on':x='(iw-iw/zoom)*0.5':y='(ih-ih/zoom)*0.5':d=1:s=1280x720:fps=24,trim=duration=3,setpts=PTS-STARTPTS[v4]",
            "[v0][v1]xfade=transition=fade:duration=0.75:offset=2.25[x1]",
            "[x1][v2]xfade=transition=fade:duration=0.75:offset=4.5[x2]",
            "[x2][v3]xfade=transition=fade:duration=0.75:offset=6.75[x3]",
            "[x3][v4]xfade=transition=fade:duration=0.75:offset=9[x4]",
            "[5:v]scale=1280:720:flags=bilinear,format=rgba[particles]",
            "[x4][particles]overlay=shortest=1:format=auto,format=yuv420p[out]",
        ]
        command += [
            "-filter_complex", ";".join(filters), "-map", "[out]", "-an", "-r", str(FPS),
            "-frames:v", str(FPS * DURATION), "-c:v", "libx264", "-preset", "medium",
            "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(PUBLIC / "kether-cinema-iceblade-v1.mp4"),
        ]
        subprocess.run(command, check=True)


if __name__ == "__main__":
    render()
