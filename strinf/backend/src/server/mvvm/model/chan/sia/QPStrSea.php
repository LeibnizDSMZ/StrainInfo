<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\model\chan\sia;

use straininfo\server\mvvm\model\chan\PdoMWr;
use straininfo\server\interfaces\mvvm\model\chan\query\QMIntSeaIdStr;

use function straininfo\server\shared\text\create_designation_triplet;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_main_str_id;
use function straininfo\server\shared\mvvm\model\sia\sql\parse_sql_des_id;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_str_base;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_tax_name_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_str_no_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_seq_acc_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_des_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_cul_id_str;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_sea_brc_ent;
use function straininfo\server\shared\mvvm\model\sia\sql\ent\get_designation;
use function straininfo\server\shared\mvvm\model\pdo\bind_and_exe;

final class QPStrSea extends PdoMWr implements QMIntSeaIdStr
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
        $res_cul = $this->getResStrId(
            get_sea_tax_name_ent('culture', get_str_base()),
            [$a_val],
            parse_sql_main_str_id(...),
            \PDO::PARAM_STR
        );
        $res_str = $this->getResStrId(
            get_sea_tax_name_ent('strain', get_str_base()),
            [$a_val],
            parse_sql_main_str_id(...),
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
        $sql_cul = get_sea_des_ent($ids_cnt, get_str_base());
        $res = [];
        foreach ($sql_cul as $sql_cmd) {
            $res = array_merge($res, $this->getResStrId(
                $sql_cmd,
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
        $sql = get_sea_str_no_ent(count($str_no), count($des_tri), get_str_base());
        return $this->getResStrId(
            $sql,
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
        $sql = get_sea_cul_id_str(count($cul_ids));
        return $this->getResStrId(
            $sql,
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
        $sql = get_sea_seq_acc_ent(count($seq_acc), get_str_base());
        return $this->getResStrId(
            $sql,
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
        $sql = get_sea_brc_ent($acr_cnt, get_str_base());
        return $this->getResStrId(
            $sql,
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
        $bound = bind_and_exe($sta, $args, $type);
        return match (true) {
            $bound => array_map(
                $parser,
                $sta->fetchAll()
            ),
            default => []
        };
    }
}
