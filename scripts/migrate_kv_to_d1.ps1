param(
  [string]$NamespaceId = "0272b12877264d808bec5fbee5f4db93",
  [string]$DbName = "mbti"
)

$keysJson = npx wrangler kv key list --namespace-id $NamespaceId | Out-String
if (-not $keysJson) { Write-Error "No keys returned"; exit 1 }
if ($keysJson -notmatch '^\s*\[') { Write-Error $keysJson; exit 1 }
$keys = $keysJson | ConvertFrom-Json

$phoneKeys = $keys | Where-Object { $_.name -match '^1[3-9]\d{9}$' }

if (-not $phoneKeys) { Write-Host "No phone keys found"; exit 0 }

function SqlEscape([string]$s) {
  if ($null -eq $s) { return "" }
  return $s.Replace("'","''")
}

foreach ($k in $phoneKeys) {
  $phone = $k.name
  $raw = npx wrangler kv key get --namespace-id $NamespaceId --key $phone | Out-String
  if (-not $raw) { continue }
  try { $obj = $raw | ConvertFrom-Json } catch { continue }

  $pin = if ($obj.pin) { [string]$obj.pin } else { "" }
  $credits = 0
  if ($obj.credits -ne $null) { $credits = [int]$obj.credits }
  $records = @()
  if ($obj.records) { $records = $obj.records }

  $now = [int][double](Get-Date -UFormat %s)
  $pinEsc = SqlEscape $pin

  $sql = @()
  $sql += "INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES ('$phone', '$pinEsc', $credits, $now, $now) " +
          "ON CONFLICT(phone) DO UPDATE SET pin = CASE WHEN excluded.pin != '' THEN excluded.pin ELSE users.pin END, credits = excluded.credits, updated_at = excluded.updated_at;"

  foreach ($r in $records) {
    $result = SqlEscape ([string]$r.result)
    $qset = if ($r.questionSet) { "'" + (SqlEscape ([string]$r.questionSet)) + "'" } else { "NULL" }
    $ts = if ($r.timestamp) { [int]$r.timestamp } else { 0 }
    if ($ts -le 0 -or -not $result) { continue }
    $viewed = if ($r.viewed) { 1 } else { 0 }
    $sql += "INSERT OR IGNORE INTO records (phone, result, question_set, ts, viewed) VALUES ('$phone', '$result', $qset, $ts, $viewed);"
  }

  $sqlText = $sql -join "\n"
  npx wrangler d1 execute $DbName --command $sqlText --remote | Out-Null
  Write-Host "Migrated $phone (credits=$credits, records=$($records.Count))"
}