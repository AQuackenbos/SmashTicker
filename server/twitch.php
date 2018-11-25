<?php

/** Server : API Throughput for Twitch **/
require('keys.php');


class TwitchApi {
  
  protected $_clientId;
  protected $_baseUrl;
  protected $_gamesWhitelist;
  
  public function __construct() {
    global $_KEYS;
    $this->_clientId = $_KEYS['twitch'];
    $this->_baseUrl = 'https://api.twitch.tv/kraken/streams?';
    $this->_gamesWhitelist = [
      'Super Smash Bros. Ultimate',
      'Super Smash Bros. for Wii U',
      'Super Smash Bros. for Nintendo 3DS',
      'Super Smash Bros. Brawl',
      'Super Smash Bros. Melee',
      'Super Smash Bros.' //64
    ];
  }

  public function getGameStreams($game) {
    if(!in_array($game, $this->_gamesWhitelist)) {
      return json_encode(['error' => true]);
    }
    
    $url = $this->_baseUrl;
    
    $params = [
      'game' => $game,
      'client_id' => $this->_clientId
    ];
    
    $paramString = http_build_query($params);
    $url .= $paramString;
    
    $r = curl_init();
    curl_setopt($r, CURLOPT_URL, $url);
    $output = curl_exec($r);
    
    return $output;
  }

}

$twitch = new TwitchApi();
$json = $twitch->getGameStreams($_GET['game']);
header('Content-Type: application/json');
echo $json;
exit;