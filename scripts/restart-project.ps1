[CmdletBinding()]
param(
  [switch]$KeepContainers
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repositoryRoot

Write-Host 'Arret de l environnement actuel...' -ForegroundColor Cyan
& (Join-Path $PSScriptRoot 'stop-project.ps1')

Write-Host 'Redemarrage complet...' -ForegroundColor Cyan
$startArguments = @()
if ($KeepContainers) {
  $startArguments += '-KeepContainers'
}
& (Join-Path $PSScriptRoot 'start-project.ps1') @startArguments
