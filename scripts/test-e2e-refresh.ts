import { chromium } from 'playwright';

async function runE2ERefreshTest() {
  console.log('🚀 Starting Playwright E2E Hard-Reload Rehydration Tests...');
  const appUrl = process.env.TEST_APP_URL || 'http://localhost:3000';

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // TEST 1: Desktop Viewport (1280x720)
    // -------------------------------------------------------------
    console.log('\n🖥️ Running Desktop Viewport Rehydration Test (1280x720)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const desktopPage = await desktopContext.newPage();

    await desktopPage.goto(appUrl);
    await desktopPage.waitForLoadState('networkidle');

    // Fill Host Name in Create Form
    await desktopPage.fill('input[placeholder="e.g. Gautum"]', 'Desktop Host Manager');
    await desktopPage.click('button:has-text("Create Auction Room & Launch")');

    // Wait for Room Creation
    await desktopPage.waitForURL((url) => url.searchParams.has('room'), { timeout: 10000 });
    const desktopRoomCode = new URL(desktopPage.url()).searchParams.get('room');
    console.log(`  ✓ Desktop Room Created: ${desktopRoomCode}`);

    // Claim Franchise
    await desktopPage.waitForSelector('text=Click to Claim →', { timeout: 10000 });
    await desktopPage.click('text=Click to Claim →');

    // Fill Owner Name in Claim Modal
    await desktopPage.fill('input[placeholder="e.g. Gautum, Rohit, Nita"]', 'CSK Desktop Owner');
    await desktopPage.click('button:has-text("Claim Franchise")');
    console.log('  ✓ Claimed Franchise');

    // Start Mega Auction
    await desktopPage.waitForSelector('button:has-text("Start Mega Auction")', { timeout: 10000 });
    await desktopPage.click('button:has-text("Start Mega Auction")');

    // Wait for Bidding Arena
    await desktopPage.waitForSelector('h3', { timeout: 10000 });
    console.log('  ✓ Entered Bidding Arena');

    // Get live values before refresh
    const desktopPlayerName = await desktopPage.locator('h3').first().textContent();
    console.log(`  ✓ Current Player Before Refresh: ${desktopPlayerName?.trim()}`);

    // Place bid
    await desktopPage.click('button:has-text("BID")');
    await desktopPage.waitForTimeout(500);

    // Verify bid placed
    await desktopPage.waitForSelector('text=Holds Highest Bid', { timeout: 5000 });
    console.log('  ✓ Placed Bid (Now Holding Highest Bid)');

    // Perform Hard Reload
    console.log('  🔄 Performing hard page reload (F5)...');
    await desktopPage.reload({ waitUntil: 'networkidle' });

    // Assert Rehydration
    await desktopPage.waitForSelector('text=Holds Highest Bid', { timeout: 10000 });
    const rehydratedUrl = desktopPage.url();
    expect(rehydratedUrl).toContain(`room=${desktopRoomCode}`);

    const rehydratedPlayerName = await desktopPage.locator('h3').first().textContent();
    expect(rehydratedPlayerName?.trim()).toBe(desktopPlayerName?.trim());
    console.log(`  ✓ Rehydrated Player Name: ${rehydratedPlayerName?.trim()}`);
    console.log('  ✅ Desktop Hard-Reload Rehydration PASSED!');

    await desktopContext.close();

    // -------------------------------------------------------------
    // TEST 2: Mobile Viewport (375x667)
    // -------------------------------------------------------------
    console.log('\n📱 Running Mobile Viewport Rehydration Test (375x667)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(appUrl);
    await mobilePage.waitForLoadState('networkidle');

    // Fill Host Name in Create Form
    await mobilePage.fill('input[placeholder="e.g. Gautum"]', 'Mobile Host Manager');
    await mobilePage.click('button:has-text("Create Auction Room & Launch")');

    // Wait for Room Creation
    await mobilePage.waitForURL((url) => url.searchParams.has('room'), { timeout: 10000 });
    const mobileRoomCode = new URL(mobilePage.url()).searchParams.get('room');
    console.log(`  ✓ Mobile Room Created: ${mobileRoomCode}`);

    // Claim Franchise
    await mobilePage.waitForSelector('text=Click to Claim →', { timeout: 10000 });
    await mobilePage.click('text=Click to Claim →');

    // Fill Owner Name in Claim Modal
    await mobilePage.fill('input[placeholder="e.g. Gautum, Rohit, Nita"]', 'CSK Mobile Owner');
    await mobilePage.click('button:has-text("Claim Franchise")');
    console.log('  ✓ Claimed Franchise on Mobile');

    // Start Mega Auction
    await mobilePage.waitForSelector('button:has-text("Start Mega Auction")', { timeout: 10000 });
    await mobilePage.click('button:has-text("Start Mega Auction")');

    // Wait for Bidding Arena
    await mobilePage.waitForSelector('h3', { timeout: 10000 });
    console.log('  ✓ Entered Bidding Arena on Mobile');

    const mobilePlayerName = await mobilePage.locator('h3').first().textContent();
    console.log(`  ✓ Current Player Before Refresh (Mobile): ${mobilePlayerName?.trim()}`);

    // Place bid on Mobile
    await mobilePage.click('button:has-text("BID")');
    await mobilePage.waitForTimeout(500);

    // Verify bid placed on Mobile
    await mobilePage.waitForSelector('text=Holds Highest Bid', { timeout: 5000 });
    console.log('  ✓ Placed Bid on Mobile (Holding Highest Bid)');

    // Perform Hard Reload on Mobile
    console.log('  🔄 Performing hard page reload on mobile (F5)...');
    await mobilePage.reload({ waitUntil: 'networkidle' });

    // Assert Rehydration on Mobile
    await mobilePage.waitForSelector('text=Holds Highest Bid', { timeout: 10000 });
    const mobileRehydratedUrl = mobilePage.url();
    expect(mobileRehydratedUrl).toContain(`room=${mobileRoomCode}`);

    const mobileRehydratedPlayerName = await mobilePage.locator('h3').first().textContent();
    expect(mobileRehydratedPlayerName?.trim()).toBe(mobilePlayerName?.trim());
    console.log(`  ✓ Rehydrated Player Name (Mobile): ${mobileRehydratedPlayerName?.trim()}`);
    console.log('  ✅ Mobile Hard-Reload Rehydration PASSED!');

    await mobileContext.close();

    console.log('\n🎉 ALL E2E PLAYWRIGHT REFRESH REHYDRATION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ E2E Playwright Test Failed:', (err as Error).message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected "${String(expected)}" but got "${String(actual)}"`);
      }
    },
    toContain(expected: string) {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected "${String(actual)}" to contain "${expected}"`);
      }
    },
  };
}

if (require.main === module) {
  runE2ERefreshTest();
}
