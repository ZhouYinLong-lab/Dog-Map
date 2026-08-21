import { expect, test } from '@playwright/test'

test('renders the route archive and destination markers', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Dog Map/)
  await expect(page.locator('.map-view')).toBeVisible()
  await expect(page.locator('.place-marker')).toHaveCount(2)
  await expect(page.getByRole('region', { name: '路线图例' })).toBeVisible()
})

test('opens and closes a destination detail drawer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：平江路' }).click()
  await expect(page.getByRole('complementary', { name: '平江路详情' })).toBeVisible()
  await expect(page.getByText('旧城里的慢速切片')).toBeVisible()
  await page.getByRole('button', { name: '关闭详情' }).click()
  await expect(page.getByRole('complementary', { name: '平江路详情' })).toHaveCount(0)
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})
