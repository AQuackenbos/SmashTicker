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
      'ultimate'	=> 'Super Smash Bros. Ultimate',
      'wiiu'		=> 'Super Smash Bros. for Wii U',
      'threeds'			=> 'Super Smash Bros. for Nintendo 3DS',
      'brawl'		=> 'Super Smash Bros. Brawl',
      'melee'		=> 'Super Smash Bros. Melee',
      'sixtyfour'			=> 'Super Smash Bros.'
    ];
  }

  public function getGameStreams($game) {
    if(!array_key_exists($game,$this->_gamesWhitelist)) {
      return json_encode(['error' => true]);
    }
    
    $url = $this->_baseUrl;
    
    $params = [
      'game' => $this->_gamesWhitelist[$game],
      'client_id' => $this->_clientId,
	  'api_version' => 5
    ];
    
	// https://blog.twitch.tv/action-required-twitch-api-version-update-f3a21e6c3410 ?
	
    $paramString = http_build_query($params);
    $url .= $paramString;
    
    $r = curl_init();
    curl_setopt($r, CURLOPT_URL, $url);
    curl_setopt($r, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($r);
    
    return $output;
  }

}

$twitch = new TwitchApi();
$json = $twitch->getGameStreams($_GET['game']);
header('Content-Type: application/json');
echo $json;


