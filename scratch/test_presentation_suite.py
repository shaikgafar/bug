import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1600,1050")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=options)

try:
    print("Testing Landing Page Hero 3D Video Section...")
    driver.get("http://localhost:3000/")
    time.sleep(3)
    # Scroll down to #architecture
    arch = driver.find_element(By.ID, "architecture")
    driver.execute_script("arguments[0].scrollIntoView();", arch)
    time.sleep(1.5)
    driver.save_screenshot("C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/landing_hero_3d_bw_theme.png")
    print("Saved landing_hero_3d_bw_theme.png")

    print("Testing Demo Page Presentation Suite...")
    driver.get("http://localhost:3000/demo")
    time.sleep(2)

    # Click on first scenario card
    cards = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
    if cards:
        cards[0].click()
        time.sleep(1.5)
        # Capture modal open
        driver.save_screenshot("C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/presentation_modal_overview.png")
        print("Saved presentation_modal_overview.png")

        # Toggle Speaker Pitch Notes
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if "Pitch Notes" in btn.text:
                btn.click()
                break
        time.sleep(1)
        driver.save_screenshot("C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/presentation_speaker_notes_open.png")
        print("Saved presentation_speaker_notes_open.png")

        # Jump to Act 04 (Verification)
        for btn in buttons:
            if "04 Verification" in btn.text:
                btn.click()
                break
        time.sleep(1)
        driver.save_screenshot("C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/presentation_act04_breakthrough.png")
        print("Saved presentation_act04_breakthrough.png")

        # Jump to Act 05 (Resolution & Certificate)
        for btn in buttons:
            if "05 Resolution" in btn.text:
                btn.click()
                break
        time.sleep(1)
        driver.save_screenshot("C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/presentation_act05_verified.png")
        print("Saved presentation_act05_verified.png")

        # Switch to Scenario 4 (Regression & Routing)
        for btn in buttons:
            if "Sc 04" in btn.text:
                btn.click()
                break
        time.sleep(1.5)
        # Click 04 Verification on Scenario 4
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if "04 Verification" in btn.text:
                btn.click()
                break
        time.sleep(1)
        driver.save_screenshot("C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/presentation_scenario4_routing.png")
        print("Saved presentation_scenario4_routing.png")

finally:
    driver.quit()
    print("Test run complete.")
