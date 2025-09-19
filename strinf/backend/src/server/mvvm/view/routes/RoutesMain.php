<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\routes;

use Psr\Log\LoggerInterface;
use Slim\App;
use straininfo\server\interfaces\mvvm\view\ToViewIntV;
use straininfo\server\mvvm\view\const\ConCtrl;
use straininfo\server\mvvm\view\routes\ctrl\CusErrCtrl;
use straininfo\server\mvvm\view\routes\ctrl\MaintainCtrl;
use straininfo\server\mvvm\view\routes\ctrl\ShortCtrl;
use straininfo\server\shared\mvvm\view\StatArgs;
use straininfo\server\shared\mvvm\view\WebArgsBE;
use straininfo\server\shared\mvvm\view\WebArgsFE;

use function straininfo\server\shared\text\create_domain_url;

final class RoutesMain
{
    // immutable
    private readonly WebArgsBE $wbe_args;
    private readonly WebArgsFE $wfe_args;
    private readonly StatArgs $stat_args;
    private readonly string $version;

    private ?MaintainCtrl $m_ctrl;
    private ?ShortCtrl $s_ctrl;

    // mutable
    private ConCtrl $ctrl_con;

    public function __construct(
        WebArgsBE $wbe_args,
        WebArgsFE $wfe_args,
        StatArgs $stat_args,
        string $version
    ) {
        $this->wbe_args = $wbe_args;
        $this->wfe_args = $wfe_args;
        $this->stat_args = $stat_args;
        $this->version = $version;
        $this->m_ctrl = null;
        $this->s_ctrl = null;
    }

    /**
     * @param App<\Psr\Container\ContainerInterface|null> $app
     *
     * @return array<\Slim\Interfaces\RouteInterface>
     */
    public function initRoutes(App $app, ToViewIntV $chan, LoggerInterface $logger): array
    {
        $this->ctrl_con = new ConCtrl(
            $this->wbe_args,
            $this->wfe_args,
            $this->stat_args,
            $chan,
            $this->getMaintainCtrl(),
            $logger,
            $this->version
        );
        $this->initMain($app);
        return [
            ...init_query_cul_v1($app, $this->ctrl_con),
            ...init_query_cul_v2($app, $this->ctrl_con),
            ...init_query_str_v1($app, $this->ctrl_con),
            ...init_query_str_v2($app, $this->ctrl_con),
            ...init_query_sea_cul_v1($app, $this->ctrl_con),
            ...init_query_sea_cul_v2($app, $this->ctrl_con),
            ...init_query_sea_str_v1($app, $this->ctrl_con),
            ...init_query_sea_str_v2($app, $this->ctrl_con),
            ...init_query_cnt_v1($app, $this->ctrl_con),
            ...init_query_cnt_v2($app, $this->ctrl_con),
            ...init_query_stat_ser($app, $this->ctrl_con),
            ...init_query_ind_ser($app, $this->ctrl_con),
            ...init_query_arc_ser($app, $this->ctrl_con),
            ...init_query_all_ser($app, $this->ctrl_con),
        ];
    }

    /** @param App<\Psr\Container\ContainerInterface|null> $app */
    public function addErrorMW(App $app, LoggerInterface $logger): void
    {
        $err_mid = $app->addErrorMiddleware(false, true, true);
        $cus_err = new CusErrCtrl(
            $this->wbe_args->getCharSet(),
            [
                ...$this->wbe_args->getCORS(),
                create_domain_url($this->wfe_args),
            ],
            $logger
        );
        $err_mid->setDefaultErrorHandler($cus_err);
    }

    /** @param array<\Slim\Interfaces\RouteInterface> $apps */
    public function addMaintenanceMW(array $apps): void
    {
        foreach ($apps as $app) {
            $app->add($this->getMaintainCtrl());
        }
    }

    /** @param array<\Slim\Interfaces\RouteInterface> $apps */
    public function addShortMW(array $apps): void
    {
        foreach ($apps as $app) {
            $app->add($this->getShortCtrl());
        }
    }

    public function getWebArgs(): WebArgsBE
    {
        return $this->wbe_args;
    }

    public function setMaintenance(
        ?\DateTime $finish_time,
        \DateTimeZone $zone,
        bool $maintenance
    ): void {
        $maintainer = $this->getMaintainCtrl();
        if ($maintenance) {
            $maintainer->setMaintenance($finish_time, $zone);
        } else {
            $maintainer->unsetMaintenance();
        }
        $this->setViewMaintenance();
    }

    private function setViewMaintenance(): void
    {
        if (isset($this->ctrl_con)) {
            $maintainer = $this->getMaintainCtrl();
            $maintenance = $maintainer->getMaintenance();
            $status = $this->ctrl_con->getRootCtrl();
            if ($maintenance) {
                $status->setMaintenance($maintainer->getTime(), $maintainer->getZone());
            } else {
                $status->unsetMaintenance();
            }
        }
    }

    private function getMaintainCtrl(): MaintainCtrl
    {
        $this->m_ctrl ??= new MaintainCtrl(
            $this->getWebArgs()->getCharSet(),
            [
                ...$this->wbe_args->getCORS(),
                create_domain_url($this->wfe_args),
            ],
        );
        return $this->m_ctrl;
    }

    private function getShortCtrl(): ShortCtrl
    {
        $this->s_ctrl ??= new ShortCtrl($this->getWebArgs()->getCharSet());
        return $this->s_ctrl;
    }

    /** @param App<\Psr\Container\ContainerInterface|null> $app */
    private function initMain(App $app): void
    {
        $root = $this->ctrl_con->getRootCtrl();
        $app->get('/', $root->getRoot(...));
    }
}
