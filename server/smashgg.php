<?php
if(@$_SERVER['REMOTE_IP'])
	exit;

require('keys.php');

/** Server : API Gatherer from smash.gg into hourly file **/
class SmashGGApi {
	protected $_tournamentSearchUrl;
	protected $_apiBaseUrl;
	protected $_baseLinkUrl;
	
	protected $_apiKey;
	
	public function __construct() {
		global $_KEYS;
		$this->_apiKey = $_KEYS['smashgg'];
		
		$this->_apiBaseUrl = 'https://api.smash.gg/gql/alpha';
		$this->_baseLinkUrl = 'https://smash.gg/';
	}
	
	protected function _setCurlOpts($curlHandle, $body) {
		curl_setopt($curlHandle, CURLOPT_URL, $this->_apiBaseUrl);
		curl_setopt($curlHandle, CURLOPT_HTTPHEADER, [
			'Content-Type: application/json',
			'Authorization: Bearer '.$this->_apiKey
		]);
		curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curlHandle, CURLOPT_POST, 1);
		curl_setopt($curlHandle, CURLOPT_POSTFIELDS, $body);
	}
	
	public function getSmashGames() {
		//Coded for now - replace with API call in the future?
		return [
			1 => [
				'name' => 'Super Smash Bros. Melee',
				'gamecode' => 'melee'
			],
			2 => [
				'name' => 'Project M',
				'gamecode' => 'pm'
			],
			3 => [
				'name' => 'Super Smash Bros. for Wii U',
				'gamecode' => 'wiiu'
			],
			4 => [
				'name' => 'Super Smash Bros.',
				'gamecode' => 'sixtyfour'
			],
			5 => [
				'name' => 'Super Smash Bros. Brawl',
				'gamecode' => 'brawl'
			],
			29 => [
				'name' => 'Super Smash Bros. for Nintendo 3DS',
				'gamecode' => 'threeds'
			],
			1386 => [
				'name' => 'Super Smash Bros. Ultimate',
				'gamecode' => 'ultimate'
			]
		];
	}
	
	public function nightlyScrape() {
		$games = $this->getSmashGames();
		$perPage = 25;
		
		$query = 'query TournamentsByVideogame($perPage: Int, $videogameIds: [ID], $beforeDate: Timestamp, $afterDate: Timestamp) {
			tournaments(query: {
				perPage: $perPage
				page: 1
				sortBy: "startAt asc"
				filter: {
					isFeatured: true
					videogameIds: $videogameIds
					beforeDate: $beforeDate
					afterDate: $afterDate
				}
			}) {
				nodes {
					id
					name
					slug
					startAt
					endAt
					addrState
					city
					timezone
					events {
						id
						name
						slug
						startAt
						type
						videogameId
					}
				}
			}
		}';
		
		$dt = new DateTime();
		$dt->modify('-2 days');
		$after = $dt->format('U');
		$dt->modify('+32 days');
		$before = $dt->format('U');
		
		$vars = [
			'perPage' => 10,
			'videogameIds' => array_keys($games),
			'beforeDate' => $before,
			'afterDate' => $after
		];
		
		$gqlBody = json_encode(['query' => $query, 'variables' => json_encode($vars)]);
		
		$ch = curl_init();
		$this->_setCurlOpts($ch, $gqlBody);
		
		$result = curl_exec($ch);
		
		$response = json_decode($result,true);
		
		$output = [];
		foreach($response['data']['tournaments']['nodes'] as $tournament) {
			$events = [];
			
			foreach($tournament['events'] as $_event) {
				if(!array_key_exists($_event['videogameId'], $games))
					continue;
				
				$evStart = '';
				if($_event['startAt']) {
					$edt = new DateTime();
					$edt->setTimezone(new DateTimeZone($tournament['timezone']));
					$edt->setTimestamp($_event['startAt']);
					$evStart = $edt->format('M j, g:i A');
				}
				
				$typeString = 'Singles';
				if($_event['type'] > 1)
					$typeString = 'Doubles';
				
				$evOut = [
					'name' => $_event['name'],
					'start' => $evStart,
					'url' => $this->_baseLinkUrl . $_event['slug'],
					'type' => $typeString,
					'gamecode' => $games[$_event['videogameId']]['gamecode']
				];
				
				$events[] = $evOut;
			}
			
			$dt = new DateTime();
			$dt->setTimezone(new DateTimeZone($tournament['timezone']));
			$dt->setTimestamp($tournament['startAt']);
			$start = $dt->format('M j');
			$dt->setTimestamp($tournament['endAt']);
			$end = $dt->format('M j, Y');
			
			$locationString = $tournament['city'].', '.$tournament['addrState'];
			if($locationString === ', ')
				$locationString = 'Online';
			
			$tournOut = [
				'name' => $tournament['name'],
				'start' => $start,
				'end' => $end,
				'location' => $locationString,
				'url' => $this->_baseLinkUrl . $tournament['slug'],
				'events' => $events
			];
			
			$output[] = $tournOut;
		}
		
		file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'smashgg.gql.json',json_encode($output));
	}
}

$api = new SmashGGApi();
$api->nightlyScrape();
