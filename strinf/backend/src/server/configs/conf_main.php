<?php

declare(strict_types=1);

namespace straininfo\server\configs;

use Safe\Exceptions\FilesystemException;
use function Safe\file_get_contents;
use function Safe\json_decode;
use straininfo\server\exceptions\init_phase\KnownConfExc;

use straininfo\server\shared\exc\KEAct;
use straininfo\server\shared\logger\LogLevE;

/**
 * @template T
 *
 * @param callable(mixed): T $acc
 * @param array<string> $set_names
 *
 * @return array<string, array<string, T>>
 */
function check_conf_values(
    callable $acc,
    string $json_file,
    string $cont,
    array $set_names
): array {
    try {
        $json = json_decode(file_get_contents($json_file), true);
        if (!(is_array($json) && is_array($json[$cont] ?? ''))) {
            $msg = "Container: {$cont} not defined!";
            throw new KnownConfExc($msg, LogLevE::CRITICAL, KEAct::TERM);
        }
        $conf = $json[$cont];
        $res = [];
        foreach ($set_names as $to_ch) {
            if (!is_array($conf[$to_ch] ?? '') || array_is_list($conf[$to_ch])) {
                $msg = "Section: {$to_ch} not defined!";
                throw new KnownConfExc($msg, LogLevE::CRITICAL, KEAct::TERM);
            }
            array_map($acc(...), $conf[$to_ch]);
            $res[$to_ch] = $conf[$to_ch];
        }
        return $res;
    } catch (FilesystemException) {
        $msg = 'Could not find section!';
        throw new KnownConfExc($msg, LogLevE::CRITICAL, KEAct::TERM);
    }
}

function check_conf_main(mixed $a_el): string|bool|int
{
    if (is_string($a_el)) {
        return (string) $a_el;
    }
    if (is_int($a_el)) {
        return (int) $a_el;
    }
    if (is_bool($a_el)) {
        return (bool) $a_el;
    }
    throw new KnownConfExc(
        'Wrong conf type given - ' . gettype($a_el),
        LogLevE::CRITICAL,
        KEAct::TERM
    );
}
/**
 * @template T
 *
 * @param array<T> $arr
 */
function is_array_str(array $arr): bool
{
    foreach ($arr as $ele) {
        if (!is_string($ele)) {
            return false;
        }
    }
    return true;
}
/**
 * @return string|bool|int|array<string>
 */
function check_conf_array_str(mixed $a_el): string|bool|int|array
{
    if (is_string($a_el)) {
        return (string) $a_el;
    }
    if (is_int($a_el)) {
        return (int) $a_el;
    }
    if (is_bool($a_el)) {
        return (bool) $a_el;
    }
    if (is_array($a_el) && is_array_str($a_el)) {
        /** @var array<string> $a_el */
        return $a_el;
    }
    throw new KnownConfExc(
        'Wrong conf type given - ' . gettype($a_el),
        LogLevE::CRITICAL,
        KEAct::TERM
    );
}
