param(
  [string]$Output = 'public/audio/v2'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Path $Output -Force | Out-Null

$tracks = @(
  @{Name='website-command'; Text='未来，经营店群，也许只需要一句话。'},
  @{Name='website-organization-boot'; Text='目标进入 AXIO，治理、计划、建议与执行逐级启动。'},
  @{Name='website-positioning'; Text='这不是一个 AI 工具。这是一套 AI 电商经营组织。'},
  @{Name='website-proof'; Text='一百一十六家店，六个站点。AXIO，来自真实经营。'},
  @{Name='website-plan'; Text='你定义目标。AI Supervisor 拆解选品、站点、数量、利润、证据和验收标准。成本、汇率、平台费、物流与目标利润，每一项透明可查。'},
  @{Name='website-governance'; Text='AI Supervisor 唯一派发。ACCIO 监督方向和风险。专业 Agent 只建议。创始人最终决策。'},
  @{Name='website-readback'; Text='获批任务交给脚本与妙手执行。状态、异常、订单和利润，必须回读复盘。'},
  @{Name='website-vision'; Text='今天，受控执行。未来七乘二十四小时运营，仍然可监督、可纠偏、可停止。'},
  @{Name='website-brand'; Text='这个月，帮我赚十万。然后，整个 AI 组织开始工作。AXIO 智核。'},
  @{Name='wechat-organization'; Text='这不是一个 AI 工具。这是一套 AI 电商经营组织。'},
  @{Name='wechat-proof'; Text='一百一十六家店，六个站点。AXIO，来自真实经营。'},
  @{Name='wechat-operating'; Text='你说目标，AI Supervisor 拆计划、证据和验收。透明定价，风险检查，获批后再交给妙手执行。'},
  @{Name='wechat-governance'; Text='ACCIO 监督方向与风险。AI Supervisor 保持唯一正式派发权。自动化，不是黑盒。'},
  @{Name='wechat-trial'; Text='新品上线，招募前五十位粉丝免费试用七天。最多三家店，先从计划模式开始。'}
)

foreach ($track in $tracks) {
  $raw = Join-Path $Output ($track.Name + '-raw.wav')
  $final = Join-Path $Output ($track.Name + '.wav')
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.SelectVoice('Microsoft Huihui Desktop')
  $voice.Rate = 1
  $voice.Volume = 100
  $voice.SetOutputToWaveFile($raw)
  $voice.Speak($track.Text)
  $voice.Dispose()

  & ffmpeg -y -loglevel error -i $raw -af 'highpass=f=75,lowpass=f=10500' -ar 48000 -ac 2 $final
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $($track.Name)" }
}

& ffmpeg -y -loglevel error -f lavfi -i 'sine=frequency=55:sample_rate=48000:duration=85' -f lavfi -i 'anoisesrc=color=pink:amplitude=0.035:sample_rate=48000:duration=85' -filter_complex '[0:a]volume=0.07,tremolo=f=0.25:d=0.82[low];[1:a]highpass=f=180,lowpass=f=1800,volume=0.018[air];[low][air]amix=inputs=2:normalize=0,afade=t=in:st=0:d=2,afade=t=out:st=81:d=4[a]' -map '[a]' -ar 48000 -ac 2 (Join-Path $Output 'website-bed.wav')
if ($LASTEXITCODE -ne 0) { throw 'website bed generation failed' }

& ffmpeg -y -loglevel error -f lavfi -i 'sine=frequency=58:sample_rate=48000:duration=50' -f lavfi -i 'anoisesrc=color=pink:amplitude=0.035:sample_rate=48000:duration=50' -filter_complex '[0:a]volume=0.07,tremolo=f=0.3:d=0.82[low];[1:a]highpass=f=180,lowpass=f=1800,volume=0.018[air];[low][air]amix=inputs=2:normalize=0,afade=t=in:st=0:d=1.5,afade=t=out:st=47:d=3[a]' -map '[a]' -ar 48000 -ac 2 (Join-Path $Output 'wechat-bed.wav')
if ($LASTEXITCODE -ne 0) { throw 'wechat bed generation failed' }
