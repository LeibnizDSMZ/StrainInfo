<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\model\chan\sia;

use straininfo\server\interfaces\mvvm\model\chan\query\QMIntAll;
use straininfo\server\mvvm\model\chan\PdoMWr;

use function straininfo\server\shared\mvvm\model\pdo\parse_col_2_arr;
use function straininfo\server\shared\mvvm\model\sia\sql\get_all_cul;
use function straininfo\server\shared\mvvm\model\sia\sql\get_all_str;
use function straininfo\server\shared\mvvm\model\sia\sql\get_all_t_cul;
use function straininfo\server\shared\mvvm\model\sia\sql\get_all_t_str;

final class QPAll extends PdoMWr implements QMIntAll
{
    public function __construct(?\PDO $dbc)
    {
        parent::__construct($dbc, true);
    }

    /** @return array<int> */
    public function getAllCulIds(): array
    {
        return $this->getRes(get_all_cul());
    }

    /** @return array<int> */
    public function getAllStrIds(): array
    {
        return $this->getRes(get_all_str());
    }

    /** @return array<int> */
    public function getAllTStrIds(): array
    {
        return $this->getRes(get_all_t_str());
    }

    /** @return array<int> */
    public function getAllTCulIds(): array
    {
        return $this->getRes(get_all_t_cul());
    }

    /** @return array<int> */
    private function getRes(string $sta): array
    {
        $this->checkMaintenanceMode();
        $sta = $this->getDBC()->prepare($sta);
        $sta->setFetchMode(\PDO::FETCH_COLUMN, 0);
        return parse_col_2_arr(
            $sta,
            static fn (string|int $ele): int => (int) $ele
        );
    }
}
