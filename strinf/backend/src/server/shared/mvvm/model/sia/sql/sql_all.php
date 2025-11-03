<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\sql;

function get_all_cul(): string
{
    return <<<EOF
    SELECT DISTINCT culture.id
    FROM culture
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id;
    EOF;
}

function get_all_str(): string
{
    return <<<EOF
    SELECT DISTINCT strain.main_id
    FROM strain
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id;
    EOF;
}

function get_all_str_date(): string
{
    return <<<EOF
    SELECT DISTINCT strain.main_id, MAX(culture.last_update)
    FROM strain
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    GROUP BY strain.main_id;
    EOF;
}

function get_all_t_str(): string
{
    return <<<EOF
    SELECT DISTINCT strain.main_id
    FROM strain
        INNER JOIN culture
            ON strain.id=culture.strain_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    WHERE strain.type_strain = 1;
    EOF;
}

function get_all_t_cul(): string
{
    return <<<EOF
    SELECT DISTINCT culture.id
    FROM culture
    WHERE culture.type_culture=1;
    EOF;
}
