param(
  [Parameter(Mandatory = $true)]
  [string]$DumpPath
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DumpPath)) {
  throw "No existe el archivo dump: $DumpPath"
}

if (-not (Get-Command pg_restore -ErrorAction SilentlyContinue)) {
  throw "pg_restore no está disponible. Instala PostgreSQL client tools."
}

$supabaseDbUrl = [Environment]::GetEnvironmentVariable("SUPABASE_DB_URL")
if ([string]::IsNullOrWhiteSpace($supabaseDbUrl)) {
  throw "Falta variable SUPABASE_DB_URL."
}

Write-Host "Restaurando DB desde: $DumpPath"
pg_restore --dbname="$supabaseDbUrl" --clean --if-exists --no-owner "$DumpPath"
Write-Host "Restore DB finalizado."
