<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$url = $input['url'] ?? '';

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['error' => 'رابط غير صالح']);
    exit;
}

$parsedUrl = parse_url($url);
$host = strtolower($parsedUrl['host'] ?? '');
$privateIps = ['/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/', '/^localhost$/i'];
foreach ($privateIps as $pattern) {
    if (preg_match($pattern, $host)) {
        http_response_code(403);
        echo json_encode(['error' => 'غير مسموح بفحص العناوين الداخلية']);
        exit;
    }
}

function checkUrlStatus($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => 'Intooly-Broken-Link-Checker/1.0'
    ]);
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);
    return ['code' => $httpCode, 'finalUrl' => $effectiveUrl];
}

function getHttpStatusMessage($code) {
    $messages = [
        200 => 'سليم (OK)', 301 => 'تحويل دائم (301)', 302 => 'تحويل مؤقت (302)',
        403 => 'ممنوع (403)', 404 => 'غير موجود (404)', 410 => 'محذوف (410)',
        429 => 'محظور (429)', 500 => 'خطأ خادم (500)', 0 => 'فشل الاتصال'
    ];
    return $messages[$code] ?? 'حالة غير معروفة (' . $code . ')';
}

$baseUrl = rtrim($url, '/');
$baseUrlHost = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];

$ch = curl_init($url);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 15, CURLOPT_USERAGENT => 'Intooly-Broken-Link-Checker/1.0']);
$html = curl_exec($ch);
curl_close($ch);

if (!$html) {
    http_response_code(500);
    echo json_encode(['error' => 'تعذر جلب محتوى الصفحة']);
    exit;
}

$dom = new DOMDocument();
libxml_use_internal_errors(true);
$dom->loadHTML($html);
$anchors = $dom->getElementsByTagName('a');

$linksToCheck = [];
$seenUrls = [];

foreach ($anchors as $a) {
    $href = $a->getAttribute('href');
    $anchorText = trim($a->textContent) ?: '(بدون نص)';
    
    if (!$href || strpos($href, 'javascript:') === 0 || strpos($href, '#') === 0 || strpos($href, 'mailto:') === 0) continue;

    if (strpos($href, 'http') !== 0) {
        $href = rtrim($baseUrl, '/') . '/' . ltrim($href, '/');
    }
    $href = explode('#', $href)[0];

    if (!isset($seenUrls[$href])) {
        $seenUrls[$href] = true;
        $isInternal = (strpos($href, $baseUrlHost) === 0);
        $linksToCheck[] = [
            'targetUrl' => $href, 'anchorText' => $anchorText, 'sourceUrl' => $url,
            'type' => $isInternal ? 'داخلي' : 'خارجي'
        ];
    }
}

$results = [];
$stats = ['total' => count($linksToCheck), 'valid' => 0, 'broken' => 0, 'redirect' => 0];

foreach ($linksToCheck as $link) {
    $status = checkUrlStatus($link['targetUrl']);
    $code = $status['code'];
    $link['httpCode'] = $code;
    $link['statusMessage'] = getHttpStatusMessage($code);
    $link['finalUrl'] = ($status['finalUrl'] !== $link['targetUrl']) ? $status['finalUrl'] : null;

    if ($code >= 200 && $code < 300) { $stats['valid']++; $link['category'] = 'valid'; }
    elseif ($code == 301 || $code == 302) { $stats['redirect']++; $link['category'] = 'redirect'; }
    else { $stats['broken']++; $link['category'] = 'broken'; }
    $results[] = $link;
}

usort($results, function($a, $b) {
    $priority = ['broken' => 1, 'redirect' => 2, 'valid' => 3];
    return $priority[$a['category']] <=> $priority[$b['category']];
});

echo json_encode(['success' => true, 'stats' => $stats, 'results' => $results, 'scannedUrl' => $url]);
?>