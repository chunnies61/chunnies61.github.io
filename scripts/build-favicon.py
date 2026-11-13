#!/usr/bin/env python3
"""Builds the site's favicon: the rounded star-burst badge from portfolio.chsmc.org, in purple.

One flat colour, one bold silhouette with soft corners, filling its canvas, on a
transparent ground. The shape's numbers below were fitted to that site's favicon.

  python3 scripts/build-favicon.py             # writes public/favicon.svg, favicon.ico, apple-touch-icon.png
  python3 scripts/build-favicon.py --preview out.png   # a size comparison sheet instead

Needs Pillow (pip install pillow). Tweak COLOR / POINTS / DEPTH / ROUND_* / ROTATE below to change it.
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

COLOR = "#8B5CF6"    # purple
POINTS = 10          # number of points
DEPTH = 0.85         # inner radius / outer radius of the points: 1.0 is a plain polygon, lower is spikier
ROUND_OUT = 0.13     # corner radius at the points, as a fraction of the outer radius
ROUND_IN = 0.11      # corner radius in the notches
ROTATE = 0.0         # degrees clockwise from "one point straight up"
FILL = 0.961         # share of the canvas height the shape fills
ROOT = Path(__file__).resolve().parent.parent


def vertices(depth):
    """Alternating outer / inner vertices, one point straight up, clockwise on screen."""
    pts = []
    for i in range(POINTS * 2):
        r = 1.0 if i % 2 == 0 else depth
        a = -math.pi / 2 + math.radians(ROTATE) + i * math.pi / POINTS
        pts.append((r * math.cos(a), r * math.sin(a)))
    return pts


def outline(depth, r_out, r_in, samples=14):
    """The rounded outline as (svg path commands, dense polygon). Unit outer radius, centred on 0,0."""
    v = vertices(depth)
    n = len(v)
    cmds, dense, fillets = [], [], []
    for i, p in enumerate(v):
        a, b = v[i - 1], v[(i + 1) % n]
        rad = r_out if i % 2 == 0 else r_in
        ux, uy = a[0] - p[0], a[1] - p[1]
        vx, vy = b[0] - p[0], b[1] - p[1]
        lu, lv = math.hypot(ux, uy), math.hypot(vx, vy)
        ux, uy, vx, vy = ux / lu, uy / lu, vx / lv, vy / lv
        theta = math.acos(max(-1, min(1, ux * vx + uy * vy)))
        t = rad / math.tan(theta / 2)
        s = (p[0] + ux * t, p[1] + uy * t)
        e = (p[0] + vx * t, p[1] + vy * t)
        bis = (ux + vx, uy + vy)
        lb = math.hypot(*bis)
        d = rad / math.sin(theta / 2)
        c = (p[0] + bis[0] / lb * d, p[1] + bis[1] / lb * d)
        cross = (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])
        fillets.append((s, e, c, rad, 1 if cross > 0 else 0))
    for i, (s, e, c, rad, sweep) in enumerate(fillets):
        cmds.append(("M" if i == 0 else "L", s))
        cmds.append(("A", (rad, e, sweep)))
        a0 = math.atan2(s[1] - c[1], s[0] - c[0])
        a1 = math.atan2(e[1] - c[1], e[0] - c[0])
        da = (a1 - a0 + math.pi) % (2 * math.pi) - math.pi
        for k in range(samples + 1):
            ang = a0 + da * k / samples
            dense.append((c[0] + rad * math.cos(ang), c[1] + rad * math.sin(ang)))
    return cmds, dense


def fitted(depth, r_out, r_in, size):
    """Outline scaled and centred to fill `size` × `size` (FILL of its height)."""
    cmds, dense = outline(depth, r_out, r_in)
    xs, ys = [p[0] for p in dense], [p[1] for p in dense]
    k = FILL * size / (max(ys) - min(ys))
    ox = size / 2 - k * (max(xs) + min(xs)) / 2
    oy = size / 2 - k * (max(ys) + min(ys)) / 2
    f = lambda p: (p[0] * k + ox, p[1] * k + oy)
    return cmds, [f(p) for p in dense], k


def svg_path(depth, r_out, r_in, size=64):
    cmds, _, k = fitted(depth, r_out, r_in, size)
    _, dense = outline(depth, r_out, r_in)
    xs, ys = [p[0] for p in dense], [p[1] for p in dense]
    ox = size / 2 - k * (max(xs) + min(xs)) / 2
    oy = size / 2 - k * (max(ys) + min(ys)) / 2
    f = lambda p: f"{p[0] * k + ox:.2f} {p[1] * k + oy:.2f}"
    parts = []
    for op, arg in cmds:
        if op in "ML":
            parts.append(f"{op}{f(arg)}")
        else:
            rad, e, sweep = arg
            parts.append(f"A{rad * k:.2f} {rad * k:.2f} 0 0 {sweep} {f(e)}")
    return " ".join(parts) + " Z"


def raster(depth, r_out, r_in, px, color=COLOR, background=None, scale=1.0):
    """Supersampled PNG of the shape at px × px; `scale` < 1 pads it (for the touch icon)."""
    ss = 8
    _, dense, _ = fitted(depth, r_out, r_in, px * ss)
    c = px * ss / 2
    dense = [(c + (x - c) * scale, c + (y - c) * scale) for x, y in dense]
    mask = Image.new("L", (px * ss, px * ss), 0)
    ImageDraw.Draw(mask).polygon(dense, fill=255)
    mask = mask.resize((px, px), Image.LANCZOS)
    img = Image.new("RGBA", (px, px), background or (0, 0, 0, 0))
    img.paste(Image.new("RGBA", (px, px), color), (0, 0), mask)
    return img


def preview(path):
    variants = [(0.92, "0.92 softer"), (0.85, "0.85 (chosen)"), (0.78, "0.78 spikier")]
    sheet = Image.new("RGB", (900, 130 * len(variants) + 20), "white")
    d = ImageDraw.Draw(sheet)
    for row, (depth, label) in enumerate(variants):
        y = 20 + row * 130
        x = 20
        for px in (96, 48, 32, 16):
            sheet.paste(raster(depth, ROUND_OUT, ROUND_IN, px), (x, y + (96 - px) // 2), raster(depth, ROUND_OUT, ROUND_IN, px))
            x += px + 24
        dark = Image.new("RGBA", (96, 96), (38, 38, 42, 255))
        dark.alpha_composite(raster(depth, ROUND_OUT, ROUND_IN, 48), (24, 24))
        sheet.paste(dark.convert("RGB"), (330, y))
        d.text((460, y + 40), label, fill=(60, 60, 60))
    sheet.save(path)
    print("wrote", path)


def build():
    path = svg_path(DEPTH, ROUND_OUT, ROUND_IN)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        f'<path fill="{COLOR}" d="{path}"/></svg>\n'
    )
    (ROOT / "public/favicon.svg").write_text(svg)
    sizes = [16, 32, 48]
    frames = [raster(DEPTH, ROUND_OUT, ROUND_IN, 256)]
    frames[0].save(ROOT / "public/favicon.ico", sizes=[(s, s) for s in sizes])
    # iOS fills transparency with black, so the touch icon gets a white ground and some air
    touch = raster(DEPTH, ROUND_OUT, ROUND_IN, 180, background=(255, 255, 255, 255), scale=0.74)
    touch.convert("RGB").save(ROOT / "public/apple-touch-icon.png")
    print("wrote public/favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png")


if __name__ == "__main__":
    if "--preview" in sys.argv:
        preview(sys.argv[sys.argv.index("--preview") + 1])
    else:
        build()
