<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl\dbs;

use straininfo\server\shared\mvvm\view\StatArgs;
use straininfo\server\shared\mvvm\view\HeadArgs;
use function straininfo\server\shared\mvvm\view\contained_in_origin;
use function straininfo\server\shared\mvvm\view\api\get_do_not_track_arg;
use function straininfo\server\shared\mvvm\view\add_default_headers;
use function straininfo\server\exceptions\create_error_json;
use Slim\Exception\HttpInternalServerErrorException;
use Slim\Exception\HttpForbiddenException;

use Psr\Log\LoggerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use MatomoTracker;

abstract class DBSCtrl
{
    private readonly string $charset;

    /** @var array<string> */
    private readonly array $cors;

    /** @var array<string> */
    private readonly array $private;

    /** @var array<string> */
    private readonly array $ignore;

    private readonly MatomoTracker $stats;

    private readonly LoggerInterface $logger;

    private readonly bool $track_enabled;

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
        $buf_stat = null;
        $this->track_enabled = $stat_args->getEnabled();
        $buf_stat = new MatomoTracker(
            $stat_args->getId(),
            $stat_args->getMatomo()
        );
        $buf_stat->setTokenAuth($stat_args->getToken());
        $this->stats = $buf_stat;
        $this->ignore = $stat_args->getIgnore();
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
        if ($empty) {
            $response = $response->withStatus(404);
            $response->getBody()->write(create_error_json('No data available!', 404));
        } else {
            $response->getBody()->write($json);
        }
        $this->track($request, $origin);
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

    /** @param array<string> $origin */
    private function track(ServerRequestInterface $request, array $origin): void
    {
        $track = count($origin) === 0 ? $this->trackCli($request) : $this->trackOri(
            $origin, $request
        );
        try {
            if ($track) {
                $this->stats->setRequestTimeout(1);
                $params = $request->getServerParams();
                $cip = $params['HTTP_X_FORWARDED_FOR']
                    ?? $params['REMOTE_ADDR']
                    ?? $params['HTTP_CLIENT_IP']
                    ?? '127.0.0.1';
                $this->stats->setIP($cip);
                $this->stats->doTrackPageView('API');
            }
        } catch (\Throwable $exp) {
            $this->logger->info('Could not track (' . $exp->getMessage() . ')');
        }
    }

    private function trackCli(ServerRequestInterface $request): bool
    {
        return $this->track_enabled && !array_key_exists(
            get_do_not_track_arg(),
            $request->getQueryParams()
        );
    }

    /** @param array<string> $origin */
    private function trackOri(array $origin, ServerRequestInterface $request): bool
    {
        return $this->track_enabled && !contained_in_origin($origin, $this->ignore) &&
        !array_key_exists(
            get_do_not_track_arg(),
            $request->getQueryParams()
        );
    }
}
