"""Development-only browser verification and unedited screenshot capture."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT / 'game')))
Thread(target=server.serve_forever, daemon=True).start()
shots = ROOT / 'screenshots'
shots.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'http://127.0.0.1:{server.server_port}/', wait_until='networkidle')
    page.screenshot(path=str(shots / '2-title.jpg'), type='jpeg', quality=85)
    page.locator('#start').click()
    bounds = page.locator('#left').bounding_box()
    def click(x, y):
        page.mouse.click(bounds['x'] + x * bounds['width'] / 500, bounds['y'] + y * bounds['height'] / 500)
    click(250, 150)
    assert page.locator('#penalties').inner_text() == '1 penalties'
    click(405, 85)
    click(117, 250)
    assert page.locator('.mark').count() == 4
    assert page.locator('#remaining').inner_text() == '3 differences remain'
    page.wait_for_timeout(700)
    page.screenshot(path=str(shots / '1-hunt.jpg'), type='jpeg', quality=85)
    click(268, 337)
    click(414, 391)
    click(80, 439)
    assert page.locator('#win').is_visible()
    assert page.locator('#result').inner_text() == 'All five differences found with 1 penalties.'
    page.screenshot(path=str(shots / '3-complete.jpg'), type='jpeg', quality=85)
    page.locator('#again').click()
    assert page.locator('.mark').count() == 0
    assert page.locator('#remaining').inner_text() == '5 differences remain'
    page.keyboard.press('h')
    assert page.locator('.pulse').count() == 2
    assert page.locator('#penalties').inner_text() == '2 penalties'
    page.keyboard.press('r')
    assert page.locator('#penalties').inner_text() == '0 penalties'
    assert not errors, errors
    print('PASS: title, wrong-click penalty, paired markers, five finds, win, restart, hint, keyboard shortcuts; browser errors:', len(errors))
    browser.close()
server.shutdown()
