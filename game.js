// 포켓몬스터 Yellow 버전 게임
class PokemonGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;
        this.gameState = 'overworld'; // 'overworld' or 'battle'

        // 플레이어 설정
        this.player = {
            x: 10,
            y: 10,
            direction: 'down',
            moving: false,
            sprite: 0
        };

        // 피카츄 (따라오는 포켓몬)
        this.pikachu = {
            x: 10,
            y: 11,
            direction: 'down',
            targetX: 10,
            targetY: 11
        };

        // 플레이어 파티
        this.party = [
            {
                name: '피카츄',
                level: 5,
                hp: 35,
                maxHp: 35,
                attack: 25,
                defense: 20,
                speed: 45,
                type: 'electric',
                moves: [
                    { name: '전기충격', power: 40, type: 'electric' },
                    { name: '몸통박치기', power: 35, type: 'normal' },
                    { name: '꼬리흔들기', power: 0, type: 'normal' },
                    { name: '울음소리', power: 0, type: 'normal' }
                ]
            }
        ];

        // 맵 데이터 (0: 풀, 1: 길, 2: 나무, 3: 물, 4: 집, 5: 긴 풀)
        this.map = this.generateMap();

        // 걸음 수 카운터
        this.stepCounter = 0;

        // 키 입력
        this.keys = {};
        this.setupControls();

        // 배틀 시스템
        this.battle = new BattleSystem(this);

        // 게임 시작
        this.gameLoop();
    }

    generateMap() {
        const width = 25;
        const height = 19;
        const map = [];

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // 외곽 나무
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    row.push(2);
                }
                // 길 생성
                else if ((x >= 8 && x <= 16 && y >= 8 && y <= 12) ||
                         (x >= 10 && x <= 14 && y >= 5 && y <= 15)) {
                    row.push(1);
                }
                // 집
                else if ((x >= 3 && x <= 6 && y >= 3 && y <= 5) ||
                         (x >= 18 && x <= 21 && y >= 3 && y <= 5)) {
                    row.push(4);
                }
                // 물
                else if (x >= 18 && x <= 22 && y >= 13 && y <= 16) {
                    row.push(3);
                }
                // 긴 풀 (야생 포켓몬 출현)
                else if (Math.random() < 0.3 &&
                         x > 2 && x < width - 3 &&
                         y > 2 && y < height - 3) {
                    row.push(5);
                }
                // 일반 풀
                else {
                    row.push(0);
                }
            }
            map.push(row);
        }

        return map;
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (this.gameState === 'overworld' && !this.player.moving) {
                let newX = this.player.x;
                let newY = this.player.y;
                let direction = this.player.direction;

                switch(e.key) {
                    case 'ArrowUp':
                    case 'w':
                        newY--;
                        direction = 'up';
                        break;
                    case 'ArrowDown':
                    case 's':
                        newY++;
                        direction = 'down';
                        break;
                    case 'ArrowLeft':
                    case 'a':
                        newX--;
                        direction = 'left';
                        break;
                    case 'ArrowRight':
                    case 'd':
                        newX++;
                        direction = 'right';
                        break;
                }

                this.player.direction = direction;

                if (this.canMove(newX, newY)) {
                    // 피카츄가 플레이어의 이전 위치로 이동
                    this.pikachu.targetX = this.player.x;
                    this.pikachu.targetY = this.player.y;

                    this.player.x = newX;
                    this.player.y = newY;
                    this.player.moving = true;

                    this.stepCounter++;

                    // 긴 풀에서 랜덤 인카운터
                    if (this.map[newY][newX] === 5 && Math.random() < 0.15) {
                        this.startWildBattle();
                    }

                    setTimeout(() => {
                        this.player.moving = false;
                        // 피카츄 실제 위치 업데이트
                        this.pikachu.x = this.pikachu.targetX;
                        this.pikachu.y = this.pikachu.targetY;
                    }, 150);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    canMove(x, y) {
        if (x < 0 || x >= this.map[0].length || y < 0 || y >= this.map.length) {
            return false;
        }

        const tile = this.map[y][x];
        // 나무, 물, 집은 통과 불가
        return tile !== 2 && tile !== 3 && tile !== 4;
    }

    startWildBattle() {
        const wildPokemon = this.getRandomWildPokemon();
        this.battle.start(wildPokemon);
    }

    getRandomWildPokemon() {
        const wildPokemons = [
            {
                name: '꼬렛',
                level: Math.floor(Math.random() * 3) + 2,
                type: 'normal',
                baseHp: 30,
                baseAttack: 25,
                baseDefense: 20,
                baseSpeed: 35
            },
            {
                name: '구구',
                level: Math.floor(Math.random() * 3) + 2,
                type: 'normal',
                baseHp: 40,
                baseAttack: 22,
                baseDefense: 18,
                baseSpeed: 30
            },
            {
                name: '캐터피',
                level: Math.floor(Math.random() * 3) + 2,
                type: 'bug',
                baseHp: 45,
                baseAttack: 15,
                baseDefense: 15,
                baseSpeed: 25
            },
            {
                name: '뿔충이',
                level: Math.floor(Math.random() * 3) + 2,
                type: 'bug',
                baseHp: 40,
                baseAttack: 18,
                baseDefense: 16,
                baseSpeed: 28
            },
            {
                name: '참새',
                level: Math.floor(Math.random() * 3) + 3,
                type: 'flying',
                baseHp: 40,
                baseAttack: 30,
                baseDefense: 15,
                baseSpeed: 40
            }
        ];

        const chosen = wildPokemons[Math.floor(Math.random() * wildPokemons.length)];
        const level = chosen.level;

        return {
            name: chosen.name,
            level: level,
            hp: chosen.baseHp + level * 2,
            maxHp: chosen.baseHp + level * 2,
            attack: chosen.baseAttack + level,
            defense: chosen.baseDefense + level,
            speed: chosen.baseSpeed + level,
            type: chosen.type,
            moves: [
                { name: '몸통박치기', power: 35, type: 'normal' },
                { name: '할퀴기', power: 30, type: 'normal' }
            ]
        };
    }

    drawTile(x, y, tile) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        switch(tile) {
            case 0: // 풀
                this.ctx.fillStyle = '#90EE90';
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#7CCD7C';
                for (let i = 0; i < 5; i++) {
                    this.ctx.fillRect(px + Math.random() * this.tileSize,
                                     py + Math.random() * this.tileSize, 2, 3);
                }
                break;
            case 1: // 길
                this.ctx.fillStyle = '#D2B48C';
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#C19A6B';
                if (Math.random() < 0.1) {
                    this.ctx.fillRect(px + Math.random() * this.tileSize,
                                     py + Math.random() * this.tileSize, 3, 3);
                }
                break;
            case 2: // 나무
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#1a6b1a';
                this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8);
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(px + 12, py + 20, 8, 12);
                break;
            case 3: // 물
                this.ctx.fillStyle = '#4682B4';
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#5A9BD4';
                this.ctx.fillRect(px + 5, py + 5, 8, 4);
                this.ctx.fillRect(px + 18, py + 15, 6, 3);
                break;
            case 4: // 집
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#A0522D';
                this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(px + 10, py + 15, 12, 15);
                break;
            case 5: // 긴 풀 (야생 포켓몬)
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = '#32CD32';
                for (let i = 0; i < 8; i++) {
                    this.ctx.fillRect(px + Math.random() * this.tileSize,
                                     py + Math.random() * this.tileSize, 2, 6);
                }
                break;
        }
    }

    drawPlayer() {
        const px = this.player.x * this.tileSize;
        const py = this.player.y * this.tileSize;

        // 플레이어 몸통 (Red의 스프라이트 간단 버전)
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(px + 8, py + 12, 16, 14);

        // 플레이어 머리
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.fillRect(px + 10, py + 6, 12, 10);

        // 모자
        this.ctx.fillStyle = '#C00000';
        this.ctx.fillRect(px + 8, py + 4, 16, 6);

        // 다리
        this.ctx.fillStyle = '#0000FF';
        this.ctx.fillRect(px + 9, py + 26, 6, 6);
        this.ctx.fillRect(px + 17, py + 26, 6, 6);

        // 눈
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(px + 12, py + 10, 2, 2);
        this.ctx.fillRect(px + 18, py + 10, 2, 2);
    }

    drawPikachu() {
        const px = this.pikachu.x * this.tileSize;
        const py = this.pikachu.y * this.tileSize;

        // 피카츄 몸통
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(px + 10, py + 14, 12, 10);

        // 피카츄 머리
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(px + 11, py + 10, 10, 8);

        // 귀 (번개 모양)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(px + 9, py + 6, 3, 6);
        this.ctx.fillRect(px + 20, py + 6, 3, 6);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(px + 9, py + 6, 3, 2);
        this.ctx.fillRect(px + 20, py + 6, 3, 2);

        // 눈
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(px + 13, py + 13, 2, 2);
        this.ctx.fillRect(px + 17, py + 13, 2, 2);

        // 볼터치 (빨간 볼)
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(px + 10, py + 16, 3, 3);
        this.ctx.fillRect(px + 19, py + 16, 3, 3);

        // 꼬리 (번개 모양)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(px + 22, py + 12, 4, 8);
        this.ctx.fillRect(px + 24, py + 8, 3, 6);
    }

    drawUI() {
        // 상단 UI
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, 40);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px "Courier New"';
        this.ctx.fillText(`피카츄 Lv.${this.party[0].level}`, 10, 25);

        // HP 바
        const hpPercent = this.party[0].hp / this.party[0].maxHp;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(150, 10, 104, 24);
        this.ctx.fillStyle = hpPercent > 0.5 ? '#0F0' : hpPercent > 0.2 ? '#FF0' : '#F00';
        this.ctx.fillRect(152, 12, 100 * hpPercent, 20);

        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(`HP: ${this.party[0].hp}/${this.party[0].maxHp}`, 270, 25);

        // 걸음 수
        this.ctx.fillText(`걸음: ${this.stepCounter}`, 500, 25);

        // 조작 안내
        this.ctx.font = '14px "Courier New"';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, this.canvas.height - 30, this.canvas.width, 30);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText('이동: 화살표 키 또는 WASD | 긴 풀에서 야생 포켓몬 만나기!', 10, this.canvas.height - 10);
    }

    render() {
        // 배경 클리어
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'overworld') {
            // 맵 그리기
            for (let y = 0; y < this.map.length; y++) {
                for (let x = 0; x < this.map[y].length; x++) {
                    this.drawTile(x, y, this.map[y][x]);
                }
            }

            // 피카츄 먼저 그리기 (플레이어 뒤에)
            this.drawPikachu();

            // 플레이어 그리기
            this.drawPlayer();

            // UI 그리기
            this.drawUI();
        }
    }

    gameLoop() {
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 배틀 시스템
class BattleSystem {
    constructor(game) {
        this.game = game;
        this.enemy = null;
        this.playerPokemon = null;
        this.turn = 'player';
        this.battleUI = document.getElementById('battle-ui');
        this.messageBox = document.getElementById('battle-message');
    }

    start(wildPokemon) {
        this.game.gameState = 'battle';
        this.enemy = wildPokemon;
        this.playerPokemon = {...this.game.party[0]};
        this.turn = 'player';

        this.battleUI.style.display = 'block';
        this.updateUI();
        this.showMessage(`야생의 ${this.enemy.name}이(가) 나타났다!`);

        // 배틀 배경 그리기
        this.drawBattleScreen();
    }

    drawBattleScreen() {
        const ctx = this.game.ctx;

        // 배경
        const gradient = ctx.createLinearGradient(0, 0, 0, this.game.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // 적 포켓몬 플랫폼
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(500, 150, 150, 10);

        // 플레이어 포켓몬 플랫폼
        ctx.fillStyle = '#654321';
        ctx.fillRect(150, 350, 150, 10);

        // 적 포켓몬 그리기 (간단한 실루엣)
        this.drawEnemyPokemon(550, 80);

        // 피카츄 그리기
        this.drawPlayerPikachu(200, 280);
    }

    drawEnemyPokemon(x, y) {
        const ctx = this.game.ctx;

        // 포켓몬 타입에 따른 색상
        let color = '#8B8B8B';
        if (this.enemy.type === 'normal') color = '#A8A878';
        if (this.enemy.type === 'bug') color = '#A8B820';
        if (this.enemy.type === 'flying') color = '#A890F0';

        // 간단한 몸통
        ctx.fillStyle = color;
        ctx.fillRect(x, y + 20, 40, 40);

        // 머리
        ctx.fillRect(x + 5, y, 30, 30);

        // 눈
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 10, y + 10, 8, 8);
        ctx.fillRect(x + 25, y + 10, 8, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 12, y + 12, 4, 4);
        ctx.fillRect(x + 27, y + 12, 4, 4);

        // 이름과 레벨
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px "Courier New"';
        ctx.fillText(`${this.enemy.name} Lv.${this.enemy.level}`, x - 20, y - 10);
    }

    drawPlayerPikachu(x, y) {
        const ctx = this.game.ctx;

        // 피카츄 몸통 (더 큰 버전)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 10, y + 30, 40, 35);

        // 머리
        ctx.fillRect(x + 12, y + 10, 36, 30);

        // 귀
        ctx.fillRect(x + 8, y, 12, 20);
        ctx.fillRect(x + 40, y, 12, 20);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y, 12, 6);
        ctx.fillRect(x + 40, y, 12, 6);

        // 눈
        ctx.fillRect(x + 20, y + 20, 6, 6);
        ctx.fillRect(x + 34, y + 20, 6, 6);

        // 볼터치
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(x + 10, y + 30, 8, 8);
        ctx.fillRect(x + 42, y + 30, 8, 8);

        // 꼬리
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 50, y + 25, 15, 25);
        ctx.fillRect(x + 55, y + 15, 10, 20);
    }

    updateUI() {
        document.getElementById('enemy-pokemon').textContent =
            `${this.enemy.name} Lv.${this.enemy.level}`;
        document.getElementById('player-pokemon').textContent =
            `피카츄 Lv.${this.playerPokemon.level}`;

        this.updateHPBar('enemy', this.enemy.hp, this.enemy.maxHp);
        this.updateHPBar('player', this.playerPokemon.hp, this.playerPokemon.maxHp);

        document.getElementById('enemy-hp-text').textContent =
            `HP: ${this.enemy.hp}/${this.enemy.maxHp}`;
        document.getElementById('player-hp-text').textContent =
            `HP: ${this.playerPokemon.hp}/${this.playerPokemon.maxHp}`;

        this.drawBattleScreen();
    }

    updateHPBar(who, hp, maxHp) {
        const percent = Math.max(0, hp / maxHp);
        const hpBar = document.getElementById(`${who}-hp`);
        hpBar.style.width = (percent * 100) + '%';

        if (percent > 0.5) {
            hpBar.className = 'hp-fill';
        } else if (percent > 0.2) {
            hpBar.className = 'hp-fill low';
        } else {
            hpBar.className = 'hp-fill critical';
        }
    }

    showMessage(msg) {
        this.messageBox.textContent = msg;
    }

    attack() {
        if (this.turn !== 'player') return;

        const move = this.playerPokemon.moves[0]; // 첫 번째 기술 사용
        const damage = this.calculateDamage(this.playerPokemon, this.enemy, move);

        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        this.updateUI();
        this.showMessage(`피카츄의 ${move.name}! ${damage}의 데미지!`);

        if (this.enemy.hp <= 0) {
            setTimeout(() => this.win(), 1500);
            return;
        }

        this.turn = 'enemy';
        setTimeout(() => this.enemyTurn(), 1500);
    }

    enemyTurn() {
        const move = this.enemy.moves[0];
        const damage = this.calculateDamage(this.enemy, this.playerPokemon, move);

        this.playerPokemon.hp = Math.max(0, this.playerPokemon.hp - damage);
        this.updateUI();
        this.showMessage(`${this.enemy.name}의 ${move.name}! ${damage}의 데미지!`);

        if (this.playerPokemon.hp <= 0) {
            setTimeout(() => this.lose(), 1500);
            return;
        }

        this.turn = 'player';
    }

    calculateDamage(attacker, defender, move) {
        if (move.power === 0) return 0;

        const level = attacker.level;
        const attack = attacker.attack;
        const defense = defender.defense;
        const power = move.power;

        // 간단한 데미지 계산식
        let damage = ((2 * level / 5 + 2) * power * attack / defense) / 50 + 2;

        // 타입 상성 (간단 버전)
        if (move.type === 'electric' && defender.type === 'flying') damage *= 2;
        if (move.type === 'electric' && defender.type === 'bug') damage *= 0.5;

        // 랜덤 요소
        damage = Math.floor(damage * (Math.random() * 0.15 + 0.85));

        return Math.max(1, damage);
    }

    useItem() {
        this.showMessage('도구가 없습니다!');
    }

    switchPokemon() {
        this.showMessage('교체할 포켓몬이 없습니다!');
    }

    run() {
        if (Math.random() < 0.5) {
            this.showMessage('무사히 도망쳤다!');
            setTimeout(() => this.end(), 1000);
        } else {
            this.showMessage('도망칠 수 없다!');
            this.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 1500);
        }
    }

    win() {
        const expGain = this.enemy.level * 15;
        this.showMessage(`${this.enemy.name}을(를) 쓰러뜨렸다! 경험치 ${expGain}을 획득!`);

        // 경험치로 HP 약간 회복
        this.game.party[0].hp = Math.min(
            this.game.party[0].maxHp,
            this.game.party[0].hp + 5
        );

        setTimeout(() => this.end(), 2000);
    }

    lose() {
        this.showMessage('피카츄가 쓰러졌다! 포켓몬 센터로 이동합니다...');
        this.game.party[0].hp = this.game.party[0].maxHp;
        setTimeout(() => this.end(), 2000);
    }

    end() {
        this.battleUI.style.display = 'none';
        this.game.gameState = 'overworld';
        this.enemy = null;
    }
}

// 게임 시작
let game;
window.onload = () => {
    game = new PokemonGame();
};
