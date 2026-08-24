import { expect, test } from '@playwright/test'

test('renders the route archive and destination markers', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Dog Map/)
  await expect(page.locator('.map-view')).toBeVisible()
  await expect(page.locator('.place-marker')).toHaveCount(3)
  await expect(page.locator('.place-marker__art')).toHaveCount(3)
  await expect(page.getByRole('button', { name: '打开地点：南京大学苏州校区' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('region', { name: '路线图例' })).toHaveCount(0)
})

test('opens and closes a destination detail drawer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：平江路' }).evaluate((element) => (element as HTMLElement).click())
  await expect(page.getByRole('complementary', { name: '平江路详情' })).toBeVisible()
  await expect(page.getByText('旧城里的慢速切片')).toBeVisible()
  await page.getByRole('button', { name: '关闭详情' }).click()
  await expect(page.getByRole('complementary', { name: '平江路详情' })).toHaveCount(0)
})

test('shows the selected place identity and hides map overlays in the detail view', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：南京大学苏州校区' }).click()
  await expect(page.locator('.detail-drawer__identity')).toContainText('南京大学苏州校区')
  await expect(page.locator('.place-marker').first()).toHaveCSS('visibility', 'visible')
  await expect(page.locator('.place-marker').nth(1)).toHaveCSS('visibility', 'hidden')
})

test('has a GitHub repository link in the lower-left corner', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: '打开 Dog Map GitHub 仓库' })
  await expect(link).toHaveAttribute('href', 'https://github.com/ZhouYinLong-lab/Dog-Map')
})

test('opens an image preview and closes it with Escape', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：南京大学苏州校区' }).click()
  await page.getByRole('button', { name: '预览：骑车初遇照片 01' }).click()
  await expect(page.getByRole('dialog', { name: '图片预览：骑车初遇照片 01' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('keeps the map focused on map and visit artwork', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.bottom-strip')).toHaveCount(0)
  await expect(page.locator('.place-marker__art')).toHaveCount(3)
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})
