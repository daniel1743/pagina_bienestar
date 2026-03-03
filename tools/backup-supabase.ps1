param(
  [ValidateSet("daily", "predeploy")]
  [string]$Mode = "daily",
  [string]$OutputDir = "ops/backups"
)

$ErrorActionPreference = "Stop"

function Get-EnvOrThrow([string]$Name) {
  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Falta variable de entorno requerida: $Name"
  }
  return $value
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$baseDir = Join-Path $OutputDir $Mode
$dbDir = Join-Path $baseDir "db"
$storageDir = Join-Path $baseDir "storage"
New-Item -ItemType Directory -Force -Path $dbDir | Out-Null
New-Item -ItemType Directory -Force -Path $storageDir | Out-Null

$supabaseDbUrl = Get-EnvOrThrow "SUPABASE_DB_URL"
$supabaseUrl = Get-EnvOrThrow "SUPABASE_URL"
$serviceRoleKey = Get-EnvOrThrow "SUPABASE_SERVICE_ROLE_KEY"

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump no está disponible. Instala PostgreSQL client tools y vuelve a intentar."
}

$dbDumpPath = Join-Path $dbDir "backup-db-$timestamp.dump"
$dbShaPath = "$dbDumpPath.sha256"

Write-Host "Generando dump DB: $dbDumpPath"
pg_dump --dbname="$supabaseDbUrl" --format=custom --compress=9 --file="$dbDumpPath"

$dbHash = Get-FileHash -Algorithm SHA256 -Path $dbDumpPath
"$($dbHash.Hash)  $(Split-Path -Leaf $dbDumpPath)" | Set-Content -Path $dbShaPath -Encoding UTF8

Write-Host "Generando manifest de Storage..."
$manifestPath = Join-Path $storageDir "backup-storage-manifest-$timestamp.json"
$env:BACKUP_STORAGE_MANIFEST_PATH = $manifestPath
$env:BACKUP_SUPABASE_URL = $supabaseUrl
$env:BACKUP_SUPABASE_SERVICE_ROLE_KEY = $serviceRoleKey
node tools/backup-storage-manifest.mjs

$manifestSha = Get-FileHash -Algorithm SHA256 -Path $manifestPath
"$($manifestSha.Hash)  $(Split-Path -Leaf $manifestPath)" | Set-Content -Path "$manifestPath.sha256" -Encoding UTF8

Write-Host "Descargando snapshot de Storage..."
$storageSnapshotDir = Join-Path $storageDir "backup-storage-$timestamp"
$env:BACKUP_STORAGE_OUTPUT_DIR = $storageSnapshotDir
node tools/backup-storage-download.mjs

$tarCommand = Get-Command tar -ErrorAction SilentlyContinue
if ($tarCommand) {
  $archivePath = Join-Path $storageDir "backup-storage-$timestamp.tar.gz"
  tar -czf $archivePath -C $storageSnapshotDir .
} else {
  $archivePath = Join-Path $storageDir "backup-storage-$timestamp.zip"
  Compress-Archive -Path (Join-Path $storageSnapshotDir "*") -DestinationPath $archivePath -Force
}

$archiveSha = Get-FileHash -Algorithm SHA256 -Path $archivePath
"$($archiveSha.Hash)  $(Split-Path -Leaf $archivePath)" | Set-Content -Path "$archivePath.sha256" -Encoding UTF8

Write-Host ""
Write-Host "Backup completado."
Write-Host "DB dump: $dbDumpPath"
Write-Host "Storage manifest: $manifestPath"
Write-Host "Storage snapshot: $archivePath"
Write-Host "IMPORTANTE: cifra y sube estos artefactos a almacenamiento privado."
