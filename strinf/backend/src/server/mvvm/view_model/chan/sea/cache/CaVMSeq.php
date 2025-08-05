<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view_model\chan\sea\cache;

use straininfo\server\shared\mvvm\view_model\data\QDConSea;

/**
 * @extends CaVMChanSea<string, \straininfo\server\interfaces\mvvm\model\chan\cache\CaMIntSeaId, \straininfo\server\interfaces\mvvm\model\chan\cache\CaMIntSeaIdSet>
 */
final class CaVMSeq extends CaVMChanSea
{
    /**
     * @param array<string> $arg
     *
     * @return QDConSea<string>
     */
    public function getResult(array $arg): QDConSea
    {
        $seq = \array_filter(
            $this->getMChan()->getSeqAcc($arg),
            static fn (string $val): bool => $val !== '',
        );
        return new QDConSea(array_diff($arg, array_keys($seq)), $seq);
    }

    /** @param QDConSea<string> $sea_con */
    public function setResult(QDConSea $sea_con): void
    {
        if ($sea_con->getToBuf()) {
            $this->getMSetChan()->setSeqAcc($sea_con->getToBuf());
        }
    }
}
