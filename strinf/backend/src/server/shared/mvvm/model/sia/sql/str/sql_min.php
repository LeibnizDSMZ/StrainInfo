<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\sql\str;

use straininfo\server\shared\mvvm\model\sia\fields\DBStructDesE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructRelCulE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructStrE;
use straininfo\server\shared\mvvm\model\sia\fields\DBStructTaxE;

function get_sql_base_select_str(): string
{
    $tst = DBStructStrE::TYP_STR->value;
    $doi = DBStructStrE::STRAIN_DOI->value;
    return get_sql_select_str() . <<<EOF
        , strain.type_strain as {$tst}
        , (
            SELECT strain_archive.doi
            FROM strain_archive
            WHERE strain_archive.str_id=strain.id
            ORDER BY strain_archive.doi DESC
            LIMIT 1
        ) as {$doi}
    EOF;
}

/**
 * @param array<string> $extra_fields
 */
function get_sql_base_strain(array $extra_fields = []): string
{
    $sql = get_sql_from_str();
    $bac = DBStructStrE::BAC_DIVE->value;
    $scc = DBStructStrE::SAM_CC->value;
    $ssc = DBStructStrE::SAM_SRC->value;
    $more = implode(',', $extra_fields);
    return get_sql_base_select_str() . <<<EOF
        , strain.bac_dive_id as {$bac}
        , strain.sam_cc as {$scc}
        , sample.source as {$ssc}
        {$more}
        {$sql}
        LEFT JOIN sample
            ON sample.id=strain.sam_id
    EOF;
}

function get_sql_select_str(): string
{
    $sid = DBStructStrE::STRAIN_ID->value;
    $mid = DBStructStrE::MAIN_ID->value;
    return <<<EOF
    SELECT DISTINCT
        strain.id as {$sid},
        strain.main_id as {$mid}
    EOF;
}

function get_sql_from_str(): string
{
    return <<<EOF
    FROM strain
    EOF;
}

function get_sql_merge_src_str_id(): string
{
    $from = get_sql_from_str();
    $med = DBStructStrE::MERGE_ID->value;
    return <<<EOF
    SELECT DISTINCT strain.id as {$med}
    {$from}
    WHERE strain.merge_id IS NOT NULL 
        AND strain.main_id=? AND strain.main_id!=strain.id;
    EOF;
}

function get_sql_main_str_id(): string
{
    $from = get_sql_from_str();
    $mid = DBStructStrE::MAIN_ID->value;
    return <<<EOF
    SELECT DISTINCT strain.main_id as {$mid}
    {$from}
    WHERE strain.id=?;
    EOF;
}

function get_strain_type_cul(): string
{
    $sty = DBStructStrE::TYP_CUL->value;
    return <<<EOF
        SELECT culture.id as {$sty}
        FROM strain
            INNER JOIN culture
                ON culture.strain_id=strain.id
        WHERE culture.type_culture=1 AND strain.main_id=?
        LIMIT 1
    EOF;
}

function get_full_strain(): string
{
    $nam = DBStructTaxE::S_NAME->value;
    $ncbi = DBStructTaxE::S_NCBI->value;
    $lpsn = DBStructTaxE::S_LPSN->value;
    return get_sql_base_strain([
        '',
        "s_taxon_name.name_canonical as {$nam}",
        "s_taxon_name.ncbi_id as {$ncbi}",
        "s_taxon_name.lpsn_id as {$lpsn}",
    ]) . ' ' . <<<EOF
        LEFT JOIN taxon_name as s_taxon_name
            ON s_taxon_name.id = strain.tax_id 
        WHERE strain.id=?;
    EOF;
}

function get_min_strain(): string
{
    return get_sql_base_select_str() . ' ' .
    get_sql_from_str() . ' WHERE strain.id=?;';
}

function get_sql_rel_cul(): string
{
    $cui = DBStructRelCulE::CUL_ID->value;
    $str = DBStructRelCulE::STR_NO->value;
    $ori = DBStructRelCulE::ORI_ID->value;
    $cid = DBStructRelCulE::CC_ID->value;
    $err = DBStructRelCulE::CC_ERR->value;
    return <<<EOF
    SELECT DISTINCT 
        culture.id as {$cui},
        culture_collection_number.dep_cul_id as {$ori},
        designation.designation as {$str},
        culture_collection_number.brc_id as {$cid},
        (
            COALESCE(culture_collection.deprecated = 1, FALSE)
            OR culture.status="erroneous data"
        ) as {$err}
    FROM strain
        INNER JOIN culture
            ON culture.strain_id = strain.id
        INNER JOIN designation
            ON culture.designation_id = designation.id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    EOF;
}

function get_rel_des(): string
{
    $des = DBStructDesE::DES->value;
    return <<<EOF
    SELECT DISTINCT designation.designation as {$des}
    FROM strain
        INNER JOIN culture
            ON culture.strain_id = strain.id
        INNER JOIN culture_relation as des_rel
            ON des_rel.cul_id = culture.id
        INNER JOIN designation
            ON des_rel.des_id=designation.id AND 
            designation.id NOT IN (
                SELECT DISTINCT str_cul.designation_id
                FROM strain as loc_str
                    INNER JOIN culture as str_cul
                        ON loc_str.id=str_cul.strain_id
                WHERE loc_str.main_id=?
            )
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id    
    WHERE strain.main_id=?;
    EOF;
}
