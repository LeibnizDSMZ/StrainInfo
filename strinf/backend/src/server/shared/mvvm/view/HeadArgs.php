<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view;

final class HeadArgs
{
    /**
     * @param array<string> $origin
     * @param array<string> $cors
     */
    public function __construct(
        private readonly array $origin,
        private readonly array $cors,
        private readonly string $charset,
        private readonly bool $embeddable,
        private readonly string $contype
    ) {
    }

    /** @return array<string> */
    public function getCors(): array
    {
        return $this->cors;
    }

    /** @return array<string> */
    public function getOri(): array
    {
        return $this->origin;
    }

    public function getCharS(): string
    {
        return $this->charset;
    }

    public function isEmbeddable(): bool
    {
        return $this->embeddable;
    }

    public function getContentType(): string
    {
        return $this->contype;
    }
}
