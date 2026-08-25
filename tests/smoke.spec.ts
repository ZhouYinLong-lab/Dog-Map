import { expect, test } from '@playwright/test'

test('renders the current destination markers without demo content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Dog Map/)
  await expect(page.locator('.map-view')).toBeVisible()
  await expect(page.locator('.place-marker')).toHaveCount(2)
  await expect(page.locator('.place-marker__art')).toHaveCount(2)
  await expect(page.getByRole('button', { name: '打开地点：南京大学苏州校区' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('button', { name: '打开地点：东渚夜市' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('region', { name: '路线图例' })).toHaveCount(0)
})

test('keeps every place marker in the map positioning layer', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.place-marker')).toHaveCount(2)
  const positions = await page.locator('.place-marker').evaluateAll((elements) => elements.map((element) => getComputedStyle(element).position))
  expect(positions.every((position) => position === 'absolute')).toBeTruthy()
})

test('shows the map source attribution', async ({ page }) => {
  await page.goto('/')
  const attribution = page.locator('.maplibregl-ctrl-attrib')
  await expect(attribution).toBeVisible()
  await expect(attribution).toContainText(/OpenStreetMap|OpenFreeMap/)
})

test('opens and closes the current destination detail drawer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：南京大学苏州校区' }).click()
  await expect(page.getByRole('complementary', { name: '南京大学苏州校区详情' })).toBeVisible()
  await expect(page.getByText('骑车初遇')).toBeVisible()
  await page.getByRole('button', { name: '关闭详情' }).click()
  await expect(page.getByRole('complementary', { name: '南京大学苏州校区详情' })).toHaveCount(0)
})

test('shows the selected place identity and hides map overlays in the detail view', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：南京大学苏州校区' }).click()
  await expect(page.locator('.detail-drawer__identity')).toContainText('南京大学苏州校区')
  await expect(page.locator('.place-marker').first()).toHaveCSS('visibility', 'visible')
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
  const image = page.locator('.media-lightbox__image')
  const imageBox = await image.boundingBox()
  const previousBox = await page.getByRole('button', { name: '上一张图片' }).boundingBox()
  const nextBox = await page.getByRole('button', { name: '下一张图片' }).boundingBox()
  expect(imageBox).not.toBeNull()
  expect(previousBox).not.toBeNull()
  expect(nextBox).not.toBeNull()
  expect(previousBox!.x + previousBox!.width).toBeLessThanOrEqual(imageBox!.x)
  expect(nextBox!.x).toBeGreaterThanOrEqual(imageBox!.x + imageBox!.width)
  await expect(page.getByRole('button', { name: '上一张图片' })).toBeDisabled()
  await expect(page.getByRole('button', { name: '下一张图片' })).toBeEnabled()
  await page.getByRole('button', { name: '下一张图片' }).click()
  await expect(page.getByRole('dialog', { name: '图片预览：骑车初遇照片 02' })).toBeVisible()
  await expect(page.getByRole('button', { name: '上一张图片' })).toBeEnabled()
  await page.getByRole('button', { name: '上一张图片' }).click()
  await expect(page.getByRole('dialog', { name: '图片预览：骑车初遇照片 01' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('keeps the map focused on map and visit artwork', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.bottom-strip')).toHaveCount(0)
  await expect(page.locator('.place-marker__art')).toHaveCount(2)
})

test('scales marker artwork with map zoom', async ({ page }) => {
  await page.goto('/')
  const marker = page.locator('.place-marker__visual').first()
  await expect(marker).toBeVisible()
  const before = await marker.boundingBox()
  expect(before).not.toBeNull()

  const map = page.locator('.map-view')
  const mapBox = await map.boundingBox()
  expect(mapBox).not.toBeNull()
  await page.mouse.move(mapBox!.x + mapBox!.width / 2, mapBox!.y + mapBox!.height / 2)
  await page.mouse.wheel(0, -600)
  await page.waitForTimeout(350)

  const afterZoomIn = await marker.boundingBox()
  expect(afterZoomIn).not.toBeNull()
  expect(afterZoomIn!.width).toBeGreaterThan(before!.width + 10)
  const zoomInScale = await marker.evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue('--marker-scale')))
  expect(zoomInScale).toBeLessThanOrEqual(1.35)

  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(350)
  const afterZoomOut = await marker.boundingBox()
  expect(afterZoomOut).not.toBeNull()
  expect(afterZoomOut!.width).toBeLessThan(afterZoomIn!.width - 10)
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})
