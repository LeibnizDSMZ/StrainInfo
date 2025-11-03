<?php

declare(strict_types=1);

namespace straininfo\server\cron\sitemap;

use Psr\Log\LoggerInterface;
use straininfo\server\configs\ConfigsCont;
use straininfo\server\mvvm\model\dbs\ChMainDB;
use straininfo\server\shared\path\QUIMap;

use function Safe\chmod;
use function Safe\fclose;
use function Safe\filesize;
use function Safe\fopen;
use function Safe\fread;
use function Safe\fwrite;
use function Safe\ini_get;
use function Safe\ini_set;
use function Safe\mkdir;
use function Safe\preg_replace;
use function Safe\touch;
use function straininfo\server\exceptions\get_err_handler_slim_fun;
use function straininfo\server\logger\create_logger;
use function straininfo\server\shared\dbs\tryToConnect;
use function straininfo\server\shared\path\get_public_root;
use function straininfo\server\shared\text\create_url;

final class SiteMapGen
{
    // immutable
    private readonly LoggerInterface $logger_err;
    private readonly ConfigsCont $configurations;
    private readonly string $rootPath;

    /** @var ChMainDB<array<string, object>, array<string, object>> */
    // @phpstan-ignore property.unusedType
    private ?ChMainDB $data;

    public function __construct(string $root)
    {
        $this->rootPath = $root === '' ? get_public_root() : $root;
        $this->data = null;
        $this->configurations = ConfigsCont::getConfigsCon('_site_map_gen');
        $conf = $this->configurations->getLoggerArgs();
        $this->logger_err = create_logger($conf, 10);
        set_exception_handler(get_err_handler_slim_fun($this->logger_err));
    }

    public function start(): void
    {
        try {
            $mem = ini_get('memory_limit');
            $new_mem = '512M';
            printf('START - ' . $mem . ' -> ' . $new_mem . "\n");
            ini_set('memory_limit', '512M');
            $all_con = $this->getDataDB()->getQDBAll();
            $all_strains = $all_con->getAllStrIdsWDate();
            $site_maps_cnt = (int) ceil(count($all_strains) / 30_000);
            printf('Sitemap creation, with ' . $site_maps_cnt . " sitemaps\n");
            $this->createSiteMapIndex($site_maps_cnt, $all_strains);
            $this->createRobots();
            printf("FINISHED\n");
        } catch (\Throwable $ex) {
            echo $ex;
        }
    }

    /** @return ChMainDB<array<string, object>, array<string, object>> */
    private function getDataDB(): ChMainDB
    {
        if ($this->data === null) {
            $this->data = new ChMainDB($this->configurations->getDBArgs());
            tryToConnect($this->data->connect(...), 10);
        }
        return $this->data;
    }

    /** @param array<array{int, string}> $strain_ids */
    private function createSiteMap(array $strain_ids, string $path, int $cont): void
    {
        $start = 30_000 * ($cont - 1);
        $end = $start + 30_000;
        $file_fh = fopen($this->rootPath . '/' . $path, 'w');
        $data = <<<EOF
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        EOF;
        $url = create_url($this->configurations->getWebArgsFE(), QUIMap::STRAIN->value);
        $str_ids = count($strain_ids);
        for ($cnt_i = $start; $cnt_i < $str_ids && $cnt_i < $end; $cnt_i++) {
            $loc = $url . '/' . $strain_ids[$cnt_i][0];
            $data .= '<url><loc>' . $loc . '</loc><lastmod>' . $strain_ids[$cnt_i][1];
            $data .= '</lastmod></url>';
        }
        $data .= '</urlset>';
        fwrite($file_fh, $data);
        fclose($file_fh);
    }

    /** @param array<array{int, string}> $strain_ids */
    private function createSiteMapIndex(int $site_maps_cnt, array $strain_ids): void
    {
        $cnt = $site_maps_cnt;
        if ($cnt > 500) {
            printf("!!!WARNING!!! more than 500 sitemaps required\n");
            $cnt = 500;
        }
        $public = $this->rootPath;
        $sitemap_dir = 'sitemaps';
        if (!file_exists($public . '/' . $sitemap_dir)) {
            mkdir($public . '/' . $sitemap_dir, 0755, true);
        }
        $index = fopen($public . QUIMap::SITEMAP->value, 'w');
        fwrite($index, <<<EOF
        <?xml version="1.0" encoding="UTF-8"?>
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        EOF);
        $feCon = $this->configurations->getWebArgsFE();
        $url = create_url($feCon, $feCon->getSiteMap());
        fwrite($index, "<sitemap><loc>{$url}</loc></sitemap>");
        for ($cnt_i = 1; $cnt_i <= $cnt; $cnt_i++) {
            $map_path = $sitemap_dir . "/sitemap{$cnt_i}.xml";
            $url = create_url($feCon, $map_path);
            fwrite($index, "<sitemap><loc>{$url}</loc></sitemap>");
            $this->createSiteMap($strain_ids, $map_path, $cnt_i);
        }
        fwrite($index, '</sitemapindex>');
        fclose($index);
    }

    private function createRobots(): void
    {
        $robot = $this->rootPath . QUIMap::ROBOT->value;
        if (!file_exists($robot)) {
            touch($robot);
            chmod($robot, 0644);
        }
        $robot_rfh = fopen($robot, 'r');
        $size = filesize($robot);
        if ($size < 1) {
            $size = 1;
        }
        $robots_txt = fread($robot_rfh, $size);
        fclose($robot_rfh);
        $robot_wfh = fopen($robot, 'w');
        $robots_txt = preg_replace("/\s*Sitemap\s*:\s*.*(\n|$)/i", '', $robots_txt);
        $url = create_url($this->configurations->getWebArgsFE(), QUIMap::SITEMAP->value);
        $robots_txt .= "\n\nSitemap: " . $url . "\n\n";
        fwrite($robot_wfh, $robots_txt);
        fclose($robot_wfh);
    }
}
