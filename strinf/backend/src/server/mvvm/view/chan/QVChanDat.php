<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view\chan;

use function Safe\preg_match;
use function Safe\preg_match_all;
use function Safe\preg_replace;

use straininfo\server\interfaces\mvvm\controller\chan\QCIntDat;
use straininfo\server\interfaces\mvvm\view\chan\QVIntDat;
use straininfo\server\shared\mvvm\view\api\VersionE;

final class QVChanDat implements QVIntDat
{
    private readonly QCIntDat $q_chan;

    public function __construct(QCIntDat $q_chan)
    {
        $this->q_chan = $q_chan;
    }

    /** @return array{string, bool} */
    public function getAvg(string $id, VersionE $version): array
    {
        return $this->q_chan->getAvg(QVChanDat::correctRanges($id), $version);
    }

    /** @return array{string, bool} */
    public function getMax(string $id, VersionE $version): array
    {
        return $this->q_chan->getMax(QVChanDat::correctRanges($id), $version);
    }

    /** @return array{string, bool} */
    public function getMin(string $id, VersionE $version): array
    {
        return $this->q_chan->getMin(QVChanDat::correctRanges($id), $version);
    }

    public static function correctRanges(string $id): string
    {
        $reg_ranges = "/(\d+-\d+),?/";
        $reg_range = "/(\d+)-(\d+)/";
        preg_match_all($reg_ranges, $id, $matches);
        $new_id = preg_replace($reg_ranges, '', $id);
        foreach ($matches[1] as $ran) {
            if (preg_match($reg_range, $ran, $num_mat)) {
                [, $fir, $sec,] = $num_mat;
                $fir_n = (int) $fir;
                $sec_n = (int) $sec;
                $dif = $sec_n - $fir_n;
                if (0 < $dif && $dif < 100_000) {
                    for ($num = $fir_n; $num <= $sec_n; $num++) {
                        $new_id .= ",{$num}";
                    }
                }
            }
        }
        if (substr_count($new_id, ',') > 100_000) {
            return '';
        }
        return $new_id;
    }
}
