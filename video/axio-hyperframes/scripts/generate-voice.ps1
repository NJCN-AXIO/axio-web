param(
  [string]$Manifest = 'public/data/manifest.json',
  [string]$Output = 'public/audio'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Path $Output -Force | Out-Null
$data = Get-Content -Raw -Encoding UTF8 -LiteralPath $Manifest | ConvertFrom-Json

function Write-Narration {
  param([string]$Name, [object[]]$Scenes)
  $text = ($Scenes | ForEach-Object { $_.narration }) -join ' '
  $path = Join-Path $Output ($Name + '-raw.wav')
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.SelectVoice('Microsoft Huihui Desktop')
  $voice.Rate = 1
  $voice.Volume = 100
  $voice.SetOutputToWaveFile($path)
  $voice.Speak($text)
  $voice.Dispose()
}

Write-Narration -Name 'website' -Scenes $data.website.scenes
Write-Narration -Name 'wechat' -Scenes $data.wechat.scenes
