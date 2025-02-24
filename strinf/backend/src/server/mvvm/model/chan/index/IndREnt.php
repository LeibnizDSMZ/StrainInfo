<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\model\chan\index;

use Predis;
use function Safe\shuffle;
use straininfo\server\interfaces\mvvm\model\chan\index\IMIntEnt;

use straininfo\server\mvvm\model\chan\RedisMWr;
use function straininfo\server\shared\mvvm\model\parse_index_match;
use function straininfo\server\shared\mvvm\model\parse_index_results;
use function straininfo\server\shared\text\create_slim_key_w;

final class IndREnt extends RedisMWr implements IMIntEnt
{
    private readonly string $encode;

    public function __construct(?Predis\Client $dbc, string $encode)
    {
        parent::__construct($dbc, true);
        $this->encode = $encode;
    }

    /** @return array<string> */
    public function getBanChars(): array
    {
        return ['%', ','];
    }

    /**
     * @return array{match: array<array{string,int<0, 4>,int,int}>, exact: array<array{string,int,int,int}>}
     */
    public function getSIdsEnt(string $key): array
    {
        return parse_index_results($this->getRes($key));
    }

    /**
     * @return array{match: array<string>, exact: string}
     */
    public function getRes(string $key): array
    {
        $this->checkMaintenanceMode();
        $slim_key = create_slim_key_w($key, $this->encode);
        if ($slim_key['key'] === '') {
            /** @var array{match: array<string>, exact: string} */
            return ['match' => [], 'exact' => ''];
        }
        $exact = $this->getExactMatch($slim_key['key'], $slim_key['value']);
        return [
            'match' => $this->searchMKeys($slim_key['key'], $slim_key['value']),
            'exact' => $exact,
        ];
    }

    /**
     * @return array<string>
     */
    private function searchMKeys(string $main_key, string $val_key): array
    {
        $prefix = $val_key === '' ? '' : $main_key . ':';
        $full_key = $main_key . ($val_key === '' ? '' : ':' . $val_key);
        $match_keys = parse_index_match(
            $this->getDBC()->hget($full_key, '__match') ?? ''
        );
        shuffle($match_keys);
        $cnt = 0;
        $res = [];
        foreach ($match_keys as $match_key) {
            $main = $this->getMainKey($prefix . $match_key);
            $cnt += count($main);
            array_push($res, ...$main);
            if ($cnt >= 6) {
                return $res;
            }
        }
        return $res;
    }

    /**
     * @return array<string>
     */
    private function getMainKey(string $main_key): array
    {
        $res = $this->getDBC()->hget($main_key, '__main');
        if ($res !== null) {
            return [$res];
        }
        return [];
    }

    private function getExactMatch(string $main_key, string $sub_key): string
    {
        $full_key = $main_key . ($sub_key === '' ? '' : ':' . $sub_key);
        if (($res = $this->getDBC()->hget($full_key, '__main')) !== null) {
            return $res;
        }
        return '';
    }
}
