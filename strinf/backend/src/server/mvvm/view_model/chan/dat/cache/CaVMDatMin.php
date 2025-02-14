<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view_model\chan\dat\cache;

use straininfo\server\shared\mvvm\view\api\VersionE;
use straininfo\server\shared\mvvm\view_model\data\QDConIdEnt;

final class CaVMDatMin extends CaVMChanDat
{
    /**
     * @param array<int> $arg
     *
     * @return QDConIdEnt<int>
     */
    public function getResult(array $arg, VersionE $version): QDConIdEnt
    {
        $ent = $this->getMChan()->getMin($arg, $version);
        return new QDConIdEnt(array_diff($arg, array_keys($ent)), $ent);
    }

    /** @param QDConIdEnt<int> $ent_con*/
    public function setResult(QDConIdEnt $ent_con, VersionE $version, bool $perm): void
    {
        if ($ent_con->getToBuf()) {
            $this->getMSetChan()->setMin($ent_con->getToBuf(), $version, $perm);
        }
    }

    public function permanent(VersionE $version): bool
    {
        return $version === VersionE::V2;
    }
}
