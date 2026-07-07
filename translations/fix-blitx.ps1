$files = Get-ChildItem "README.*.md"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Step 1: Fix incorrectly capitalized URLs/code refs (Blitz -> blitz in URLs)
    $content = $content -creplace 'https://Blitz\.ai', 'https://blitz.ai'
    $content = $content -creplace 'https://blog\.Blitz\.ai', 'https://blog.blitz.ai'
    $content = $content -creplace 'https://app\.Blitz\.ai', 'https://app.blitz.ai'
    $content = $content -creplace '@Blitzcode/', '@blitzcode/'
    $content = $content -creplace 'x\.com/Blitzcode', 'x.com/blitzcode'
    $content = $content -creplace 'reddit\.com/r/Blitzcode', 'reddit.com/r/blitzcode'
    $content = $content -creplace 'Blitzcode-000000', 'blitzcode-000000'
    
    # Fix VS Code marketplace publisher (lowercase before dot)
    $content = $content -creplace 'itemName=Blitzcode\.', 'itemName=blitzcode.'
    $content = $content -creplace 'nmpjs\.org/package/@Blitzcode', 'nmpjs.org/package/@blitzcode'
    # Fix npm badge
    $content = $content -creplace 'nmpjs\.com/package/@Blitzcode', 'nmpjs.com/package/@blitzcode'
    # Fix r/blitzcode in badge alt text
    $content = $content -creplace 'r%2FBlitzcode', 'r%2Fblitzcode'
    
    Set-Content $file.FullName -Value $content -NoNewline
}
Write-Output "URL capitalization fixes applied to all files."
