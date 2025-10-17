<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\model\chan\sia;

use straininfo\server\interfaces\mvvm\model\chan\query\QMIntSeaIdStr;
use straininfo\server\mvvm\model\chan\PdoMWr;

use function straininfo\server\shared\mvvm\model\pdo\bind_and_exe;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\add_w_sea_brc_ent_2_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\add_w_sea_des_ent_2_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\add_w_sea_seq_acc_ent_2_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\add_w_sea_str_no_ent_2_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\add_w_sea_tax_name_ent_2_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_designation;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_cul_id_str;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_str_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_str_base_min;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_des_id;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_main_str_id;
use function straininfo\server\shared\text\create_designation_triplet;

final class QPStrSea extends PdoMWr implements QMIntSeaIdStr
{
    /** @param callable(): \PDO|null $dbc */
    public function __construct(?callable $dbc)
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
        $a_val = implode(' ', $tax_name);
        $res_str = $this->getResStrId(
            get_str_base_min() . ' ' . add_w_sea_tax_name_ent_2_base('strain'),
            [$a_val],
            parse_sql_main_str_id(...),
            \PDO::PARAM_STR
        );
        return array_unique($res_str);
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
        $des_ids = $this->getResStrId(
            $sql_des,
            array_merge($str_des, array_merge(...$des_tri)),
            parse_sql_des_id(...),
            \PDO::PARAM_STR
        );
        $ids_cnt = count($des_ids);
        if ($ids_cnt === 0) {
            return [];
        }
        $sql_cul = add_w_sea_des_ent_2_base($ids_cnt);
        $res = [];
        foreach ($sql_cul as $sql_cmd) {
            $res = array_merge($res, $this->getResStrId(
                get_str_base() . ' ' . $sql_cmd,
                $des_ids,
                parse_sql_main_str_id(...),
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
        $sql = add_w_sea_str_no_ent_2_base(count($str_no), count($des_tri));
        return $this->getResStrId(
            get_str_base() . ' ' . $sql,
            array_merge($str_no, array_merge(...$des_tri)),
            parse_sql_main_str_id(...),
            \PDO::PARAM_STR
        );
    }

    /**
     * @param array<int> $cul_ids
     *
     * @return array<int>
     */
    public function getCulId(array $cul_ids): array
    {
        return $this->getResStrId(
            get_sea_cul_id_str(count($cul_ids)),
            $cul_ids,
            parse_sql_main_str_id(...),
            \PDO::PARAM_INT
        );
    }

    /**
     * @param array<string> $seq_acc
     *
     * @return array<int>
     */
    public function getSeqAcc(array $seq_acc): array
    {
        $sql = add_w_sea_seq_acc_ent_2_base(count($seq_acc));
        return $this->getResStrId(
            get_str_base() . ' ' . $sql,
            $seq_acc,
            parse_sql_main_str_id(...),
            \PDO::PARAM_STR
        );
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
        $sql = add_w_sea_brc_ent_2_base($acr_cnt);
        return $this->getResStrId(
            get_str_base() . ' ' . $sql,
            array_merge($brc, $brc),
            parse_sql_main_str_id(...),
            \PDO::PARAM_STR
        );
    }

    /**
     * @template T
     * @template U of int
     *
     * @param array<string|int> $args
     * @param callable(T): U $parser
     *
     * @return array<int>
     */
    private function getResStrId(
        string $sql,
        array $args,
        callable $parser,
        int $type
    ): array {
        $this->checkMaintenanceMode();
        $sta = $this->prepDefSta($sql);
        if (bind_and_exe($sta, $args, $type)) {
            return array_map(
                $parser,
                $sta->fetchAll()
            );
        }
        return [];
    }
}
