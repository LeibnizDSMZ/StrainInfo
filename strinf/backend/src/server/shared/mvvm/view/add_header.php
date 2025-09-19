<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view;

use Psr\Http\Message\ResponseInterface;
use straininfo\server\configs\Config;

use function straininfo\server\shared\text\extract_valid_domains;

/**
 * @param array<string> $to_check
 * @param array<string> $overlap
 */
function domain_overlap(array $to_check, array $overlap): bool
{
    $to_check_dom = extract_valid_domains($to_check);
    $overlap_dom = extract_valid_domains($overlap);
    foreach ($to_check_dom as $toc) {
        if (strlen($toc) > 0 && in_array($toc, $overlap_dom)) {
            return true;
        }
    }
    return false;
}

function add_default_headers(
    ResponseInterface $response,
    HeadArgs $hArgs
): ResponseInterface {
    $response = $response->withHeader('Content-Type', $hArgs->getContentType() .'; charset='.$hArgs->getCharS());
    $response = $response->withHeader('Cache-Control', 'no-store');
    if (Config::isProductionBuild()) {
        $response = $response->withHeader('X-Content-Type-Options', 'nosniff');
        $response = $response->withHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    if ($hArgs->isEmbeddable()) {
        return $response->withHeader('Access-Control-Allow-Origin', '*');
    }
    foreach ($hArgs->getOri() as $ori) {
        if ($ori !== '' && in_array($ori, $hArgs->getCors())) {
            return $response->withHeader('Access-Control-Allow-Origin', $ori);
        }
    }
    if (count($hArgs->getCors()) > 0) {
        return $response->withHeader('Access-Control-Allow-Origin', $hArgs->getCors()[0]);
    }
    return $response;
}
