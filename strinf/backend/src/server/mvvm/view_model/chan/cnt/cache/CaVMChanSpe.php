<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view_model\chan\cnt\cache;

use straininfo\server\shared\mvvm\view_model\data\QDConCnt;

final class CaVMChanSpe extends CaVMChanCnt
{
    public function getCount(): QDConCnt
    {
        $cnt = $this->getMChan()->getSpeciesCount();
        return new QDConCnt($cnt >= 0, $cnt);
    }

    public function setCount(QDConCnt $cnt): void
    {
        $this->getMSetChan()->setSpeciesCount($cnt->getCnt());
    }
}
