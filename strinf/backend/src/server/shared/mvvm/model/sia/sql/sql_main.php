<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\sql;

use function Safe\preg_replace;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructArcE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructBrcE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructCulE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructDesE;

use straininfo\server\shared\mvvm\model\sia\fields\DBStructStrE;

/**
 * @template T
 *
 * @param array<T> $ele
 */
function parse_sql_cul_id(array $ele): int
{
    return (int) $ele[DBStructCulE::CULTURE_ID->value]; // @phpstan-ignore cast.int
}

/**
 * @param array<string|int> $ele
 */
function parse_sql_brc_id(array $ele): int
{
    return (int) $ele[DBStructBrcE::B_ID->value];
}

/**
 * @param array<string|int> $row
 *
 * @return array{string, int, int}
 */
function parse_sql_index_entity(array $row): array
{
    return [
        (string) $row[0],
        (int) $row[1],
        (int) $row[2],
    ];
}

/**
 * @param array<string|int> $row
 *
 * @return array{int, string}
 */
function parse_sql_id_date(array $row): array
{
    return [
        (int) $row[0],
        (string) $row[1],
    ];
}

/**
 * @param array<string|int> $row
 *
 * @return array{string, int, int}
 */
function parse_sql_index_entity_ccno(array $row): array
{
    return [
        implode(' ', array_slice($row, 0, 4)),
        (int) $row[4],
        (int) $row[5],
    ];
}

/**
 * @param array<string|int> $ele
 */
function parse_sql_des_id(array $ele): int
{
    return (int) $ele[DBStructDesE::DES_ID->value];
}

/**
 * @template T
 *
 * @param array<T> $ele
 */
function parse_sql_str_id(array $ele): int
{
    return (int) $ele[DBStructStrE::STRAIN_ID->value];  // @phpstan-ignore cast.int
}

/**
 * @template T
 *
 * @param array<T> $ele
 */
function parse_sql_main_str_id(array $ele): int
{
    return (int) $ele[DBStructStrE::MAIN_ID->value];  // @phpstan-ignore cast.int
}

/**
 * @template T
 *
 * @param array<T> $ele
 */
function parse_sql_merge_str_id(array $ele): int
{
    return (int) $ele[DBStructStrE::MERGE_ID->value];  // @phpstan-ignore cast.int
}

/**
 * @template T
 *
 * @param array<T> $ele
 */
function parse_sql_alt_str_id(array $ele): int
{
    return (int) $ele[DBStructStrE::ALT_ID->value];  // @phpstan-ignore cast.int
}

/**
 * @template T of array
 *
 * @param array<T> $full
 *
 * @return array<string, string>
 */
function parse_sql_arc_id(array $full): array
{
    $res = [];
    $sDoi = DBStructStrE::STRAIN_DOI->value;
    $arc = DBStructArcE::ARC->value;
    if (count($full) === 0) {
        return $res;
    }
    foreach ($full as $ele) {
        $si_id = preg_replace('/^.+\/SI-ID\s+/', '', (string) $ele[$sDoi]);
        $res[$si_id] = (string) $ele[$arc];
    }
    return $res;
}

/** @param array<string> $column */
function create_sql_in_templ(int $cnt, array $column, string $comb): string
{
    $str_q = implode(',', array_map(static fn (): string => '?', range(0, $cnt - 1)));
    if (!$column) {
        return '';
    }
    $res = [];
    foreach ($column as $col) {
        $res[] = "{$col} IN({$str_q})";
    }
    $res_str = implode(" {$comb} ", $res);
    return "{$res_str}";
}

/** @param array<string> $column */
function create_sql_in_tuple_templ(int $cnt, array $column): string
{
    $tuple_size = count($column);
    $str_q = implode('),(', array_map(static fn (): string => implode(
        ',',
        array_map(static fn (): string => '?', range(0, $tuple_size - 1))
    ), range(0, $cnt - 1)));
    if ($tuple_size < 2) {
        return '';
    }
    $col_q = implode(',', $column);
    return "({$col_q}) IN(({$str_q}))";
}
