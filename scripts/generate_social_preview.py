from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1280
HEIGHT = 640

NAVY = "#101827"
NAVY_2 = "#172033"
PANEL = "#1B263A"
PANEL_2 = "#202D44"
WHITE = "#F8FAFC"
SLATE = "#AEB9CB"
SLATE_DARK = "#7F8BA0"
INDIGO = "#6366F1"
INDIGO_LIGHT = "#A5B4FC"
CYAN = "#63D6E6"
GREEN = "#70D6A0"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: str, outline: str | None = None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def base_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (WIDTH, HEIGHT), NAVY)
    draw = ImageDraw.Draw(image)
    for x in range(0, WIDTH, 64):
        draw.line((x, 0, x, HEIGHT), fill="#152033", width=1)
    for y in range(0, HEIGHT, 64):
        draw.line((0, y, WIDTH, y), fill="#152033", width=1)
    draw.ellipse((930, -250, 1450, 270), fill="#182047")
    draw.ellipse((-280, 420, 260, 960), fill="#13213A")
    return image, draw


def mark(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    rounded(draw, (x, y, x + 58, y + 58), 12, INDIGO)
    draw.text((x + 14, y + 11), "ST", font=font(24, True), fill=WHITE)


def eyebrow(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    rounded(draw, (x, y, x + 300, y + 38), 18, "#20264D", outline="#363B72")
    draw.text((x + 16, y + 9), "ENTERPRISE AI OPERATING MODEL", font=font(15, True), fill=INDIGO_LIGHT)


def footer(draw: ImageDraw.ImageDraw) -> None:
    draw.text((72, 590), "Synthetic portfolio demonstration", font=font(17), fill=SLATE_DARK)
    draw.text((1000, 590), "signaltower-ai.vercel.app", font=font(17), fill=SLATE)


def preview_one() -> Image.Image:
    image, draw = base_canvas()
    mark(draw, 72, 58)
    draw.text((146, 66), "SignalTower AI", font=font(28, True), fill=WHITE)
    eyebrow(draw, 72, 164)
    draw.text((72, 224), "Enterprise AI", font=font(57, True), fill=WHITE)
    draw.text((72, 292), "Delivery Control Tower", font=font(57, True), fill=WHITE)
    draw.text((74, 382), "Turn AI demand into governed production value.", font=font(25), fill=SLATE)
    draw.text((74, 425), "Portfolio readiness  •  Evidence tracking  •  Executive decisions", font=font(19), fill=INDIGO_LIGHT)

    rounded(draw, (760, 72, 1208, 548), 22, PANEL, outline="#33405A", width=2)
    draw.text((796, 105), "Executive Portfolio", font=font(24, True), fill=WHITE)
    draw.text((796, 142), "Governed pilot-to-production visibility", font=font(16), fill=SLATE)
    for i, (label, color) in enumerate([
        ("Portfolio intake", INDIGO),
        ("Readiness evidence", CYAN),
        ("Decision support", GREEN),
    ]):
        top = 190 + i * 102
        rounded(draw, (796, top, 1172, top + 78), 12, PANEL_2, outline="#34425D")
        rounded(draw, (816, top + 20, 826, top + 58), 5, color)
        draw.text((846, top + 17), label, font=font(18, True), fill=WHITE)
        draw.text((846, top + 45), "Structured ownership and review", font=font(14), fill=SLATE)
    footer(draw)
    return image


def preview_two() -> Image.Image:
    image, draw = base_canvas()
    mark(draw, 72, 58)
    draw.text((146, 66), "SignalTower AI", font=font(28, True), fill=WHITE)
    eyebrow(draw, 72, 164)
    draw.text((72, 224), "Govern AI delivery", font=font(58, True), fill=WHITE)
    draw.text((72, 294), "without slowing it down.", font=font(58, True), fill=WHITE)
    draw.text((74, 390), "A synthetic enterprise control tower for practical pilot-to-production decisions.", font=font(22), fill=SLATE)

    x0 = 765
    for i, (num, title, color) in enumerate([
        ("01", "INTAKE", INDIGO),
        ("02", "READINESS", CYAN),
        ("03", "DECISIONS", GREEN),
    ]):
        top = 118 + i * 128
        rounded(draw, (x0, top, 1198, top + 100), 16, PANEL, outline="#33405A")
        draw.text((x0 + 28, top + 23), num, font=font(28, True), fill=color)
        draw.text((x0 + 96, top + 25), title, font=font(20, True), fill=WHITE)
        draw.line((x0 + 96, top + 60, x0 + 374, top + 60), fill="#43506A", width=4)
        draw.line((x0 + 96, top + 60, x0 + 260 - i * 32, top + 60), fill=color, width=4)
    footer(draw)
    return image


def preview_three() -> Image.Image:
    image, draw = base_canvas()
    mark(draw, 72, 54)
    draw.text((146, 62), "SignalTower AI", font=font(28, True), fill=WHITE)
    draw.text((72, 158), "Control Tower for Enterprise AI", font=font(53, True), fill=WHITE)
    draw.text((74, 226), "A disciplined operating layer between promising pilots and production value.", font=font(22), fill=SLATE)

    rounded(draw, (72, 302, 1208, 548), 22, PANEL, outline="#33405A", width=2)
    draw.text((106, 332), "PORTFOLIO READINESS", font=font(15, True), fill=INDIGO_LIGHT)
    for i, (title, detail, color) in enumerate([
        ("Intake", "Clear business ownership", INDIGO),
        ("Evidence", "Controls and review", CYAN),
        ("Decisions", "Leadership action", GREEN),
    ]):
        left = 106 + i * 357
        rounded(draw, (left, 376, left + 318, 510), 14, PANEL_2, outline="#34425D")
        rounded(draw, (left + 22, 397, left + 32, 467), 5, color)
        draw.text((left + 52, 397), title, font=font(23, True), fill=WHITE)
        draw.text((left + 52, 440), detail, font=font(16), fill=SLATE)
    footer(draw)
    return image


def preview_four() -> Image.Image:
    image, draw = base_canvas()
    mark(draw, 72, 58)
    draw.text((146, 66), "SignalTower AI", font=font(28, True), fill=WHITE)
    draw.text((72, 172), "From AI pilot", font=font(65, True), fill=WHITE)
    draw.text((72, 250), "to governed production.", font=font(65, True), fill=WHITE)
    draw.text((74, 350), "Enterprise delivery visibility for readiness, evidence, blockers, and decisions.", font=font(23), fill=SLATE)

    chips = [
        ("Portfolio intake", 72, INDIGO),
        ("Evidence tracking", 332, CYAN),
        ("Executive decisions", 626, GREEN),
    ]
    for label, left, color in chips:
        right = left + (230 if label == "Portfolio intake" else 264)
        rounded(draw, (left, 430, right, 486), 28, PANEL, outline="#3B4862")
        draw.ellipse((left + 18, 449, left + 30, 461), fill=color)
        draw.text((left + 44, 445), label, font=font(18, True), fill=WHITE)
    footer(draw)
    return image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    for index, image in enumerate([preview_one(), preview_two(), preview_three(), preview_four()], start=1):
        target = args.output_dir / f"signaltower-social-preview-{index}.png"
        image.save(target, format="PNG", optimize=True)
        print(target)


if __name__ == "__main__":
    main()
