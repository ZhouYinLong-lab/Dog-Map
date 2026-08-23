$ErrorActionPreference = 'Stop'

$root = Join-Path (Get-Location) 'references/p5r-location-images'
$sources = Get-Content (Join-Path $root 'sources.json') -Raw | ConvertFrom-Json
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('dog-map-p5r-' + [guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
try {
  foreach ($item in $sources) {
    $target = Join-Path $root $item.file
    $targetDir = Split-Path $target -Parent
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    $download = Join-Path $tempRoot ([guid]::NewGuid().ToString('N') + '.source')
    Write-Host "Downloading $($item.label)"
    Invoke-WebRequest -Uri $item.source -OutFile $download -UseBasicParsing -TimeoutSec 60
    & magick $download -strip $target
    if ($LASTEXITCODE -ne 0) { throw "Image conversion failed: $($item.label)" }
  }
}
finally {
  if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}
