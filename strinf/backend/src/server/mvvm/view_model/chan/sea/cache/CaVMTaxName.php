<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view_model\chan\sea\cache;

use straininfo\server\shared\mvvm\view_model\data\QDConSea;

/**
 * @extends CaVMChanSea<string, \straininfo\server\interfaces\mvvm\model\chan\cache\CaMIntSeaId, \straininfo\server\interfaces\mvvm\model\chan\cache\CaMIntSeaIdSet>
 */
final class CaVMTaxName extends CaVMChanSea
{
    /**
     * @param array<string> $arg
     *
     * @return QDConSea<string>
     */
    public function getResult(array $arg): QDConSea
    {
        $name = $this->getMChan()->getTaxName($arg);
        return new QDConSea(array_diff($arg, array_keys($name)), $name);
    }

    /** @param QDConSea<string> $sea_con */
    public function setResult(QDConSea $sea_con): void
    {
        if ($sea_con->getToBuf()) {
            $this->getMSetChan()->setTaxName($sea_con->getToBuf());
        } elseif (count($sea_con->getMisIds()) > 0) {
            $this->getMSetChan()->setTaxName(
                array_merge(...array_map(
                    static function ($sid) {
                        return [
                            $sid => [],
                        ];
                    },
                    array_filter($sea_con->getMisIds(), static function ($seaId) {
                        return strlen($seaId) < 32;
                    })
                ))
            );
        }
    }
}
