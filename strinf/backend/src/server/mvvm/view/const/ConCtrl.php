<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\const;

use Psr\Log\LoggerInterface;
use straininfo\server\interfaces\mvvm\view\ToViewIntV;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlAll;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlArc;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlCnt;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlCul;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlCulSea;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlSeaOpt;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlStat;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlStr;
use straininfo\server\mvvm\view\routes\ctrl\dbs\DBSCtrlStrSea;
use straininfo\server\mvvm\view\routes\ctrl\MaintainCtrl;
use straininfo\server\mvvm\view\routes\ctrl\RootCtrl;
use straininfo\server\shared\mvvm\view\StatArgs;
use straininfo\server\shared\mvvm\view\WebArgsBE;
use straininfo\server\shared\mvvm\view\WebArgsFE;

use function straininfo\server\shared\text\create_domain_url;

final class ConCtrl
{
    private readonly DBSCtrlCnt $cnt;
    private readonly DBSCtrlCul $cul;
    private readonly DBSCtrlStr $str;
    private readonly DBSCtrlCulSea $sea_cul;
    private readonly DBSCtrlStrSea $sea_str;
    private readonly DBSCtrlAll $all;
    private readonly DBSCtrlStat $stat;
    private readonly DBSCtrlArc $arc;
    private readonly DBSCtrlSeaOpt $sea_opt;
    private readonly RootCtrl $root_ctrl;

    public function __construct(
        WebArgsBE $wbe_args,
        WebArgsFE $wfe_args,
        StatArgs $sta,
        ToViewIntV $chan,
        MaintainCtrl $maintainer,
        LoggerInterface $log,
        string $version
    ) {
        $chS = $wbe_args->getCharSet();
        $cors = [ ...$wbe_args->getCORS(), create_domain_url($wfe_args)];
        $pri = $wbe_args->getPrivate();
        $this->root_ctrl = new RootCtrl(
            $wbe_args->getCharSet(),
            $wbe_args->getPrivate(),
            $version,
            $maintainer->getMaintenance(),
            $maintainer->getTime(),
            $maintainer->getZone()
        );
        $args = [$chS, $cors, $pri, $sta, $log];
        $this->cnt = new DBSCtrlCnt($chan->getQVChanCnt(), ...$args);
        $this->cul = new DBSCtrlCul($chan->getQVChanCul(), ...$args);
        $this->str = new DBSCtrlStr($chan->getQVChanStr(), ...$args);
        $this->sea_cul = new DBSCtrlCulSea($chan->getQVChanCulSea(), ...$args);
        $this->sea_str = new DBSCtrlStrSea($chan->getQVChanStrSea(), ...$args);
        $this->all = new DBSCtrlAll($chan->getQVChanAll(), ...$args);
        $this->stat = new DBSCtrlStat($chan->getQVChanStat(), ...$args);
        $this->arc = new DBSCtrlArc($chan->getQVChanArc(), ...$args);
        $this->sea_opt = new DBSCtrlSeaOpt($chan->getQVChanOptSea(), ...$args);
    }

    public function getDBSCtrlCnt(): DBSCtrlCnt
    {
        return $this->cnt;
    }

    public function getDBSCtrlCul(): DBSCtrlCul
    {
        return $this->cul;
    }

    public function getDBSCtrlStr(): DBSCtrlStr
    {
        return $this->str;
    }

    public function getDBSCtrlCulSea(): DBSCtrlCulSea
    {
        return $this->sea_cul;
    }

    public function getDBSCtrlStrSea(): DBSCtrlStrSea
    {
        return $this->sea_str;
    }

    public function getDBSCtrlAll(): DBSCtrlAll
    {
        return $this->all;
    }

    public function getDBSCtrlStat(): DBSCtrlStat
    {
        return $this->stat;
    }

    public function getDBSCtrlArc(): DBSCtrlArc
    {
        return $this->arc;
    }

    public function getDBSCtrlSeaOpt(): DBSCtrlSeaOpt
    {
        return $this->sea_opt;
    }

    public function getRootCtrl(): RootCtrl
    {
        return $this->root_ctrl;
    }
}
