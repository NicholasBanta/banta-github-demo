# Trust Self-Signed Certificate on Windows
# This script imports the self-signed cert into the Trusted Root Certification Authorities store
# Requires admin privileges

param(
    [string]$CertPath = "certs/server.crt"
)

if (-not (Test-Path $CertPath)) {
    Write-Error "Certificate file not found: $CertPath"
    exit 1
}

# Check if running as admin
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires Administrator privileges."
    Write-Host "Attempting to re-run as Administrator..."
    Start-Process powershell -Verb RunAs -ArgumentList "-File", $PSCommandPath, "-CertPath", $CertPath
    exit 0
}

try {
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($CertPath)
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store(
        [System.Security.Cryptography.X509Certificates.StoreName]::Root,
        [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser
    )
    
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $store.Add($cert)
    $store.Close()
    
    Write-Host "✓ Certificate imported successfully to Trusted Root Certification Authorities"
    Write-Host "  Cert: $($cert.Subject)"
    Write-Host "  Thumbprint: $($cert.Thumbprint)"
}
catch {
    Write-Error "Failed to import certificate: $_"
    exit 1
}
