<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view_model\chan\sea\cache;

use function straininfo\server\shared\arr\filter_arr;

use straininfo\server\shared\mvvm\view_model\data\QDConSea;

/**
 * @extends CaVMChanSea<string, \straininfo\server\interfaces\mvvm\model\chan\cache\CaMIntSeaId, \straininfo\server\interfaces\mvvm\model\chan\cache\CaMIntSeaIdSet>
 */
final class CaVMBrc extends CaVMChanSea
{
    /**
     * @param array<string> $arg
     *
     * @return QDConSea<string>
     */
    public function getResult(array $arg): QDConSea
    {
        $brc = filter_arr(
            static fn (array $val): bool => (bool) $val,
            $this->getMChan()->getBrc($arg)
        );
        return new QDConSea(array_diff($arg, array_keys($brc)), $brc);
    }

    /** @param QDConSea<string> $sea_con */
    public function setResult(QDConSea $sea_con): void
    {
        if ($sea_con->getToBuf()) {
            $this->getMSetChan()->setBrc($sea_con->getToBuf());
        }
    }
}
