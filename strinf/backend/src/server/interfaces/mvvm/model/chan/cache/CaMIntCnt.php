<?php

declare(strict_types=1);

namespace straininfo\server\interfaces\mvvm\model\chan\cache;

use straininfo\server\interfaces\mvvm\model\chan\MainChannel;

interface CaMIntCnt extends MainChannel
{
    public function getStrainCount(): int;

    public function getArchiveCount(): int;

    public function getTypeStrainCount(): int;

    public function getTypeCultureCount(): int;

    public function getSpeciesCount(): int;

    public function getCultureCount(): int;

    public function getDesignationCount(): int;
}
