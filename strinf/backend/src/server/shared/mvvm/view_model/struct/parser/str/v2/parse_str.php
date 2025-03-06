<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\str\v2;

use straininfo\server\shared\mvvm\view_model\struct\json\v2\StRelDepositE;
use straininfo\server\shared\mvvm\view_model\data\ParStr;
use straininfo\server\shared\mvvm\model\struct\StrainStatus;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructStrE;

use function straininfo\server\shared\arr\rem_null_rec;

/**
 * @template TV
 *
 * @param array<array<string, TV>> $arr
 *
 * @return array<int, ParStr>
 */
function parse_max_arr(array $arr): array
{
    $res = [];
    $str_id = DBStructStrE::STRAIN_ID->value;
    foreach ($arr as $val) {
        $ind = $val[$str_id];
        if (is_int($ind)) {
            $res[$ind] = create_max($val);
        }
    }
    return $res;
}

/**
 * @template TV
 *
 * @param array<array<string, TV>> $arr
 *
 * @return array<int, ParStr>
 */
function parse_avg_arr(array $arr): array
{
    $res = [];
    $str_id = DBStructStrE::STRAIN_ID->value;
    foreach ($arr as $val) {
        $ind = $val[$str_id];
        if (is_int($ind)) {
            $res[$ind] = create_avg($val);
        }
    }
    return $res;
}

/**
 * @template TV
 *
 * @param array<array<string, TV>> $arr
 *
 * @return array<int, ParStr>
 */
function parse_min_arr(array $arr): array
{
    $res = [];
    $str_id = DBStructStrE::STRAIN_ID->value;
    foreach ($arr as $val) {
        $ind = $val[$str_id];
        if (is_int($ind)) {
            $res[$ind] = create_min($val);
        }
    }
    return $res;
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 */
function create_max(array $val): ParStr
{
    $cultures = rem_null_rec(get_min_arr_rel_cul($val));
    return new ParStr(
        cul: rem_null_rec(get_max_arr_cul($val)),
        pub: rem_null_rec(get_max_arr_pub($val)),
        seq: rem_null_rec(get_avg_arr_seq($val)),
        arc: rem_null_rec(get_avg_arr_arc($val)),
        rel_des: rem_null_rec(get_avg_rel_des_str($val)),
        rel_cul: rem_null_rec(get_min_arr_rel_cul($val)),
        str: rem_null_rec(get_avg_arr_str($val, $cultures)),
        tax: rem_null_rec(get_min_arr_tax($val))
    );
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 */
function create_avg(array $val): ParStr
{
    $cultures = rem_null_rec(get_min_arr_rel_cul($val));
    return new ParStr(
        cul: [],
        pub: rem_null_rec(get_max_arr_pub($val)),
        seq: rem_null_rec(get_avg_arr_seq($val)),
        arc: rem_null_rec(get_avg_arr_arc($val)),
        rel_des: rem_null_rec(get_avg_rel_des_str($val)),
        rel_cul: $cultures,
        str: rem_null_rec(get_avg_arr_str($val, $cultures)),
        tax: rem_null_rec(get_min_arr_tax($val))
    );
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 */
function create_min(array $val): ParStr
{
    $cultures = rem_null_rec(get_min_arr_rel_cul($val));
    return new ParStr(
        cul: [],
        arc: [],
        rel_des: [],
        pub: [],
        seq: [],
        rel_cul: $cultures,
        str: rem_null_rec(get_min_arr_str($val, $cultures)),
        tax: rem_null_rec(get_min_arr_tax($val))
    );
}

function convert_strain_status(string $status): int
{
    if ($status === StrainStatus::UND_DEP->value) {
        return 2;
    }
    if ($status === StrainStatus::PUB_ON->value) {
        return 1;
    }
    return 0;
}
