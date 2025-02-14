<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\controller\const;

use straininfo\server\interfaces\mvvm\view_model\chan\cache\CaVMIntSeaId;
use straininfo\server\interfaces\mvvm\view_model\chan\query\QVMIntSeaId;

/**
 * @template TI of CaVMIntSeaId<int>|QVMIntSeaId<int>
 * @template TS of CaVMIntSeaId<string>|QVMIntSeaId<string>
 */
final class ConCtrlSeaCul
{
    /**
     * @param TI $str
     * @param TS $str_des
     * @param TS $tax_name
     * @param TS $str_no
     * @param TS $seq
     * @param TS $brc
     */
    public function __construct(
        private readonly CaVMIntSeaId|QVMIntSeaId $tax_name,
        private readonly CaVMIntSeaId|QVMIntSeaId $str_no,
        private readonly CaVMIntSeaId|QVMIntSeaId $str,
        private readonly CaVMIntSeaId|QVMIntSeaId $str_des,
        private readonly CaVMIntSeaId|QVMIntSeaId $seq,
        private readonly CaVMIntSeaId|QVMIntSeaId $brc
    ) {
    }

    /** @return TS */
    public function getTaxName()
    {
        return $this->tax_name;
    }

    /** @return TS */
    public function getStrNo()
    {
        return $this->str_no;
    }

    /** @return TS */
    public function getBrc()
    {
        return $this->brc;
    }

    /** @return TS */
    public function getStrDes()
    {
        return $this->str_des;
    }

    /** @return TS */
    public function getSeq()
    {
        return $this->seq;
    }

    /** @return TI */
    public function getStr()
    {
        return $this->str;
    }
}
