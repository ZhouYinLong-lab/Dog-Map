import { expect, test } from '@playwright/test'

test('renders the current destination markers without demo content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Dog Map/)
  await expect(page.locator('.map-view')).toBeVisible()
  await expect(page.locator('.place-marker')).toHaveCount(6)
  await expect(page.locator('.place-marker__art')).toHaveCount(6)
  await expect(page.getByRole('button', { name: '打开地点：南京大学苏州校区' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('button', { name: '打开地点：东渚夜市与街道' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('button', { name: '打开地点：拙政园' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('button', { name: '打开地点：狮子林' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('button', { name: '打开地点：留园' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('button', { name: '打开地点：苏州万象天地' })).toHaveClass(/place-marker--sticker/)
  await expect(page.getByRole('region', { name: '路线图例' })).toHaveCount(0)
})

test('keeps every place marker in the map positioning layer', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.place-marker')).toHaveCount(6)
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

test('keeps other place markers visible and allows switching directly between places', async ({ page }) => {
  await page.goto('/')
  const campusMarker = page.getByRole('button', { name: '打开地点：南京大学苏州校区' })
  const nightMarketMarker = page.getByRole('button', { name: '打开地点：东渚夜市与街道' })

  await campusMarker.click()
  await expect(page.getByRole('complementary', { name: '南京大学苏州校区详情' })).toBeVisible()
  await expect(nightMarketMarker).toBeVisible()
  await expect(nightMarketMarker).toHaveCSS('visibility', 'visible')

  if (page.viewportSize()?.width && page.viewportSize()!.width <= 520) {
    await nightMarketMarker.dispatchEvent('click')
  } else {
    await nightMarketMarker.click()
  }
  await expect(page.getByRole('complementary', { name: '东渚夜市与街道详情' })).toBeVisible()
  await expect(campusMarker).toBeVisible()
  await expect(campusMarker).toHaveCSS('visibility', 'visible')
})

test('opens every curated place and keeps its gallery connected to the selected marker', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')

  for (const title of ['拙政园', '狮子林', '留园', '苏州万象天地']) {
    const marker = page.getByRole('button', { name: `打开地点：${title}` })
    if (page.viewportSize()?.width && page.viewportSize()!.width <= 520) {
      await marker.dispatchEvent('click')
    } else {
      await marker.click()
    }
    await expect(page.getByRole('complementary', { name: `${title}详情` })).toBeVisible()
    await expect(page.locator('.detail-drawer__identity')).toContainText(title)
    await expect(page.locator('.media-preview-trigger').first()).toBeVisible()
    await expect(page.locator('.detail-drawer .media-figure figcaption')).toHaveCount(0)
    await page.waitForTimeout(1200)
  }
})

test('opens the first Dongzhu shop log with the storefront photo first', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '打开地点：东渚夜市与街道' }).click()
  await expect(page.getByRole('complementary', { name: '东渚夜市与街道详情' })).toBeVisible()
  await expect(page.locator('.detail-drawer')).not.toContainText('2026.08.25')
  await expect(page.getByRole('heading', { name: '探店' })).toBeVisible()

  await page.getByRole('button', { name: '打开探店：椒点川菜' }).click()
  await expect(page.getByRole('region', { name: '椒点川菜探店详情' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '椒点川菜' })).toBeVisible()
  await expect(page.getByRole('button', { name: '预览：椒点川菜店铺门头照片' }).first()).toBeVisible()
  await expect(page.locator('.media-preview-trigger')).toHaveCount(5)
  await expect(page.locator('.shop-detail .media-figure figcaption')).toHaveCount(0)

  await page.getByRole('button', { name: /返回地点/ }).click()
  await expect(page.getByRole('button', { name: '打开探店：椒点川菜' })).toBeVisible()
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
  await expect(page.locator('.place-marker__art')).toHaveCount(6)
})

test('scales marker artwork with map zoom', async ({ page }) => {
  await page.goto('/')
  const marker = page.locator('.place-marker__visual').first()
  await expect(marker).toBeVisible()
  const before = await marker.boundingBox()
  expect(before).not.toBeNull()
  const beforeScale = await marker.evaluate((element) => Number.parseFloat(getComputedStyle(element.parentElement!).getPropertyValue('--marker-scale')))

  const map = page.locator('.map-view')
  const mapBox = await map.boundingBox()
  expect(mapBox).not.toBeNull()
  await page.mouse.move(mapBox!.x + mapBox!.width / 2, mapBox!.y + mapBox!.height / 2)
  await page.mouse.wheel(0, -600)
  await page.waitForTimeout(350)

  const afterZoomIn = await marker.boundingBox()
  expect(afterZoomIn).not.toBeNull()
  const zoomInScale = await marker.evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue('--marker-scale')))
  expect(zoomInScale).toBeGreaterThan(beforeScale)
  if (page.viewportSize()?.width && page.viewportSize()!.width > 520) {
    expect(afterZoomIn!.width).toBeGreaterThan(before!.width + 10)
  }
  expect(zoomInScale).toBeLessThanOrEqual(1.35)

  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(350)
  const afterZoomOut = await marker.boundingBox()
  expect(afterZoomOut).not.toBeNull()
  const zoomOutScale = await marker.evaluate((element) => Number.parseFloat(getComputedStyle(element).getPropertyValue('--marker-scale')))
  expect(zoomOutScale).toBeLessThan(zoomInScale)
  if (page.viewportSize()?.width && page.viewportSize()!.width > 520) {
    expect(afterZoomOut!.width).toBeLessThan(afterZoomIn!.width - 10)
  }
})

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})
