$files = Get-ChildItem "README.*.md"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    $content = $content -replace 'Blitx', 'Blitz'
    $content = $content -replace 'blitx', 'blitz'
    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -NoNewline
        $count = ([regex]::Matches($original, '[Bb]litx')).Count
        Write-Output "$($file.Name): $count replacements"
    }
}
Write-Output "Done!"
