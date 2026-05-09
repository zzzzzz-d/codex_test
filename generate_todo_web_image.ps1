Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "output\imagegen"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$outPath = Join-Path $outDir "todo-mini-app-webpage.png"

$width = 1440
$height = 1000
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

function Brush($hex) {
    return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Pen($hex, $w = 1) {
    return New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($hex)), $w
}

function RoundRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $p.AddArc($x, $y, $d, $d, 180, 90)
    $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

function FillRoundRect($x, $y, $w, $h, $r, $color) {
    $path = RoundRectPath $x $y $w $h $r
    $g.FillPath((Brush $color), $path)
    $path.Dispose()
}

function StrokeRoundRect($x, $y, $w, $h, $r, $color, $line = 1) {
    $path = RoundRectPath $x $y $w $h $r
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($color)), $line
    $g.DrawPath($pen, $path)
    $pen.Dispose()
    $path.Dispose()
}

function Text($s, $x, $y, $size, $color, $weight = "Regular", $family = "Microsoft YaHei UI") {
    $style = [System.Drawing.FontStyle]::Regular
    if ($weight -eq "Bold") { $style = [System.Drawing.FontStyle]::Bold }
    $font = New-Object System.Drawing.Font($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $g.DrawString($s, $font, (Brush $color), [float]$x, [float]$y)
    $font.Dispose()
}

function CenterText($s, $x, $y, $w, $h, $size, $color, $weight = "Regular") {
    if (-not ($size -as [double]) -or [double]$size -le 0) { $size = 14 }
    if (-not $color) { $color = "#000000" }
    $style = [System.Drawing.FontStyle]::Regular
    if ($weight -eq "Bold") { $style = [System.Drawing.FontStyle]::Bold }
    $font = New-Object System.Drawing.Font("Microsoft YaHei UI", $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF([float]$x, [float]$y, [float]$w, [float]$h)
    $g.DrawString($s, $font, (Brush $color), $rect, $fmt)
    $fmt.Dispose()
    $font.Dispose()
}

function DrawLine($x1, $y1, $x2, $y2, $color, $line = 1) {
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($color)), $line
    $g.DrawLine($pen, $x1, $y1, $x2, $y2)
    $pen.Dispose()
}

function DrawCheck($x, $y, $checked) {
    FillRoundRect $x $y 24 24 8 $(if ($checked) { "#1F9D8A" } else { "#FFFFFF" })
    StrokeRoundRect $x $y 24 24 8 $(if ($checked) { "#1F9D8A" } else { "#D5DEE8" }) 1.5
    if ($checked) {
        $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")), 2.8
        $g.DrawLines($pen, @(
            [System.Drawing.PointF]::new($x + 6, $y + 12),
            [System.Drawing.PointF]::new($x + 10.5, $y + 16.5),
            [System.Drawing.PointF]::new($x + 18, $y + 8)
        ))
        $pen.Dispose()
    }
}

function DrawTask($x, $y, $title, $meta, $tag, $tagColor, $checked, $accent) {
    FillRoundRect $x $y 650 84 18 "#FFFFFF"
    StrokeRoundRect $x $y 650 84 18 "#E5ECF4" 1
    FillRoundRect ($x + 1) ($y + 18) 4 48 2 $accent
    DrawCheck ($x + 24) ($y + 30) $checked
    Text $title ($x + 64) ($y + 19) 21 "#18212D" "Bold"
    Text $meta ($x + 64) ($y + 50) 15 "#718096"
    FillRoundRect ($x + 520) ($y + 27) 96 30 15 $tagColor
    CenterText $tag ($x + 520) ($y + 27) 96 30 14 "#FFFFFF" "Bold"
}

$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Rectangle]::new(0, 0, $width, $height),
    [System.Drawing.ColorTranslator]::FromHtml("#ECF6F4"),
    [System.Drawing.ColorTranslator]::FromHtml("#F8E7D0"),
    35
)
$g.FillRectangle($bg, 0, 0, $width, $height)
$bg.Dispose()

FillRoundRect 78 62 1284 856 34 "#FAFCFB"
StrokeRoundRect 78 62 1284 856 34 "#FFFFFF" 3

FillRoundRect 112 100 1216 56 20 "#FFFFFF"
StrokeRoundRect 112 100 1216 56 20 "#E4EAF1" 1
FillRoundRect 138 121 14 14 7 "#F36C64"
FillRoundRect 164 121 14 14 7 "#F5BD4E"
FillRoundRect 190 121 14 14 7 "#51C477"
FillRoundRect 432 113 430 30 15 "#F3F6F8"
CenterText "todo.app / today" 432 113 430 30 14 "#7C8794"
Text "Todo Mini" 112 183 42 "#14202E" "Bold" "Segoe UI"
Text "A calm daily planner for focused work" 112 232 18 "#6B7785" "Segoe UI"

