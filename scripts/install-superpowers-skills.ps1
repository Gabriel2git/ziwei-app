$ErrorActionPreference = "Stop"

$srcRoot = "F:\DOWNLOAD\superpowers-main\superpowers-main\skills"
$dstRoot = "C:\Users\gz\.codex\skills"

if (-not (Test-Path $srcRoot)) {
  throw "Source not found: $srcRoot"
}

if (-not (Test-Path $dstRoot)) {
  New-Item -ItemType Directory -Path $dstRoot -Force | Out-Null
}

Copy-Item -Path (Join-Path $srcRoot "*") -Destination $dstRoot -Recurse -Force

Write-Host "Installed superpowers skills to: $dstRoot"
Write-Host "Please restart Codex to pick up new skills."
