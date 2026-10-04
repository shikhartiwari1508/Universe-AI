$source = ".\frontend"
$apk = ".\frontend\www"

Copy-Item "$source\index.html" "$apk\index.html" -Force
Copy-Item "$source\style.css" "$apk\style.css" -Force
Copy-Item "$source\script.js" "$apk\script.js" -Force

(Get-Content "$apk\index.html") `
    -replace 'href="/static/favicon.svg"', 'href="favicon.svg"' `
    -replace 'href="/static/style.css"', 'href="style.css"' `
    -replace 'src="/static/script.js"', 'src="script.js"' |
    Set-Content "$apk\index.html"

Write-Host "SYNC COMPLETE - Website files copied to APK www folder." -ForegroundColor Green
