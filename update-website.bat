@echo off
rem ===========================================================================
rem  更新網站.bat — 雙擊這個檔案就會把變更推上 GitHub
rem
rem  這裡刻意只寫 ASCII：.bat 的編碼在不同 Windows 地區設定下很容易出錯，
rem  所以真正的邏輯放在同資料夾的 update-website.ps1，這支只負責呼叫它。
rem  %~dp0 代表「這支 .bat 所在的路徑」，所以資料夾名稱有空格也不會壞。
rem ===========================================================================
chcp 65001 >nul
title Update website
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-website.ps1"
