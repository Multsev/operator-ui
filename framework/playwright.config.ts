import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.015 } },
  snapshotPathTemplate: '{testDir}/../visual/{projectName}/{arg}{ext}',
  projects: [
    { name: 'desktop-1024', testIgnore: [/dpi\.spec\.ts/, /release-artifacts\.spec\.ts/], use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'desktop-1920', testIgnore: [/dpi\.spec\.ts/, /release-artifacts\.spec\.ts/], use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'desktop-800', testMatch: /visual\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 800, height: 600 } } },
    { name: 'desktop-1366', testMatch: /visual\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
    { name: 'desktop-2560', testMatch: /visual\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 2560, height: 1440 } } },
    { name: 'dpi-125', testMatch: /dpi\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1.25 } },
    { name: 'dpi-150', testMatch: /dpi\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1.5 } },
    { name: 'dpi-200', testMatch: /dpi\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 } },
    { name: 'release-artifacts', testMatch: /release-artifacts\.spec\.ts/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4174',
    port: 4174,
    reuseExistingServer: true,
  },
});
