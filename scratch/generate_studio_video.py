import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio.v2 as imageio
import imageio_ffmpeg
import os

def create_studio_animation():
    print("Starting BugSense Studio 3D Animation Video Generation (Clean Minimalist Theme)...")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using ffmpeg: {ffmpeg_exe}")

    bot_path = "frontend/public/bugsense-bot.png"
    if not os.path.exists(bot_path):
        raise FileNotFoundError(f"{bot_path} not found")

    bot_img = Image.open(bot_path).convert("RGBA")
    
    W, H = 1080, 1080
    fps = 30
    duration = 6.0  # seconds
    total_frames = int(fps * duration)
    
    os.makedirs("frontend/public", exist_ok=True)
    mp4_path = "frontend/public/bugsense-animation.mp4"
    webm_path = "frontend/public/bugsense-animation.webm"

    # Pre-render particle field (clean subtle grey & emerald dust)
    np.random.seed(42)
    num_particles = 60
    particles = []
    for _ in range(num_particles):
        particles.append({
            'x': np.random.uniform(0, W),
            'y': np.random.uniform(0, H),
            'size': np.random.uniform(1.2, 3.2),
            'speed': np.random.uniform(0.3, 0.9),
            'phase': np.random.uniform(0, math.pi * 2),
            'type': np.random.choice(['dark', 'green', 'light'])
        })

    writer = imageio.get_writer(
        mp4_path, 
        fps=fps, 
        codec='libx264', 
        quality=8, 
        pixelformat='yuv420p',
        macro_block_size=16
    )

    print(f"Rendering {total_frames} studio frames ({W}x{H} @ {fps}fps)...")

    bot_orig_w, bot_orig_h = bot_img.size
    target_bot_w = 660
    aspect = bot_orig_h / bot_orig_w
    target_bot_h = int(target_bot_w * aspect)
    bot_scaled = bot_img.resize((target_bot_w, target_bot_h), Image.Resampling.LANCZOS)

    for frame_idx in range(total_frames):
        t = frame_idx / total_frames
        angle = t * 2 * math.pi
        
        # Frame canvas: Clean luxury bright studio background (#fafafa to #f4f4f5)
        # Create subtle studio gradient
        frame = Image.new("RGBA", (W, H), (250, 250, 251, 255))
        draw = ImageDraw.Draw(frame)

        # 1. Ambient Volumetric Studio Lighting (Soft Radial Gradients)
        # Soft studio spotlight in center
        center_x = int(W * 0.5 + 20 * math.sin(angle))
        center_y = int(H * 0.46 + 15 * math.cos(angle))
        for r_step in range(450, 80, -45):
            alpha = int(18 * (1.0 - r_step / 450.0))
            draw.ellipse(
                [center_x - r_step, center_y - r_step, center_x + r_step, center_y + r_step],
                fill=(255, 255, 255, alpha)
            )

        # Delicate subtle ambient green/cyan flare for high-tech AI touch
        flare_x = int(W * 0.65)
        flare_y = int(H * 0.40)
        for r_step in range(260, 40, -40):
            alpha = int(12 * (1.0 - r_step / 260.0))
            draw.ellipse(
                [flare_x - r_step, flare_y - r_step, flare_x + r_step, flare_y + r_step],
                fill=(23, 201, 100, alpha)
            )

        # 2. Studio Floor Perspective Grid (Clean Subtle Hairlines)
        grid_horizon_y = int(H * 0.72)
        grid_bottom_y = H
        num_v_lines = 16
        for i in range(num_v_lines + 1):
            norm_i = (i / num_v_lines) - 0.5
            top_x = W * 0.5 + norm_i * (W * 0.45)
            bottom_x = W * 0.5 + norm_i * (W * 1.5)
            draw.line([(top_x, grid_horizon_y), (bottom_x, grid_bottom_y)], fill=(0, 0, 0, 14), width=1)
        
        # Horizontal perspective grid lines
        grid_phase = (angle * 1.5) % (math.pi / 2)
        for j in range(8):
            pj = (j / 8.0 + (grid_phase / (math.pi / 2)) * (1.0 / 8.0)) % 1.0
            curve = pj ** 2.2
            line_y = grid_horizon_y + curve * (grid_bottom_y - grid_horizon_y)
            grid_alpha = int(24 * curve)
            draw.line([(0, line_y), (W, line_y)], fill=(0, 0, 0, grid_alpha), width=1)

        # 3. Floating Ambient Micro-Particles
        for p in particles:
            py = (p['y'] - frame_idx * p['speed']) % H
            px = p['x'] + 12 * math.sin(angle + p['phase'])
            p_twinkle = 0.5 + 0.5 * math.sin(angle * 3 + p['phase'])
            p_alpha = int(110 * p_twinkle)
            p_size = p['size'] * (0.8 + 0.4 * p_twinkle)
            
            if p['type'] == 'green':
                color = (23, 201, 100, p_alpha)
            elif p['type'] == 'dark':
                color = (40, 40, 40, int(p_alpha * 0.6))
            else:
                color = (180, 180, 185, p_alpha)
                
            draw.ellipse([px - p_size, py - p_size, px + p_size, py + p_size], fill=color)

        # 4. 3D Levitation & Physics for BugSense Robot
        float_offset_y = 20.0 * math.sin(angle)
        float_offset_x = 6.0 * math.cos(angle)
        tilt_deg = 2.0 * math.sin(angle)
        scale_factor = 1.0 + 0.015 * math.cos(angle * 2)

        cur_w = int(target_bot_w * scale_factor)
        cur_h = int(target_bot_h * scale_factor)
        cur_bot = bot_scaled.resize((cur_w, cur_h), Image.Resampling.LANCZOS)
        
        cur_bot = cur_bot.rotate(tilt_deg, resample=Image.Resampling.BICUBIC, expand=True)
        cb_w, cb_h = cur_bot.size

        bot_center_x = int(W * 0.5 + float_offset_x)
        bot_center_y = int(H * 0.47 + float_offset_y)
        paste_x = bot_center_x - cb_w // 2
        paste_y = bot_center_y - cb_h // 2

        # 5. Soft Studio Drop Shadow on Floor
        shadow_w = int(cur_w * 0.72 * (1.0 - float_offset_y / 160.0))
        shadow_h = int(32 * (1.0 - float_offset_y / 160.0))
        shadow_y = int(bot_center_y + cur_h * 0.42)
        
        # Multi-layer soft shadow for realistic studio lighting
        for s_layer in range(4):
            sw = shadow_w + s_layer * 12
            sh = shadow_h + s_layer * 6
            s_alpha = int(22 / (s_layer + 1))
            draw.ellipse([
                bot_center_x - sw // 2, shadow_y - sh // 2,
                bot_center_x + sw // 2, shadow_y + sh // 2
            ], fill=(15, 23, 42, s_alpha))

        # Paste robot onto frame
        frame.alpha_composite(cur_bot, (paste_x, paste_y))

        # 6. Minimal Studio Tech Overlays
        mag_screen_x = int(paste_x + cb_w * 0.72)
        mag_screen_y = int(paste_y + cb_h * 0.54)
        
        ant_screen_x = int(paste_x + cb_w * 0.49)
        ant_screen_y = int(paste_y + cb_h * 0.06)

        # A) Antenna Pulsing Beacon (Crisp Emerald Flare)
        beacon_alpha = int(160 + 80 * math.sin(angle * 3))
        beacon_r = 13 + int(5 * math.sin(angle * 3))
        draw.ellipse([ant_screen_x - beacon_r, ant_screen_y - beacon_r,
                      ant_screen_x + beacon_r, ant_screen_y + beacon_r],
                     fill=(23, 201, 100, beacon_alpha))
        draw.ellipse([ant_screen_x - 4, ant_screen_y - 4, ant_screen_x + 4, ant_screen_y + 4],
                     fill=(255, 255, 255, 230))

        # B) Clean Concentric Radar / Sonar Rings from Magnifying Glass
        for ring_i in range(3):
            ring_progress = (t * 2.0 + ring_i / 3.0) % 1.0
            ring_r = int(15 + ring_progress * 135)
            ring_alpha = int(180 * (1.0 - ring_progress))
            if ring_alpha > 0:
                draw.ellipse(
                    [mag_screen_x - ring_r, mag_screen_y - ring_r,
                     mag_screen_x + ring_r, mag_screen_y + ring_r],
                    outline=(10, 10, 10, ring_alpha),
                    width=2
                )
                # Outer emerald accent arc
                draw.arc(
                    [mag_screen_x - ring_r - 4, mag_screen_y - ring_r - 4,
                     mag_screen_x + ring_r + 4, mag_screen_y + ring_r + 4],
                    start=int(ring_progress * 360),
                    end=int(ring_progress * 360 + 80),
                    fill=(23, 201, 100, ring_alpha),
                    width=2
                )

        # C) Laser Scanner Beam sweeping across code terminal
        term_x0 = int(paste_x + cb_w * 0.18)
        term_x1 = int(paste_x + cb_w * 0.58)
        term_y0 = int(paste_y + cb_h * 0.42)
        term_y1 = int(paste_y + cb_h * 0.72)

        scan_progress = 0.5 + 0.5 * math.sin(angle * 2)
        scan_x = int(term_x0 + (term_x1 - term_x0) * scan_progress)

        for glow_w in [5, 3, 1]:
            glow_a = 40 if glow_w == 5 else (80 if glow_w == 3 else 210)
            laser_color = (23, 201, 100, glow_a) if glow_w > 1 else (10, 10, 10, glow_a)
            draw.line([(scan_x - glow_w//2, term_y0), (scan_x - glow_w//2, term_y1)],
                      fill=laser_color, width=glow_w)

        # D) Target Crosshair Brackets around detected Bug
        target_size = 28 + int(4 * math.sin(angle * 4))
        b_x0 = mag_screen_x - target_size
        b_x1 = mag_screen_x + target_size
        b_y0 = mag_screen_y - target_size
        b_y1 = mag_screen_y + target_size
        b_len = 10
        bracket_color = (225, 29, 72, 220) # clean rose red

        draw.line([(b_x0, b_y0), (b_x0 + b_len, b_y0)], fill=bracket_color, width=2)
        draw.line([(b_x0, b_y0), (b_x0, b_y0 + b_len)], fill=bracket_color, width=2)
        draw.line([(b_x1, b_y0), (b_x1 - b_len, b_y0)], fill=bracket_color, width=2)
        draw.line([(b_x1, b_y0), (b_x1, b_y0 + b_len)], fill=bracket_color, width=2)
        draw.line([(b_x0, b_y1), (b_x0 + b_len, b_y1)], fill=bracket_color, width=2)
        draw.line([(b_x0, b_y1), (b_x0, b_y1 - b_len)], fill=bracket_color, width=2)
        draw.line([(b_x1, b_y1), (b_x1 - b_len, b_y1)], fill=bracket_color, width=2)
        draw.line([(b_x1, b_y1), (b_x1 - b_len, b_y1)], fill=bracket_color, width=2)

        # 7. Clean Minimalist Studio Branding
        # Corner brackets
        c_size = 18
        bracket_gray = (160, 160, 165, 180)
        draw.line([(24, 24), (24 + c_size, 24)], fill=bracket_gray, width=2)
        draw.line([(24, 24), (24, 24 + c_size)], fill=bracket_gray, width=2)
        draw.line([(W - 24, 24), (W - 24 - c_size, 24)], fill=bracket_gray, width=2)
        draw.line([(W - 24, 24), (W - 24, 24 + c_size)], fill=bracket_gray, width=2)
        draw.line([(24, H - 24), (24 + c_size, H - 24)], fill=bracket_gray, width=2)
        draw.line([(24, H - 24), (24, H - 24 - c_size)], fill=bracket_gray, width=2)
        draw.line([(W - 24, H - 24), (W - 24 - c_size, H - 24)], fill=bracket_gray, width=2)
        draw.line([(W - 24, H - 24), (W - 24, H - 24 - c_size)], fill=bracket_gray, width=2)

        # Convert to RGB numpy array and write frame
        rgb_frame = np.array(frame.convert("RGB"))
        writer.append_data(rgb_frame)

        if (frame_idx + 1) % 45 == 0:
            print(f"Rendered {frame_idx + 1}/{total_frames} frames ({int((frame_idx + 1)/total_frames * 100)}%)...")

    writer.close()
    print(f"Successfully generated clean MP4: {mp4_path}")

    # Generate WebM
    print("Generating WebM version...")
    cmd = f'"{ffmpeg_exe}" -y -i "{mp4_path}" -c:v libvpx-vp9 -b:v 1500k -crf 30 -pix_fmt yuv420p "{webm_path}"'
    os.system(cmd)
    print(f"Successfully generated clean WebM: {webm_path}")

if __name__ == "__main__":
    create_studio_animation()
