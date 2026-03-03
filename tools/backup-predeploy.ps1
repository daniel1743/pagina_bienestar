param(
  [string]$TagPrefix = "backup-predeploy"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "git no está disponible en PATH."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$tag = "$TagPrefix-$timestamp"

Write-Host "Creando tag de respaldo: $tag"
git tag $tag
git push origin $tag

Write-Host "Tag enviado correctamente: $tag"
Write-Host "Usa este tag para rollback rápido en Vercel si es necesario."
