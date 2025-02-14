<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2;

use function straininfo\server\shared\arr\rem_null_rec;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructCulE;
use straininfo\server\shared\mvvm\model\struct\DataCon;

use straininfo\server\shared\mvvm\view_model\data\ParCul;

/**
 * @template TV
 *
 * @param array<array<string, TV>> $arr
 *
 * @return array<int, ParCul>
 */
function parse_max_arr(array $arr): array
{
    $res = [];
    $cul_id = DBStructCulE::CULTURE_ID->value;
    foreach ($arr as $val) {
        $ind = $val[$cul_id];
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
 * @return array<int, ParCul>
 */
function parse_avg_arr(array $arr): array
{
    $res = [];
    $cul_id = DBStructCulE::CULTURE_ID->value;
    foreach ($arr as $val) {
        $ind = $val[$cul_id];
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
 * @return array<int, ParCul>
 */
function parse_min_arr(array $arr): array
{
    $res = [];
    $cul_id = DBStructCulE::CULTURE_ID->value;
    foreach ($arr as $val) {
        $ind = $val[$cul_id];
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
function create_max(array $val): ParCul
{
    $cultures = rem_null_rec(get_avg_rel_des(
        $val,
        DataCon::R_DES_C->value,
        create_rel_cul_con(...)
    ));
    return new ParCul(
        arc: rem_null_rec(get_max_arr_arc($val)),
        rel_des_str: rem_null_rec(get_avg_rel_des(
            $val,
            DataCon::R_DES_S->value,
            create_rel_str_con(...)
        )),
        rel_des_cul:$cultures,
        rel_cul: rem_null_rec(get_max_arr_rel_cul($val)),
        pub: rem_null_rec(get_max_arr_pub($val)),
        seq: rem_null_rec(get_max_arr_seq($val)),
        str: rem_null_rec(get_max_arr_str($val, count($cultures))),
        reg: rem_null_rec(get_avg_arr_reg($val)),
        iso: rem_null_rec(get_avg_arr_iso($val)),
        dep: rem_null_rec(get_avg_arr_dep($val)),
        cul: rem_null_rec(get_avg_arr_cul($val)),
        tax: rem_null_rec(get_max_arr_tax($val)),
        brc: rem_null_rec(get_avg_arr_brc($val))
    );
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 */
function create_avg(array $val): ParCul
{
    return new ParCul(
        arc: [],
        rel_cul: [],
        rel_des_str: [],
        rel_des_cul: rem_null_rec(get_avg_rel_des(
            $val,
            DataCon::R_DES_C->value,
            create_rel_cul_con(...)
        )),
        pub: [],
        seq: [],
        str: rem_null_rec(get_cul_avg_arr_str($val)),
        reg: rem_null_rec(get_avg_arr_reg($val)),
        iso: rem_null_rec(get_avg_arr_iso($val)),
        dep: rem_null_rec(get_avg_arr_dep($val)),
        cul: rem_null_rec(get_avg_arr_cul($val)),
        tax: rem_null_rec(get_min_arr_tax($val)),
        brc: rem_null_rec(get_avg_arr_brc($val))
    );
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 */
function create_min(array $val): ParCul
{
    return new ParCul(
        arc: [],
        rel_cul: [],
        rel_des_cul: [],
        rel_des_str: [],
        pub: [],
        seq: [],
        brc: rem_null_rec(get_min_arr_brc($val)),
        dep: [],
        iso: [],
        str: [],
        reg: rem_null_rec(get_min_arr_reg($val)),
        cul: rem_null_rec(get_min_arr_cul($val)),
        tax: rem_null_rec(get_min_arr_tax($val))
    );
}
