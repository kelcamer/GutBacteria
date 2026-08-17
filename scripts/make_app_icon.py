#!/usr/bin/env python3
"""Generate the home-screen icons in pure Python - no Pillow, no ImageMagick.

Neither is installed here, and adding a native image dependency to a repo that
otherwise runs on stdlib + npm is a poor trade for three PNGs. A minimal
encoder (zlib + struct, both stdlib) is ~40 lines and fully deterministic, so
the icons can be regenerated identically on any machine.

Design: the app's own node map, reduced to its essentials - one bright hub with
spokes out to smaller taxa nodes, in the map's real colours (pink = increased,
blue = decreased) on the app's background. Recognisable at 40px on a home
screen, and it looks like what the app actually does.
"""
import math
import struct
import zlib

BG = (0x16, 0x0E, 0x2B)
HUB = (0x8F, 0xD3, 0xF4)
PINK = (0xFF, 0x5C, 0x86)
BLUE = (0x4F, 0xC3, 0xF7)
TEAL = (0x2D, 0xD4, 0xBF)


def render(size):
    px = [[BG for _ in range(size)] for _ in range(size)]
    cx = cy = size / 2
    hub_r = size * 0.085
    node_r = size * 0.042
    ring = size * 0.335
    spokes = 9

    def blend(x, y, color, a):
        if 0 <= x < size and 0 <= y < size and a > 0:
            b = px[y][x]
            px[y][x] = tuple(int(b[i] + (color[i] - b[i]) * min(1.0, a)) for i in range(3))

    def disc(ox, oy, r, color):
        for y in range(int(oy - r - 2), int(oy + r + 3)):
            for x in range(int(ox - r - 2), int(ox + r + 3)):
                d = math.hypot(x + 0.5 - ox, y + 0.5 - oy)
                blend(x, y, color, max(0.0, min(1.0, r - d + 0.5)))  # antialiased edge

    def line(x0, y0, x1, y1, color, w):
        steps = int(math.hypot(x1 - x0, y1 - y0) * 2) + 1
        for i in range(steps + 1):
            t = i / steps
            disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w, color)

    pts = []
    for i in range(spokes):
        a = -math.pi / 2 + i * (2 * math.pi / spokes)
        pts.append((cx + math.cos(a) * ring, cy + math.sin(a) * ring, PINK if i % 2 else BLUE))

    for x, y, c in pts:
        line(cx, cy, x, y, c, size * 0.0085)
    for x, y, c in pts:
        disc(x, y, node_r, c)
    disc(cx, cy, hub_r * 1.5, (0x2D, 0x1B, 0x4E))  # halo so spokes don't touch the hub
    disc(cx, cy, hub_r, HUB)
    disc(cx - hub_r * 0.28, cy - hub_r * 0.28, hub_r * 0.32, TEAL)  # highlight
    return px


def write_png(path, px):
    size = len(px)
    raw = b"".join(b"\x00" + b"".join(struct.pack("3B", *px[y][x]) for x in range(size)) for y in range(size))

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    open(path, "wb").write(png)
    print(f"wrote {path} ({size}x{size}, {len(png)} bytes)")


BASE = "Porting to native react/app/public/"
for s, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    write_png(BASE + name, render(s))
