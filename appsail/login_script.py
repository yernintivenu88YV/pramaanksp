from playwright.sync_api import sync_playwright
import time
import sys

def run(playwright, code, url="https://accounts.zoho.com/oauth/v3/device"):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    
    print(f"Navigating to device login: {url}...")
    page.goto(url)
    time.sleep(3)
    
    # Check if we need to login first
    if page.locator('input#login_id').is_visible():
        print("Entering email...")
        page.fill('input#login_id', 'kamisettyyogesh@gmail.com')
        page.click('button#nextbtn')
        page.wait_for_timeout(3000)
        
    if page.locator('input#password').is_visible():
        print("Entering password...")
        page.fill('input#password', 'k9966259115')
        page.click('button#nextbtn')
        page.wait_for_timeout(5000)
        
    print("Looking for verification code input...")
    try:
        # Wait until the device code input is visible (usually not login_id)
        page.wait_for_selector('input.usercode-input, input[placeholder*="code"]', timeout=10000)
        page.fill('input.usercode-input, input[placeholder*="code"]', code)
        page.keyboard.press('Enter')
    except Exception as e:
        print(f"Could not fill code via specific selector, trying fallback: {e}")
        try:
            # Try filling first generic text input if specific fails, but make sure it's not login_id
            page.fill('input[type="text"]:not(#login_id)', code)
            page.keyboard.press('Enter')
        except Exception as e2:
            print(f"Fallback also failed: {e2}")
        
    page.wait_for_timeout(3000)
    try:
        if page.locator('button:has-text("Accept"), button:has-text("Allow")').is_visible():
            print("Accepting consent...")
            page.click('button:has-text("Accept"), button:has-text("Allow")')
    except Exception:
        pass
        
    page.wait_for_timeout(5000)
    print("Done. Check terminal for success.")
    
    context.close()
    browser.close()

if __name__ == "__main__":
    if len(sys.argv) > 2:
        with sync_playwright() as playwright:
            run(playwright, sys.argv[1], sys.argv[2])
    elif len(sys.argv) > 1:
        with sync_playwright() as playwright:
            run(playwright, sys.argv[1])
