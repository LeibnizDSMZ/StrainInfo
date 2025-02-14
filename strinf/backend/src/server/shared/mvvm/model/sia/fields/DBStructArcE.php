<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\model\sia\fields;

enum DBStructArcE: string
{
    case DOI = 'strain_doi';
    case DATE = 'archived';
    case ARC = 'archive';
    case TIT = 'title';
}
