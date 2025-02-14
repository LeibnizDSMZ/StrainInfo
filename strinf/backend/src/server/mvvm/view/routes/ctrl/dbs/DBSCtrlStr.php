<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl\dbs;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use straininfo\server\interfaces\mvvm\view\chan\QVIntDat;
use function straininfo\server\shared\mvvm\view\api\is_str_api_pr;
use straininfo\server\shared\mvvm\view\api\query\v1\QStrE as QStrEV1;
use straininfo\server\shared\mvvm\view\api\query\v2\QStrE as QStrEV2;
use straininfo\server\shared\mvvm\view\api\VersionE;

use straininfo\server\shared\mvvm\view\StatArgs;

final class DBSCtrlStr extends DBSCtrl
{
    private readonly QVIntDat $q_chan;

    /**
     * @param array<string> $cors
     * @param array<string> $private
     */
    public function __construct(
        QVIntDat $q_chan,
        string $charset,
        array $cors,
        array $private,
        StatArgs $stat_args,
        LoggerInterface $logger
    ) {
        $this->q_chan = $q_chan;
        parent::__construct($charset, $cors, $private, $stat_args, $logger);
    }

    /** @param array<string> $args */
    public function getAvg(
        QStrEV1 | QStrEV2 $path,
        QStrEV1 | QStrEV2 $arg_name,
        VersionE $version,
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ): ResponseInterface {
        $this->checkPrivate($request, is_str_api_pr($path));
        [$res, $emp] = $this->q_chan->getAvg($args[$arg_name->value], $version);
        return $this->parseJson($request, $response, $res, $emp);
    }

    /** @param array<string> $args */
    public function getMax(
        QStrEV1 | QStrEV2 $path,
        QStrEV1 | QStrEV2 $arg_name,
        VersionE $version,
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ): ResponseInterface {
        $this->checkPrivate($request, is_str_api_pr($path));
        [$res, $emp] = $this->q_chan->getMax($args[$arg_name->value], $version);
        return $this->parseJson($request, $response, $res, $emp);
    }

    /** @param array<string> $args */
    public function getMin(
        QStrEV1 | QStrEV2 $path,
        QStrEV1 | QStrEV2 $arg_name,
        VersionE $version,
        ServerRequestInterface $request,
        ResponseInterface $response,
        array $args
    ): ResponseInterface {
        $this->checkPrivate($request, is_str_api_pr($path));
        [$res, $emp] = $this->q_chan->getMin($args[$arg_name->value], $version);
        return $this->parseJson($request, $response, $res, $emp);
    }
}
