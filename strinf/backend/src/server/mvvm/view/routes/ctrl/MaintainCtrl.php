<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl;

use Nyholm\Psr7\Factory\Psr17Factory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use function straininfo\server\exceptions\create_error_json;

use function straininfo\server\shared\mvvm\view\add_default_headers;
use straininfo\server\shared\mvvm\view\HeadArgs;

final class MaintainCtrl
{
    private ?\DateTime $time;
    private ?\DateTimeZone $zone;
    private bool $maintenance;
    private readonly Psr17Factory $psr17Factory;
    private readonly string $charset;

    /** @var array<string> */
    private readonly array $cors;

    /** @param array<string> $cors */
    public function __construct(
        string $charset,
        array $cors
    ) {
        $this->charset = $charset;
        $this->cors = $cors;
        $this->time = null;
        $this->zone = null;
        $this->maintenance = false;
        $this->psr17Factory = new Psr17Factory();
    }

    public function __invoke(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        if ($this->maintenance) {
            $response = $this->psr17Factory->createResponse(200);
            $info = '';
            if (!(is_null($this->time) || is_null($this->zone))) {
                $this->time->setTimezone($this->zone);
                $time = $this->time->format(\DateTimeInterface::ATOM);
                $zone = $this->zone->getName();
                $info = "time: {$time} - zone: {$zone}";
            }
            $response->getBody()->write(create_error_json(
                'Site is under construction!',
                503,
                $info
            ));
            $response = $response->withStatus(503);
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
        return $handler->handle($request);
    }

    public function setMaintenance(?\DateTime $time, \DateTimeZone $zone): void
    {
        $this->time = $time;
        $this->zone = $zone;
        $this->maintenance = true;
    }

    public function unsetMaintenance(): void
    {
        $this->maintenance = false;
    }

    public function getMaintenance(): bool
    {
        return $this->maintenance;
    }

    public function getTime(): ?\DateTime
    {
        return $this->time;
    }

    public function getZone(): ?\DateTimeZone
    {
        return $this->zone;
    }
}
