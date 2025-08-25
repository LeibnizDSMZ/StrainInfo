<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl;

use function straininfo\server\shared\mvvm\view\api\get_short_arg;

use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use Nyholm\Psr7\Factory\Psr17Factory;

final class ShortCtrl
{
    private readonly string $charset;
    private readonly Psr17Factory $psr17Factory;

    public function __construct(
        string $charset)
    {
        $this->charset = $charset;
        $this->psr17Factory = new Psr17Factory();
    }

    public function __invoke(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $response = $handler->handle($request);
        if (
            $response->getStatusCode() !== 200 || !(array_key_exists(
                get_short_arg(),
                $request->getQueryParams()
            ) && ($response->getBody()->getSize() ?? 0) > 50_000)
        ) {
            return $response;
        }
        $bodyShort = substr((string) $response->getBody(), 0, 1_000) . '...';
        $newResp = $this->psr17Factory->createResponse($response->getStatusCode());
        foreach ($response->getHeaders() as $name => $values) {
            $newResp = $newResp->withHeader((string) $name, $values);
        }
        $newResp = $newResp->withHeader(
            'Content-Type',
            'text/plain; ' . $this->charset
        );
        $newResp->getBody()->write($bodyShort);
        return $newResp;
    }

}
