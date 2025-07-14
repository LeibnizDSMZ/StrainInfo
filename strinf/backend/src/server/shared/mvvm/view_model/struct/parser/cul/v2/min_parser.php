<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2;

use function straininfo\server\shared\arr\check_kt_bool;
use function straininfo\server\shared\arr\check_kt_f_arr_str;
use function straininfo\server\shared\arr\check_kt_f_str;
use function straininfo\server\shared\arr\check_kt_false_bool;
use function straininfo\server\shared\arr\check_kt_int;
use function straininfo\server\shared\arr\check_kt_str;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructBrcE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructCulE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructSubE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructSupE;

use straininfo\server\shared\mvvm\model\sia\fields\DBStructTaxE;
use straininfo\server\shared\mvvm\model\struct\DataCon;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StCcE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StDepositE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StRegE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StTaxE;

function get_cul_source(?string $src, ?int $ccno_id): ?string
{
    if (!(is_null($src) || is_null($ccno_id))) {
        return $src;
    }
    if (is_null($src) && is_null($ccno_id)) {
        return 'registration';
    }
    return null;
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, mixed>
 */
function get_min_arr_cul_base(array $val): array
{
    /** @var class-string<DBStructCulE> */
    $db = DBStructCulE::class;
    $cat = [];
    $url = check_kt_f_str($val, $db::CAT->value);
    if (!is_null($url)) {
        $cat = [
            StDepositE::CAT_URL->value => $url,
            StDepositE::CAT_ON->value => check_kt_bool($val, $db::CAT_ON->value),
        ];
    }
    return [
        StDepositE::SI_DP->value => check_kt_int($val, $db::CULTURE_ID->value),
        StDepositE::DES->value => check_kt_str($val, $db::STRAIN_NUMBER->value),
        StDepositE::CAT->value => $cat,
        StDepositE::STATUS->value => check_kt_str($val, $db::STATUS->value),
        StDepositE::TYP_STR->value => check_kt_false_bool($val, $db::TYP_STR->value),
        StDepositE::DATA_SRC->value => get_cul_source(
            check_kt_str($val, $db::DATA_SRC->value),
            check_kt_int($val, $db::CCNO_ID->value)
        ),
        StDepositE::UPDATE->value => check_kt_str($val, $db::UPDATE->value),
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_min_arr_cul(array $val): array
{
    return [
        StDepositE::CON->value => [
            ...get_min_arr_cul_base($val),
        ],
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, mixed>
 */
function get_min_arr_tax_base(array $val): array
{
    /** @var class-string<DBStructTaxE> */
    $db = DBStructTaxE::class;
    return [
        StTaxE::TAX_CON->value => [
            StTaxE::NAME->value => check_kt_f_str($val, $db::C_NAME->value),
            StTaxE::LPSN->value => check_kt_int($val, $db::C_LPSN->value),
            StTaxE::NCBI->value => check_kt_int($val, $db::C_NCBI->value),
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
function get_min_arr_tax(array $val): array
{
    return [
        StDepositE::CON->value => [
            ...get_min_arr_tax_base($val),
        ],
    ];
}
/**
 * @template TV
 *
 * @param array<string, TV> $sub
 * @param class-string<\straininfo\server\shared\mvvm\model\sia\fields\DBStructSubE|DBStructSupE> $typ
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function create_reg(array $sub, string $typ): array
{
    $name = check_kt_f_str($sub, $typ::NAME->value);
    if (is_null($name) or $name === '') {
        return [];
    }
    return [
        StRegE::S_NAME->value => $name,
        StRegE::S_INST->value => check_kt_f_str(
            $sub,
            $typ::INST->value
        ),
        StRegE::S_CC->value => check_kt_f_str(
            $sub,
            $typ::RCC->value
        ),
        StRegE::S_ROR->value => check_kt_f_str(
            $sub,
            $typ::ROR->value
        ),
        StRegE::S_ORCID->value => check_kt_f_str(
            $sub,
            $typ::ORCID->value
        ),
        StRegE::S_PLA->value => check_kt_f_arr_str(
            $sub,
            $typ::PLA->value,
            ','
        ),
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val *
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_min_arr_reg(array $val): array
{
    $sub = [];
    $key_con = DataCon::REG->value;
    if (array_key_exists($key_con, $val) && is_array($val[$key_con])) {
        foreach ($val[$key_con] as $reg) {
            if (!is_array($reg)) {
                continue;
            }
            if (!empty($sub_buf = create_reg($reg, DBStructSubE::class))) { // @phpstan-ignore argument.type
                $sub = $sub_buf;
            }
        }
    }
    return [
        StDepositE::CON->value => [
            StRegE::REG_CON->value => [
                StRegE::DATE->value => check_kt_f_str(
                    $val,
                    DBStructCulE::REG_DATE->value
                ),
                StRegE::SUB_ENT_CON->value => $sub,
            ],
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
function get_min_arr_brc_plain(array $val): array
{
    /** @var class-string<DBStructBrcE> */
    $db = DBStructBrcE::class;
    return [
        StCcE::CC_CON->value => [
            StCcE::CC_ID->value => check_kt_int($val, $db::B_ID->value),
            StCcE::CC_NAME->value => check_kt_f_str($val, $db::B_NAME->value),
            StCcE::CC_CODE->value => check_kt_f_str($val, $db::B_CODE->value),
            StCcE::CC_DEPR->value => check_kt_bool($val, $db::B_DEPR->value),
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
function get_min_arr_brc(array $val): array
{
    return [
        StDepositE::CON->value => get_min_arr_brc_plain($val),
    ];
}
