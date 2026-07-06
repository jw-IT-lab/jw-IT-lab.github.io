$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Copy-Item -LiteralPath (Join-Path $scriptDir "double_gaussian_rd_figure.pre_tech_style.py") `
    -Destination (Join-Path $scriptDir "double_gaussian_rd_figure.py") -Force

if (Test-Path (Join-Path $scriptDir "double_gaussian_rd_figure.pre_tech_style.png")) {
    Copy-Item -LiteralPath (Join-Path $scriptDir "double_gaussian_rd_figure.pre_tech_style.png") `
        -Destination (Join-Path $scriptDir "double_gaussian_rd_figure.png") -Force
}

if (Test-Path (Join-Path $scriptDir "double_gaussian_rd_figure.pre_tech_style.pdf")) {
    Copy-Item -LiteralPath (Join-Path $scriptDir "double_gaussian_rd_figure.pre_tech_style.pdf") `
        -Destination (Join-Path $scriptDir "double_gaussian_rd_figure.pdf") -Force
}

Write-Output "Restored pre-tech-style script and figure files."
