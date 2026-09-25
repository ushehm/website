<#
  update-website.ps1 — 一鍵把 D:\My website 的變更推上 GitHub

  為什麼要有這支：你改了 data.js 之後，需要「加入變更 → 提交 → 推送」三個步驟，
  而且推送時 git 會把進度寫到 stderr，直接跑會讓 PowerShell 回報失敗訊息，
  看起來很像出錯。這支腳本把流程包好，並且在提交前強制檢查金鑰沒有被帶上。

  用法：雙擊同資料夾的「更新網站.bat」，或直接執行這支腳本。
#>

$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot

# 讓中文在命令提示字元視窗正常顯示（.bat 已經先 chcp 65001）
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch { }

# --- 找 git -----------------------------------------------------------------
$Git = 'C:\Program Files\Git\cmd\git.exe'
if (-not (Test-Path $Git)) {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) { $Git = $cmd.Source }
    else {
        Write-Host ''
        Write-Host '  找不到 git。請先安裝：winget install --id Git.Git -e' -ForegroundColor Red
        Write-Host ''
        Read-Host '  按 Enter 關閉'
        exit 1
    }
}

# --- 包裝 git 呼叫，避免 stderr 被當成致命錯誤 -------------------------------
function Invoke-Git {
    param([string[]]$GitArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $output = & $Git @GitArgs 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    return [pscustomobject]@{ Output = $output; Code = $code }
}

Write-Host ''
Write-Host '  更新網站' -ForegroundColor Cyan
Write-Host '  ────────────────────────────────────────────' -ForegroundColor DarkGray

# --- 1. 有沒有變更 -----------------------------------------------------------
$st = Invoke-Git @('status', '--porcelain')
if (-not $st.Output) {
    Write-Host ''
    Write-Host '  沒有任何變更，不需要更新。' -ForegroundColor Yellow
    Write-Host '  （如果你剛改過 data.js，請先存檔再執行）' -ForegroundColor DarkGray
    Write-Host ''
    Read-Host '  按 Enter 關閉'
    exit 0
}

# --- 2. 加入變更 -------------------------------------------------------------
$null = Invoke-Git @('add', '-A')

# --- 3. 安全檢查：金鑰絕對不能被提交 -----------------------------------------
$staged = (Invoke-Git @('diff', '--cached', '--name-only')).Output
$danger = $staged | Where-Object { $_ -match 'steam-api-key|user provide image' }
if ($danger) {
    Write-Host ''
    Write-Host '  ⚠ 中止：偵測到不該提交的檔案！' -ForegroundColor Red
    $danger | ForEach-Object { Write-Host ('      ' + $_) -ForegroundColor Red }
    Write-Host ''
    Write-Host '  已取消這次提交，沒有任何東西被推上去。' -ForegroundColor Yellow
    $null = Invoke-Git @('reset')
    Write-Host ''
    Read-Host '  按 Enter 關閉'
    exit 1
}

# --- 4. 列出這次要更新的檔案 -------------------------------------------------
Write-Host ''
Write-Host '  這次會更新：' -ForegroundColor Gray
$staged | ForEach-Object { Write-Host ('      ' + $_) -ForegroundColor DarkGray }

# --- 5. 提交 -----------------------------------------------------------------
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$commit = Invoke-Git @('commit', '-m', "更新網站 ($stamp)")
if ($commit.Code -ne 0) {
    Write-Host ''
    Write-Host '  提交失敗：' -ForegroundColor Red
    $commit.Output | ForEach-Object { Write-Host ('      ' + $_) -ForegroundColor Red }
    Write-Host ''
    Read-Host '  按 Enter 關閉'
    exit 1
}
Write-Host ''
Write-Host "  已提交：更新網站 ($stamp)" -ForegroundColor Green

# --- 6. 推送 -----------------------------------------------------------------
Write-Host ''
Write-Host '  推送到 GitHub …' -ForegroundColor Cyan
$push = Invoke-Git @('push')
if ($push.Code -ne 0) {
    Write-Host ''
    Write-Host '  推送失敗：' -ForegroundColor Red
    $push.Output | ForEach-Object { Write-Host ('      ' + $_) -ForegroundColor Red }
    Write-Host ''
    Write-Host '  最常見的原因是要重新登入 GitHub，重跑一次並完成瀏覽器登入即可。' -ForegroundColor Yellow
    Write-Host ''
    Read-Host '  按 Enter 關閉'
    exit 1
}

Write-Host ''
Write-Host '  ✓ 完成！' -ForegroundColor Green
Write-Host ''
Write-Host '  Cloudflare Pages 大約 1 分鐘後會自動重新部署。' -ForegroundColor Gray
Write-Host '  如果網頁看起來還是舊的，按 Ctrl+Shift+R 強制重新整理。' -ForegroundColor Gray
Write-Host ''
Read-Host '  按 Enter 關閉'
