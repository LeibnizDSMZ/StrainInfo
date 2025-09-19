<?php

declare(strict_types=1);

namespace straininfo\server\exceptions;

use Safe\Exceptions\OutcontrolException;
use Safe\Exceptions\SimplexmlException;
use function Safe\json_encode;

use function Safe\ob_clean;
use function Safe\ob_end_flush;
use function Safe\ob_start;
use function Safe\simplexml_load_string;
use straininfo\server\configs\Config;

function print_msg_500(bool $over): void
{
    print_err_msg($over, 'Internal server error!', 500);
}

function print_msg_503(bool $over): void
{
    print_err_msg($over, 'Service unavailable!', 503);
}

function clean_buf(string $message, int $type): void
{
    $msg = $message;
    try {
        if (ob_get_level() > 0) {
            ob_clean();
        }
    } catch (OutcontrolException) {
        $msg = $message . "\nFailed to delete buffer!";
    }
    ob_start();
    http_response_code($type);
    if (Config::isProductionBuild()) {
        header(
            'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'
        );
    }
    header('Access-Control-Allow-Origin: *');
    header('Cache-Control: no-store');
    header('Content-Type: application/json; charset=UTF-8');
    echo create_error_json($msg, $type);
    ob_end_flush();
}

function print_err_msg(bool $over, string $msg, int $type): void
{
    $buf = ob_get_contents() ?: '';
    try {
        simplexml_load_string($buf);
        if ($over) {
            clean_buf($msg, $type);
        }
    } catch (SimplexmlException) {
        clean_buf($msg, $type);
    }
}

function create_error_json(string $msg, int $type, string $info = ''): string
{
    $results = [
        'message' => $msg,
        'code' => $type,
    ];
    if ($info !== '') {
        $results['info'] = $info;
    }
    return json_encode($results);
}
