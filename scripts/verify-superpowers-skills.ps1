$ErrorActionPreference = "Stop"

$srcRoot = "F:\DOWNLOAD\superpowers-main\superpowers-main\skills"
$dstRoot = "C:\Users\gz\.codex\skills"

if (-not (Test-Path $srcRoot)) {
  throw "Source not found: $srcRoot"
}

if (-not (Test-Path $dstRoot)) {
  throw "Destination not found: $dstRoot"
}

$rows = Get-ChildItem -Path $srcRoot -Directory | Sort-Object Name | ForEach-Object {
  $name = $_.Name
  $dst = Join-Path $dstRoot $name
  [pscustomobject]@{
    Skill = $name
    Installed = Test-Path $dst
    SkillMd = Test-Path (Join-Path $dst "SKILL.md")
  }
}

$rows | Format-Table -AutoSize

$missing = $rows | Where-Object { -not $_.Installed -or -not $_.SkillMd }
if ($missing) {
  Write-Host ""
  Write-Host "Missing skills detected: $($missing.Count)" -ForegroundColor Yellow
  exit 2
}

Write-Host ""
Write-Host "All superpowers skills are installed and valid." -ForegroundColor Green
