<?php

declare(strict_types=1);

namespace straininfo\server\shared\mvvm\view_model\struct\json\v1;

enum StSamE: string
{
    case SAM_CON = 'sample';
    // sample
    case S_SRC = 'source';
    case S_CC = 'country_code';
    case S_DATE = 'date';
    case S_PLA = 'place';
}
