[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Write-Host 'Arret du frontend Vite Apik...' -ForegroundColor Cyan
$nodeProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object {
  $_.CommandLine -and
  $_.CommandLine -match [regex]::Escape($repositoryRoot) -and
  $_.CommandLine -match 'vite|npm.*dev'
}
foreach ($process in $nodeProcesses) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  Write-Host "Processus Node arrete : $($process.ProcessId)" -ForegroundColor DarkGray
}

Write-Host 'Arret des conteneurs Docker Apik...' -ForegroundColor Cyan
& docker compose down
if ($LASTEXITCODE -eq 0) {
  Write-Host 'Frontend et conteneurs arretes.' -ForegroundColor Green
} else {
  Write-Warning "docker compose down a retourne le code $LASTEXITCODE."
}
