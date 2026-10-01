import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1600,1050")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

artifact_dir = "C:/Users/ssrhs/.gemini/antigravity-ide/brain/941d2251-79d6-4d6c-ac88-0a174d5faad7/"
results = {
    "landing_page": False,
    "hero_3d_animation": False,
    "agent_switchers": False,
    "demo_page": False,
    "scenario_modal": False,
    "scenario_1_clarification": False,
    "scenario_2_dedup": False,
    "scenario_3_repro": False,
    "scenario_4_routing": False,
    "dashboard_page": False,
    "bugs_page": False,
    "console_errors": []
}

try:
    print("=== 1. VERIFYING LANDING PAGE ===")
    driver.get("http://localhost:3000/")
    time.sleep(2.5)
    
    # Check title
    h1 = driver.find_element(By.TAG_NAME, "h1")
    print(f"Landing H1: {h1.text}")
    assert "Autonomous bug triage" in h1.text
    driver.save_screenshot(artifact_dir + "verified_01_landing_hero.png")
    results["landing_page"] = True

    # Scroll to 3D Architecture section
    arch = driver.find_element(By.ID, "architecture")
    driver.execute_script("arguments[0].scrollIntoView({behavior: 'instant', block: 'center'});", arch)
    time.sleep(1.5)
    driver.save_screenshot(artifact_dir + "verified_02_landing_3d_section.png")
    results["hero_3d_animation"] = True

    # Test Agent Switcher Buttons
    agent_buttons = arch.find_elements(By.XPATH, ".//button[contains(., 'STAGE')]")
    print(f"Found {len(agent_buttons)} agent switcher buttons")
    if len(agent_buttons) >= 4:
        # Click Intelligence Agent (Stage 02)
        agent_buttons[1].click()
        time.sleep(0.5)
        # Click Reproduction Agent (Stage 03)
        agent_buttons[2].click()
        time.sleep(0.5)
        driver.save_screenshot(artifact_dir + "verified_03_agent_drawer_repro.png")
        results["agent_switchers"] = True

    print("\n=== 2. VERIFYING DEMO LAB & PRESENTATION SUITE ===")
    driver.get("http://localhost:3000/demo")
    time.sleep(2)
    driver.save_screenshot(artifact_dir + "verified_04_demo_overview.png")

    # Check 4 scenario cards
    scenario_cards = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
    print(f"Found {len(scenario_cards)} scenario cards")
    assert len(scenario_cards) == 4
    results["demo_page"] = True

    # Click Scenario 1 Presentation Demo
    scenario_cards[0].click()
    time.sleep(1.5)
    results["scenario_modal"] = True

    # Toggle Pitch Notes
    pitch_btn = driver.find_element(By.XPATH, "//button[contains(., 'Pitch Notes')]")
    pitch_btn.click()
    time.sleep(0.5)

    # Jump to Act 04 (Verification)
    act4_btn = driver.find_element(By.XPATH, "//button[contains(., '04 Verification')]")
    act4_btn.click()
    time.sleep(1)
    driver.save_screenshot(artifact_dir + "verified_05_scenario1_clarification_chat.png")
    results["scenario_1_clarification"] = True

    # Switch to Scenario 2 via top pill "Sc 02"
    sc2_pill = driver.find_element(By.XPATH, "//button[contains(., 'Sc 02')]")
    sc2_pill.click()
    time.sleep(1)
    act4_btn = driver.find_element(By.XPATH, "//button[contains(., '04 Verification')]")
    act4_btn.click()
    time.sleep(1)
    driver.save_screenshot(artifact_dir + "verified_06_scenario2_vector_diff.png")
    results["scenario_2_dedup"] = True

    # Switch to Scenario 3 via top pill "Sc 03"
    sc3_pill = driver.find_element(By.XPATH, "//button[contains(., 'Sc 03')]")
    sc3_pill.click()
    time.sleep(1)
    act4_btn = driver.find_element(By.XPATH, "//button[contains(., '04 Verification')]")
    act4_btn.click()
    time.sleep(1)
    driver.save_screenshot(artifact_dir + "verified_07_scenario3_selenium_script.png")
    results["scenario_3_repro"] = True

    # Switch to Scenario 4 via top pill "Sc 04"
    sc4_pill = driver.find_element(By.XPATH, "//button[contains(., 'Sc 04')]")
    sc4_pill.click()
    time.sleep(1)
    act4_btn = driver.find_element(By.XPATH, "//button[contains(., '04 Verification')]")
    act4_btn.click()
    time.sleep(1)
    driver.save_screenshot(artifact_dir + "verified_08_scenario4_regression_routing.png")
    results["scenario_4_routing"] = True

    # Jump to Act 05 (Resolution & Certificate)
    act5_btn = driver.find_element(By.XPATH, "//button[contains(., '05 Resolution')]")
    act5_btn.click()
    time.sleep(1)
    driver.save_screenshot(artifact_dir + "verified_09_scenario4_verified_certificate.png")

    # Close modal
    close_btn = driver.find_element(By.XPATH, "//button[contains(., 'Close')]")
    close_btn.click()
    time.sleep(1)

    print("\n=== 3. VERIFYING DASHBOARD PAGE ===")
    driver.get("http://localhost:3000/dashboard")
    time.sleep(2)
    dash_h1 = driver.find_element(By.TAG_NAME, "h1")
    print(f"Dashboard H1: {dash_h1.text}")
    driver.save_screenshot(artifact_dir + "verified_10_dashboard_page.png")
    results["dashboard_page"] = True

    print("\n=== 4. VERIFYING BUGS PAGE ===")
    driver.get("http://localhost:3000/bugs")
    time.sleep(2)
    bugs_h1 = driver.find_element(By.TAG_NAME, "h1")
    print(f"Bugs H1: {bugs_h1.text}")
    driver.save_screenshot(artifact_dir + "verified_11_bugs_page.png")
    results["bugs_page"] = True

    # Check console logs
    logs = driver.get_log('browser')
    severe_errors = [entry['message'] for entry in logs if entry['level'] == 'SEVERE']
    results["console_errors"] = severe_errors
    print(f"\nConsole SEVERE errors count: {len(severe_errors)}")
    for err in severe_errors:
        print(f"  - {err[:150]}")

except Exception as e:
    print(f"Verification error: {e}")
    driver.save_screenshot(artifact_dir + "verification_failure.png")
finally:
    driver.quit()
    print("\n=== VERIFICATION SUMMARY ===")
    print(json.dumps(results, indent=2))
