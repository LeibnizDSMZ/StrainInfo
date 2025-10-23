<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl\dbs;

use MatomoTracker;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpInternalServerErrorException;
use straininfo\server\shared\mvvm\view\HeadArgs;
use straininfo\server\shared\mvvm\view\StatArgs;

use function straininfo\server\exceptions\create_error_json;
use function straininfo\server\shared\mvvm\view\add_default_headers;
use function straininfo\server\shared\mvvm\view\api\get_do_not_track_arg;
use function straininfo\server\shared\mvvm\view\domain_overlap;

abstract class DBSCtrl
{
    private readonly string $charset;

    /** @var array<string> */
    private readonly array $cors;

    /** @var array<string> */
    private readonly array $private;

    private readonly StatArgs $stat_args;

    private readonly LoggerInterface $logger;

    /**
     * @param array<string> $cors
     * @param array<string> $private
     */
    public function __construct(
        string $charset,
        array $cors,
        array $private,
        StatArgs $stat_args,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->charset = $charset;
        $this->cors = $cors;
        $this->private = $private;
        $this->stat_args = $stat_args;
    }

    protected function checkPrivate(ServerRequestInterface $request, bool $private): void
    {
        // TODO: Low level privacy, can be spoofed, mostly redundant
        // more of "you should not do it" rather than "you can not do it"
        // TODO: Should be removed,
        // so it is not used for crucial security by accident!
        $pr_host = in_array(
            $request->getServerParams()['HTTP_HOST'] ?? '',
            $this->private
        );
        foreach ($request->getHeader('Host') as $host) {
            if (\in_array($host, $this->private)) {
                $pr_host = \true;
                break;
            }
        }
        if ($private && !$pr_host) {
            throw new HttpForbiddenException($request);
        }
    }

    protected function parseJson(
        ServerRequestInterface $request,
        ResponseInterface $response,
        string $json,
        bool $empty,
        bool $embeddable = false
    ): ResponseInterface {
        if ($json === '') {
            throw new HttpInternalServerErrorException($request);
        }
        $origin = $request->getHeader('Origin');
        $referer = $request->getHeader('Referer');
        if ($empty) {
            $response = $response->withStatus(404);
            $response->getBody()->write(create_error_json('No data available!', 404));
        } else {
            $response->getBody()->write($json);
        }
        $this->track($request, $origin, $referer);
        return add_default_headers(
            $response,
            new HeadArgs(
                $origin,
                $this->cors,
                $this->charset,
                $embeddable,
                'application/json'
            )
        );
    }

    private function runMatomoTrack(ServerRequestInterface $request): void
    {
        $buf_stat = new MatomoTracker(
            (int) $this->stat_args->getId(),
            $this->stat_args->getMatomo()
        );
        $buf_stat->setTokenAuth($this->stat_args->getToken());
        $buf_stat->setRequestTimeout(12);
        $params = $request->getServerParams();
        $cip = $params['HTTP_X_FORWARDED_FOR']
            ?? $params['REMOTE_ADDR']
            ?? $params['HTTP_CLIENT_IP']
            ?? '127.0.0.1';
        if (is_array($cip)) {
            $cip = reset($cip);
        }
        if (is_string($cip) && str_contains($cip, ',')) {
            $cip = trim(explode(',', $cip)[0]);
        }
        $buf_stat->setIP($cip);
        $buf_stat->setUserAgent($request->getHeader('User-Agent')[0] ?? 'Unknown');
        $buf_stat->setUrl((string) $request->getUri());
        $buf_stat->setUrlReferrer($request->getHeader('Referer')[0] ?? '');
        $buf_stat->doTrackPageView('API');
    }

    /**
     * @param array<string> $origin
     * @param array<string> $referer
     */
    private function track(
        ServerRequestInterface $request,
        array $origin,
        array $referer
    ): void {
        $toCheck = count($origin) > 0 || count($referer) > 0;
        $track = $this->trackCli($request);
        if ($toCheck) {
            $track = $track && !domain_overlap(
                array_merge($origin, $referer),
                $this->stat_args->getIgnore()
            );
        }
        try {
            if ($track) {
                $this->runMatomoTrack($request);
            }
        } catch (\Throwable $exp) {
            $this->logger->warning('Could not track (' . $exp->getMessage() . ')');
        }
    }

    private function trackCli(ServerRequestInterface $request): bool
    {
        return $this->stat_args->getEnabled() && !array_key_exists(
            get_do_not_track_arg(),
            $request->getQueryParams()
        );
    }
}
