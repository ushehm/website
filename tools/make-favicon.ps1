<#
  make-favicon.ps1 — 從一張方形圖產生網站用的 favicon

  為什麼要做這些處理：
    來源圖是「圓角方形圖示放在白色畫布上」。若直接縮成 16~32px，
    四個白色角落會讓分頁圖示看起來像一個白方塊，所以先用洪水填充
    （只從邊界連通的「精確純白」像素）把外部白底變透明。
    刻意只認 255,255,255：圖內的女僕頭飾雖然也是白的，但帶有 JPEG
    雜訊（例如 254,255,253），不會被誤刪。

  用法：
    powershell -ExecutionPolicy Bypass -File tools\make-favicon.ps1 `
        -Source "user provide image\Favorite icon Image .jpeg"

  產出（都放在 images\）：
    favicon.ico          16 / 32 / 48 三種尺寸，舊瀏覽器與書籤列用
    favicon.png          32x32，現代瀏覽器用
    apple-touch-icon.png 180x180，iOS 加入主畫面用（保留白底，iOS 會自己切圓角）
#>
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [string]$OutDir = '',
    [int[]]$IcoSizes = @(16, 32, 48)
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not $OutDir) {
    $OutDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'images'
}
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }
$OutDir = (Resolve-Path $OutDir).Path

$code = @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class FavTool {
    public static Bitmap Load32(string path) {
        using (var img = Image.FromFile(path)) {
            var bmp = new Bitmap(img.Width, img.Height, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(bmp)) {
                g.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
                g.DrawImage(img, 0, 0, img.Width, img.Height);
            }
            return bmp;
        }
    }

    // 從四個邊界洪水填充，只吃「精確 255,255,255」的連通區域，然後設為透明。
    // 圖內部的白色裝飾不會被連通，因此完整保留。
    public static long ClearWhiteBackground(Bitmap bmp) {
        int w = bmp.Width, h = bmp.Height;
        var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        var px = new byte[stride * h];
        Marshal.Copy(data.Scan0, px, 0, px.Length);

        var seen = new bool[w * h];
        var stack = new Stack<int>();
        for (int x = 0; x < w; x++) { Seed(stack, seen, px, stride, w, x, 0); Seed(stack, seen, px, stride, w, x, h - 1); }
        for (int y = 0; y < h; y++) { Seed(stack, seen, px, stride, w, 0, y); Seed(stack, seen, px, stride, w, w - 1, y); }

        long cleared = 0;
        while (stack.Count > 0) {
            int idx = stack.Pop();
            int x = idx % w, y = idx / w, i = y * stride + x * 4;
            px[i + 3] = 0; cleared++;
            if (x > 0)     Seed(stack, seen, px, stride, w, x - 1, y);
            if (x < w - 1) Seed(stack, seen, px, stride, w, x + 1, y);
            if (y > 0)     Seed(stack, seen, px, stride, w, x, y - 1);
            if (y < h - 1) Seed(stack, seen, px, stride, w, x, y + 1);
        }

        Marshal.Copy(px, 0, data.Scan0, px.Length);
        bmp.UnlockBits(data);
        return cleared;
    }

    static void Seed(Stack<int> st, bool[] seen, byte[] px, int stride, int w, int x, int y) {
        int idx = y * w + x;
        if (seen[idx]) return;
        int i = y * stride + x * 4;
        if (px[i] != 255 || px[i + 1] != 255 || px[i + 2] != 255) return;
        seen[idx] = true;
        st.Push(idx);
    }

    public static byte[] PngBytes(Bitmap src, int size) {
        using (var bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp)) {
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
            g.Clear(Color.Transparent);
            g.DrawImage(src, 0, 0, size, size);
            using (var ms = new System.IO.MemoryStream()) {
                bmp.Save(ms, ImageFormat.Png);
                return ms.ToArray();
            }
        }
    }

    public static void WriteIco(Bitmap src, int[] sizes, string path) {
        var pngs = new List<byte[]>();
        foreach (int s in sizes) pngs.Add(PngBytes(src, s));

        using (var fs = new System.IO.FileStream(path, System.IO.FileMode.Create))
        using (var bw = new System.IO.BinaryWriter(fs)) {
            bw.Write((ushort)0); bw.Write((ushort)1); bw.Write((ushort)sizes.Length);
            int offset = 6 + 16 * sizes.Length;
            for (int i = 0; i < sizes.Length; i++) {
                int s = sizes[i];
                bw.Write((byte)(s >= 256 ? 0 : s));
                bw.Write((byte)(s >= 256 ? 0 : s));
                bw.Write((byte)0); bw.Write((byte)0);
                bw.Write((ushort)1); bw.Write((ushort)32);
                bw.Write((uint)pngs[i].Length);
                bw.Write((uint)offset);
                offset += pngs[i].Length;
            }
            foreach (var d in pngs) bw.Write(d);
        }
    }
}
'@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing -ErrorAction Stop

Write-Host ("來源：{0}" -f $Source)
$srcPath = (Resolve-Path $Source).Path

# --- 去白邊（透明版）---
$cut = [FavTool]::Load32($srcPath)
$cleared = [FavTool]::ClearWhiteBackground($cut)
Write-Host ("  去白邊：清掉 {0:N0} 個像素" -f $cleared)

# --- 保留白底版（給 iOS，它會自己切圓角）---
$keep = [FavTool]::Load32($srcPath)

# --- 輸出 ---
[FavTool]::WriteIco($cut, $IcoSizes, (Join-Path $OutDir 'favicon.ico'))
[System.IO.File]::WriteAllBytes((Join-Path $OutDir 'favicon.png'), [FavTool]::PngBytes($cut, 32))
[System.IO.File]::WriteAllBytes((Join-Path $OutDir 'apple-touch-icon.png'), [FavTool]::PngBytes($keep, 180))
[System.IO.File]::WriteAllBytes((Join-Path $OutDir 'icon-192.png'), [FavTool]::PngBytes($cut, 192))

$cut.Dispose(); $keep.Dispose()

Write-Host "已產生："
foreach ($n in 'favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'icon-192.png') {
    $p = Join-Path $OutDir $n
    Write-Host ("  {0,-24} {1,8:N0} bytes" -f $n, (Get-Item $p).Length)
}
