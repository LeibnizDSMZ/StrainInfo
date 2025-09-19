<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl;

use Nyholm\Psr7\Factory\Psr17Factory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Exception\HttpNotFoundException;
use Slim\Handlers\ErrorHandler;
use function straininfo\server\exceptions\create_error_json;
use function straininfo\server\shared\mvvm\view\add_default_headers;

use straininfo\server\shared\mvvm\view\HeadArgs;
use Throwable;

final class CusErrCtrl extends ErrorHandler
{
    private readonly string $charset;

    /** @var array<string> */
    private readonly array $cors;

    private readonly Psr17Factory $psr17Factory;

    private readonly string $err404;
    private readonly string $err403;
    private readonly string $err405;
    private readonly string $err500;

    /** @param array<string> $cors */
    public function __construct(
        string $charset,
        array $cors,
        LoggerInterface $logger
    ) {
        $this->charset = $charset;
        $this->cors = $cors;
        $this->logger = $logger;
        $this->psr17Factory = new Psr17Factory();
        $this->err500 = 'Internal server error!';
        $this->err404 = 'Route not found!';
        $this->err403 = 'Request forbidden!';
        $this->err405 = 'Method forbidden!';
    }

    public function __invoke(
        ServerRequestInterface $request,
        Throwable $exception,
        bool $showErrDet,
        bool $logErr,
        bool $logErrDet
    ): ResponseInterface {
        $msg = "{$exception->getMessage()};";
        $this->logger->error("{$msg} {$showErrDet} - {$logErr} - {$logErrDet}");
        $error_code = $exception->getCode();
        if (!(is_int($error_code) && $error_code >= 100 && $error_code <= 599)) {
            $error_code = 500;
        }
        $response = $this->psr17Factory->createResponse();
        $message = match ($exception::class) {
            HttpMethodNotAllowedException::class => $this->err405,
            HttpNotFoundException::class => $this->err404,
            HttpForbiddenException::class => $this->err403,
            default => $this->err500,
        };
        $response->getBody()->write(create_error_json($message, $error_code));
        $response = $response->withStatus($error_code);
        if ($exception instanceof HttpMethodNotAllowedException) {
            $response = $response->withHeader(
                'Allow',
                'GET'
            );
        }
        return add_default_headers(
            $response,
            new HeadArgs(
                $request->getHeader('Origin'),
                $this->cors,
                $this->charset,
                false,
                'application/json'
            )
        );
    }
}
