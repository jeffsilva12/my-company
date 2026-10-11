$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker nao encontrado. Instale o Docker Desktop e tente de novo."
}

try {
    docker info | Out-Null
} catch {
    Write-Error "Docker nao esta em execucao. Abra o Docker Desktop e tente de novo."
}

if (-not (Test-Path ".env.docker")) {
    if (Test-Path ".env.docker.example") {
        Copy-Item ".env.docker.example" ".env.docker"
        Write-Host "Criado .env.docker a partir de .env.docker.example"
    } else {
        Write-Error "Arquivo .env.docker.example nao encontrado."
    }
}

Copy-Item ".env.docker" ".env.compose" -Force

$AppPort = "8080"
$PortLine = Select-String -Path ".env.docker" -Pattern "^APP_PORT=" | Select-Object -First 1
if ($PortLine) {
    $AppPort = ($PortLine.Line -split "=", 2)[1]
}

Write-Host "Subindo My Company (build + migrate + seed + assets)..."
docker compose --env-file .env.compose up -d --build

Write-Host ""
Write-Host "Aguardando a aplicacao responder em http://localhost:${AppPort}/up ..."

$Attempts = 0
while ($true) {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:${AppPort}/up" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            break
        }
    } catch {
        # ainda subindo
    }

    $Attempts++
    if ($Attempts -ge 90) {
        Write-Host ""
        Write-Host "Timeout aguardando a aplicacao. Veja os logs:"
        Write-Host "  docker compose --env-file .env.compose logs -f app"
        exit 1
    }

    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Aplicacao pronta:"
Write-Host "  App:     http://localhost:${AppPort}"
Write-Host "  Mailpit: http://localhost:8025"
Write-Host "  Login:   test@example.com / password"
Write-Host ""
Write-Host "Logs: docker compose --env-file .env.compose logs -f app"
