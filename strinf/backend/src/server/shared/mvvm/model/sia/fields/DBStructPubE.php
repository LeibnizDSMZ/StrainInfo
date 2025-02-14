<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\fields;

enum DBStructPubE: string
{
    case LIT_ID = 'id';
    case PUB_MED = 'pubmed';
    case PMC = 'pmc';
    case ISSN = 'issn';
    case DOI = 'doi';
    case TITLE = 'title';
    case AUT = 'author';
    case PUB = 'publisher';
    case YEAR = 'year';
    case CUL = 'cul_id';
    case CUL_DES = 'cul_des';
}
