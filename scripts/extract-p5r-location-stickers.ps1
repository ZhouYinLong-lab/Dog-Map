$ErrorActionPreference = 'Stop'

$root = Join-Path (Get-Location) 'references/p5r-location-stickers'
$sourceDir = Join-Path $root 'source'
$source = Join-Path $sourceDir 'p5r-map-preview.jpg'
$sourceUrl = 'https://media.sketchfab.com/models/a8fd2793e583446e9509cf65f350fb9d/thumbnails/adb0aa09aa80478e91e7ae3f5ac4b0ba/e660c92572ad4b6ea0b712bee0928671.jpeg'

$stickers = @(
  @{ group = 'stations'; name = 'kichijoji'; x = 390; y = 225; w = 145; h = 160 },
  @{ group = 'stations'; name = 'ogikubo'; x = 548; y = 215; w = 95; h = 100 },
  @{ group = 'stations'; name = 'ikebukuro'; x = 835; y = 165; w = 120; h = 135 },
  @{ group = 'stations'; name = 'nakano'; x = 615; y = 270; w = 105; h = 115 },
  @{ group = 'stations'; name = 'shinjuku'; x = 710; y = 230; w = 125; h = 150 },
  @{ group = 'stations'; name = 'ichigaya'; x = 895; y = 300; w = 105; h = 85 },
  @{ group = 'stations'; name = 'meiji-shrine'; x = 565; y = 375; w = 125; h = 110 },
  @{ group = 'stations'; name = 'harajuku'; x = 675; y = 380; w = 125; h = 110 },
  @{ group = 'stations'; name = 'inokashira-park'; x = 405; y = 380; w = 180; h = 110 },
  @{ group = 'stations'; name = 'shibuya'; x = 495; y = 490; w = 165; h = 160 },
  @{ group = 'stations'; name = 'aoyama-itchome'; x = 905; y = 410; w = 160; h = 130 },
  @{ group = 'stations'; name = 'nagatacho'; x = 930; y = 360; w = 145; h = 130 },
  @{ group = 'stations'; name = 'jinbocho'; x = 1150; y = 360; w = 150; h = 130 },
  @{ group = 'stations'; name = 'suidobashi'; x = 1115; y = 260; w = 145; h = 125 },
  @{ group = 'stations'; name = 'ueno'; x = 1160; y = 125; w = 145; h = 175 },
  @{ group = 'stations'; name = 'asakusa'; x = 1295; y = 25; w = 165; h = 260 },
  @{ group = 'stations'; name = 'akihabara'; x = 1280; y = 270; w = 150; h = 130 },
  @{ group = 'stations'; name = 'kanda'; x = 1300; y = 365; w = 125; h = 115 },
  @{ group = 'stations'; name = 'akasaka-mitsuke'; x = 1095; y = 480; w = 145; h = 110 },
  @{ group = 'stations'; name = 'roppongi'; x = 1045; y = 565; w = 125; h = 125 },
  @{ group = 'stations'; name = 'shinagawa'; x = 950; y = 600; w = 150; h = 115 },
  @{ group = 'stations'; name = 'ginza'; x = 1325; y = 505; w = 140; h = 140 },
  @{ group = 'stations'; name = 'tsukishima'; x = 1540; y = 585; w = 160; h = 160 },
  @{ group = 'stations'; name = 'maihama'; x = 1635; y = 370; w = 150; h = 190 },
  @{ group = 'stations'; name = 'yongen-jaya'; x = 500; y = 500; w = 180; h = 160 },
  @{ group = 'destinations'; name = 'china-town'; x = 370; y = 750; w = 170; h = 145 },
  @{ group = 'destinations'; name = 'miura-beach'; x = 760; y = 900; w = 300; h = 160 },
  @{ group = 'destinations'; name = 'seaside-park'; x = 1300; y = 850; w = 280; h = 180 }
)

New-Item -ItemType Directory -Path $sourceDir -Force | Out-Null
if (-not (Test-Path -LiteralPath $source)) {
  Invoke-WebRequest -Uri $sourceUrl -OutFile $source -UseBasicParsing -TimeoutSec 60
}

foreach ($sticker in $stickers) {
  $directory = Join-Path $root $sticker.group
  $target = Join-Path $directory ($sticker.name + '.png')
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
  $crop = "$($sticker.w)x$($sticker.h)+$($sticker.x)+$($sticker.y)"
  & magick $source -crop $crop +repage -alpha on -fuzz 35% -fill none -opaque '#de0a18' -fuzz 45% -opaque '#f3bf00' -opaque '#7acb17' -opaque '#c23fae' -opaque '#1ba9d9' -trim +repage $target
  if ($LASTEXITCODE -ne 0) { throw "Sticker extraction failed: $($sticker.name)" }
}

@{
  source = $sourceUrl
  note = 'Cropped from the Sketchfab preview image for visual reference.'
  stickers = $stickers | ForEach-Object { "/p5r-map-location-stickers/$($_.group)/$($_.name).png" }
} | ConvertTo-Json -Depth 4 | Set-Content (Join-Path $root 'manifest.json') -Encoding utf8
