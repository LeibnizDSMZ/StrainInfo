<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\str\v2;

use straininfo\server\shared\mvvm\view_model\struct\json\v2\StStrE;
use straininfo\server\shared\mvvm\model\struct\DataCon;

use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2\get_max_arr_seq;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2\get_max_arr_arc;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2\get_avg_rel_des;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2\create_rel_str_con;
use function straininfo\server\shared\arr\check_kt_arr_id;

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, array<string, array<string>>>>
 */
function get_avg_rel_des_str(array $val): array
{
    return get_avg_rel_des(
        $val,
        DataCon::R_DES_S->value,
        create_rel_str_con(...)
    );
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_avg_arr_arc(array $val): array
{
    return get_max_arr_arc($val);
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_avg_arr_seq(array $val): array
{
    return get_max_arr_seq($val);
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 * @param array<string, TV> $strain
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_avg_arr_str(array $val, array $strain): array
{
    $arr_min = get_min_arr_str($val, $strain);
    $arr_avg = [
        StStrE::CON->value => [
            StStrE::ALT_CON->value => check_kt_arr_id(
                $val,
                DataCon::ALT->value
            ),
        ],
    ];
    return \array_merge_recursive($arr_min, $arr_avg);
}
