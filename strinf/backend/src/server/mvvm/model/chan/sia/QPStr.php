<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\model\chan\sia;

use straininfo\server\interfaces\mvvm\model\chan\query\QMIntDat;
use straininfo\server\mvvm\model\chan\PdoMWr;
use function straininfo\server\shared\mvvm\model\pdo\bind_and_exe;

use function straininfo\server\shared\mvvm\model\sia\sql\cul\get_cul_min_reg_id;
use function straininfo\server\shared\mvvm\model\sia\sql\cul\get_cul_min_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_alt_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_main_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_merge_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_alt_si_id;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_archive;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_full_strain;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_main_str_con;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_rel_des;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_main_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_merge_src_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_pub;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_rel_cul;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_seq;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_strain_err;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_sql_strain_online;
use function straininfo\server\shared\mvvm\model\sia\sql\str\get_strain_type_cul;
use straininfo\server\shared\mvvm\model\struct\DataCon;

/**
 * @implements QMIntDat<array<string, mixed>>
 */
final class QPStr extends PdoMWr implements QMIntDat
{
    /** @param callable(): \PDO|null $dbc */
    public function __construct(?callable $dbc)
    {
        parent::__construct($dbc, true);
    }

    /**
     * @param array<int> $ids
     *
     * @return array<array<string, mixed>>
     */
    public function getMin(array $ids): array
    {
        $this->checkMaintenanceMode();
        return $this->getMinSql($ids, get_full_strain());
    }

    /**
     * @param array<int> $ids
     *
     * @return array<array<string, mixed>>
     */
    public function getAvg(array $ids): array
    {
        $this->checkMaintenanceMode();
        return $this->getAvgSql($ids, get_full_strain());
    }

    /**
     * @param array<int> $ids
     *
     * @return array<array<string, mixed>>
     */
    public function getMax(array $ids): array
    {
        $this->checkMaintenanceMode();
        return $this->getMaxSql($ids, get_full_strain());
    }

    /**
     * @return array{array<string, object>, int} | null
     */
    private function getStrCon(int $strain_id, string $sta_str): ?array
    {
        $main_ids_fetched = $this->fetchConSql(get_sql_main_str_id(), [$strain_id]);
        if (count($main_ids_fetched) !== 1) {
            return null;
        }
        $main_id = parse_sql_main_str_id($main_ids_fetched[0]);
        $merge_ids = array_map(
            parse_sql_merge_str_id(...),
            $this->fetchConSql(get_sql_merge_src_str_id(), [$main_id])
        );
        $res = $this->fetchConSql(get_strain_type_cul(), [$main_id]);
        $base = $this->fetchConSql($sta_str, [$main_id])[0];
        $merge = [DataCon::MER->value => $merge_ids];
        $rel_cul = [
            DataCon::R_CUL->value => $this->fetchConSql(
                get_main_str_con(get_sql_rel_cul()),
                [$main_id]
            ),
        ];
        $rel_des = [
            DataCon::R_DES_S->value => $this->fetchConSql(
                get_rel_des(),
                [$main_id, $main_id]
            ),
        ];
        $merged_con = array_merge($base, $this->fetchConSql(
            get_sql_strain_online(),
            [$main_id]
        )[0], $this->fetchConSql(
            get_sql_strain_err(),
            [$main_id]
        )[0], $rel_cul, $rel_des, $merge);
        if (count($res) > 0) {
            $merged_con = array_merge($res[0], $merged_con);
        }
        /** @var array{array<string, object>, int} */
        return [$merged_con, $main_id];
    }

    /**
     * @return array<string, mixed>
     */
    private function addAvgStrCon(int $main_id): array
    {
        $seq = [
            DataCon::SEQ->value => $this->fetchConSql(
                get_main_str_con(get_sql_seq()),
                [$main_id]
            ),
        ];
        $arc = [
            DataCon::ARC->value => $this->fetchConSql(
                get_archive(),
                [$main_id]
            ),
        ];
        $lit = [DataCon::LIT->value => $this->fetchConSql(
            get_main_str_con(get_sql_pub()),
            [$main_id]
        ),
        ];
        $alt = [
            DataCon::ALT->value => array_map(
                parse_sql_alt_str_id(...),
                $this->fetchConSql(
                    get_alt_si_id(),
                    [$main_id]
                )
            ),
        ];
        return array_merge($seq, $arc, $lit, $alt);
    }

    /**
     * @return array<string, mixed>
     */
    private function addMaxStrCon(int $main_id): array
    {
        $cul = [
            DataCon::CUL_CON->value => $this->fetchConSql(
                get_cul_min_str_id(),
                [$main_id]
            ),
        ];
        $cul_sub = [
            DataCon::ENT_CON->value => $this->fetchConSql(
                get_cul_min_reg_id(),
                [$main_id]
            ),
        ];
        return array_merge($cul, $cul_sub);
    }

    /**
     * @param array<int> $ids
     *
     * @return array<array<string, array<array<string, object>>|object>>
     */
    private function getMinSql(array $ids, string $sta_str): array
    {
        $buf = [];
        foreach ($ids as $id) {
            $strain = $this->getStrCon($id, $sta_str);
            if (!$strain) {
                continue;
            }
            array_push($buf, $strain[0]);
        }
        return $buf;
    }

    /**
     * @param array<int> $ids
     *
     * @return array<array<string, mixed>>
     */
    private function getAvgSql(array $ids, string $sta_str): array
    {
        $buf = [];
        foreach ($ids as $id) {
            $strain = $this->getStrCon($id, $sta_str);
            if (!$strain) {
                continue;
            }
            [$info, $main_id] = $strain;
            $avg_con = $this->addAvgStrCon($main_id);
            array_push($buf, array_merge($info, $avg_con));
        }
        return $buf;
    }

    /**
     * @param array<int> $ids
     *
     * @return array<array<string, mixed>>
     */
    private function getMaxSql(array $ids, string $sta_str): array
    {
        $buf = [];
        foreach ($ids as $id) {
            $strain = $this->getStrCon($id, $sta_str);
            if (!$strain) {
                continue;
            }
            [$info, $main_id] = $strain;
            $avg_con = $this->addAvgStrCon($main_id);
            $max_con = $this->addMaxStrCon($main_id);
            array_push($buf, array_merge($info, $avg_con, $max_con));
        }
        return $buf;
    }

    /**
     * @param array<int|string> $args
     *
     * @return array<array<string, object>>
     */
    private function fetchConSql(
        string $sql,
        array $args,
        int $type = \PDO::PARAM_INT
    ): array {
        $sta = $this->prepDefSta($sql);
        if (bind_and_exe($sta, $args, $type)) {
            return $sta->fetchAll() ?: [];
        }
        return [];
    }
}
