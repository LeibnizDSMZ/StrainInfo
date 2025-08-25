<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view;

use straininfo\server\configs\Config;
use Psr\Http\Message\ResponseInterface;

/**
 * @param array<string> $origin
 * @param array<string> $to_check
 */
function contained_in_origin(array $origin, array $to_check): bool
{
    foreach ($origin as $ori) {
        if (strlen($ori) > 0 && in_array($ori, $to_check)) {
            return true;
        }
    }
    return false;
}


function add_default_headers(
    ResponseInterface $response,
    HeadArgs $hArgs
): ResponseInterface {
    $response = $response->withHeader('Content-Type', $hArgs->getContentType() ."; charset=".$hArgs->getCharS());
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
