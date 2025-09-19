<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\cul\v1;

use function straininfo\server\shared\arr\check_kt_arr_id;
use function straininfo\server\shared\arr\check_kt_bool;
use function straininfo\server\shared\arr\check_kt_f_arr_id;
use function straininfo\server\shared\arr\check_kt_f_arr_str;
use function straininfo\server\shared\arr\check_kt_f_str;
use function straininfo\server\shared\arr\check_kt_false_bool;
use function straininfo\server\shared\arr\check_kt_int;
use function straininfo\server\shared\arr\check_kt_str;
use function straininfo\server\shared\arr\check_kt_true;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructBrcE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructCulE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructDepE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructDesE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructIsoE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructStrE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructSubE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructSupE;

use straininfo\server\shared\mvvm\model\struct\DataCon;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StBrcE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StCulE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StDepE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StIsoE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StRegE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StRelDesE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StSamE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StStrE;
use function straininfo\server\shared\text\encode_url;

/**
 * @template TV
 *
 * @param array<string, TV> $dep
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function create_dep(array $dep): array
{
    return [
        StDepE::D_NAME->value => check_kt_f_str(
            $dep,
            DBStructDepE::NAME->value
        ),
        StDepE::D_INST->value => check_kt_f_str(
            $dep,
            DBStructDepE::INST->value
        ),
        StDepE::D_CC->value => check_kt_f_str(
            $dep,
            DBStructDepE::DCC->value
        ),
        StDepE::D_ROR->value => check_kt_f_str(
            $dep,
            DBStructDepE::ROR->value
        ),
        StDepE::D_ORCID->value => check_kt_f_str(
            $dep,
            DBStructDepE::ORCID->value
        ),
        StDepE::D_PLA->value => check_kt_f_arr_str(
            $dep,
            DBStructDepE::PLA->value,
            ','
        ),
        StDepE::D_CONTR->value => check_kt_true(
            $dep,
            DBStructDepE::CONTR->value
        ),
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $iso
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function create_iso(array $iso): array
{
    return [
        StIsoE::I_NAME->value => check_kt_f_str(
            $iso,
            DBStructIsoE::NAME->value
        ),
        StIsoE::I_INST->value => check_kt_f_str(
            $iso,
            DBStructIsoE::INST->value
        ),
        StIsoE::I_CC->value => check_kt_f_str(
            $iso,
            DBStructIsoE::DCC->value
        ),
        StIsoE::I_ROR->value => check_kt_f_str(
            $iso,
            DBStructIsoE::ROR->value
        ),
        StIsoE::I_ORCID->value => check_kt_f_str(
            $iso,
            DBStructIsoE::ORCID->value
        ),
        StIsoE::I_PLA->value => check_kt_f_arr_str(
            $iso,
            DBStructIsoE::PLA->value,
            ','
        ),
        StIsoE::I_CONTR->value => check_kt_true(
            $iso,
            DBStructIsoE::CONTR->value
        ),
    ];
}
/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_avg_arr_dep(array $val): array
{
    $reg = [];
    $key = DataCon::DEP->value;
    if (array_key_exists($key, $val) && is_array($arr = $val[$key])) {
        foreach ($arr as $dep) {
            if (!is_array($dep)) {
                continue;
            }
            // @phpstan-ignore argument.type
            $reg[] = create_dep($dep);
        }
    }
    return [
        StCulE::CON->value => [
            StDepE::DEP_CON->value => [
                StDepE::YEAR->value => check_kt_int($val, DBStructDepE::YEAR->value),
                StDepE::O_CUL->value => check_kt_int(
                    $val,
                    DBStructDepE::ORI_CUL->value
                ),
                StDepE::O_DES->value => check_kt_f_str(
                    $val,
                    DBStructDepE::DES->value
                ),
                StDepE::DEP_ENT_CON->value => $reg,
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
function get_avg_arr_iso(array $val): array
{
    $reg = [];
    $key = DataCon::ISO->value;
    if (array_key_exists($key, $val) && is_array($arr = $val[$key])) {
        foreach ($arr as $iso) {
            if (!is_array($iso)) {
                continue;
            }
            // @phpstan-ignore argument.type
            $reg[] = create_iso($iso);
        }
    }
    return [
        StCulE::CON->value => [
            StIsoE::ISO_CON->value => [
                StSamE::SAM_CON->value => [
                    StSamE::S_DATE->value => check_kt_f_str(
                        $val,
                        DBStructIsoE::SAM_DATE->value
                    ),
                    StSamE::S_CC->value => check_kt_f_str(
                        $val,
                        DBStructIsoE::SAM_CC->value
                    ),
                    StSamE::S_SRC->value => check_kt_f_str(
                        $val,
                        DBStructIsoE::SAM_SRC->value
                    ),
                    StSamE::S_PLA->value => check_kt_f_arr_str(
                        $val,
                        DBStructIsoE::SAM_PLA->value,
                        ','
                    ),
                ],
                StIsoE::ISO_ENT_CON->value => $reg,
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
function get_avg_arr_brc(array $val): array
{
    /** @var class-string<DBStructBrcE> */
    $db = DBStructBrcE::class;
    $home = [];
    $url = check_kt_f_str($val, $db::B_HOME->value);
    if (!is_null($url)) {
        $home = [
            StBrcE::BRC_URL->value => encode_url($url),
            StBrcE::BRC_ON->value => check_kt_bool($val, $db::B_ON->value),
        ];
    }
    return [
        StCulE::CON->value => [
            StBrcE::BRC_CON->value => [
                StBrcE::B_ID->value => check_kt_int($val, $db::B_ID->value),
                StBrcE::B_NAME->value => check_kt_f_str($val, $db::B_NAME->value),
                StBrcE::B_CC->value => check_kt_f_str($val, $db::B_CC->value),
                StBrcE::B_ROR->value => check_kt_f_str($val, $db::B_ROR->value),
                StBrcE::B_ACT->value => check_kt_bool($val, $db::B_ACT->value),
                StBrcE::B_DEPR->value => check_kt_bool($val, $db::B_DEPR->value),
                StBrcE::B_GBIF->value => check_kt_f_str($val, $db::B_GBIF->value),
                StBrcE::B_CODE->value => check_kt_f_str($val, $db::B_CODE->value),
                StBrcE::BRC_HOME->value => $home,
            ],
        ],
    ];
}

