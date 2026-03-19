const { chromium } = require('playwright');
const { exec } = require('child_process');

async function runTest() {
  console.log("Starting Flask server...");
  const server = exec('python3 app.py');

  // Wait a few seconds for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to http://127.0.0.1:7860...");
    await page.goto('http://127.0.0.1:7860');

    // Test Login instead of register since we might already exist
    console.log("Filling login form...");
    await page.fill('#login-username', 'testuser_playwright');
    await page.fill('#login-password', 'password123');

    console.log("Submitting login...");
    await page.click('form#login-form button[type="submit"]');

    // Wait for the dashboard to appear
    console.log("Waiting for dashboard...");
    await page.waitForSelector('#add-item-form', { state: 'visible', timeout: 10000 });
    console.log("Successfully logged in/registered!");

    // Take a screenshot
    await page.screenshot({ path: 'dashboard.png' });
    console.log("Screenshot saved to dashboard.png");

  } catch (error) {
    console.error("Test failed!", error);
    await page.screenshot({ path: 'error.png' });
  } finally {
    console.log("Closing browser and server...");
    await browser.close();
    server.kill('SIGINT');
  }
}

runTest();
