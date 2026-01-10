/**
 * Performance Testing with Chrome Lighthouse & DevTools (Playwright)
 * 
 * This script runs:
 * 1. Chrome Lighthouse audit (performance, accessibility, best practices, SEO)
 * 2. Chrome DevTools Performance trace (CPU, memory, network timing)
 * 
 * Usage:
 *   bun run test:perf              # Run against default URL (http://localhost:4321)
 *   bun run test:perf --url=https://example.com  # Run against custom URL
 */

import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(__dirname, '../performance-results');

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const TARGET_URL = urlArg ? urlArg.split('=')[1] : 'http://localhost:4321';

// Ensure results directory exists
if (!existsSync(RESULTS_DIR)) {
  mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format milliseconds to human readable string
 */
function formatTime(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Run Chrome Lighthouse audit using Playwright's CDP connection
 */
async function runLighthouse(browser, url) {
  console.log('\n🔦 Running Lighthouse audit...\n');
  
  // Get the CDP endpoint from Playwright browser
  const cdpEndpoint = browser.contexts()[0]?.pages()[0] 
    ? await browser.newBrowserCDPSession()
    : null;
  
  // Launch a separate Chrome instance for Lighthouse with remote debugging
  const debuggingPort = 9222;
  const lighthouseBrowser = await chromium.launch({
    headless: true,
    args: [
      `--remote-debugging-port=${debuggingPort}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const result = await lighthouse(url, {
      port: debuggingPort,
      output: ['json', 'html'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    const { lhr, report } = result;
    
    // Save HTML report
    const htmlPath = join(RESULTS_DIR, 'lighthouse-report.html');
    writeFileSync(htmlPath, report[1]);
    
    // Save JSON report
    const jsonPath = join(RESULTS_DIR, 'lighthouse-report.json');
    writeFileSync(jsonPath, report[0]);

    // Extract and display key metrics
    const categories = lhr.categories;
    const audits = lhr.audits;

    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│               🏆 LIGHTHOUSE SCORES                          │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    Object.values(categories).forEach(cat => {
      const score = Math.round(cat.score * 100);
      const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
      const emoji = score >= 90 ? '🟢' : score >= 50 ? '🟡' : '🔴';
      console.log(`│ ${emoji} ${cat.title.padEnd(20)} ${bar} ${String(score).padStart(3)}% │`);
    });

    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│               ⚡ CORE WEB VITALS                            │');
    console.log('├─────────────────────────────────────────────────────────────┤');

    const vitals = {
      'first-contentful-paint': { name: 'First Contentful Paint (FCP)', unit: 's' },
      'largest-contentful-paint': { name: 'Largest Contentful Paint (LCP)', unit: 's' },
      'total-blocking-time': { name: 'Total Blocking Time (TBT)', unit: 'ms' },
      'cumulative-layout-shift': { name: 'Cumulative Layout Shift (CLS)', unit: '' },
      'speed-index': { name: 'Speed Index', unit: 's' },
      'interactive': { name: 'Time to Interactive (TTI)', unit: 's' },
    };

    Object.entries(vitals).forEach(([key, { name }]) => {
      const audit = audits[key];
      if (audit) {
        const value = audit.displayValue || audit.numericValue || 'N/A';
        const scoreEmoji = audit.score >= 0.9 ? '🟢' : audit.score >= 0.5 ? '🟡' : '🔴';
        console.log(`│ ${scoreEmoji} ${name.padEnd(35)} ${String(value).padStart(10)} │`);
      }
    });

    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log(`\n📄 Reports saved to: ${RESULTS_DIR}`);
    console.log(`   - lighthouse-report.html`);
    console.log(`   - lighthouse-report.json`);

    return lhr;
  } finally {
    await lighthouseBrowser.close();
  }
}

/**
 * Run Chrome DevTools Performance trace using Playwright
 */
async function runDevToolsPerformance(browser, url) {
  console.log('\n\n📊 Running Chrome DevTools Performance trace...\n');
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();
  
  // Get CDP session for advanced metrics
  const cdpSession = await context.newCDPSession(page);
  await cdpSession.send('Performance.enable');
  
  // Start tracing
  await browser.startTracing(page, {
    screenshots: true,
    categories: [
      'devtools.timeline',
      'blink.user_timing',
      'loading',
      'devtools.timeline.frame',
      'blink.resource_timing',
    ],
  });

  // Navigate and wait for network idle
  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  const loadTime = Date.now() - startTime;
  
  // Simulate user interaction - scroll the page
  await page.evaluate(() => {
    return new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });

  // Stop tracing and save
  const traceBuffer = await browser.stopTracing();
  const tracePath = join(RESULTS_DIR, 'devtools-trace.json');
  writeFileSync(tracePath, traceBuffer);

  // Get performance metrics via CDP
  const { metrics } = await cdpSession.send('Performance.getMetrics');
  const metricsMap = {};
  metrics.forEach(m => { metricsMap[m.name] = m.value; });

  // Get performance timings from page
  const performanceTimings = await page.evaluate(() => {
    const timing = performance.timing;
    const paint = performance.getEntriesByType('paint');
    const navigation = performance.getEntriesByType('navigation')[0];
    
    return {
      // Navigation Timing
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseStart - timing.requestStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      domComplete: timing.domComplete - timing.navigationStart,
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      
      // Paint Timing
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      
      // Transfer sizes (if available)
      transferSize: navigation?.transferSize || 0,
      encodedBodySize: navigation?.encodedBodySize || 0,
      decodedBodySize: navigation?.decodedBodySize || 0,
    };
  });

  // Get resource metrics
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    return entries.map(entry => ({
      name: entry.name.split('/').pop().substring(0, 40),
      type: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize || 0,
    }));
  });

  // Display results
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│               🚀 DEVTOOLS PERFORMANCE METRICS               │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ TIMING BREAKDOWN                                            │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ DNS Lookup                       ${formatTime(performanceTimings.dnsLookup).padStart(20)} │`);
  console.log(`│ TCP Connection                   ${formatTime(performanceTimings.tcpConnection).padStart(20)} │`);
  console.log(`│ Server Response (TTFB)           ${formatTime(performanceTimings.serverResponse).padStart(20)} │`);
  console.log(`│ First Paint                      ${formatTime(performanceTimings.firstPaint).padStart(20)} │`);
  console.log(`│ First Contentful Paint           ${formatTime(performanceTimings.firstContentfulPaint).padStart(20)} │`);
  console.log(`│ DOM Content Loaded               ${formatTime(performanceTimings.domContentLoaded).padStart(20)} │`);
  console.log(`│ DOM Complete                     ${formatTime(performanceTimings.domComplete).padStart(20)} │`);
  console.log(`│ Page Load                        ${formatTime(performanceTimings.pageLoad).padStart(20)} │`);
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ MEMORY & JS METRICS                                         │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ JS Heap Used                     ${formatBytes(metricsMap.JSHeapUsedSize || 0).padStart(20)} │`);
  console.log(`│ JS Heap Total                    ${formatBytes(metricsMap.JSHeapTotalSize || 0).padStart(20)} │`);
  console.log(`│ DOM Nodes                        ${String(Math.round(metricsMap.Nodes || 0)).padStart(20)} │`);
  console.log(`│ Layout Count                     ${String(Math.round(metricsMap.LayoutCount || 0)).padStart(20)} │`);
  console.log(`│ Style Recalc Count               ${String(Math.round(metricsMap.RecalcStyleCount || 0)).padStart(20)} │`);
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ TRANSFER SIZE                                               │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ Document Transfer Size           ${formatBytes(performanceTimings.transferSize).padStart(20)} │`);
  console.log(`│ Document Encoded Size            ${formatBytes(performanceTimings.encodedBodySize).padStart(20)} │`);
  console.log(`│ Document Decoded Size            ${formatBytes(performanceTimings.decodedBodySize).padStart(20)} │`);
  console.log('└─────────────────────────────────────────────────────────────┘');

  // Resource breakdown
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│               📦 TOP RESOURCES BY SIZE                      │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  
  const sortedResources = resources
    .filter(r => r.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
  
  sortedResources.forEach(resource => {
    const name = resource.name.substring(0, 30).padEnd(30);
    const size = formatBytes(resource.size).padStart(12);
    const time = formatTime(resource.duration).padStart(10);
    console.log(`│ ${name} ${size} ${time} │`);
  });
  
  console.log('└─────────────────────────────────────────────────────────────┘');

  // Save detailed metrics JSON
  const metricsData = {
    url,
    timestamp: new Date().toISOString(),
    loadTime,
    performanceTimings,
    cdpMetrics: metricsMap,
    resources: resources.slice(0, 50),
  };
  
  const metricsPath = join(RESULTS_DIR, 'devtools-metrics.json');
  writeFileSync(metricsPath, JSON.stringify(metricsData, null, 2));
  
  console.log(`\n📄 DevTools reports saved:`);
  console.log(`   - devtools-trace.json (Open in Chrome DevTools > Performance)`);
  console.log(`   - devtools-metrics.json`);

  await context.close();
  return metricsData;
}

/**
 * Main test runner
 */
async function runPerformanceTests() {
  console.log('═'.repeat(63));
  console.log('       🔬 PERFORMANCE TEST SUITE - Lighthouse & DevTools');
  console.log('                     (Powered by Playwright)');
  console.log('═'.repeat(63));
  console.log(`\n🎯 Target URL: ${TARGET_URL}`);
  console.log(`📁 Results directory: ${RESULTS_DIR}\n`);

  let browser;
  
  try {
    // Launch browser with Playwright
    console.log('🚀 Launching Chrome via Playwright...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    // Run tests
    const lighthouseResults = await runLighthouse(browser, TARGET_URL);
    const devtoolsResults = await runDevToolsPerformance(browser, TARGET_URL);

    // Summary
    console.log('\n' + '═'.repeat(63));
    console.log('                    ✅ TEST COMPLETE');
    console.log('═'.repeat(63));
    
    const perfScore = Math.round(lighthouseResults.categories.performance.score * 100);
    console.log(`\n📊 Overall Performance Score: ${perfScore >= 90 ? '🟢' : perfScore >= 50 ? '🟡' : '🔴'} ${perfScore}/100`);
    console.log(`⏱️  Page Load Time: ${formatTime(devtoolsResults.loadTime)}`);
    console.log(`📦 Resources Loaded: ${devtoolsResults.resources.length}`);
    
    console.log('\n📂 All reports saved in:', RESULTS_DIR);
    console.log('   └── lighthouse-report.html   → Open in browser');
    console.log('   └── lighthouse-report.json   → Raw Lighthouse data');
    console.log('   └── devtools-trace.json      → Open in Chrome DevTools > Performance');
    console.log('   └── devtools-metrics.json    → Detailed timing metrics\n');

    return { lighthouse: lighthouseResults, devtools: devtoolsResults };
    
  } catch (error) {
    console.error('\n❌ Performance test failed:', error.message);
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('\n💡 Tip: Make sure your dev server is running!');
      console.error('   Run: bun run dev');
      console.error('   Or specify a different URL: bun run test:perf --url=https://example.com');
    }
    
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
runPerformanceTests();
