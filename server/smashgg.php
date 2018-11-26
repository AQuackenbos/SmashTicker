<?php
if(@$_SERVER['REMOTE_IP'])
	exit;

require('lib/simple_html_dom.php');

/** Server : API Gatherer for Smash GG into nightly file **/
class SmashGGApi {
	protected $_tournamentSearchUrl;
	protected $_apiBaseUrl;
	protected $_baseLinkUrl;
	
	public $tournaments;
	
	public function __construct() {
		$dt = new DateTime();
		$dt->modify('-2 days');
		$afterDate = $dt->format('U');
		$dt->modify('+32 days');
		$beforeDate = $dt->format('U');
		
		//hand crafted love
		$this->_tournamentSearchUrl = 'https://smash.gg/tournaments?per_page=25&filter=%7B%22upcoming%22%3Afalse%2C%22videogameIds%22%3A%5B%221%22%2C%222%22%2C%223%22%2C%224%22%2C%225%22%2C%221386%22%5D%2C%22isFeatured%22%3Atrue%2C%22beforeDate%22%3A'.$beforeDate.'%2C%22afterDate%22%3A'.$afterDate.'%7D&page=1';
		
		//echo $this->_tournamentSearchUrl."\n";
		
		$this->_apiBaseUrl = 'https://api.smash.gg/';
		$this->_baseLinkUrl = 'https://smash.gg/';
		
		$this->tournaments = [];
	}
	
	public function nightlyScrape() {
		$output = [];
		
		$validGames = [1,2,3,4,5,1386];
		$searchPage = file_get_html($this->_tournamentSearchUrl);
		
		foreach($searchPage->find('div.TournamentCardHeading__title a') as $element) {
			$tournamentRef = $element->href;
			$this->tournaments[] = ltrim($tournamentRef,'/');
		}
		
		foreach($this->tournaments as $_tourney) {
			$tournData = json_decode(file_get_contents($this->_apiBaseUrl . $_tourney . '?expand[]=event&expand[]=stream'),true);
			
			$tournament = $tournData['entities']['tournament'];
			
			$dt = new DateTime();
			$dt->setTimezone(new DateTimeZone($tournament['timezone']));
			$dt->setTimestamp($tournament['startAt']);
			$start = $dt->format('M j');
			$dt->setTimestamp($tournament['endAt']);
			$end = $dt->format('M j');
			
			$events = [];
			
			foreach($tournData['entities']['event'] as $_event) {
				if(!in_array($_event['videogameId'], $validGames))
					continue;
				
				
				$edt = new DateTime();
				$edt->setTimezone(new DateTimeZone($tournament['timezone']));
				$edt->setTimestamp($_event['startAt']);
				$evStart = $edt->format('M j H:i:s');
				$edt->setTimestamp($_event['endAt']);
				$evEnd = $edt->format('M j H:i:s');
				
				$evOut = [
					'name' => $_event['name'],
					'start' => $evStart,
					'end' => $evEnd,
					'url' => $this->_baseLinkUrl . $_event['slug'],
					'type' => $_event['typeDisplayStr']
				];
				
				$events[] = $evOut;
			}
			
			$tournOut = [
				'name' => $tournament['name'],
				'start' => $start,
				'end' => $end,
				'location' => $tournament['city'].', '.$tournament['addrState'],
				'url' => $this->_baseLinkUrl . $tournament['slug'],
				'events' => $events
			];
			
			$output[] = $tournOut;
		}
		
		file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'smashgg.json',json_encode($output));
	}
}

$api = new SmashGGApi();
$api->nightlyScrape();