/**
 * @template TV
 *check_kt_bool
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_avg_arr_cul(array $val): array
{
    /** @var class-string<DBStructCulE> */
    $db = DBStructCulE::class;
    $cat = [];
    $url = check_kt_f_str($val, $db::CAT->value);
    if (!is_null($url)) {
        $cat = [
            StCulE::CAT_URL->value => encode_url($url),
            StCulE::CAT_ON->value => check_kt_bool($val, $db::CAT_ON->value),
        ];
    }
    $his = check_kt_f_str($val, $db::HIST->value);
    $his_con = [];
    if (!is_null($his) && $his !== '') {
        $his_con = [StCulE::HIST_ENC->value => $his,
            StCulE::DATA_SRC->value => check_kt_f_str(
                $val,
                $db::DATA_SRC->value
            ),
        ];
    }
    return [
        StCulE::CON->value => [
            StCulE::CUL_ID->value => check_kt_int($val, $db::CULTURE_ID->value),
            StCulE::STR_NO->value => check_kt_str($val, $db::STRAIN_NUMBER->value),
            StCulE::CAT->value => $cat,
            StCulE::STATUS->value => check_kt_str($val, $db::STATUS->value),
            StCulE::TYP_CUL->value => check_kt_bool($val, $db::TYP_CUL->value),
            StCulE::TYP_STR->value => check_kt_false_bool($val, $db::TYP_STR->value),
            StCulE::DATA_SRC->value => [get_cul_source(
                check_kt_str($val, $db::DATA_SRC->value),
                check_kt_int($val, $db::CCNO_ID->value)
            ),
            ],
            StCulE::COMMENT->value => check_kt_f_str($val, $db::COMMENT->value),
            StCulE::HIST->value => [$his_con],
            StCulE::BAC_DIVE->value => check_kt_f_arr_id(
                $val,
                $db::BAC_DIVE->value,
                ','
            ),
            StCulE::UPDATE->value => check_kt_str($val, $db::UPDATE->value),
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
function get_cul_avg_arr_str(array $val): array
{
    /** @var class-string<DBStructStrE> */
    $db = DBStructStrE::class;
    return [
        StStrE::CON->value => [
            StStrE::STR_ID->value => check_kt_int($val, $db::STRAIN_ID->value),
            StStrE::STR_DOI->value => check_kt_f_str($val, $db::STRAIN_DOI->value),
            StStrE::TYP_CUL->value => check_kt_int($val, $db::TYP_CUL->value),
            StStrE::TYP_STR->value => check_kt_bool($val, $db::TYP_STR->value),
            StStrE::MERGE_CON->value => check_kt_arr_id(
                $val,
                DataCon::MER->value
            ),
        ],
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val *
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_avg_arr_reg(array $val): array
{
    $sub = null;
    $sup = null;
    /** @var class-string<DBStructSubE> $subDB */
    $subDB = DBStructSubE::class;
    /** @var class-string<DBStructSupE> $supDB */
    $supDB = DBStructSupE::class;
    $key = DataCon::REG->value;
    if (array_key_exists($key, $val) && is_array($arr = $val[$key])) {
        foreach ($arr as $reg) {
            if (!is_array($reg)) {
                continue;
            }
            // @phpstan-ignore argument.type
            if (count($sub_buf = create_reg($reg, $subDB)) > 0) {
                $sub = $sub_buf;
            }
            // @phpstan-ignore argument.type
            if (count($sup_buf = create_reg($reg, $supDB)) > 0) {
                $sup = $sup_buf;
            }
        }
    }
    return [
        StCulE::CON->value => [
            StRegE::REG_CON->value => [
                StRegE::DATE->value => check_kt_f_str(
                    $val,
                    DBStructCulE::REG_DATE->value
                ),
                StRegE::SUP_ENT_CON->value => $sup,
                StRegE::SUB_ENT_CON->value => $sub,
            ],
        ],
    ];
}

/**
 * @param array<string|number> $des_con
 *
 * @return array<string, array<string, array<string>>>
 */
function create_rel_cul_con(array $des_con): array
{
    return [StCulE::CON->value => [
        StRelDesE::REL_CON->value => array_map(
            static fn ($des) => (string) $des,
            $des_con
        ),
    ],
    ];
}

/**
 * @template TV
 * @template TR
 *
 * @param array<string, TV> $val
 * @param callable(array<string>): array<string, TR> $wrapper
 *
 * @return array<string, TR>
 */
function get_avg_rel_des(
    array $val,
    string $db_con,
    callable $wrapper
): array {
    $res = [];
    /** @var class-string<DBStructDesE> */
    $db = DBStructDesE::class;
    if (array_key_exists($db_con, $val) && is_array($arr = $val[$db_con])) {
        foreach ($arr as $des) {
            if (!is_array($des)) {
                continue;
            }
            // @phpstan-ignore argument.type
            $des_id = check_kt_f_str($des, $db::DES->value);
            if (!(is_string($des_id) && $des_id !== '')) {
                continue;
            }
            $res[$des_id] = 1;
        }
    }
    return $wrapper(array_keys($res));
}
