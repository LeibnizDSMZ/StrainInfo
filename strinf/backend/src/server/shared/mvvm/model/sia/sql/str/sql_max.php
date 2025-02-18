<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\sql\str;

use straininfo\server\shared\mvvm\model\sia\fields\DBStructPubE;

function get_sql_pub(): string
{
    $doi = DBStructPubE::DOI->value;
    $lid = DBStructPubE::LIT_ID->value;
    $lpu = DBStructPubE::PUB_MED->value;
    $lpc = DBStructPubE::PMC->value;
    $lis = DBStructPubE::ISSN->value;
    $lti = DBStructPubE::TITLE->value;
    $lat = DBStructPubE::AUT->value;
    $pub = DBStructPubE::PUB->value;
    $yea = DBStructPubE::YEAR->value;
    $cid = DBStructPubE::CUL->value;
    $cde = DBStructPubE::CUL_DES->value;
    return <<<EOF
    SELECT DISTINCT 
        literature.id as {$lid},
        literature.pmid as {$lpu},
        literature.pmcid as {$lpc},
        literature.issn as {$lis},
        literature.doi as {$doi},
        literature.title as {$lti},
        literature.authors as {$lat},
        literature.publisher as {$pub},
        literature.pub_year as {$yea},
        culture.id as {$cid},
        designation.designation as {$cde}
    FROM strain
        INNER JOIN culture
            ON culture.strain_id = strain.id
        INNER JOIN designation
            ON culture.designation_id = designation.id
        INNER JOIN literature_strain
            ON culture.designation_id = literature_strain.des_id
        INNER JOIN literature
            ON literature.id = literature_strain.lit_id
        LEFT JOIN culture_collection_number
            ON culture.ccno_id=culture_collection_number.id
        LEFT JOIN culture_collection
            ON culture_collection.id=culture_collection_number.brc_id
    EOF;
}

/** @return array<string> */
function get_str_id_max(): array
{
    return [
        get_main_str_con(get_sql_pub()),
        get_main_str_con(get_sql_seq()),
        get_main_str_con(get_sql_rel_cul()),
        get_rel_des(),
        get_archive(),
    ];
}
