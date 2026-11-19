<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

function respond(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    respond(['error' => 'Method Not Allowed'], 405);
}

$keyFile = '/home/u649086535/domains/intooly.com/storage/secrets/gold-api-key.php';
$cacheFile = '/home/u649086535/domains/intooly.com/storage/cache/gold-price-xau-usd.json';
$cacheLifetime = 60;
// Per-IP file-based rate limiting (60 requests per 60 seconds).
$rateLimitWindow = 60;
$rateLimitMaxRequests = 60;
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '';

if (!filter_var($clientIp, FILTER_VALIDATE_IP)) {
    respond(['error' => 'Unable to identify client'], 400);
}

$rateLimitDir = dirname($cacheFile);
$rateLimitFile = $rateLimitDir . '/gold-price-rate-limit.json';
$rateLimitLockFile = $rateLimitDir . '/gold-price-rate-limit.lock';

$rateLimitLock = @fopen($rateLimitLockFile, 'c');

if ($rateLimitLock === false) {
    respond(['error' => 'Rate limit service is temporarily unavailable'], 503);
}

if (!flock($rateLimitLock, LOCK_EX)) {
    fclose($rateLimitLock);
    respond(['error' => 'Rate limit service is temporarily unavailable'], 503);
}

$rateData = [];

if (is_file($rateLimitFile)) {
    $rateContents = @file_get_contents($rateLimitFile);
    $decodedRateData = is_string($rateContents)
        ? json_decode($rateContents, true)
        : null;

    if (is_array($decodedRateData)) {
        $rateData = $decodedRateData;
    }
}

$now = time();

foreach ($rateData as $storedKey => $storedEntry) {
    if (
        !is_array($storedEntry) ||
        !isset($storedEntry['window_start'], $storedEntry['count']) ||
        !is_numeric($storedEntry['window_start']) ||
        !is_numeric($storedEntry['count']) ||
        ($now - (int) $storedEntry['window_start']) >= $rateLimitWindow
    ) {
        unset($rateData[$storedKey]);
    }
}

$clientKey = hash('sha256', $clientIp);
$clientEntry = $rateData[$clientKey] ?? [
    'window_start' => $now,
    'count' => 0,
];

if ((int) $clientEntry['count'] >= $rateLimitMaxRequests) {
    $retryAfter = max(
        1,
        $rateLimitWindow - ($now - (int) $clientEntry['window_start'])
    );

    flock($rateLimitLock, LOCK_UN);
    fclose($rateLimitLock);

    header('Retry-After: ' . $retryAfter);
    respond(['error' => 'Too many requests. Please try again later.'], 429);
}

$clientEntry['count'] = (int) $clientEntry['count'] + 1;
$rateData[$clientKey] = $clientEntry;

$rateLimitEncoded = json_encode($rateData);

if (
    !is_string($rateLimitEncoded) ||
    @file_put_contents($rateLimitFile, $rateLimitEncoded, LOCK_EX) === false
) {
    flock($rateLimitLock, LOCK_UN);
    fclose($rateLimitLock);
    respond(['error' => 'Rate limit service is temporarily unavailable'], 503);
}

@chmod($rateLimitFile, 0600);
@chmod($rateLimitLockFile, 0600);

flock($rateLimitLock, LOCK_UN);
fclose($rateLimitLock);

$cached = null;

if (is_file($cacheFile)) {
    $cacheContents = @file_get_contents($cacheFile);
    if (is_string($cacheContents)) {
        $decoded = json_decode($cacheContents, true);
        if (is_array($decoded) && isset($decoded['fetchedAt'], $decoded['priceUsdPerOunce'])) {
            $cached = $decoded;
            if ((time() - (int)$decoded['fetchedAt']) < $cacheLifetime) {
                $cached['cached'] = true;
                $cached['stale'] = false;
                respond($cached);
            }
        }
    }
}

if (!is_file($keyFile) || !is_readable($keyFile)) {
    if ($cached !== null) {
        $cached['cached'] = true;
        $cached['stale'] = true;
        respond($cached);
    }
    respond(['error' => 'Price service is temporarily unavailable'], 503);
}

$apiKey = require $keyFile;

if (!is_string($apiKey) || trim($apiKey) === '') {
    respond(['error' => 'Price service is temporarily unavailable'], 503);
}

if (!function_exists('curl_init')) {
    respond(['error' => 'Price service is temporarily unavailable'], 503);
}

$ch = curl_init('https://goldapi.dev/api/v1/price/XAU/USD');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'X-API-Key: ' . trim($apiKey),
        'Accept: application/json',
    ],
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
]);

$body = curl_exec($ch);
$httpStatus = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$upstream = is_string($body) ? json_decode($body, true) : null;

if ($httpStatus !== 200 || !is_array($upstream) || !isset($upstream['price']) || !is_numeric($upstream['price'])) {
    if ($cached !== null) {
        $cached['cached'] = true;
        $cached['stale'] = true;
        respond($cached);
    }
    respond(['error' => 'Unable to retrieve the latest gold price'], 502);
}

$price = (float) $upstream['price'];
$gram = isset($upstream['gram']) && is_numeric($upstream['gram'])
    ? (float) $upstream['gram']
    : $price / 31.1034768;

$result = [
    'source' => 'GoldAPI.dev',
    'symbol' => 'XAU',
    'currency' => 'USD',
    'unit' => 'troy_ounce',
    'priceUsdPerOunce' => $price,
    'gram24Usd' => $gram,
    'updatedAt' => $upstream['updatedAt'] ?? null,
    'fetchedAt' => time(),
    'cached' => false,
    'stale' => false,
];

$encoded = json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (is_string($encoded)) {
    $temporaryFile = $cacheFile . '.' . getmypid() . '.tmp';
    if (@file_put_contents($temporaryFile, $encoded, LOCK_EX) !== false) {
        @chmod($temporaryFile, 0600);
        @rename($temporaryFile, $cacheFile);
    }
}

respond($result);