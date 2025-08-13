<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\str\v2;

use function straininfo\server\shared\arr\check_kt_arr_id;
use straininfo\server\shared\mvvm\model\struct\DataCon;

use straininfo\server\shared\mvvm\view_model\struct\json\v2\StStrE;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2\get_max_arr_arc;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2\get_max_arr_seq;

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
