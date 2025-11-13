<?php

declare(strict_types=1);

namespace straininfo\server;

require_once dirname(__FILE__, 2) . '/vendor/autoload.php';

use function straininfo\server\shared\state\reboot;
use function Safe\curl_init;
use function Safe\curl_exec;
use Spiral\RoadRunner\Jobs\Consumer;
use Spiral\RoadRunner\Environment\Mode;
use Spiral\RoadRunner\Environment;

use Spiral\RoadRunner;
use RuntimeException;
use Nyholm\Psr7\Factory\Psr17Factory;

$env = Environment::fromGlobals();
$mode = $env->getMode();
if ($mode === Mode::MODE_HTTP) {
    $boot = Bootstrap::getBootstrap();
    $boot->init(false);

    $psr17Factory = new Psr17Factory();
    $worker = RoadRunner\Worker::create();
    $psr7 = new RoadRunner\Http\PSR7Worker(
        $worker,
        $psr17Factory,
        $psr17Factory,
        $psr17Factory
    );
    while ($request = $psr7->waitRequest()) {
        try {
            $response = $boot->getApp()->handle($request);
            $psr7->respond($response);
            if ($response->getStatusCode() >= 500) {
                $boot = reboot($boot);
            }
        } catch (\Throwable $exc) {
            $psr7->respond(
                $psr17Factory->createResponse(500)->withBody(
                    $psr17Factory->createStream('Internal server error!')
                )
            );
            $boot = reboot($boot);
        }
    }
} elseif ($mode === Mode::MODE_JOBS) {
    $consumer = new Consumer();
    while ($task = $consumer->waitTask()) {
        try {
            $queueName = $task->getQueue();
            $payload = json_decode($task->getPayload(), true, 512, JSON_THROW_ON_ERROR);
            if (!is_array($payload)) {
                $task->nack(new RuntimeException(
                    "{$queueName} - payload not an array {$payload}"
                ));
                continue;
            }
            $url = $payload['url'] ?? '';
            $agent = $payload['agent'] ?? 'Unknown';
            $lang = $payload['lang'] ?? '';
            if (!is_string($url) || $url === '') {$task->nack(new RuntimeException(
                    "{$queueName} - url missing {$payload}"
                ));
                continue;
            }
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT_MS => 500,
                CURLOPT_CONNECTTIMEOUT_MS => 500,
                CURLOPT_NOSIGNAL => true,
                CURLOPT_USERAGENT => $agent,
                CURLOPT_HEADER => true,
                CURLOPT_HTTPHEADER => array_filter([
                    $lang ? 'Accept-Language: ' . $lang : null,
                ]),
                CURLOPT_FOLLOWLOCATION => true,
            ]);
            curl_exec($ch);
            $task->ack();
        } catch (\Throwable $exc) {
            $task->nack($exc);
        } finally {
            if (isset($ch)) {
                curl_close($ch);
            }
        }
    }
} else {
    exit(1);
}
