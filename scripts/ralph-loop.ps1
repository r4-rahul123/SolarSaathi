# Ralph Loop Autonomous Runner for Antigravity / SolarSaathi
param (
    [int]$MaxIterations = 10
)

Write-Host "==========================================" -ForegroundColor Green
Write-Host "    Starting Ralph Loop for SolarSaathi   " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host "`n[Ralph Loop] Iteration $i / $MaxIterations" -ForegroundColor Cyan

    # Check for pending tasks in PRD.md
    $pending = Select-String -Path "PRD.md" -Pattern "- \[ \]"
    if (-not $pending) {
        Write-Host "`n[SUCCESS] All tasks in PRD.md are marked complete! Ralph Loop finished." -ForegroundColor Green
        break
    }

    Write-Host "[INFO] Tasks pending in PRD.md: $($pending.Count)" -ForegroundColor Yellow

    # Verification checks
    Write-Host "[STEP] Running test suites..." -ForegroundColor Gray
    npm test

    Write-Host "[STEP] Verifying production build..." -ForegroundColor Gray
    npm run build

    Write-Host "[DONE] Iteration $i completed successfully." -ForegroundColor Green
}
