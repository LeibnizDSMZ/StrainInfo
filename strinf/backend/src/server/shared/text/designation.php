<?php

declare(strict_types=1);

namespace straininfo\server\shared\text;

use function Safe\preg_match;
use function Safe\preg_replace;

/**
 * @return array{string,string,string}
 */
function split_three_groups(string $pattern, string $designation): array
{
    if (preg_match($pattern, $designation, $matches) === 0 || $matches === null) {
        return ['', '', ''];
    }
    /** @var array<string> $matches */
    [, $pre, $core, $suf] = $matches;
    return [
        strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $pre)),
        preg_replace("/^\D+|\D+$/", '', $core),
        strtoupper(preg_replace("/^[,.:\/\s_-]+|[,.:\/\s_-]+$|T$/", '', $suf)),
    ];
}
/**
 * @param array<string> $designations
 *
 * @return array<array{string,string,string}>
 */
function create_designation_triplet(array $designations): array
{
    $three_groups = "/^(\D*)(\d+(?:\D\d+)*)(\D*)$/";
    return array_filter(
        array_map(
            static fn (string $des): array => split_three_groups($three_groups, $des),
            $designations
        ),
        static fn (array $tri): bool => $tri[1] !== '' and $tri[0] !== ''
    );
}
