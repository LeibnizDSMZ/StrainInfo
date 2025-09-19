<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\cul\v2;

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
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StCcE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StDepositE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StDepositionE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StIsoE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StRegE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StRelDesE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StSamE;
use straininfo\server\shared\mvvm\view_model\struct\json\v2\StStrE;
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
        StDepositionE::D_NAME->value => check_kt_f_str(
            $dep,
            DBStructDepE::NAME->value
        ),
        StDepositionE::D_INST->value => check_kt_f_str(
            $dep,
            DBStructDepE::INST->value
        ),
        StDepositionE::D_CC->value => check_kt_f_str(
            $dep,
            DBStructDepE::DCC->value
        ),
        StDepositionE::D_ROR->value => check_kt_f_str(
            $dep,
            DBStructDepE::ROR->value
        ),
        StDepositionE::D_ORCID->value => check_kt_f_str(
            $dep,
            DBStructDepE::ORCID->value
        ),
        StDepositionE::D_PLA->value => check_kt_f_arr_str(
            $dep,
            DBStructDepE::PLA->value,
            ','
        ),
        StDepositionE::D_CONTR->value => check_kt_true(
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
            $reg[] = create_dep($dep);  // @phpstan-ignore argument.type
        }
    }
    return [
        StDepositE::CON->value => [
            StDepositionE::DEP_CON->value => [
                StDepositionE::YEAR->value => check_kt_int($val, DBStructDepE::YEAR->value),
                StDepositionE::O_SI_DP->value => check_kt_int(
                    $val,
                    DBStructDepE::ORI_CUL->value
                ),
                StDepositionE::O_DES->value => check_kt_f_str(
                    $val,
                    DBStructDepE::DES->value
                ),
                StDepositionE::DEP_ENT_CON->value => $reg,
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
            $reg[] = create_iso($iso);  // @phpstan-ignore argument.type
        }
    }
    return [
        StDepositE::CON->value => [
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
            StCcE::CC_URL->value => encode_url($url),
            StCcE::CC_ON->value => check_kt_bool($val, $db::B_ON->value),
        ];
    }
    return [
        StDepositE::CON->value => [
            StCcE::CC_CON->value => [
                StCcE::CC_ID->value => check_kt_int($val, $db::B_ID->value),
                StCcE::CC_NAME->value => check_kt_f_str($val, $db::B_NAME->value),
                StCcE::CC_CC_CODE->value => check_kt_f_str($val, $db::B_CC->value),
                StCcE::CC_ROR->value => check_kt_f_str($val, $db::B_ROR->value),
                StCcE::CC_ACT->value => check_kt_bool($val, $db::B_ACT->value),
                StCcE::CC_DEPR->value => check_kt_bool($val, $db::B_DEPR->value),
                StCcE::CC_GBIF->value => check_kt_f_str($val, $db::B_GBIF->value),
                StCcE::CC_CODE->value => check_kt_f_str($val, $db::B_CODE->value),
                StCcE::CC_HOME->value => $home,
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
            StDepositE::CAT_URL->value => encode_url($url),
            StDepositE::CAT_ON->value => check_kt_bool($val, $db::CAT_ON->value),
        ];
    }
    $his = check_kt_f_str($val, $db::HIST->value);
    $his_con = [];
    if (!is_null($his) && $his !== '') {
        $his_con = [StDepositE::HIST_ENC->value => $his,
            StDepositE::DATA_SRC->value => check_kt_f_str(
                $val,
                $db::DATA_SRC->value
            ),
        ];
    }
    return [
        StDepositE::CON->value => [
            StDepositE::SI_DP->value => check_kt_int($val, $db::CULTURE_ID->value),
            StDepositE::DES->value => check_kt_str($val, $db::STRAIN_NUMBER->value),
            StDepositE::CAT->value => $cat,
            StDepositE::STATUS->value => check_kt_str($val, $db::STATUS->value),
            StDepositE::TYP_STR->value => check_kt_false_bool($val, $db::TYP_STR->value),
            StDepositE::DATA_SRC->value => [get_cul_source(
                check_kt_str($val, $db::DATA_SRC->value),
                check_kt_int($val, $db::CCNO_ID->value)
            ),
            ],
            StDepositE::HIST->value => [$his_con],
            StDepositE::BAC_DIVE->value => check_kt_f_arr_id(
                $val,
                $db::BAC_DIVE->value,
                ','
            ),
            StDepositE::UPDATE->value => check_kt_str($val, $db::UPDATE->value),
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
            StStrE::SI_ID->value => check_kt_int($val, $db::STRAIN_ID->value),
            StStrE::STR_DOI->value => check_kt_f_str($val, $db::STRAIN_DOI->value),
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
            if (count($sub_buf = create_reg($reg, $subDB)) > 0) {  // @phpstan-ignore argument.type
                $sub = $sub_buf;
            }
            if (count($sup_buf = create_reg($reg, $supDB)) > 0) {  // @phpstan-ignore argument.type
                $sup = $sup_buf;
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
    return [StDepositE::CON->value => [
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
            $des_id = check_kt_f_str($des, $db::DES->value);  // @phpstan-ignore argument.type
            if (!(is_string($des_id) && $des_id !== '')) {
                continue;
            }
            $res[$des_id] = 1;
        }
    }
    return $wrapper(array_keys($res));
}
