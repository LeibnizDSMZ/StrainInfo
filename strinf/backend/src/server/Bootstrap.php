<?php

declare(strict_types=1);

namespace straininfo\server;

use Psr\Log\LoggerInterface;
use function Safe\mb_internal_encoding;
use Slim\App;
use straininfo\server\configs\ConfigsCont;
use function straininfo\server\exceptions\get_err_handler_boot_fun;
use function straininfo\server\exceptions\get_err_handler_fun;
use straininfo\server\exceptions\init_phase\KnownBootExc;
use straininfo\server\interfaces\global\Stoppable;
use straininfo\server\interfaces\mvvm\controller\CtrlIntBoot;

use function straininfo\server\logger\create_logger;
use function straininfo\server\logger\create_new_log_channel;
use function straininfo\server\mvvm\create_mvvm;
use straininfo\server\shared\exc\KEAct;
use straininfo\server\shared\logger\LogLevE;
use straininfo\server\shared\state\RunState;

final class Bootstrap implements Stoppable
{
    private RunState $running;

    // to stop
    private ?CtrlIntBoot $main_service_con;

    // immutable
    private readonly LoggerInterface $logger_err;
    private readonly LoggerInterface $logger_web;
    private readonly ConfigsCont $configurations;

    // singleton
    private static ?Bootstrap $instance = null;

    private function __construct()
    {
        $this->main_service_con = null;
        $this->running = RunState::NOT_RUNNING;
        set_exception_handler(get_err_handler_boot_fun());
        $this->configurations = ConfigsCont::getConfigsCon('_web_app');
        $conf = $this->configurations->getLoggerArgs();
        $this->logger_err = create_logger($conf);
        $this->logger_web = create_new_log_channel(
            $conf->getName() . '_web',
            $this->logger_err
        );
        set_exception_handler(get_err_handler_fun($this->logger_err, $this));
    }

    public function __destruct()
    {
        $this->destruct();
    }

    public static function getBootstrap(): self
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function stop(): void
    {
        $this->getMainServiceCon()->stop();
        $this->running = RunState::STOPPED;
        $this->destruct();
    }

    public function maintain(\DateTime $finish_time, bool $maintain): void
    {
        $this->getMainServiceCon()->setMaintenance($finish_time, $maintain);
    }

    public function isStopped(): bool
    {
        return $this->status() === RunState::STOPPED;
    }

    public function init(bool $auto): string
    {
        $err_fun = static function ($msg): never {
            throw new KnownBootExc($msg, LogLevE::CRITICAL, KEAct::TERM);
        };
        return match ($this->status()) {
            RunState::NOT_RUNNING => (function () use ($auto): string {
                $this->start($auto);
                return $this->status()->value;
            })(),
            RunState::RUNNING => $this->status()->value,
            RunState::STOPPED => $err_fun('Server restart prohibited!'),
            default => $err_fun('Something went horribly wrong!')
        };
    }

    /** @return App<\Psr\Container\ContainerInterface|null> */
    public function getApp(): App
    {
        return $this->getMainServiceCon()->getApp();
    }

    public function status(): RunState
    {
        return $this->running;
    }

    private function destruct(): void
    {
        $suc_msg = 'Bootstrap object was successfully stopped!';
        $res = match ($this->status()) {
            RunState::RUNNING => function () use ($suc_msg): void {
                $this->stop();
                $this->logger_err->notice("[GC] {$suc_msg}");
            },
            RunState::STOPPED => function () use ($suc_msg): void {
                $this->logger_err->notice("[Pre-GC] {$suc_msg}");
            },
            RunState::NOT_RUNNING => function (): void {
                $this->logger_err->warning('Server was never started!');
            },
            default => function (): void {
                $this->logger_err->error('Something went horribly wrong!');
            }
        };
        $this->logger_err->notice('[EP] start');
        $res();
        $this->logger_err->notice('[EP] done');
        self::$instance = null;
    }

    private function getMainServiceCon(): CtrlIntBoot
    {
        if (is_null($this->main_service_con)) {
            $msg = 'Bootstrap procedure was not started!';
            throw new KnownBootExc($msg, LogLevE::CRITICAL, KEAct::TERM);
        }
        return $this->main_service_con;
    }

    private function setMainServiceCon(CtrlIntBoot $boot_con): void
    {
        if (!is_null($this->main_service_con)) {
            $msg = 'Bootstrap procedure was started more than once!';
            throw new KnownBootExc($msg, LogLevE::CRITICAL, KEAct::TERM);
        }
        $this->main_service_con = $boot_con;
    }

    private function start(bool $auto): void
    {
        date_default_timezone_set(
            $this->configurations->getTimeZone()->getName()
        );
        mb_internal_encoding($this->configurations->getCharSet());
        $this->setMainServiceCon(create_mvvm(
            $this->logger_web,
            $this->configurations
        ));
        $this->getMainServiceCon()->start();
        $this->running = RunState::RUNNING;
        $this->getMainServiceCon()->setSuccess();
        //$this->getMainServiceCon()->setMaintenance(null, true);
        //$this->getMainServiceCon()->setMaintenance(null, false);
        if ($auto) {
            $this->getMainServiceCon()->run();
        }
    }
}
