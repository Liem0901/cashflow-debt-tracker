# Sync .env.local variables to Vercel (development + preview + production).
# Usage: .\scripts\sync-vercel-env.ps1
# Requires: npx vercel logged in, .env.local present

$envFile = (Join-Path (Join-Path $PSScriptRoot "..") ".env.local")
$lines = Get-Content $envFile | Where-Object {
  $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' -and $_ -notmatch '^\s*#'
}

$environments = @('development', 'preview', 'production')

foreach ($line in $lines) {
  $name, $value = $line -split '=', 2
  $name = $name.Trim()
  $value = $value.Trim().Trim('"')

  if ($name -eq 'VERCEL_OIDC_TOKEN') { continue }

  foreach ($env in $environments) {
    Write-Host "Setting $name ($env)..." -ForegroundColor Cyan
    npx vercel env add $name $env --value $value --yes --force 2>&1 | Out-Null
  }
}

Write-Host "Done. Run: npx vercel env ls" -ForegroundColor Green
