[CmdletBinding()]
param(
  [switch]$KeepContainers
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

function Invoke-CheckedCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "La commande $FilePath a echoue avec le code $LASTEXITCODE."
  }
}

try {
  Write-Host '1/4 Demarrage des conteneurs Docker...' -ForegroundColor Cyan
  Invoke-CheckedCommand 'docker' @('compose', 'up', '-d')

  Write-Host '2/4 Application des migrations Prisma...' -ForegroundColor Cyan
  Invoke-CheckedCommand 'npx' @('prisma', 'migrate', 'deploy')

  Write-Host '3/4 Chargement du seed de demonstration...' -ForegroundColor Cyan
  Invoke-CheckedCommand 'npx' @('prisma', 'db', 'seed')

  $env:VITE_USE_MOCKS = 'true'
  $env:VITE_API_URL = '/api'
  Write-Host '4/4 Demarrage du frontend...' -ForegroundColor Cyan
  Write-Host 'Site: http://localhost:5173/' -ForegroundColor Green
  Write-Host 'Comptes demo: direction@jacques-prevert.fr / demo1234' -ForegroundColor Yellow
  Write-Host 'Arret: Ctrl+C' -ForegroundColor DarkYellow

  & npm run dev -w apps/web -- --host 127.0.0.1 --port 5173
}
finally {
  if (-not $KeepContainers) {
    Write-Host 'Arret des conteneurs Docker...' -ForegroundColor DarkCyan
    & docker compose down
  } else {
    Write-Host 'Conteneurs conserves (option -KeepContainers).' -ForegroundColor DarkYellow
  }
}
