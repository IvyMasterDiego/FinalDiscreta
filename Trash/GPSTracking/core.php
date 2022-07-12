<?php

use Track as GlobalTrack;

class Track
{
    // (A) Constructor - Connect to database

    public $pdo = null;
    public $stmt = null;
    public $error = "";

    function __construct()
    {
        try {
            $this->pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
                DB_USER,
                DB_PASSWORD,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (Exception $ex) {
            exit($ex->getMessage());
        }
    }

    //(B) Destructor - Close Connection
    function __destruct()
    {
        if ($this->stmt !== null) {
            $this->stmt = null;
        }
        if ($this->pdo !== null) {
            $this->pdo = null;
        }
    }

    //(C) helper function - Execute SQL query
    function query($sql, $data = null)
    {
        try {
            $this->stmt = $this->pdo->prepare($sql);
            $this->stmt->execute($data);
            return true;
        } catch (Exception $ex) {
            $this->error = $ex->getMessage();
            return false;
        }
    }

    //(D) Update rider coordinates
    function update($id, $lng, $lat)
    {
        return $this->query(
            "Replace into `gps_track`(`rider_id`,`track_time`,`track_lng`,`track_lat`)Values(?,?,?,?)",
            [$id, date("Y-m-d H:i:s"), $lng, $lat]
        );
    }

    //(E) Get rider coordinates
    function get($id)
    {
        $this->query("select * from `gps_track`");
        return $this->stmt->fetchAll();
    }
}
//(G) database settings 
define("DB_HOST", "localhost");
define("DB_NAME", "trackinggps");
define("DB_CHARSET", "utf8");
define("DB_USER", "root");
define("DB_PASSWORD", "ofimatic");

//start

$_TRACK = new Track();
