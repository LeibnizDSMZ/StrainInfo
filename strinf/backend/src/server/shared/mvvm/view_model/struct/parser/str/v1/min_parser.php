<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\str\v1;

use straininfo\server\shared\mvvm\view_model\struct\json\v1\StTaxE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StStrE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StRelCulE;
use straininfo\server\shared\mvvm\model\struct\DataCon;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructTaxE;

use straininfo\server\shared\mvvm\model\sia\fields\DBStructStrE;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v1\get_strain_status;
use function straininfo\server\shared\mvvm\view_model\struct\parser\cul\v1\get_max_arr_rel_cul;
use function straininfo\server\shared\arr\check_kt_int;
use function straininfo\server\shared\arr\check_kt_f_str;

use function straininfo\server\shared\arr\check_kt_bool;
use function straininfo\server\shared\arr\check_kt_arr_id;

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_min_arr_tax(array $val): array
{
    /** @var class-string<DBStructTaxE> */
    $db = DBStructTaxE::class;
    return [
        StStrE::CON->value => [
            StTaxE::TAX_CON->value => [
                StTaxE::NAME->value => check_kt_f_str($val, $db::S_NAME->value),
                StTaxE::LPSN->value => check_kt_int($val, $db::S_LPSN->value),
                StTaxE::NCBI->value => check_kt_int($val, $db::S_NCBI->value),
            ],
        ],
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 * @param array<string, TV> $strain
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_min_arr_str(array $val, array $strain): array
{
    /** @var class-string<DBStructStrE> */
    $db = DBStructStrE::class;
    $type_cul = check_kt_int($val, $db::TYP_CUL->value);
    $cul_on = check_kt_int($val, $db::STR_STA_ON->value);
    $cul_cnt = count(
        $strain[StStrE::CON-> value]
            [StRelCulE::REL_CON->value]
            [StRelCulE::REL_CUL_CON->value]
    );
    return [
        StStrE::CON->value => [
            StStrE::STR_ID->value => check_kt_int($val, $db::STRAIN_ID->value),
            StStrE::STR_DOI->value => check_kt_f_str($val, $db::STRAIN_DOI->value),
            StStrE::TYP_CUL->value => $type_cul,
            StStrE::TYP_STR->value => check_kt_bool($val, $db::TYP_STR->value),
            StStrE::BAC_DIVE->value => check_kt_int($val, $db::BAC_DIVE->value),
            StStrE::MERGE_CON->value => check_kt_arr_id($val, DataCon::MER->value),
            StStrE::SAM_CON->value => [
                StStrE::SAM_SRC->value => check_kt_f_str($val, $db::SAM_SRC->value),
                StStrE::SAM_CC->value => check_kt_f_str($val, $db::SAM_CC->value),
            ],
            StStrE::STA->value => get_strain_status($type_cul, $cul_on, $cul_cnt),
        ],

    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_min_arr_rel_cul(array $val): array
{
    return get_max_arr_rel_cul($val);
}
