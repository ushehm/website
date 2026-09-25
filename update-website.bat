@echo off
rem ===========================================================================
rem  Double-click this file to push your website changes to GitHub.
rem
rem  This wrapper is deliberately ASCII-only. A .bat file is read by cmd using
rem  the system OEM codepage, so non-ASCII comments get mis-decoded and can be
rem  executed as bogus commands. All real logic lives in update-website.ps1.
rem
rem  %~dp0 = the folder this .bat sits in, so a space in the path ("My website")
rem  is handled correctly.
rem ===========================================================================
chcp 65001 >nul
title Update website
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-website.ps1"
