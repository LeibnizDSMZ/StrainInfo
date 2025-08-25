<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes\ctrl;

use straininfo\server\shared\mvvm\view\HeadArgs;
use function straininfo\server\shared\mvvm\view\add_default_headers;
use function Safe\json_encode;

use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

final class RootCtrl
{
    private ?\DateTime $time;
    private ?\DateTimeZone $zone;
    private bool $maintenance;

    private readonly string $version;

    private readonly string $charset;

    /** @var array<string> $private */
    private readonly array $private;

    /** @param array<string> $private */
    public function __construct(
        string $charset,
        array $private,
        string $version,
        bool $maintenance,
        ?\DateTime $time,
        ?\DateTimeZone $zone
    ) {
        $this->charset = $charset;
        $this->version = $version;
        $this->private = $private;
        $this->time = $time;
        $this->zone = $zone;
        $this->maintenance = $maintenance;
    }

    public function getRoot(
        ServerRequestInterface $request,
        ResponseInterface $response
    ): ResponseInterface {
        $response->getBody()->write(json_encode([
            'private' => $this->checkPrivate($request),
            'maintenance' => $this->createMaintenanceNotice(),
            'version' => $this->version,
        ]));
        return add_default_headers(
            $response,
            new HeadArgs(
                $request->getHeader('Origin'),
                [],
                $this->charset,
                true,
                'application/json'
            )
        );
    }

    public function setMaintenance(?\DateTime $time, ?\DateTimeZone $zone): void
    {
        $this->time = $time;
        $this->zone = $zone;
        $this->maintenance = true;
    }

    public function unsetMaintenance(): void
    {
        $this->maintenance = false;
    }

    /** @return array<string, bool|string> */
    private function createMaintenanceNotice(): array
    {
        $time = '';
        $zone = '';
        if (!(is_null($this->time) || is_null($this->zone))) {
            $this->time->setTimezone($this->zone);
            $time = $this->time->format(\DateTimeInterface::ATOM);
            $zone = $this->zone->getName();
        }
        return [
            'status' => $this->maintenance,
            'duration' => $time,
            'zone' => $zone,
        ];
    }

    private function checkPrivate(ServerRequestInterface $request): bool
    {
        // TODO: Low level privacy, can be spoofed, mostly redundant
        // more of "you should not do it" rather than "you can not do it"
        // TODO: Should be removed,
        // so it is not used for crucial security by accident!
        foreach ($request->getHeader('Host') as $host) {
            if (\in_array($host, $this->private)) {
                return \true;
            }
        }
        return in_array($request->getServerParams()['HTTP_HOST'] ?? '', $this->private);
    }
}