FillRoundRect 112 284 230 560 26 "#102A3A"
Text "Today" 146 322 28 "#FFFFFF" "Bold" "Segoe UI"
Text "Sat, May 9" 146 360 16 "#AFC2CD" "Segoe UI"
FillRoundRect 146 406 150 42 15 "#1F9D8A"
CenterText "+ New task" 146 406 150 42 17 "#FFFFFF" "Bold"
Text "Lists" 146 484 16 "#AFC2CD" "Segoe UI"
FillRoundRect 138 518 178 42 14 "#244B5B"
Text "Today" 174 528 18 "#FFFFFF" "Bold" "Segoe UI"
Text "Work" 174 582 18 "#B8CAD3" "Regular" "Segoe UI"
Text "Home" 174 632 18 "#B8CAD3" "Regular" "Segoe UI"
Text "Study" 174 682 18 "#B8CAD3" "Regular" "Segoe UI"
FillRoundRect 146 754 150 54 16 "#F4C76A"
Text "78%" 168 766 26 "#102A3A" "Bold" "Segoe UI"
Text "done" 228 774 16 "#102A3A" "Regular" "Segoe UI"

FillRoundRect 374 284 690 560 26 "#F4F8F7"
Text "Today's tasks" 414 322 30 "#16232F" "Bold" "Segoe UI"
Text "8 tasks total, 5 completed" 414 361 16 "#74808C" "Regular" "Segoe UI"
FillRoundRect 842 320 172 42 16 "#FFFFFF"
StrokeRoundRect 842 320 172 42 16 "#DCE6EC" 1
CenterText "Sort by priority" 842 320 172 42 15 "#52616F"

DrawTask 414 396 "Finish product weekly report" "09:30 - 10:15  /  Review notes" "Urgent" "#E96C5A" $true "#E96C5A"
DrawTask 414 496 "Design todo mini app home" "11:00 - 12:00  /  UI polish" "Design" "#7B61FF" $false "#7B61FF"
DrawTask 414 596 "Organize meeting summary" "14:00 - 14:30  /  Team sync" "Work" "#2E85D3" $true "#2E85D3"
DrawTask 414 696 "Read for 30 minutes" "20:30 - 21:00  /  Habit" "Home" "#1F9D8A" $false "#1F9D8A"

FillRoundRect 1092 284 196 560 26 "#FFFFFF"
StrokeRoundRect 1092 284 196 560 26 "#E5ECF4" 1
Text "Week" 1122 322 23 "#16232F" "Bold" "Segoe UI"
Text "May 2026" 1122 358 15 "#7C8794" "Segoe UI"

$days = @("M","T","W","T","F","S","S")
for ($i = 0; $i -lt 7; $i++) {
    CenterText $days[$i] (1120 + $i * 23) 402 20 20 12 "#9AA6B2" "Regular"
}
$n = 1
for ($row = 0; $row -lt 5; $row++) {
    for ($col = 0; $col -lt 7; $col++) {
        $cx = 1120 + $col * 23
        $cy = 432 + $row * 31
        if ($n -eq 9) {
            FillRoundRect ($cx - 1) ($cy - 1) 24 24 8 "#1F9D8A"
            CenterText "$n" ($cx - 1) ($cy - 1) 24 24 12 "#FFFFFF" "Bold"
        } else {
            CenterText "$n" $cx $cy 22 22 12 "#495565" "Regular"
        }
        $n++
        if ($n -gt 31) { break }
    }
}

FillRoundRect 1122 622 136 10 5 "#E7EEF2"
FillRoundRect 1122 622 102 10 5 "#1F9D8A"
Text "Progress" 1122 650 16 "#6F7B88" "Regular" "Segoe UI"
Text "5 / 8" 1194 645 28 "#16232F" "Bold" "Segoe UI"

FillRoundRect 1122 716 136 76 18 "#FFF5E2"
Text "Focus" 1144 732 16 "#9A6A20" "Regular" "Segoe UI"
Text "Small wins" 1144 758 20 "#3F3322" "Bold" "Segoe UI"

FillRoundRect 948 196 340 52 18 "#FFFFFF"
StrokeRoundRect 948 196 340 52 18 "#DFE8EF" 1
Text "Search tasks, tags, or time" 996 211 17 "#8793A0" "Regular" "Segoe UI"
FillRoundRect 1238 207 28 28 10 "#1F9D8A"
CenterText "Q" 1238 205 28 28 20 "#FFFFFF" "Bold"

$shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 16, 42, 58))
$g.FillEllipse($shadow, 952, 848, 320, 26)
$shadow.Dispose()
FillRoundRect 978 540 256 342 34 "#172D3A"
FillRoundRect 994 562 224 298 26 "#F9FCFB"
Text "Mobile preview" 1018 586 18 "#152231" "Bold" "Segoe UI"
FillRoundRect 1018 628 176 42 14 "#1F9D8A"
CenterText "+ Quick add" 1018 628 176 42 15 "#FFFFFF" "Bold"
DrawTask 1018 694 "Buy coffee beans" "18:00  /  Home" "Home" "#1F9D8A" $false "#1F9D8A"
FillRoundRect 1018 792 176 34 14 "#EDF4F3"
CenterText "Sync calendar" 1018 792 176 34 14 "#3C4A56" "Bold"

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Output $outPath
