import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_bugtriage_presentation(output_path="BugTriage_AI_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # completely blank slide

    # Colors
    BG_DARK = RGBColor(11, 15, 25)        # #0B0F19
    CARD_BG = RGBColor(20, 27, 45)        # #141B2D
    CARD_BORDER = RGBColor(37, 48, 77)    # #25304D
    ACCENT_BLUE = RGBColor(59, 130, 246)  # #3B82F6
    ACCENT_CYAN = RGBColor(6, 182, 212)   # #06B6D4
    ACCENT_GREEN = RGBColor(16, 185, 129) # #10B981
    ACCENT_AMBER = RGBColor(245, 158, 11) # #F59E0B
    ACCENT_PURPLE = RGBColor(139, 92, 246)# #8B5CF6
    ACCENT_RED = RGBColor(239, 68, 68)    # #EF4444
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(156, 163, 175)  # #9CA3AF
    TEXT_SUBTLE = RGBColor(107, 114, 128) # #6B7280

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.color.rgb = BG_DARK
        return bg

    def add_header(slide, badge_text, title_text, subtitle_text=None, badge_color=ACCENT_BLUE):
        # Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.2), Inches(0.35))
        badge.fill.solid()
        badge.fill.fore_color.rgb = CARD_BG
        badge.line.color.rgb = badge_color
        badge.line.width = Pt(1)
        tf_b = badge.text_frame
        tf_b.word_wrap = True
        tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_b = tf_b.paragraphs[0]
        p_b.alignment = PP_ALIGN.CENTER
        run_b = p_b.add_run()
        run_b.text = badge_text.upper()
        run_b.font.size = Pt(10)
        run_b.font.bold = True
        run_b.font.color.rgb = badge_color
        run_b.font.name = "Segoe UI"

        # Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        run = p.add_run()
        run.text = title_text
        run.font.size = Pt(26)
        run.font.bold = True
        run.font.color.rgb = TEXT_WHITE
        run.font.name = "Segoe UI"

        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.space_before = Pt(4)
            run2 = p2.add_run()
            run2.text = subtitle_text
            run2.font.size = Pt(13)
            run2.font.color.rgb = TEXT_MUTED
            run2.font.name = "Segoe UI"

    def create_card(slide, left, top, width, height, title="", title_color=ACCENT_CYAN, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
        
        if title:
            # Title header box inside card
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), width - Inches(0.4), Inches(0.45))
            tf = tb.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            p = tf.paragraphs[0]
            run = p.add_run()
            run.text = title
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = title_color
            run.font.name = "Segoe UI"
            
        return card

    # ==========================================
    # SLIDE 1: TEAM & PROJECT TITLE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Decorative top glow accent line
    top_line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.6), Inches(11.733), Inches(0.06))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = ACCENT_CYAN
    top_line.line.color.rgb = ACCENT_CYAN

    # Main Project Title Box
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.733), Inches(2.2))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_tag = tf1.paragraphs[0]
    run_tag = p_tag.add_run()
    run_tag.text = "GENAI-23 • AUTONOMOUS SOFTWARE ENGINEERING"
    run_tag.font.size = Pt(12)
    run_tag.font.bold = True
    run_tag.font.color.rgb = ACCENT_CYAN
    run_tag.font.name = "Segoe UI"

    p_main = tf1.add_paragraph()
    p_main.space_before = Pt(8)
    run_main = p_main.add_run()
    run_main.text = "BugTriage.ai"
    run_main.font.size = Pt(44)
    run_main.font.bold = True
    run_main.font.color.rgb = TEXT_WHITE
    run_main.font.name = "Segoe UI"

    p_sub = tf1.add_paragraph()
    p_sub.space_before = Pt(6)
    run_sub = p_sub.add_run()
    run_sub.text = "Autonomous Multi-Agent Software Bug Triage, Semantic Deduplication & Headless Verification Platform"
    run_sub.font.size = Pt(16)
    run_sub.font.color.rgb = TEXT_MUTED
    run_sub.font.name = "Segoe UI"

    # Team Members Header Card
    team_header = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.3), Inches(11.733), Inches(0.5))
    team_header.fill.solid()
    team_header.fill.fore_color.rgb = RGBColor(26, 35, 60)
    team_header.line.color.rgb = ACCENT_BLUE
    team_header.line.width = Pt(1)
    tf_th = team_header.text_frame
    tf_th.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_th = tf_th.paragraphs[0]
    p_th.alignment = PP_ALIGN.LEFT
    p_th.margin_left = Inches(0.2)
    r_th = p_th.add_run()
    r_th.text = "PROJECT TEAM MEMBERS & ROLES"
    r_th.font.size = Pt(12)
    r_th.font.bold = True
    r_th.font.color.rgb = TEXT_WHITE
    r_th.font.name = "Segoe UI"

    # 3 Member Cards
    members = [
        {
            "name": "Kishore Kumar",
            "role": "Lead AI & Backend Architect",
            "focus": [
                "Multi-Agent Orchestration Pipeline",
                "ChromaDB Vector Store & Embeddings",
                "Strict Pydantic Schema Contracts"
            ],
            "accent": ACCENT_BLUE
        },
        {
            "name": "Ashraf",
            "role": "Systems & Automation Engineer",
            "focus": [
                "Headless Selenium 4 Execution Harness",
                "FastAPI SSE Real-time Streaming",
                "Docker Compose & PostgreSQL DB"
            ],
            "accent": ACCENT_CYAN
        },
        {
            "name": "Kulsum",
            "role": "Frontend Architect & UX Specialist",
            "focus": [
                "Next.js 14 App Router & TypeScript",
                "Interactive Clarification Chat Loop",
                "Evidence Gallery & Telemetry UX"
            ],
            "accent": ACCENT_PURPLE
        }
    ]

    card_w = Inches(3.72)
    card_gap = Inches(0.28)
    card_y = Inches(3.95)
    card_h = Inches(2.9)

    for i, m in enumerate(members):
        cx = Inches(0.8) + i * (card_w + card_gap)
        create_card(s1, cx, card_y, card_w, card_h, title="", border_color=m["accent"])

        tb_m = s1.shapes.add_textbox(cx + Inches(0.25), card_y + Inches(0.25), card_w - Inches(0.5), card_h - Inches(0.4))
        tf_m = tb_m.text_frame
        tf_m.word_wrap = True
        tf_m.margin_left = tf_m.margin_top = tf_m.margin_right = tf_m.margin_bottom = 0

        # Avatar placeholder pill
        p_av = tf_m.paragraphs[0]
        r_av = p_av.add_run()
        r_av.text = f"TEAM MEMBER 0{i+1}"
        r_av.font.size = Pt(10)
        r_av.font.bold = True
        r_av.font.color.rgb = m["accent"]
        r_av.font.name = "Segoe UI"

        p_name = tf_m.add_paragraph()
        p_name.space_before = Pt(6)
        r_name = p_name.add_run()
        r_name.text = m["name"]
        r_name.font.size = Pt(20)
        r_name.font.bold = True
        r_name.font.color.rgb = TEXT_WHITE
        r_name.font.name = "Segoe UI"

        p_role = tf_m.add_paragraph()
        p_role.space_before = Pt(3)
        r_role = p_role.add_run()
        r_role.text = m["role"]
        r_role.font.size = Pt(12)
        r_role.font.bold = True
        r_role.font.color.rgb = m["accent"]
        r_role.font.name = "Segoe UI"

        p_div = tf_m.add_paragraph()
        p_div.space_before = Pt(6)
        r_div = p_div.add_run()
        r_div.text = "──────────────────────────"
        r_div.font.size = Pt(8)
        r_div.font.color.rgb = TEXT_SUBTLE

        p_core = tf_m.add_paragraph()
        p_core.space_before = Pt(6)
        r_core = p_core.add_run()
        r_core.text = "Core Responsibilities:"
        r_core.font.size = Pt(11)
        r_core.font.bold = True
        r_core.font.color.rgb = TEXT_MUTED
        r_core.font.name = "Segoe UI"

        for f in m["focus"]:
            pf = tf_m.add_paragraph()
            pf.space_before = Pt(4)
            rf = pf.add_run()
            rf.text = f"• {f}"
            rf.font.size = Pt(11)
            rf.font.color.rgb = TEXT_WHITE
            rf.font.name = "Segoe UI"

    s1.notes_slide.notes_text_frame.text = (
        "Slide 1 Speaker Notes:\n"
        "Good morning/afternoon respected evaluators. Welcome to our presentation of BugTriage.ai, created under track GENAI-23.\n"
        "Our team consists of Kishore Kumar, Ashraf, and Kulsum. "
        "Together, we built an autonomous, end-to-end multi-agent platform designed to fundamentally eliminate the massive manual bottleneck in software bug triage."
    )

    # ==========================================
    # SLIDE 2: PROBLEM STATEMENT
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Slide 02 • Problem Definition", "Problem Statement & Industry Impact", "Software engineering teams waste 30-45% of sprint cycles triaging incomplete bug reports.")

    # 4 Structured Grid Cards: Domain, Problem, Target Users, Why It Matters
    p_cards = [
        {
            "title": "1. Domain Context",
            "color": ACCENT_BLUE,
            "bullets": [
                ("Industry", "Software Engineering, QA & DevOps Incident Operations."),
                ("Scale", "Agile teams receive hundreds of bug reports weekly across Jira, Slack, GitHub, and customer support channels."),
                ("Bottleneck", "Triage is still 100% manual, highly fragmented, and prone to human cognitive fatigue.")
            ]
        },
        {
            "title": "2. The Core Problem",
            "color": ACCENT_RED,
            "bullets": [
                ("Ambiguous Reports", "Vague descriptions ('login broken', missing steps, no OS/browser info) cause endless back-and-forth ping-pong."),
                ("Duplicate Avalanche", "20-30% of incoming tickets are duplicates phrased differently, clogging engineering backlogs."),
                ("Flaky Reproduction", "Engineers spend hours attempting to replicate errors without structured steps or visual evidence.")
            ]
        },
        {
            "title": "3. Target Users",
            "color": ACCENT_CYAN,
            "bullets": [
                ("Developers & Tech Leads", "Need clean, verified, reproduction-script-backed tickets with exact component assignments."),
                ("QA & SDET Engineers", "Need automated test generation and elimination of repetitive manual sanity testing."),
                ("Product & Support Teams", "Require instant classification, accurate SLA priority (P0-P3), and rapid turnaround for customers.")
            ]
        },
        {
            "title": "4. Why It Matters",
            "color": ACCENT_AMBER,
            "bullets": [
                ("High Financial Drain", "$50k+ lost engineering hours annually per squad on manual administrative triaging."),
                ("Slow MTTR", "Critical regressions linger unaddressed while tickets bounce between mismatched owners."),
                ("Severe Burnout", "Senior engineers get pulled out of deep coding flow to investigate 'cannot reproduce' ghosts.")
            ]
        }
    ]

    card_2w = Inches(5.72)
    card_2h = Inches(2.55)
    xs = [Inches(0.8), Inches(6.8)]
    ys = [Inches(1.85), Inches(4.55)]

    for idx, c in enumerate(p_cards):
        cx = xs[idx % 2]
        cy = ys[idx // 2]
        create_card(s2, cx, cy, card_2w, card_2h, c["title"], c["color"])

        tb_c = s2.shapes.add_textbox(cx + Inches(0.2), cy + Inches(0.65), card_2w - Inches(0.4), card_2h - Inches(0.75))
        tf_c = tb_c.text_frame
        tf_c.word_wrap = True
        tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0

        for b_idx, (b_title, b_desc) in enumerate(c["bullets"]):
            p_b = tf_c.paragraphs[0] if b_idx == 0 else tf_c.add_paragraph()
            if b_idx > 0:
                p_b.space_before = Pt(6)
            r_bt = p_b.add_run()
            r_bt.text = f"• {b_title}: "
            r_bt.font.size = Pt(11)
            r_bt.font.bold = True
            r_bt.font.color.rgb = c["color"]
            r_bt.font.name = "Segoe UI"

            r_bd = p_b.add_run()
            r_bd.text = b_desc
            r_bd.font.size = Pt(11)
            r_bd.font.color.rgb = TEXT_WHITE
            r_bd.font.name = "Segoe UI"

    s2.notes_slide.notes_text_frame.text = (
        "Slide 2 Speaker Notes:\n"
        "Let's look at the problem. In modern software organizations, bug triage is a massive hidden productivity sink. "
        "Over 30% of sprint capacity is spent deciphering poorly written tickets, chasing reporters for missing details, and manually testing whether an issue is reproducible. "
        "Furthermore, up to 30% of incoming tickets are duplicates with completely different wording—such as 'infinite spinner on Google sign in' vs 'OAuth modal hangs'. "
        "This blows up Mean Time to Resolution and burns out engineering talent."
    )

    # ==========================================
    # SLIDE 3: SOLUTION & WORKFLOW
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Slide 03 • Proposed Solution", "BugTriage.ai: Autonomous Multi-Agent Pipeline", "Transforming ambiguous, unstructured bug reports into verified, reproducible tickets in <45s.")

    # Left Column: Proposed Solution & How it Addresses the Problem
    left_w = Inches(4.5)
    create_card(s3, Inches(0.8), Inches(1.85), left_w, Inches(5.15), "Autonomous System Overview", ACCENT_CYAN)

    tb_sol = s3.shapes.add_textbox(Inches(1.05), Inches(2.5), left_w - Inches(0.5), Inches(4.3))
    tf_sol = tb_sol.text_frame
    tf_sol.word_wrap = True
    tf_sol.margin_left = tf_sol.margin_top = tf_sol.margin_right = tf_sol.margin_bottom = 0

    sol_sections = [
        ("Proposed Solution", "A production-grade, 4-agent autonomous pipeline orchestrating LLMs, vector memory, and headless browsers."),
        ("Interactive Clarification", "If critical fields (steps, environment) are missing, the system pauses execution ('waiting_for_user') and asks targeted questions in an interactive chat."),
        ("Semantic Deduplication", "Instant vector cosine similarity search in ChromaDB flags duplicates with >85% confidence and visual side-by-side diffs."),
        ("Headless Browser Proof", "Synthesizes executable Selenium WebDriver 4 scripts to reproduce the defect and capture DOM screenshots and console logs."),
        ("Intelligent Component Routing", "Detects release regressions, classifies severity (P0-P3), and assigns the exact owning engineer.")
    ]

    for idx, (title, desc) in enumerate(sol_sections):
        p_s = tf_sol.paragraphs[0] if idx == 0 else tf_sol.add_paragraph()
        if idx > 0:
            p_s.space_before = Pt(8)
        r_st = p_s.add_run()
        r_st.text = f"{title}\n"
        r_st.font.size = Pt(11)
        r_st.font.bold = True
        r_st.font.color.rgb = ACCENT_CYAN
        r_st.font.name = "Segoe UI"

        r_sd = p_s.add_run()
        r_sd.text = desc
        r_sd.font.size = Pt(10.5)
        r_sd.font.color.rgb = TEXT_WHITE
        r_sd.font.name = "Segoe UI"

    # Right Column: The 4-Agent Sequential Workflow
    right_x = Inches(5.6)
    right_w = Inches(6.933)
    create_card(s3, right_x, Inches(1.85), right_w, Inches(5.15), "The 4-Agent Autonomous Workflow", ACCENT_GREEN)

    agents = [
        ("01", "Triage Agent", ACCENT_BLUE, "Ingests raw text (email, Slack, Jira) → Normalizes steps to reproduce & environment → Evaluates completeness (triggers clarification loop if incomplete)."),
        ("02", "Intelligence Agent", ACCENT_CYAN, "Generates high-dimensional vector embeddings → ChromaDB semantic similarity search (>85% duplicate flag) → Maps to architectural component & P0-P3 priority."),
        ("03", "Reproduction Agent", ACCENT_PURPLE, "Synthesizes automated Selenium WebDriver Python test script → Executes in headless Chrome container → Captures DOM screenshots, DevTools console & network logs."),
        ("04", "Routing & Analysis Agent", ACCENT_AMBER, "Performs historical regression check against release logs → Assigns owning developer & team → Generates actionable executive Markdown triage report.")
    ]

    step_h = Inches(0.98)
    step_gap = Inches(0.18)

    for i, (num, name, color, desc) in enumerate(agents):
        sy = Inches(2.45) + i * (step_h + step_gap)
        sc = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.25), sy, right_w - Inches(0.5), step_h)
        sc.fill.solid()
        sc.fill.fore_color.rgb = RGBColor(15, 23, 42)
        sc.line.color.rgb = color
        sc.line.width = Pt(1)

        tb_step = s3.shapes.add_textbox(right_x + Inches(0.4), sy + Inches(0.08), right_w - Inches(0.8), step_h - Inches(0.16))
        tf_step = tb_step.text_frame
        tf_step.word_wrap = True
        tf_step.margin_left = tf_step.margin_top = tf_step.margin_right = tf_step.margin_bottom = 0

        p_head = tf_step.paragraphs[0]
        r_num = p_head.add_run()
        r_num.text = f"AGENT {num}: {name.upper()}"
        r_num.font.size = Pt(11)
        r_num.font.bold = True
        r_num.font.color.rgb = color
        r_num.font.name = "Segoe UI"

        p_desc = tf_step.add_paragraph()
        p_desc.space_before = Pt(3)
        r_desc = p_desc.add_run()
        r_desc.text = desc
        r_desc.font.size = Pt(10)
        r_desc.font.color.rgb = TEXT_WHITE
        r_desc.font.name = "Segoe UI"

    s3.notes_slide.notes_text_frame.text = (
        "Slide 3 Speaker Notes:\n"
        "Here is our solution: BugTriage.ai. Instead of a single LLM prompt, we architected 4 specialized agents working in a strictly orchestrated pipeline.\n"
        "Agent 1 standardizes raw input and asks the reporter clarification questions if details are missing.\n"
        "Agent 2 performs vector similarity search in ChromaDB to catch duplicates and assign components.\n"
        "Agent 3 synthesizes and runs a live Selenium browser test to capture actual visual proof.\n"
        "Agent 4 detects regressions, identifies the owning developer, and compiles an executive triage report."
    )

    # ==========================================
    # SLIDE 4: TECHNICAL DETAILS & UNIQUENESS
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Slide 04 • Technical Details & Uniqueness", "Architecture, Tech Stack & Key Differentiators", "Combining deterministic vector math, headless browser automation & multi-agent reasoning.")

    # 3 Columns: Architecture & Orchestration, Full Tech Stack, What Differentiates It
    col_w = Inches(3.72)
    col_gap = Inches(0.28)
    col_y = Inches(1.85)
    col_h = Inches(5.15)

    # Col 1: Architecture
    create_card(s4, Inches(0.8), col_y, col_w, col_h, "System Architecture", ACCENT_CYAN)
    tb_a1 = s4.shapes.add_textbox(Inches(1.05), col_y + Inches(0.65), col_w - Inches(0.5), col_h - Inches(0.8))
    tf_a1 = tb_a1.text_frame
    tf_a1.word_wrap = True
    tf_a1.margin_left = tf_a1.margin_top = tf_a1.margin_right = tf_a1.margin_bottom = 0

    arch_points = [
        ("Decoupled Micro-Pipeline", "Sequential agent state machine with asynchronous execution and event logging to AgentAction table."),
        ("Real-Time Telemetry via SSE", "Server-Sent Events stream live status, thinking rationale, and progress tokens directly to Next.js client."),
        ("Human-in-the-Loop Interrupt", "Pipeline pauses with 'waiting_for_user' on incomplete inputs; resumes seamlessly upon user chat reply."),
        ("Explainable AI (XAI)", "Every agent decision includes an inspectable reasoning field explaining the 'why' behind classifications.")
    ]
    for idx, (title, desc) in enumerate(arch_points):
        p_a = tf_a1.paragraphs[0] if idx == 0 else tf_a1.add_paragraph()
        if idx > 0:
            p_a.space_before = Pt(8)
        r_t = p_a.add_run()
        r_t.text = f"• {title}\n"
        r_t.font.size = Pt(11)
        r_t.font.bold = True
        r_t.font.color.rgb = ACCENT_CYAN
        r_t.font.name = "Segoe UI"
        r_d = p_a.add_run()
        r_d.text = desc
        r_d.font.size = Pt(10.5)
        r_d.font.color.rgb = TEXT_WHITE
        r_d.font.name = "Segoe UI"

    # Col 2: Locked Tech Stack
    cx2 = Inches(0.8) + col_w + col_gap
    create_card(s4, cx2, col_y, col_w, col_h, "Locked Tech Stack", ACCENT_BLUE)
    tb_a2 = s4.shapes.add_textbox(cx2 + Inches(0.25), col_y + Inches(0.65), col_w - Inches(0.5), col_h - Inches(0.8))
    tf_a2 = tb_a2.text_frame
    tf_a2.word_wrap = True
    tf_a2.margin_left = tf_a2.margin_top = tf_a2.margin_right = tf_a2.margin_bottom = 0

    stack_points = [
        ("Frontend Layer", "Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons, Glassmorphism design tokens."),
        ("Backend Services", "FastAPI (Python 3.11+ async), Pydantic v2 strict schemas, Uvicorn ASGI server."),
        ("Database & ORM", "PostgreSQL / SQLite, SQLAlchemy 2.0 async engine, Alembic database migrations."),
        ("Vector DB & Embeddings", "ChromaDB persistent client + sentence-transformers/all-MiniLM-L6-v2 embeddings."),
        ("Browser Harness", "Selenium 4 Headless Chrome with DevTools protocol capture."),
        ("LLM Engine", "Groq LPU (llama-3.3-70b-versatile) & OpenAI GPT-4o with deterministic demo fallback.")
    ]
    for idx, (title, desc) in enumerate(stack_points):
        p_a = tf_a2.paragraphs[0] if idx == 0 else tf_a2.add_paragraph()
        if idx > 0:
            p_a.space_before = Pt(6)
        r_t = p_a.add_run()
        r_t.text = f"• {title}: "
        r_t.font.size = Pt(10.5)
        r_t.font.bold = True
        r_t.font.color.rgb = ACCENT_BLUE
        r_t.font.name = "Segoe UI"
        r_d = p_a.add_run()
        r_d.text = desc
        r_d.font.size = Pt(10)
        r_d.font.color.rgb = TEXT_WHITE
        r_d.font.name = "Segoe UI"

    # Col 3: Uniqueness & Differentiation
    cx3 = Inches(0.8) + 2 * (col_w + col_gap)
    create_card(s4, cx3, col_y, col_w, col_h, "What Differentiates It", ACCENT_AMBER)
    tb_a3 = s4.shapes.add_textbox(cx3 + Inches(0.25), col_y + Inches(0.65), col_w - Inches(0.5), col_h - Inches(0.8))
    tf_a3 = tb_a3.text_frame
    tf_a3.word_wrap = True
    tf_a3.margin_left = tf_a3.margin_top = tf_a3.margin_right = tf_a3.margin_bottom = 0

    diff_points = [
        ("Executable Reproduction vs Text Only", "Traditional AI tools merely summarize tickets. BugTriage.ai actually writes code and drives a real headless browser to prove the bug."),
        ("Semantic vs Keyword Deduplication", "Matches conceptually identical bugs regardless of wording ('OAuth popup hangs' matches 'Google SSO infinite spinner')."),
        ("Active Clarification Loop", "Refuses to guess missing information; pauses execution to query the reporter interactively in real time."),
        ("Enterprise Observability", "Complete developer feedback loop rating accuracy and full telemetry logs stored permanently in the database.")
    ]
    for idx, (title, desc) in enumerate(diff_points):
        p_a = tf_a3.paragraphs[0] if idx == 0 else tf_a3.add_paragraph()
        if idx > 0:
            p_a.space_before = Pt(8)
        r_t = p_a.add_run()
        r_t.text = f"• {title}\n"
        r_t.font.size = Pt(11)
        r_t.font.bold = True
        r_t.font.color.rgb = ACCENT_AMBER
        r_t.font.name = "Segoe UI"
        r_d = p_a.add_run()
        r_d.text = desc
        r_d.font.size = Pt(10.5)
        r_d.font.color.rgb = TEXT_WHITE
        r_d.font.name = "Segoe UI"

    s4.notes_slide.notes_text_frame.text = (
        "Slide 4 Speaker Notes:\n"
        "Turning to technical architecture and uniqueness: what makes BugTriage.ai truly stand out is that we do NOT build another simple LLM wrapper. "
        "We combine deterministic vector cosine similarity in ChromaDB with live browser execution via Selenium 4. "
        "Our backend is built on asynchronous FastAPI with Server-Sent Events streaming directly to Next.js 14. "
        "Most importantly, BugTriage.ai actually synthesizes executable Python code and runs headless tests to provide indisputable DOM evidence."
    )

    # ==========================================
    # SLIDE 5: REAL-WORLD FEASIBILITY & OUTCOMES
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Slide 05 • Real-World Feasibility & Metrics", "Deployment, Scalability, Cost & Measurable Outcomes", "Engineered for turnkey enterprise adoption with high ROI and minimal operational friction.")

    # 5 Structured Cards
    # Top Row: 3 Cards (Deployment, Scalability, Cost/Resources)
    top_w = Inches(3.72)
    top_h = Inches(2.4)
    top_y = Inches(1.85)

    feasibility_top = [
        {
            "title": "Turnkey Deployment",
            "color": ACCENT_CYAN,
            "bullets": [
                "Full Docker & Docker Compose setup across frontend, backend, PostgreSQL, and ChromaDB.",
                "Cloud-ready for AWS ECS/EKS, GCP Cloud Run, or on-prem Kubernetes clusters.",
                "Zero external DB dependencies required for local testing (supports SQLite fallback)."
            ]
        },
        {
            "title": "Infinite Scalability",
            "color": ACCENT_BLUE,
            "bullets": [
                "Stateless FastAPI worker pods scale horizontally behind Nginx load balancers.",
                "ChromaDB vector collections partitioned by repository, organization, or domain.",
                "Celery/Redis worker queues isolate headless browser automation runs."
            ]
        },
        {
            "title": "Cost & Resource Efficiency",
            "color": ACCENT_GREEN,
            "bullets": [
                "Ultra-lean inference: Free local embeddings (`all-MiniLM-L6-v2`) + Groq LPU (<$0.002 per triage).",
                "Lightweight baseline footprint: Runs comfortably on 2 vCPUs and 4GB RAM.",
                "Deterministic fallback mode enables 100% offline evaluation without API bills."
            ]
        }
    ]

    for i, c in enumerate(feasibility_top):
        cx = Inches(0.8) + i * (top_w + card_gap)
        create_card(s5, cx, top_y, top_w, top_h, c["title"], c["color"])

        tb_fc = s5.shapes.add_textbox(cx + Inches(0.2), top_y + Inches(0.55), top_w - Inches(0.4), top_h - Inches(0.65))
        tf_fc = tb_fc.text_frame
        tf_fc.word_wrap = True
        tf_fc.margin_left = tf_fc.margin_top = tf_fc.margin_right = tf_fc.margin_bottom = 0

        for b_idx, b_text in enumerate(c["bullets"]):
            p_b = tf_fc.paragraphs[0] if b_idx == 0 else tf_fc.add_paragraph()
            if b_idx > 0:
                p_b.space_before = Pt(4)
            r_b = p_b.add_run()
            r_b.text = f"• {b_text}"
            r_b.font.size = Pt(10.5)
            r_b.font.color.rgb = TEXT_WHITE
            r_b.font.name = "Segoe UI"

    # Bottom Row: 2 Wide Cards (Practical Adoption & Expected Measurable Outcomes)
    bot_y = Inches(4.45)
    bot_w1 = Inches(5.0)
    bot_w2 = Inches(6.45)
    bot_h = Inches(2.55)

    # Card: Practical Adoption
    create_card(s5, Inches(0.8), bot_y, bot_w1, bot_h, "Practical Adoption & Integration", ACCENT_PURPLE)
    tb_ad = s5.shapes.add_textbox(Inches(1.0), bot_y + Inches(0.55), bot_w1 - Inches(0.4), bot_h - Inches(0.65))
    tf_ad = tb_ad.text_frame
    tf_ad.word_wrap = True
    tf_ad.margin_left = tf_ad.margin_top = tf_ad.margin_right = tf_ad.margin_bottom = 0

    adoption_bullets = [
        ("Jira & GitHub Sync", "Bi-directional webhooks automatically ingest issues and post formatted triage evidence back to existing issue trackers."),
        ("Low Friction Onboarding", "Engineers don't need new tools; they receive pre-reproduced tickets directly in Slack, Linear, or Jira."),
        ("Advisory Mode", "Teams can run BugTriage.ai in 'co-pilot / advisory mode' with human developer ratings before enabling full automated assignment.")
    ]
    for idx, (title, desc) in enumerate(adoption_bullets):
        p_b = tf_ad.paragraphs[0] if idx == 0 else tf_ad.add_paragraph()
        if idx > 0:
            p_b.space_before = Pt(5)
        r_t = p_b.add_run()
        r_t.text = f"• {title}: "
        r_t.font.size = Pt(10.5)
        r_t.font.bold = True
        r_t.font.color.rgb = ACCENT_PURPLE
        r_t.font.name = "Segoe UI"
        r_d = p_b.add_run()
        r_d.text = desc
        r_d.font.size = Pt(10)
        r_d.font.color.rgb = TEXT_WHITE
        r_d.font.name = "Segoe UI"

    # Card: Measurable Outcomes with Metric Badges
    create_card(s5, Inches(6.08), bot_y, bot_w2, bot_h, "Expected Measurable Outcomes", ACCENT_AMBER)
    tb_out = s5.shapes.add_textbox(Inches(6.28), bot_y + Inches(0.55), bot_w2 - Inches(0.4), bot_h - Inches(0.65))
    tf_out = tb_out.text_frame
    tf_out.word_wrap = True
    tf_out.margin_left = tf_out.margin_top = tf_out.margin_right = tf_out.margin_bottom = 0

    metrics = [
        ("85% Reduction in Triage Time", "From 4+ hours of manual back-and-forth down to < 45 seconds autonomous execution."),
        ("90%+ Duplicate Detection Accuracy", "Stops backlog bloat and redundant developer investigations with vector similarity scoring."),
        ("70% Drop in 'Cannot Reproduce' Closures", "Mandatory completeness validation + synthesized Selenium test scripts ensure actionable reports."),
        ("$50,000+ Annual Cost Savings Per Squad", "Reclaims ~10 hours/week of senior engineering capacity for core roadmap features.")
    ]
    for idx, (title, desc) in enumerate(metrics):
        p_b = tf_out.paragraphs[0] if idx == 0 else tf_out.add_paragraph()
        if idx > 0:
            p_b.space_before = Pt(5)
        r_t = p_b.add_run()
        r_t.text = f"✓ {title}: "
        r_t.font.size = Pt(10.5)
        r_t.font.bold = True
        r_t.font.color.rgb = ACCENT_GREEN
        r_t.font.name = "Segoe UI"
        r_d = p_b.add_run()
        r_d.text = desc
        r_d.font.size = Pt(10)
        r_d.font.color.rgb = TEXT_WHITE
        r_d.font.name = "Segoe UI"

    s5.notes_slide.notes_text_frame.text = (
        "Slide 5 Speaker Notes:\n"
        "Regarding real-world feasibility: BugTriage.ai is completely containerized with Docker and ready for enterprise cloud deployment on Kubernetes or AWS ECS. "
        "Because we leverage local vector embeddings and high-speed Groq LPU inference, running a full triage costs less than a fraction of a cent ($0.002). "
        "The ROI is tremendous: an 85% reduction in triage time, 90%+ duplicate identification, and over $50,000 saved per engineering squad annually."
    )

    # ==========================================
    # SLIDE 6: TECHNICAL DEMO (LIVE SHOWCASE)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Slide 06 • Live Technical Prototype", "Technical Demonstration & Working Prototype", "Live execution of the end-to-end multi-agent pipeline on localhost:3000.", ACCENT_GREEN)

    # Banner Card for Live Demo
    banner = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.85), Inches(11.733), Inches(0.75))
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(16, 185, 129)
    banner.line.color.rgb = ACCENT_GREEN
    tf_bn = banner.text_frame
    tf_bn.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_bn = tf_bn.paragraphs[0]
    p_bn.alignment = PP_ALIGN.CENTER
    r_bn = p_bn.add_run()
    r_bn.text = "► SWITCHING TO LIVE BROWSER PROTOTYPE (http://localhost:3000/demo)"
    r_bn.font.size = Pt(15)
    r_bn.font.bold = True
    r_bn.font.color.rgb = RGBColor(11, 15, 25)
    r_bn.font.name = "Segoe UI"

    # 4 Scenario Showcase Cards
    demo_cards = [
        {
            "num": "01",
            "title": "Clarification Loop",
            "tag": "Interactive Chat Pause",
            "color": ACCENT_BLUE,
            "desc": "Submit ambiguous report ('Login broken'). Triage Agent detects missing steps, halts pipeline with 'waiting_for_user', and launches clarification chat."
        },
        {
            "num": "02",
            "title": "Duplicate Detection",
            "tag": "ChromaDB Vector Match",
            "color": ACCENT_CYAN,
            "desc": "Submit paraphrased Google OAuth bug. Intelligence Agent vectors match existing defect with >85% cosine similarity and side-by-side diff."
        },
        {
            "num": "03",
            "title": "Headless Reproduction",
            "tag": "Selenium 4 Script & Proof",
            "color": ACCENT_PURPLE,
            "desc": "Submit avatar upload defect. Reproduction Agent generates Python Selenium script, executes headless, and renders DOM screenshot & console logs."
        },
        {
            "num": "04",
            "title": "Full E2E Routing",
            "tag": "Regression & Markdown Report",
            "color": ACCENT_AMBER,
            "desc": "Submit checkout 500 error after release v2.4.1. Orchestrates all 4 agents via SSE, tags P0 priority, assigns Core Payments team, and outputs executive report."
        }
    ]

    card_dw = Inches(2.72)
    card_dgap = Inches(0.28)
    card_dy = Inches(2.8)
    card_dh = Inches(2.7)

    for i, d in enumerate(demo_cards):
        dx = Inches(0.8) + i * (card_dw + card_dgap)
        create_card(s6, dx, card_dy, card_dw, card_dh, title="", border_color=d["color"])

        tb_d = s6.shapes.add_textbox(dx + Inches(0.18), card_dy + Inches(0.15), card_dw - Inches(0.36), card_dh - Inches(0.3))
        tf_d = tb_d.text_frame
        tf_d.word_wrap = True
        tf_d.margin_left = tf_d.margin_top = tf_d.margin_right = tf_d.margin_bottom = 0

        p_dn = tf_d.paragraphs[0]
        r_dn = p_dn.add_run()
        r_dn.text = f"SCENARIO {d['num']}"
        r_dn.font.size = Pt(10)
        r_dn.font.bold = True
        r_dn.font.color.rgb = d["color"]
        r_dn.font.name = "Segoe UI"

        p_dt = tf_d.add_paragraph()
        p_dt.space_before = Pt(4)
        r_dt = p_dt.add_run()
        r_dt.text = d["title"]
        r_dt.font.size = Pt(14)
        r_dt.font.bold = True
        r_dt.font.color.rgb = TEXT_WHITE
        r_dt.font.name = "Segoe UI"

        p_tag = tf_d.add_paragraph()
        p_tag.space_before = Pt(2)
        r_tag = p_tag.add_run()
        r_tag.text = d["tag"]
        r_tag.font.size = Pt(9.5)
        r_tag.font.bold = True
        r_tag.font.color.rgb = d["color"]
        r_tag.font.name = "Segoe UI"

        p_dd = tf_d.add_paragraph()
        p_dd.space_before = Pt(6)
        r_dd = p_dd.add_run()
        r_dd.text = d["desc"]
        r_dd.font.size = Pt(9.5)
        r_dd.font.color.rgb = TEXT_MUTED
        r_dd.font.name = "Segoe UI"

    # Bottom Live Demo Guidance Bar
    guide_bar = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.7), Inches(11.733), Inches(1.3))
    guide_bar.fill.solid()
    guide_bar.fill.fore_color.rgb = CARD_BG
    guide_bar.line.color.rgb = CARD_BORDER
    guide_bar.line.width = Pt(1)

    tb_gb = s6.shapes.add_textbox(Inches(1.0), Inches(5.8), Inches(11.333), Inches(1.1))
    tf_gb = tb_gb.text_frame
    tf_gb.word_wrap = True
    tf_gb.margin_left = tf_gb.margin_top = tf_gb.margin_right = tf_gb.margin_bottom = 0

    p_gb1 = tf_gb.paragraphs[0]
    r_gb1 = p_gb1.add_run()
    r_gb1.text = "CORE USER JOURNEY & KEY HIGHLIGHTS TO DEMONSTRATE:"
    r_gb1.font.size = Pt(11)
    r_gb1.font.bold = True
    r_gb1.font.color.rgb = ACCENT_GREEN
    r_gb1.font.name = "Segoe UI"

    steps_text = [
        "1. Ingestion & SSE Live Progress Bar: Real-time multi-agent state progression with zero page reloads.",
        "2. Explainable AI Reasoning: Click any agent badge to inspect 'Agent Reasoning' explaining why it made each decision.",
        "3. Tangible Output: Live synthesized Selenium script, captured DOM evidence screenshot, and executive Markdown report ready for developer assignment."
    ]
    for s_idx, st in enumerate(steps_text):
        p_s = tf_gb.add_paragraph()
        p_s.space_before = Pt(3)
        r_s = p_s.add_run()
        r_s.text = f"• {st}"
        r_s.font.size = Pt(10)
        r_s.font.color.rgb = TEXT_WHITE
        r_s.font.name = "Segoe UI"

    s6.notes_slide.notes_text_frame.text = (
        "Slide 6 Speaker Notes:\n"
        "And now, we transition directly to our live working prototype!\n"
        "On localhost:3000/demo, we have 4 one-click showcase scenarios wired to our live FastAPI backend. "
        "Watch as we trigger Scenario 1 to demonstrate the interactive clarification loop, and Scenario 4 to witness all 4 agents stream real-time telemetry via Server-Sent Events, "
        "execute headless reproduction, and compile the final developer triage report in under 45 seconds."
    )

    # Save presentation
    prs.save(output_path)
    print(f"Successfully generated PowerPoint presentation at: {output_path}")

if __name__ == "__main__":
    create_bugtriage_presentation()
