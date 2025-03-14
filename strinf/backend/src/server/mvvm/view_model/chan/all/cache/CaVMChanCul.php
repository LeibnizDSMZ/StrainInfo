<?php

declare(strict_types=1);

namespace straininfo\server\mvvm\view_model\chan\all\cache;

use straininfo\server\shared\mvvm\view_model\data\QDConJson;

final class CaVMChanCul extends CaVMChanAll
{
    public function setResult(QDConJson $all_con): void
    {
        $id_json = $all_con->getJson();
        if ($id_json) {
            $this->getMSetChan()->setAllCulIds($id_json, $all_con->getCnt());
        }
    }

    public function getResult(): QDConJson
    {
        $ids = $this->getMChan()->getAllCulIds();
        return new QDConJson(strlen($ids) > 0, $ids);
    }
}
