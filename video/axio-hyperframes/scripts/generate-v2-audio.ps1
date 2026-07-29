param(
  [string]$Output = 'public/audio/v2',
  [string]$EdgeTts = 'edge-tts'
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path $Output -Force | Out-Null
$Voice = 'zh-CN-YunxiNeural'
$Rate = '+6%'
$FastTrackRate = '+12%'
$FastTrackIds = @('website-governance', 'website-readback', 'website-control-founder', 'wechat-governance', 'wechat-outro')
$Pitch = '-2Hz'
$MaxAttempts = 3

$CuePath = Join-Path $PSScriptRoot 'v2-narration-cues.json'
$cueData = Get-Content -Raw -Encoding UTF8 $CuePath | ConvertFrom-Json
$OverridePath = Join-Path $PSScriptRoot 'v2-spoken-overrides.json'
$spokenOverrides = Get-Content -Raw -Encoding UTF8 $OverridePath | ConvertFrom-Json
$tracks = foreach ($cue in $cueData) {
  $override = $spokenOverrides.PSObject.Properties[$cue.id]
  $spokenText = if ($null -ne $override) { [string]$override.Value } else { [string]$cue.text }
  [PSCustomObject]@{Name=[string]$cue.id; Text=$spokenText}
}

foreach ($track in $tracks) {
  $raw = Join-Path $Output ($track.Name + '-raw.mp3')
  $final = Join-Path $Output ($track.Name + '.wav')
  $TrackRate = if ($FastTrackIds -contains $track.Name) { $FastTrackRate } else { $Rate }

  for ($Attempt = 1; $Attempt -le $MaxAttempts; $Attempt++) {
    & $EdgeTts --voice $Voice --rate=$TrackRate --pitch=$Pitch --volume=+0% --text $track.Text --write-media $raw
    if ($LASTEXITCODE -eq 0) { break }
    if ($Attempt -eq $MaxAttempts) { throw "edge-tts failed for $($track.Name) after $MaxAttempts attempts" }
    Start-Sleep -Seconds $Attempt
  }

  & ffmpeg -y -loglevel error -i $raw -af 'highpass=f=75,lowpass=f=10500,volume=7.5dB,alimiter=limit=0.85:attack=5:release=50:level=0:latency=1' -ar 48000 -ac 2 $final
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $($track.Name)" }
  Remove-Item -LiteralPath $raw -Force
}
