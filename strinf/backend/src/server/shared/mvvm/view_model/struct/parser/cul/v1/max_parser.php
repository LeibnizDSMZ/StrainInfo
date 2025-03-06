<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\parser\cul\v1;

use function straininfo\server\shared\arr\check_kt_arr_id;
use function straininfo\server\shared\arr\check_kt_bool;
use function straininfo\server\shared\arr\check_kt_f_str;
use function straininfo\server\shared\arr\check_kt_int;
use function straininfo\server\shared\arr\check_kt_str;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructArcE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructPubE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructRelCulE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructSeqE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructStrE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructTaxE;
use straininfo\server\shared\mvvm\model\struct\DataCon;
use straininfo\server\shared\mvvm\model\struct\StrainStatus;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StArcE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StCulE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StPubE;

use straininfo\server\shared\mvvm\view_model\struct\json\v1\StRelCulE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StRelDesE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StSeqE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StStrE;
use straininfo\server\shared\mvvm\view_model\struct\json\v1\StTaxE;

function get_strain_status(?int $type_cul, ?int $cul_on, int $cul_cnt): StrainStatus
{
    $status = StrainStatus::PUB_OFF;
    if ($cul_on !== null && $cul_on > 0) {
        $status = StrainStatus::PUB_ON;
    } elseif ($cul_cnt === 1 && $type_cul !== null && $type_cul > 0) {
        $status = StrainStatus::UND_DEP;
    }
    return $status;
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_max_arr_str(array $val, int $cul_cnt): array
{
    /** @var class-string<DBStructStrE> */
    $db = DBStructStrE::class;
    $type_cul = check_kt_int($val, $db::TYP_CUL->value);
    $cul_on = check_kt_int($val, $db::STR_STA_ON->value);
    return [
        StStrE::CON->value => [
            StStrE::STR_ID->value => check_kt_int($val, $db::STRAIN_ID->value),
            StStrE::STR_DOI->value => check_kt_f_str($val, $db::STRAIN_DOI->value),
            StStrE::TYP_CUL->value => $type_cul,
            StStrE::STA->value => get_strain_status($type_cul, $cul_on, $cul_cnt),
            StStrE::TYP_STR->value => check_kt_bool($val, $db::TYP_STR->value),
            StStrE::MERGE_CON->value => check_kt_arr_id(
                $val,
                DataCon::MER->value
            ),
            StStrE::BAC_DIVE->value => check_kt_int($val, $db::BAC_DIVE->value),
            StStrE::SAM_CON->value => [
                StStrE::SAM_SRC->value => check_kt_f_str($val, $db::SAM_SRC->value),
                StStrE::SAM_CC->value => check_kt_f_str($val, $db::SAM_CC->value),
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
function get_max_arr_tax(array $val): array
{
    /** @var class-string<DBStructTaxE> */
    $db = DBStructTaxE::class;
    return [
        StCulE::CON->value => [
            StTaxE::TAX_CON->value => [
                StTaxE::NAME->value => check_kt_f_str($val, $db::C_NAME->value),
                StTaxE::LPSN->value => check_kt_int($val, $db::C_LPSN->value),
                StTaxE::NCBI->value => check_kt_int($val, $db::C_NCBI->value),
            ],
        ],
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
 * @param array<string, TV> $lit
 *
 * @return array<string, array<string, mixed>|int|string|null>
 */
function create_pub(array $lit): array
{
    /** @var class-string<DBStructPubE> */
    $db = DBStructPubE::class;
    return [
        StPubE::PMC->value => check_kt_int($lit, $db::PMC->value),
        StPubE::PM->value => check_kt_int($lit, $db::PUB_MED->value),
        StPubE::ISSN->value => check_kt_f_str($lit, $db::ISSN->value),
        StPubE::DOI->value => check_kt_f_str($lit, $db::DOI->value),
        StPubE::TITLE->value => check_kt_f_str($lit, $db::TITLE->value),
        StPubE::AUT->value => check_kt_f_str($lit, $db::AUT->value),
        StPubE::PUB->value => check_kt_f_str($lit, $db::PUB->value),
        StPubE::YEAR->value => check_kt_int($lit, $db::YEAR->value),
        StPubE::LIT_CUL_CON->value => [],
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $seq
 *
 * @return array<string, array<string, mixed>|int|string|null>
 */
function create_seq(array $seq): array
{
    /** @var class-string<DBStructSeqE> */
    $db = DBStructSeqE::class;
    return [
        StSeqE::ACC_NR->value => check_kt_f_str($seq, $db::ACC_NR->value),
        StSeqE::DESC->value => check_kt_f_str($seq, $db::DESC->value),
        StSeqE::SEQ_L->value => check_kt_int($seq, $db::SEQ_L->value),
        StSeqE::YEAR->value => check_kt_int($seq, $db::YEAR->value),
        StSeqE::TYP->value => check_kt_f_str($seq, $db::TYP->value),
        StSeqE::ASS->value => check_kt_str($seq, $db::ASS->value),
        StSeqE::SEQ_CUL_CON->value => [],
    ];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_max_arr_pub(array $val): array
{
    $pub = [];
    /** @var class-string<DBStructPubE> */
    $db = DBStructPubE::class;
    $key_con = DataCon::LIT->value;
    if (array_key_exists($key_con, $val) && is_array($val[$key_con])) {
        foreach ($val[$key_con] as $lit) {
            if (!is_array($lit)) {
                continue;
            }
            // @phpstan-ignore argument.type
            $lit_id = check_kt_int($lit, $db::LIT_ID->value);
            if (!(is_int($lit_id) && $lit_id > 0)) {
                continue;
            }
            if (!array_key_exists($lit_id, $pub)) {
                // @phpstan-ignore argument.type
                $pub[$lit_id] = create_pub($lit);
            }
            if (!is_array($pub[$lit_id][StPubE::LIT_CUL_CON->value])) {
                continue;
            }
            $pub[$lit_id][StPubE::LIT_CUL_CON->value][] = [
                StPubE::CUL_ID->value => check_kt_int(
                    // @phpstan-ignore argument.type
                    $lit,
                    $db::CUL->value
                ),
                StPubE::STR_NO->value => check_kt_f_str(
                    // @phpstan-ignore argument.type
                    $lit,
                    $db::CUL_DES->value
                ),
            ];
        }
    }
    return [
        StStrE::CON->value => [
            StPubE::LIT_CON->value => [...$pub],
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
function get_max_arr_arc(array $val): array
{
    $res = [];
    /** @var class-string<DBStructArcE> */
    $db = DBStructArcE::class;
    $key_con = DataCon::ARC->value;
    if (array_key_exists($key_con, $val) && is_array($val[$key_con])) {
        foreach ($val[$key_con] as $con) {
            if (!is_array($con)) {
                continue;
            }
            $res[] = [
                // @phpstan-ignore argument.type
                StArcE::DOI->value => check_kt_f_str($con, $db::DOI->value),
                // @phpstan-ignore argument.type
                StArcE::DATE->value => check_kt_f_str($con, $db::DATE->value),
                // @phpstan-ignore argument.type
                StArcE::TIT->value => check_kt_f_str($con, $db::TIT->value),
            ];
        }
    }
    return [StStrE::CON->value => [StArcE::ARC_CON->value => $res]];
}

/**
 * @template TV
 *
 * @param array<string, TV> $val
 *
 * @return array<string, array<string, mixed>|scalar|null>
 */
function get_max_arr_seq(array $val): array
{
    $seq_con = [];
    /** @var class-string<DBStructSeqE> */
    $db = DBStructSeqE::class;
    $key_con = DataCon::SEQ->value;
    if (array_key_exists($key_con, $val) && is_array($val[$key_con])) {
        foreach ($val[$key_con] as $seq) {
            if (!is_array($seq)) {
                continue;
            }
            // @phpstan-ignore argument.type
            $seq_id = check_kt_int($seq, $db::SEQ_ID->value);
            if (!(is_int($seq_id) && $seq_id > 0)) {
                continue;
            }
            if (!array_key_exists($seq_id, $seq_con)) {
                // @phpstan-ignore argument.type
                $seq_con[$seq_id] = create_seq($seq);
            }
            if (!is_array($seq_con[$seq_id][StSeqE::SEQ_CUL_CON->value])) {
                continue;
            }
            $seq_con[$seq_id][StSeqE::SEQ_CUL_CON->value][] = [
                StSeqE::CUL_ID->value => check_kt_int(
                    // @phpstan-ignore argument.type
                    $seq,
                    $db::CUL->value
                ),
                StSeqE::STR_NO->value => check_kt_f_str(
                    // @phpstan-ignore argument.type
                    $seq,
                    $db::CUL_DES->value
                ),
            ];
        }
    }
    return [
        StStrE::CON->value => [
            StSeqE::SEQ_CON->value => [...$seq_con],
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
function get_max_arr_rel_cul(array $val): array
{
    $rel = [];
    /** @var class-string<DBStructRelCulE> */
    $db = DBStructRelCulE::class;
    $key_con = DataCon::R_CUL->value;
    if (array_key_exists($key_con, $val) && is_array($val[$key_con])) {
        foreach ($val[$key_con] as $rcul) {
            if (!is_array($rcul)) {
                continue;
            }
            $rel[] = [
                StRelCulE::CUL_ID->value => check_kt_int(
                    // @phpstan-ignore argument.type
                    $rcul,
                    $db::CUL_ID->value
                ),
                StRelCulE::ORI_CUL_ID->value => check_kt_int(
                    // @phpstan-ignore argument.type
                    $rcul,
                    $db::ORI_ID->value
                ),
                StRelCulE::STR_NO->value => check_kt_str(
                    // @phpstan-ignore argument.type
                    $rcul,
                    $db::STR_NO->value
                ),
            ];
        }
    }
    return [
        StStrE::CON->value => [
            StRelCulE::REL_CON->value => [StRelCulE::REL_CUL_CON->value => $rel],
        ],
    ];
}

/**
 * @param array<string | number> $des_con
 *
 * @return array<string, array<string, array<string, array<string>>>>
 */
function create_rel_str_con(array $des_con): array
{
    return [StStrE::CON->value => [
        StRelDesE::REL_CON->value => [
            StRelDesE::REL_DES_CON->value => array_map(
                static fn ($des) => (string) $des,
                $des_con
            ),
        ],
    ],
    ];
}
