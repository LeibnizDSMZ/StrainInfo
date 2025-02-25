<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\sql;

function get_str_cnt(): string
{
    $cul = get_cul_not_err();
    $col = get_col_not_err();
    return <<<EOF
    SELECT COUNT(DISTINCT strain.main_id)
    FROM strain
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE {$cul} AND {$col};
    EOF;
}

function get_archive_cnt(): string
{
    return <<<EOF
    SELECT COUNT(DISTINCT strain_archive.id)
    FROM strain_archive;
    EOF;
}

function get_str_type_cnt(): string
{
    $cul = get_cul_not_err();
    $col = get_col_not_err();
    return <<<EOF
    SELECT COUNT(DISTINCT strain.main_id)
    FROM strain
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE strain.type_strain = 1 AND {$cul} AND {$col};
    EOF;
}

function get_cul_type_cnt(): string
{
    $cul = get_cul_not_err();
    $col = get_col_not_err();
    return <<<EOF
    SELECT COUNT(DISTINCT culture.id)
    FROM culture
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE culture.type_culture=1 AND {$cul} AND {$col};
    EOF;
}

function get_des_cnt(): string
{
    return <<<EOF
    SELECT COUNT(DISTINCT designation.id)
    FROM designation
        LEFT JOIN culture ON culture.designation_id = designation.id 
        LEFT JOIN culture_relation ON culture_relation.des_id = designation.id 
        WHERE culture_relation.des_id is not NULL or culture.designation_id is not NULL;
    EOF;
}

function get_cul_cnt(): string
{
    $cul = get_cul_not_err();
    $col = get_col_not_err();
    return <<<EOF
    SELECT COUNT(DISTINCT culture.id)
    FROM culture
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE {$cul} AND {$col};
    EOF;
}

function get_spe_cnt(): string
{
    $cul = get_cul_not_err();
    $col = get_col_not_err();
    return <<<EOF
    SELECT COUNT(DISTINCT taxon_name.id)
    FROM strain
        INNER JOIN taxon_name
            ON strain.tax_id=taxon_name.id
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE strain.merge_id IS NULL AND taxon_name.name_rank = "SPECIES" 
        AND {$cul} AND {$col};
    EOF;
}

function get_dis_cul_per_str_cnt(): string
{
    $cul = get_cul_not_err();
    $col = get_col_not_err();
    return <<<EOF
    SELECT strain.main_id, COUNT(culture.id)
    FROM strain
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE {$cul} AND {$col}
    GROUP BY strain.main_id
    EOF;
}
