@echo off
REM Quick extraction script using PowerShell

powershell -Command "& { $content = Get-Content 'frontend\src\services\templates\defaultTemplates.ts' -Raw; $matches = [regex]::Matches($content, 'createJinjaTemplate\([\s\S]*?\)\s*,\s*\)', [regexoptions]::Multiline); Write-Host \"Found $($matches.Count) templates\"; }"
