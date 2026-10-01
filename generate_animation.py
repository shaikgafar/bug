import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import imageio.v2 as imageio
import imageio_ffmpeg
import os

def create_animation():
    print("Starting BugSense 3D Animation Video Generation...")
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using ffmpeg: {ffmpeg_exe}")

    # Load source robot image
    bot_path = "frontend/public/bugsense-bot.png"
    if not os.path.exists(bot_path):
        raise FileNotFoundError(f"{bot_path} not found")

    bot_img = Image.open(bot_path).convert("RGBA")
    
    # Target video specs
    W, H = 1080, 1080
    fps = 30
    duration = 6.0  # seconds
    total_frames = int(fps * duration)
    
    # Output paths
    os.makedirs("frontend/public", exist_ok=True)
    mp4_path = "frontend/public/bugsense-animation.mp4"
    webm_path = "frontend/public/bugsense-animation.webm"

    # Pre-render background elements
    # Stars / particle field
    np.random.seed(42)
    num_particles = 70
    particles = []
    for _ in range(num_particles):
        particles.append({
            'x': np.random.uniform(0, W),
            'y': np.random.uniform(0, H),
            'size': np.random.uniform(1.5, 4.0),
            'speed': np.random.uniform(0.3, 1.2),
            'phase': np.random.uniform(0, math.pi * 2),
            'color': np.random.choice(['cyan', 'purple', 'blue', 'white'])
        })

    # Floating HUD cards data (Navora style)
    # Card 1: Top-Left (Triage Agent status)
    # Card 2: Right-Top (Bug Detected / Severity)
    # Card 3: Bottom-Left (Automated Reproduction)
    
    writer = imageio.get_writer(
        mp4_path, 
        fps=fps, 
        codec='libx264', 
        quality=8, 
        pixelformat='yuv420p',
        macro_block_size=16
    )

    print(f"Rendering {total_frames} frames ({W}x{H} @ {fps}fps)...")

    # Robot base dimensions for centering
    bot_orig_w, bot_orig_h = bot_img.size
    target_bot_w = 640
    aspect = bot_orig_h / bot_orig_w
    target_bot_h = int(target_bot_w * aspect)
    bot_scaled = bot_img.resize((target_bot_w, target_bot_h), Image.Resampling.LANCZOS)

    # Let's find relative center of magnifying glass & bug in bot_scaled
    # In original bot_crop (y: 100..810, x: 120..1180), magnifying glass is approx at 72% x, 55% y
    mag_rel_x = 0.73
    mag_rel_y = 0.52
    
    # Antenna tip relative
    ant_rel_x = 0.49
    ant_rel_y = 0.04

    # Eye locations relative
    eye_l_rel = (0.41, 0.35)
    eye_r_rel = (0.57, 0.35)

    for frame_idx in range(total_frames):
        t = frame_idx / total_frames
        angle = t * 2 * math.pi
        
        # Frame canvas: deep sleek dark space background
        # Deep gradient background (#050813 to #0c1222 to #070a14)
        frame = Image.new("RGBA", (W, H), (6, 9, 18, 255))
        draw = ImageDraw.Draw(frame)

        # 1. Ambient Volumetric Glow Orbs
        # Cyan glow behind robot
        glow_radius_cyan = 340 + int(30 * math.sin(angle))
        glow_center_cyan = (int(W * 0.52 + 40 * math.sin(angle)), int(H * 0.48 + 25 * math.cos(angle)))
        
        # Violet glow bottom-right
        glow_radius_violet = 280 + int(25 * math.cos(angle))
        glow_center_violet = (int(W * 0.75), int(H * 0.65))

        # Render subtle radial glows using soft circles
        # To keep it fast, we can draw a few concentric alpha circles
        for r_step in range(glow_radius_cyan, 50, -40):
            alpha = int(14 * (1.0 - r_step / glow_radius_cyan))
            draw.ellipse(
                [glow_center_cyan[0] - r_step, glow_center_cyan[1] - r_step,
                 glow_center_cyan[0] + r_step, glow_center_cyan[1] + r_step],
                fill=(14, 165, 233, alpha)
            )

        for r_step in range(glow_radius_violet, 40, -35):
            alpha = int(12 * (1.0 - r_step / glow_radius_violet))
            draw.ellipse(
                [glow_center_violet[0] - r_step, glow_center_violet[1] - r_step,
                 glow_center_violet[0] + r_step, glow_center_violet[1] + r_step],
                fill=(139, 92, 246, alpha)
            )

        # 2. Cybernetic Perspective Grid on the floor
        grid_horizon_y = int(H * 0.72)
        grid_bottom_y = H
        num_v_lines = 14
        for i in range(num_v_lines + 1):
            norm_i = (i / num_v_lines) - 0.5 # -0.5 to 0.5
            top_x = W * 0.5 + norm_i * (W * 0.4)
            bottom_x = W * 0.5 + norm_i * (W * 1.5)
            draw.line([(top_x, grid_horizon_y), (bottom_x, grid_bottom_y)], fill=(30, 45, 75, 45), width=1)
        
        # Horizontal perspective grid lines moving forward
        grid_phase = (angle * 1.5) % (math.pi / 2)
        for j in range(8):
            pj = (j / 8.0 + (grid_phase / (math.pi / 2)) * (1.0 / 8.0)) % 1.0
            # Perspective warping: y increases exponentially
            curve = pj ** 2.2
            line_y = grid_horizon_y + curve * (grid_bottom_y - grid_horizon_y)
            grid_alpha = int(50 * curve)
            draw.line([(0, line_y), (W, line_y)], fill=(38, 90, 160, grid_alpha), width=1)

        # 3. Floating Particles & Energy Dust
        for p in particles:
            py = (p['y'] - frame_idx * p['speed']) % H
            px = p['x'] + 15 * math.sin(angle + p['phase'])
            p_twinkle = 0.5 + 0.5 * math.sin(angle * 3 + p['phase'])
            p_alpha = int(160 * p_twinkle)
            p_size = p['size'] * (0.8 + 0.4 * p_twinkle)
            
            if p['color'] == 'cyan':
                color = (56, 189, 248, p_alpha)
            elif p['color'] == 'purple':
                color = (168, 85, 247, p_alpha)
            elif p['color'] == 'blue':
                color = (99, 102, 241, p_alpha)
            else:
                color = (255, 255, 255, p_alpha)
                
            draw.ellipse([px - p_size, py - p_size, px + p_size, py + p_size], fill=color)

        # 4. 3D Levitation & Physics for BugSense Robot
        # Smooth vertical float (sine wave)
        float_offset_y = 22.0 * math.sin(angle)
        # Subtle horizontal drift
        float_offset_x = 7.0 * math.cos(angle)
        # Subtle 3D tilt (rotate +/- 2.5 degrees)
        tilt_deg = 2.2 * math.sin(angle)
        # Breathing scale (1.0 +/- 0.015)
        scale_factor = 1.0 + 0.018 * math.cos(angle * 2)

        # Transform robot
        cur_w = int(target_bot_w * scale_factor)
        cur_h = int(target_bot_h * scale_factor)
        cur_bot = bot_scaled.resize((cur_w, cur_h), Image.Resampling.LANCZOS)
        
        # Rotate slightly with high quality
        cur_bot = cur_bot.rotate(tilt_deg, resample=Image.Resampling.BICUBIC, expand=True)
        cb_w, cb_h = cur_bot.size

        # Center position
        bot_center_x = int(W * 0.5 + float_offset_x)
        bot_center_y = int(H * 0.47 + float_offset_y)
        paste_x = bot_center_x - cb_w // 2
        paste_y = bot_center_y - cb_h // 2

        # 5. Holographic Floor Shadow / Reflection
        shadow_w = int(cur_w * 0.75 * (1.0 - float_offset_y / 150.0))
        shadow_h = int(35 * (1.0 - float_offset_y / 150.0))
        shadow_y = int(bot_center_y + cur_h * 0.42)
        shadow_box = [
            bot_center_x - shadow_w // 2, shadow_y - shadow_h // 2,
            bot_center_x + shadow_w // 2, shadow_y + shadow_h // 2
        ]
        draw.ellipse(shadow_box, fill=(10, 25, 55, 110))

        # Paste robot onto frame
        frame.alpha_composite(cur_bot, (paste_x, paste_y))

        # 6. High-Tech Holographic Overlays & Visual FX
        # Calculate real-time screen coordinates of key robot features
        mag_screen_x = int(paste_x + cb_w * 0.72)
        mag_screen_y = int(paste_y + cb_h * 0.54)
        
        ant_screen_x = int(paste_x + cb_w * 0.49)
        ant_screen_y = int(paste_y + cb_h * 0.06)

        # A) Antenna Pulsing Beacon (Blue/Cyan Orb Flare)
        beacon_alpha = int(140 + 100 * math.sin(angle * 3))
        beacon_r = 14 + int(6 * math.sin(angle * 3))
        draw.ellipse([ant_screen_x - beacon_r, ant_screen_y - beacon_r,
                      ant_screen_x + beacon_r, ant_screen_y + beacon_r],
                     fill=(56, 189, 248, beacon_alpha))
        draw.ellipse([ant_screen_x - 5, ant_screen_y - 5, ant_screen_x + 5, ant_screen_y + 5],
                     fill=(255, 255, 255, 220))

        # B) Concentric Sonar / Radar Rings from Magnifying Glass (Navora signature tech pulse)
        for ring_i in range(3):
            ring_progress = (t * 2.0 + ring_i / 3.0) % 1.0
            ring_r = int(15 + ring_progress * 130)
            ring_alpha = int(210 * (1.0 - ring_progress))
            if ring_alpha > 0:
                draw.ellipse(
                    [mag_screen_x - ring_r, mag_screen_y - ring_r,
                     mag_screen_x + ring_r, mag_screen_y + ring_r],
                    outline=(6, 182, 212, ring_alpha),
                    width=2
                )
                # Outer dashed accents
                draw.arc(
                    [mag_screen_x - ring_r - 6, mag_screen_y - ring_r - 6,
                     mag_screen_x + ring_r + 6, mag_screen_y + ring_r + 6],
                    start=int(ring_progress * 360),
                    end=int(ring_progress * 360 + 90),
                    fill=(139, 92, 246, ring_alpha),
                    width=2
                )

        # C) Laser Scanner Beam sweeping across code terminal
        # Terminal area is roughly from x = paste_x + cb_w*0.18 to paste_x + cb_w*0.58
        term_x0 = int(paste_x + cb_w * 0.18)
        term_x1 = int(paste_x + cb_w * 0.58)
        term_y0 = int(paste_y + cb_h * 0.42)
        term_y1 = int(paste_y + cb_h * 0.72)

        # Laser sweep position
        scan_progress = 0.5 + 0.5 * math.sin(angle * 2)
        scan_x = int(term_x0 + (term_x1 - term_x0) * scan_progress)

        # Draw vertical laser line with glow
        for glow_w in [6, 4, 2]:
            glow_a = 50 if glow_w == 6 else (90 if glow_w == 4 else 220)
            laser_color = (6, 182, 212, glow_a) if glow_w > 2 else (230, 255, 255, glow_a)
            draw.line([(scan_x - glow_w//2, term_y0), (scan_x - glow_w//2, term_y1)],
                      fill=laser_color, width=glow_w)

        # D) Target Crosshair / Brackets around detected Bug in Magnifying Glass
        target_size = 28 + int(4 * math.sin(angle * 4))
        # Draw 4 corner brackets around bug
        b_x0 = mag_screen_x - target_size
        b_x1 = mag_screen_x + target_size
        b_y0 = mag_screen_y - target_size
        b_y1 = mag_screen_y + target_size
        b_len = 10
        bracket_color = (244, 63, 94, 210) # neon rose/red

        # Top-left corner
        draw.line([(b_x0, b_y0), (b_x0 + b_len, b_y0)], fill=bracket_color, width=2)
        draw.line([(b_x0, b_y0), (b_x0, b_y0 + b_len)], fill=bracket_color, width=2)
        # Top-right corner
        draw.line([(b_x1, b_y0), (b_x1 - b_len, b_y0)], fill=bracket_color, width=2)
        draw.line([(b_x1, b_y0), (b_x1, b_y0 + b_len)], fill=bracket_color, width=2)
        # Bottom-left corner
        draw.line([(b_x0, b_y1), (b_x0 + b_len, b_y1)], fill=bracket_color, width=2)
        draw.line([(b_x0, b_y1), (b_x0, b_y1 - b_len)], fill=bracket_color, width=2)
        # Bottom-right corner
        draw.line([(b_x1, b_y1), (b_x1 - b_len, b_y1)], fill=bracket_color, width=2)
        draw.line([(b_x1, b_y1), (b_x1, b_y1 - b_len)], fill=bracket_color, width=2)

        # 7. Navora-Style Glassmorphism Floating HUD Cards
        # We render 3 high-tech floating UI cards connected to the triage system!
        
        # --- Card 1: Top-Left "AUTONOMOUS TRIAGE AGENT" ---
        c1_w, c1_h = 240, 72
        c1_float = 9.0 * math.sin(angle + 0.5)
        c1_x = int(W * 0.08)
        c1_y = int(H * 0.22 + c1_float)
        
        # Card background (glassmorphism: translucent dark slate with cyan border)
        draw.rounded_rectangle([c1_x, c1_y, c1_x + c1_w, c1_y + c1_h], radius=14,
                               fill=(15, 23, 42, 195), outline=(56, 189, 248, 120), width=1)
        # Top accent pill
        draw.ellipse([c1_x + 16, c1_y + 16, c1_x + 26, c1_y + 26], fill=(52, 211, 153, 230))
        # Status text
        draw.text((c1_x + 34, c1_y + 14), "TRIAGE ENGINE", fill=(148, 163, 184, 240))
        draw.text((c1_x + 34, c1_y + 32), "4 AI Agents Online", fill=(255, 255, 255, 255))
        # Mini progress bar
        draw.rounded_rectangle([c1_x + 16, c1_y + 54, c1_x + c1_w - 16, c1_y + 58], radius=2, fill=(30, 41, 59, 200))
        bar_fill = int((c1_w - 32) * (0.85 + 0.12 * math.sin(angle)))
        draw.rounded_rectangle([c1_x + 16, c1_y + 54, c1_x + 16 + bar_fill, c1_y + 58], radius=2, fill=(6, 182, 212, 240))

        # Tether line connecting Card 1 to robot head
        draw.line([(c1_x + c1_w, c1_y + c1_h // 2), (int(paste_x + cb_w * 0.35), int(paste_y + cb_h * 0.25))],
                  fill=(56, 189, 248, 45), width=1)
        draw.ellipse([c1_x + c1_w - 3, c1_y + c1_h // 2 - 3, c1_x + c1_w + 3, c1_y + c1_h // 2 + 3],
                     fill=(56, 189, 248, 180))

        # --- Card 2: Right-Top "DEFECT ISOLATED: SEV-1" ---
        c2_w, c2_h = 250, 76
        c2_float = 11.0 * math.sin(angle + 2.0)
        c2_x = int(W * 0.69)
        c2_y = int(H * 0.24 + c2_float)

        draw.rounded_rectangle([c2_x, c2_y, c2_x + c2_w, c2_y + c2_h], radius=14,
                               fill=(15, 23, 42, 195), outline=(244, 63, 94, 120), width=1)
        # Red pulsing dot
        p_sev = 0.5 + 0.5 * math.sin(angle * 5)
        draw.ellipse([c2_x + 16, c2_y + 16, c2_x + 26, c2_y + 26], fill=(244, 63, 94, int(150 + 105 * p_sev)))
        draw.text((c2_x + 34, c2_y + 14), "BUG DETECTED", fill=(251, 113, 133, 240))
        draw.text((c2_x + 34, c2_y + 32), "SEV-1 Critical Defect", fill=(255, 255, 255, 255))
        draw.text((c2_x + 16, c2_y + 52), "Confidence: 99.4% • Repro Verified", fill=(148, 163, 184, 220))

        # Tether line connecting Card 2 to magnifying glass
        draw.line([(c2_x, c2_y + c2_h // 2), (mag_screen_x, mag_screen_y)],
                  fill=(244, 63, 94, 45), width=1)
        draw.ellipse([c2_x - 3, c2_y + c2_h // 2 - 3, c2_x + 3, c2_y + c2_h // 2 + 3],
                     fill=(244, 63, 94, 180))

        # --- Card 3: Bottom-Left "HEADLESS REPRODUCTION" ---
        c3_w, c3_h = 240, 70
        c3_float = 8.0 * math.sin(angle + 4.0)
        c3_x = int(W * 0.09)
        c3_y = int(H * 0.68 + c3_float)

        draw.rounded_rectangle([c3_x, c3_y, c3_x + c3_w, c3_y + c3_h], radius=14,
                               fill=(15, 23, 42, 195), outline=(139, 92, 246, 120), width=1)
        draw.ellipse([c3_x + 16, c3_y + 16, c3_x + 26, c3_y + 26], fill=(139, 92, 246, 230))
        draw.text((c3_x + 34, c3_y + 14), "HEADLESS SELENIUM", fill=(196, 181, 253, 240))
        draw.text((c3_x + 34, c3_y + 32), "Assertion: Pass (Found)", fill=(255, 255, 255, 255))
        draw.text((c3_x + 16, c3_y + 50), "Time-to-Triage: 42 seconds", fill=(148, 163, 184, 220))

        draw.line([(c3_x + c3_w, c3_y + c3_h // 2), (int(paste_x + cb_w * 0.28), int(paste_y + cb_h * 0.65))],
                  fill=(139, 92, 246, 45), width=1)

        # 8. Bottom Branding Watermark / Title Overlay
        # "BugSense" with glowing gradient styling
        brand_text = "BugSense"
        tagline = "Triage Smarter  •  Build Faster"
        
        # Center bottom text
        draw.text((W // 2 - 82, H - 75), brand_text, fill=(255, 255, 255, 240))
        draw.text((W // 2 - 105, H - 48), tagline, fill=(148, 163, 184, 200))
        
        # Top HUD timestamp & frame counter for ultra high-tech realism
        sec = (frame_idx / fps)
        hud_timestamp = f"SYS.TRIAGE_RUN // 00:0{sec:.2f} // REC [ACTIVE]"
        draw.text((36, 36), hud_timestamp, fill=(56, 189, 248, 180))
        
        # Tech corner accents
        c_size = 18
        draw.line([(24, 24), (24 + c_size, 24)], fill=(56, 189, 248, 160), width=2)
        draw.line([(24, 24), (24, 24 + c_size)], fill=(56, 189, 248, 160), width=2)
        
        draw.line([(W - 24, 24), (W - 24 - c_size, 24)], fill=(56, 189, 248, 160), width=2)
        draw.line([(W - 24, 24), (W - 24, 24 + c_size)], fill=(56, 189, 248, 160), width=2)
        
        draw.line([(24, H - 24), (24 + c_size, H - 24)], fill=(56, 189, 248, 160), width=2)
        draw.line([(24, H - 24), (24, H - 24 - c_size)], fill=(56, 189, 248, 160), width=2)
        
        draw.line([(W - 24, H - 24), (W - 24 - c_size, H - 24)], fill=(56, 189, 248, 160), width=2)
        draw.line([(W - 24, H - 24), (W - 24, H - 24 - c_size)], fill=(56, 189, 248, 160), width=2)

        # Convert to RGB numpy array and write frame
        rgb_frame = np.array(frame.convert("RGB"))
        writer.append_data(rgb_frame)

        if (frame_idx + 1) % 30 == 0:
            print(f"Rendered {frame_idx + 1}/{total_frames} frames ({int((frame_idx + 1)/total_frames * 100)}%)...")

    writer.close()
    print(f"Successfully created MP4: {mp4_path}")

    # Also convert/generate WebM for maximum browser compatibility and performance
    print("Generating WebM version...")
    cmd = f'"{ffmpeg_exe}" -y -i "{mp4_path}" -c:v libvpx-vp9 -b:v 1500k -crf 30 -pix_fmt yuv420p "{webm_path}"'
    os.system(cmd)
    print(f"Successfully created WebM: {webm_path}")

if __name__ == "__main__":
    create_animation()
