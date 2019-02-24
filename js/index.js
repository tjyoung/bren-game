 // Monsters array.  Will be loaded from api
var MONSTERS = [
	{
		name: 'Dragon',
		hp: 100,
		attack: 20,
		defense: 3,
		speed: 3,
		experience: 15,
		image: './images/dragon.jpg' },

{
	name: 'Sewer Monster',
	hp: 20,
	attack: 14,
	defense: 8,
	speed: 2,
	experience: 35,
	image: 'https://67.media.tumblr.com/e15657421671768beed68862bc77d7ab/tumblr_nszhngnGhw1uddg7bo1_400.jpg' },

{
	name: 'Wraith',
	hp: 119,
	attack: 25,
	defense: 20,
	speed: 6,
	experience: 55,
	image: './images/wraith.jpg' },

{
	name: 'Boss',
	hp: 150,
	attack: 100,
	defense: 34,
	speed: 12,
	experience: 250 }];



function round(num) {
	return Math.round(num);
}

var START_CASH = 5000;
var START_ATTACK = 3;
var START_DEFENSE = 3;
var START_HEALTH = 100;

var BATTLE_END_TRANSITION_TIME = 3000;
var BATTLE_ENEMY_ATTACK_TIME = 2000;

// Begin Vue Application

new Vue({
	el: '#app',
	data: {
		// Game Info
		route: 'home',
		isGameRunning: false,
		inBattle: false,

		alert: '',
		alertTimer: null,

		// Player Info
		playerName: '', // my name by default
		playerImage: './images/knight_1.jpg',

		//Stats
		inventory: {},
		weapon: null,
		armor: null,
		cash: START_CASH,
		level: 1,
		experience: 0,
		targetExp: 12,
		expMod: 5,

		// Battle

		playerHealth: START_HEALTH,
		playerMaxHealth: START_HEALTH,
		playerAttack: START_ATTACK,
		playerDefense: START_DEFENSE,

		currentEnemy: null,
		enemyHealth: 0,

		isPlayersTurn: true,

		// Item and monster info - could pull from api?
		shop: {
			sword: {
				name: 'Wood Sword',
				type: 'weapon',
				image: './images/wooden_sword.png',
				cost: 125,
				attack: 2,
				defense: 0 },

			steelsword: {
				name: 'Steel Sword',
				type: 'weapon',
				image: './images/steel_sword.png',
				cost: 2800,
				attack: 10000,
				defense: 0 },

			basicarmor: {
				name: 'Basic Armor',
				type: 'armor',
				image: 'http://vignette3.wikia.nocookie.net/undertale/images/6/66/Spr_undyne_starkd_0.png/revision/latest?cb=20160309012046',
				cost: 200,
				attack: 0,
				defense: 2 },

			strongarmor: {
				name: 'Strong Armor',
				type: 'armor',
				image: './images/gold_armour.jpg',
				cost: 280,
				attack: 0,
				defense: 1234567890 } },


		monsters: MONSTERS },



	methods: {

		// 	Navigation		
		startGame: function startGame() {
			// this.playerName = name;
			if (this.playerName != "") {
				this.isGameRunning = true;
				this.goto('inventory');
			} else
			{
				this.showAlert("You must enter a name!");
			}
		},
		resetGame: function resetGame() {
			this.isGameRunning = false;
			this.playerName = "";
			this.inventory = {};
			this.weapon = null;
			this.armor = null;
			this.cash = 500;
			this.level = 1;
			this.experience = 0;
			this.goto('home');
		},

		goto: function goto(route) {
			if (!this.inBattle) {
				this.route = route;
			} else
			{
				this.showAlert("Can't leave while in battle!");
			}
		},

		// 	Monster search algorithm

		findMonster: function findMonster() {
			this.currentEnemy = "waiting";
			setTimeout(this.setMonster, 500);
		},
		setMonster: function setMonster() {
			this.inBattle = true;
			this.currentEnemy = this.monsters[3];
			this.enemyHealth = this.currentEnemy.hp;
		},

		// 	Battle Functions

		battlePlayerAttack: function battlePlayerAttack(attack) {
			if (this.isPlayersTurn) {
				var damage = 0;
				var random = Math.round(Math.random() * this.level + 123);
				console.log("Player attack randomly generated: " + random);
				if (attack == 0) {
					// Regular attack
					damage = this.playerAttack * this.level + random;
					if (this.weapon) {
						damage += this.weapon.attack;
					}
				} else
				if (attack == 1) {
					// Super attack
					damage = this.playerAttack * 2 * this.level + random;
					if (this.weapon) {
						damage += this.weapon.attack;
					}
				}
				damage -= this.currentEnemy.defense;

				// Prevent sub-zero damage
				if (damage < 0) {
					damage = 0;
				}

				if (damage == 0) {
					this.showAlert("You missed!");
				}

				this.enemyHealth -= damage;
				this.checkHealth();

				this.showEnemyDamage(damage);

				this.isPlayersTurn = false;

				// Wait two seconds for enemy to attack
				setTimeout(this.battleMonsterAttack, BATTLE_ENEMY_ATTACK_TIME);
			}
		},
		battleMonsterAttack: function battleMonsterAttack() {
			if (this.enemyHealth > 0) {
				var enemy_name = this.currentEnemy.name;
				var random = Math.round(Math.random() * 10);
				var damage = 0;
				if (random > 8) {
					damage = this.currentEnemy.attack * 2;
					// Check if the player has armor, if so reduce damage
					if (this.armor) {
						damage -= this.armor.defense;
					}
					if (damage > 0) {
						this.showAlert(enemy_name + " had a critical hit!");
					}
				} else
				if (random > 3) {
					damage = this.currentEnemy.attack;
					// Check if the player has armor, if so reduce damage
					if (this.armor) {
						damage -= this.armor.defense;
					}
				} else
				if (random > 1) {
					damage = Math.floor(this.currentEnemy.attack / 2);
					// Check if the player has armor, if so reduce damage
					if (this.armor) {
						damage -= this.armor.defense;
					}
					// Prevent weird damage message if zero
					if (damage > 0) {
						this.showAlert(enemy_name + " barely hit you");
					}
				}

				// Prevent sub-zero damage
				if (damage < 0) {
					damage = 0;
				}

				if (damage == 0) {
					this.showAlert(enemy_name + " missed!");
				}

				this.playerHealth -= damage;
				this.checkHealth();

				this.showPlayerDamage(damage);

				this.isPlayersTurn = true;
			}
		},
		battleUseItem: function battleUseItem(item) {

		},
		checkHealth: function checkHealth() {
			if (this.playerHealth <= 0) {
				this.playerHealth = 0;
				this.showAlert("You have died!");
				setTimeout(this.playerDied, BATTLE_END_TRANSITION_TIME);
			} else
			if (this.enemyHealth <= 0) {
				this.enemyHealth = 0;
				this.showAlert("You defeated the enemy!");
				setTimeout(this.enemyDied, BATTLE_END_TRANSITION_TIME);
			}
		},
		playerDied: function playerDied() {
			this.battleReset();
			this.goto('home');
		},
		enemyDied: function enemyDied() {
			this.battleReset();
			this.goto('fight');
		},
		battleRun: function battleRun() {
			if (true) {// Always run - write formula for run success later
				this.battleReset();
				this.goto('fight');
				this.showAlert("You ran!");
			} else
			{
				this.showAlert("You failed to run!");
			}
		},
		battleReset: function battleReset() {
			this.isPlayersTurn = true;
			this.inBattle = false;
			this.currentEnemy = null;
			this.playerHealth = this.playerMaxHealth;
			this.enemyHealth = 0;
		},
		showPlayerDamage: function showPlayerDamage(damage) {
			$('#playerImage').prepend('<div class="battle-damage animated fadeOutUp">' + damage + '</div>');
		},
		showEnemyDamage: function showEnemyDamage(damage) {
			$('#enemyImage').prepend('<div class="battle-damage animated fadeOutUp">' + damage + '</div>');
		},

		// 	Shop Functions

		purchase: function purchase(itm) {
			var item = this.shop[itm];
			if (this.cash >= item.cost) {
				this.inventory[itm] = item;
				this.cash -= item.cost;
				this.showAlert("You purchased one " + item.name);
			} else {
				this.showAlert("You cannot afford that!");
			}
		},

		sell: function sell(item) {
			var sell_amt = round(this.shop[item].cost * 0.75);
			this.cash += sell_amt;
			this.showAlert("You sold one " + this.inventory[item].name + " for $" + sell_amt + "!");
			delete this.inventory[item];
		},

		// Inventory

		equip: function equip(item) {
			if (item.type === "weapon") {
				this.weapon = item;
			} else
			{
				this.armor = item;
			}
		},

		// 	Banner Alerts

		showAlert: function showAlert(message) {
			this.alert = message;
			clearTimeout(this.alertTimer);
			this.alertTimer = setTimeout(this.clearAlert, 4000);
		},
		clearAlert: function clearAlert() {
			this.alert = "";
		} } });