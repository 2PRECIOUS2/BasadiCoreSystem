param(
    [string]$LocalDB = "basadicore",
    [string]$LocalUser = "postgres",
    [string]$LocalHost = "localhost",
    [string]$LocalPassword = "BasadiCore2025",

    [string]$AzureDB = "basadicore", 
    [string]$AzureUser = "HOBAdmin@basadicore-db-server",
    [string]$AzureHost = "basadicore-db-server.postgres.database.azure.com",
    [string]$AzurePassword = "BasadiDB2025",

    [switch]$SkipBackup
)

# Backup directory
$BackupDir = ".\backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "Starting BasadiCore Database Sync to Azure..." -ForegroundColor Green
Write-Host "Local DB: $LocalHost/$LocalDB" -ForegroundColor Cyan
Write-Host "Azure DB: $AzureHost/$AzureDB" -ForegroundColor Cyan

# -----------------------------
# 1️⃣ Backup Azure database (optional)
# -----------------------------
if (!$SkipBackup) {
    Write-Host "Backing up Azure database..." -ForegroundColor Yellow
    $AzureBackupFile = Join-Path $BackupDir "azure_backup_$Timestamp.dump"

    $env:PGPASSWORD = $AzurePassword
    $env:PGSSLMODE = "require"
    pg_dump -h $AzureHost -U $AzureUser -d $AzureDB -Fc -f $AzureBackupFile
    $backupExitCode = $LASTEXITCODE
    Remove-Item Env:PGPASSWORD
    Remove-Item Env:PGSSLMODE

    if ($backupExitCode -eq 0) {
        Write-Host "Azure backup saved: $AzureBackupFile" -ForegroundColor Green
    }
    else {
        Write-Host "Azure backup failed, continuing..." -ForegroundColor Yellow
    }
}

# -----------------------------
# 2️⃣ Dump local database
# -----------------------------
Write-Host "Dumping local database..." -ForegroundColor Yellow
$LocalDumpFile = Join-Path $BackupDir "local_db_$Timestamp.dump"

$env:PGPASSWORD = $LocalPassword
pg_dump -h $LocalHost -U $LocalUser -d $LocalDB -Fc -f $LocalDumpFile
$dumpExitCode = $LASTEXITCODE
Remove-Item Env:PGPASSWORD

if ($dumpExitCode -ne 0) {
    Write-Host "Local database dump failed" -ForegroundColor Red
    exit 1
}

# -----------------------------
# 3️⃣ Restore local dump to Azure
# -----------------------------
Write-Host "Restoring to Azure..." -ForegroundColor Yellow

$env:PGPASSWORD = $AzurePassword
$env:PGSSLMODE = "require"

pg_restore -h $AzureHost -U $AzureUser -d $AzureDB --clean --no-owner --no-privileges $LocalDumpFile --verbose
$restoreExitCode = $LASTEXITCODE

Remove-Item Env:PGPASSWORD
Remove-Item Env:PGSSLMODE

if ($restoreExitCode -eq 0) {
    Write-Host "Database sync completed successfully!" -ForegroundColor Green
    if (!$SkipBackup) {
        Write-Host "Azure backup: $AzureBackupFile" -ForegroundColor White
    }
}
else {
    Write-Host "Sync to Azure failed" -ForegroundColor Red
    if (!$SkipBackup) {
        Write-Host "Your Azure backup is safe at: $AzureBackupFile" -ForegroundColor Blue
    }
    exit 1
}
