<?php

declare(strict_types=1);

namespace straininfo\server\exceptions;

use Psr\Log\LoggerInterface;
use function Safe\error_log;
use straininfo\server\interfaces\global\Stoppable;
use straininfo\server\shared\exc\KEAct;

use straininfo\server\shared\logger\LogLevE;

function get_err_handler_boot_fun(): callable
{
    return static function (\Throwable $exc): void {
        unknown_err(null, $exc, true, null);
    };
}

/** @return callable(\Throwable): void */
function get_err_handler_fun(
    LoggerInterface $logger,
    Stoppable $to_stop
): callable {
    $local_log = $logger;
    $local_to_stop = $to_stop;
    return static function (\Throwable $exc) use (
        $local_log,
        $local_to_stop
    ): void {
        create_err_msg($local_log, $exc, $local_to_stop);
    };
}

/** @return callable(\Throwable): void */
function get_err_handler_slim_fun(LoggerInterface $logger): callable
{
    $local_log = $logger;
    return static function (\Throwable $exc) use ($local_log): void {
        create_err_msg_slim($local_log, $exc);
    };
}

function notice_err(): void
{
    print_msg_503(true);
}

function warn_err(): void
{
    print_msg_503(true);
}

function on_exit_run_stop(Stoppable $to_stop, ?LoggerInterface $logger): void
{
    try {
        $to_stop->stop();
    } catch (\Throwable $exc) {
        if (!is_null($logger)) {
            $logger->error(
                'Another problem occurred during stop the procedure. ',
                ['trace' => $exc->getTrace(), 'message' => $exc->getMessage()]
            );
        }
    }
}

function term_err(Stoppable $to_stop, LoggerInterface $logger): void
{
    print_msg_500(true);
    on_exit_run_stop($to_stop, $logger);
    if (!$to_stop->isStopped()) {
        $ob_cl = $to_stop::class;
        $logger->warning("[{$ob_cl}] could not be stopped.");
    }
}

function known_err(
    LoggerInterface $logger,
    KnownExc $exc,
    Stoppable $to_stop
): void {
    $logger->log(
        $exc->getLevel()->value,
        $exc->getFullMessage(),
        ['trace' => $exc->getTrace()]
    );
    match ($exc->getAct()) {
        KEAct::TERM => term_err($to_stop, $logger),
        KEAct::WARN => warn_err(),
        default => notice_err(),
    };
}

function unknown_err(
    ?LoggerInterface $logger,
    \Throwable $exc,
    bool $over,
    ?Stoppable $to_stop
): void {
    if (!is_null($logger)) {
        $logger->log(LogLevE::CRITICAL->value, $exc->getMessage(), [
            'trace' => $exc->getTrace(),
        ]);
    } else {
        error_log($exc->getMessage(), 0);
    }
    print_msg_500($over);
    if (!is_null($to_stop)) {
        on_exit_run_stop($to_stop, $logger);
    }
}

function create_err_msg(
    LoggerInterface $logger,
    \Throwable $exc,
    Stoppable $to_stop
): void {
    if ($exc instanceof KnownExc) {
        known_err($logger, $exc, $to_stop);
    } else {
        unknown_err($logger, $exc, false, $to_stop);
    }
}

function create_err_msg_slim(LoggerInterface $logger, \Throwable $exc): void
{
    $log_lvl = LogLevE::CRITICAL->value;
    $log_msg = $exc->getMessage();
    if ($exc instanceof KnownExc) {
        $log_lvl = $exc->getLevel()->value;
        $log_msg = $exc->getFullMessage();
    }
    $logger->log($log_lvl, $log_msg, ['trace' => $exc->getTrace()]);
}
