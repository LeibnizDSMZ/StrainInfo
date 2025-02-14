<?php

declare(strict_types=1);

namespace straininfo\server\interfaces\mvvm\model\chan\query;

use straininfo\server\interfaces\mvvm\model\chan\MainChannel;

interface QMIntCnt extends MainChannel
{
    public function getStrainCount(): int;

    public function getArchiveCount(): int;

    public function getTypeStrainCount(): int;

    public function getTypeCultureCount(): int;

    public function getDesignationCount(): int;

    public function getSpeciesCount(): int;

    public function getCultureCount(): int;
}
