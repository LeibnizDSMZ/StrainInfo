<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\model\chan\sia;

use straininfo\server\interfaces\mvvm\model\chan\query\QMIntSeaIdCul;
use straininfo\server\mvvm\model\chan\PdoMWr;

use function straininfo\server\shared\mvvm\model\pdo\bind_and_exe;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_cul_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_designation;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_brc_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_des_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_seq_acc_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_str_id_cul;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_str_no_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_tax_name_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_cul_id;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_des_id;
use function straininfo\server\shared\text\create_designation_triplet;

final class QPCulSea extends PdoMWr implements QMIntSeaIdCul
{
    public function __construct(?\PDO $dbc)
    {
        parent::__construct($dbc, true);
    }

    /** @return array<string> */
    public function getBanChars(): array
    {
        return ['%', '(?<=\s)\s+'];
    }

    /**
     * @param array<string> $tax_name
     *
     * @return array<int>
     */
    public function getTaxName(array $tax_name): array
    {
        $a_val = '+' . implode(' *', $tax_name);
        $res_cul = $this->getResCulId(
            get_sea_tax_name_ent('culture', get_cul_base()),
            [$a_val],
            parse_sql_cul_id(...),
            \PDO::PARAM_STR
        );
        $res_str = $this->getResCulId(
            get_sea_tax_name_ent('strain', get_cul_base()),
            [$a_val],
            parse_sql_cul_id(...),
            \PDO::PARAM_STR
        );
        return array_unique(array_merge($res_str, $res_cul));
    }

    /**
     * @param array<string> $str_des
     *
     * @return array<int>
     */
    public function getStrDes(array $str_des): array
    {
        $des_tri = create_designation_triplet($str_des);
        $sql_des = get_designation(count($str_des), count($des_tri));
        $des_ids = $this->getResCulId(
            $sql_des,
            array_merge($str_des, array_merge(...$des_tri)),
            parse_sql_des_id(...),
            \PDO::PARAM_STR
        );
        $ids_cnt = count($des_ids);
        if ($ids_cnt === 0) {
            return [];
        }
        $sql_cul = get_sea_des_ent($ids_cnt, get_cul_base());
        $res = [];
        foreach ($sql_cul as $sql_cmd) {
            $res = array_merge($res, $this->getResCulId(
                $sql_cmd,
                $des_ids,
                parse_sql_cul_id(...),
                \PDO::PARAM_STR
            ));
        }
        return array_unique($res);
    }

    /**
     * @param array<string> $str_no
     *
     * @return array<int>
     */
    public function getStrNo(array $str_no): array
    {
        $des_tri = create_designation_triplet($str_no);
        $sql = get_sea_str_no_ent(count($str_no), count($des_tri), get_cul_base());
        return $this->getResCulId(
            $sql,
            array_merge($str_no, array_merge(...$des_tri)),
            parse_sql_cul_id(...),
            \PDO::PARAM_STR
        );
    }

    /**
     * @param array<int> $str_ids
     *
     * @return array<int>
     */
    public function getStrId(array $str_ids): array
    {
        $sql = get_sea_str_id_cul(count($str_ids));
        return $this->getResCulId($sql, $str_ids, parse_sql_cul_id(...), \PDO::PARAM_INT);
    }

    /**
     * @param array<string> $seq_acc
     *
     * @return array<int>
     */
    public function getSeqAcc(array $seq_acc): array
    {
        $sql = get_sea_seq_acc_ent(count($seq_acc), get_cul_base());
        return $this->getResCulId($sql, $seq_acc, parse_sql_cul_id(...), \PDO::PARAM_STR);
    }

    /**
     * @param array<string> $brc
     *
     * @return array<int>
     */
    public function getBrc(array $brc): array
    {
        $acr_cnt = count($brc);
        if ($acr_cnt === 0) {
            return [];
        }
        $sql = get_sea_brc_ent($acr_cnt, get_cul_base());
        return $this->getResCulId(
            $sql,
            array_merge($brc, $brc),
            parse_sql_cul_id(...),
            \PDO::PARAM_STR
        );
    }

    /**
     * @template T
     *
     * @param array<string|int> $args
     * @param callable(T): int $parser
     *
     * @return array<int>
     */
    private function getResCulId(
        string $sql,
        array $args,
        callable $parser,
        int $type
    ): array {
        $this->checkMaintenanceMode();
        $sta = $this->prepDefSta($sql);
        return match (true) {
            bind_and_exe($sta, $args, $type) => array_map(
                $parser,
                $sta->fetchAll()
            ),
            default => []
        };
    }
}
