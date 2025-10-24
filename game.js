// 포켓몬스터 Yellow 버전 - 실제 그래픽 스타일
// Game Boy Color 팔레트
const GB_COLORS = {
    WHITE: '#ffffff',
    LIGHT: '#c0c0c0',
    DARK: '#606060',
    BLACK: '#000000',
    // 풀/필드 색상
    GRASS_LIGHT: '#88d850',
    GRASS_DARK: '#5ca84e',
    // 피카츄 색상
    YELLOW: '#f8d030',
    YELLOW_DARK: '#f0b020',
    // 기타
    RED: '#f83028',
    BLUE: '#3890f8',
    BROWN: '#a85820'
};

class PokemonYellow {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // 게임보이 해상도 (160x144)
        this.baseWidth = 160;
        this.baseHeight = 144;

        // 화면 크기에 맞게 스케일 계산
        this.updateCanvasSize();
        window.addEventListener('resize', () => this.updateCanvasSize());

        this.gameState = 'overworld';

        // 플레이어
        this.player = {
            x: 10,
            y: 10,
            direction: 'down',
            animFrame: 0
        };

        // 피카츄
        this.pikachu = {
            x: 10,
            y: 11,
            direction: 'down',
            targetX: 10,
            targetY: 11,
            animFrame: 0
        };

        // 파티
        this.party = [{
            name: '피카츄',
            level: 5,
            hp: 20,
            maxHp: 20,
            attack: 12,
            defense: 8,
            speed: 18,
            type: 'electric'
        }];

        // 맵
        this.map = this.generateMap();
        this.tileSize = 16;

        // 카메라
        this.camera = { x: 0, y: 0 };

        // 입력
        this.keys = {};
        this.lastKeyTime = 0;
        this.keyDelay = 150;

        // 전투
        this.battle = null;

        this.setupControls();
        this.gameLoop(0);
    }

    updateCanvasSize() {
        const windowRatio = window.innerWidth / window.innerHeight;
        const gameRatio = this.baseWidth / this.baseHeight;

        if (windowRatio > gameRatio) {
            this.canvas.height = window.innerHeight;
            this.canvas.width = this.canvas.height * gameRatio;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = this.canvas.width / gameRatio;
        }

        this.scale = this.canvas.width / this.baseWidth;
    }

    generateMap() {
        const w = 30, h = 30;
        const map = [];

        for (let y = 0; y < h; y++) {
            const row = [];
            for (let x = 0; x < w; x++) {
                if (x === 0 || x === w-1 || y === 0 || y === h-1) {
                    row.push(2); // 나무
                } else if ((x >= 8 && x <= 15 && y >= 8 && y <= 12) ||
                          (x >= 10 && x <= 13 && y >= 5 && y <= 20)) {
                    row.push(1); // 길
                } else if (x >= 3 && x <= 6 && y >= 3 && y <= 6) {
                    row.push(4); // 건물
                } else if (Math.random() < 0.3 && x > 2 && x < w-2 && y > 2 && y < h-2) {
                    row.push(3); // 긴 풀
                } else {
                    row.push(0); // 일반 풀
                }
            }
            map.push(row);
        }
        return map;
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            const now = Date.now();

            if (this.gameState === 'battle' && this.battle) {
                this.battle.handleInput(e.key);
                return;
            }

            if (this.gameState === 'overworld' && now - this.lastKeyTime > this.keyDelay) {
                let newX = this.player.x;
                let newY = this.player.y;
                let moved = false;

                switch(e.key) {
                    case 'ArrowUp':
                    case 'w':
                        newY--;
                        this.player.direction = 'up';
                        moved = true;
                        break;
                    case 'ArrowDown':
                    case 's':
                        newY++;
                        this.player.direction = 'down';
                        moved = true;
                        break;
                    case 'ArrowLeft':
                    case 'a':
                        newX--;
                        this.player.direction = 'left';
                        moved = true;
                        break;
                    case 'ArrowRight':
                    case 'd':
                        newX++;
                        this.player.direction = 'right';
                        moved = true;
                        break;
                }

                if (moved && this.canMove(newX, newY)) {
                    this.lastKeyTime = now;
                    this.pikachu.targetX = this.player.x;
                    this.pikachu.targetY = this.player.y;
                    this.player.x = newX;
                    this.player.y = newY;
                    this.player.animFrame = (this.player.animFrame + 1) % 2;

                    setTimeout(() => {
                        this.pikachu.x = this.pikachu.targetX;
                        this.pikachu.y = this.pikachu.targetY;
                    }, 75);

                    if (this.map[newY][newX] === 3 && Math.random() < 0.15) {
                        setTimeout(() => this.startBattle(), 200);
                    }
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
        return tile !== 2 && tile !== 4;
    }

    startBattle() {
        this.gameState = 'battle';
        const wildPokemon = this.getRandomWildPokemon();
        this.battle = new Battle(this, wildPokemon);
    }

    getRandomWildPokemon() {
        const wilds = [
            { name: '꼬렛', level: 2, type: 'normal', hp: 15, atk: 8, def: 6, spd: 10 },
            { name: '구구', level: 3, type: 'flying', hp: 18, atk: 9, def: 7, spd: 11 },
            { name: '캐터피', level: 2, type: 'bug', hp: 20, atk: 5, def: 5, spd: 7 },
            { name: '뿔충이', level: 3, type: 'bug', hp: 18, atk: 7, def: 6, spd: 8 }
        ];

        const chosen = wilds[Math.floor(Math.random() * wilds.length)];
        return {
            name: chosen.name,
            level: chosen.level + Math.floor(Math.random() * 2),
            hp: chosen.hp + chosen.level * 2,
            maxHp: chosen.hp + chosen.level * 2,
            attack: chosen.atk + chosen.level,
            defense: chosen.def,
            speed: chosen.spd,
            type: chosen.type
        };
    }

    updateCamera() {
        const centerX = this.player.x * this.tileSize;
        const centerY = this.player.y * this.tileSize;

        this.camera.x = centerX - this.baseWidth / 2;
        this.camera.y = centerY - this.baseHeight / 2;

        const maxX = this.map[0].length * this.tileSize - this.baseWidth;
        const maxY = this.map.length * this.tileSize - this.baseHeight;

        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }

    drawTile(x, y, tile) {
        const px = Math.floor(x * this.tileSize);
        const py = Math.floor(y * this.tileSize);
        const size = this.tileSize;

        switch(tile) {
            case 0: // 일반 풀
                this.ctx.fillStyle = GB_COLORS.GRASS_LIGHT;
                this.ctx.fillRect(px, py, size, size);
                // 풀 디테일
                this.ctx.fillStyle = GB_COLORS.GRASS_DARK;
                if ((x + y) % 2 === 0) {
                    this.ctx.fillRect(px + 2, py + 4, 2, 3);
                    this.ctx.fillRect(px + 8, py + 2, 2, 3);
                    this.ctx.fillRect(px + 13, py + 5, 2, 3);
                }
                break;
            case 1: // 길
                this.ctx.fillStyle = GB_COLORS.LIGHT;
                this.ctx.fillRect(px, py, size, size);
                this.ctx.fillStyle = GB_COLORS.DARK;
                if ((x + y) % 3 === 0) {
                    this.ctx.fillRect(px + 4, py + 6, 3, 2);
                    this.ctx.fillRect(px + 10, py + 3, 2, 2);
                }
                break;
            case 2: // 나무
                this.ctx.fillStyle = GB_COLORS.GRASS_DARK;
                this.ctx.fillRect(px, py, size, size);
                // 나무 몸통
                this.ctx.fillStyle = GB_COLORS.BROWN;
                this.ctx.fillRect(px + 6, py + 8, 4, 6);
                // 나무 잎
                this.ctx.fillStyle = GB_COLORS.GRASS_DARK;
                this.ctx.fillRect(px + 3, py + 2, 10, 8);
                this.ctx.fillStyle = GB_COLORS.BLACK;
                this.ctx.fillRect(px + 4, py + 3, 8, 6);
                break;
            case 3: // 긴 풀
                this.ctx.fillStyle = GB_COLORS.GRASS_DARK;
                this.ctx.fillRect(px, py, size, size);
                // 긴 풀 디테일
                this.ctx.fillStyle = GB_COLORS.GRASS_LIGHT;
                for (let i = 0; i < 5; i++) {
                    this.ctx.fillRect(px + 2 + i * 3, py + 3, 2, 8);
                }
                break;
            case 4: // 건물
                this.ctx.fillStyle = GB_COLORS.RED;
                this.ctx.fillRect(px, py, size, size);
                this.ctx.fillStyle = GB_COLORS.BROWN;
                this.ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
                this.ctx.fillStyle = GB_COLORS.BLACK;
                this.ctx.fillRect(px + 6, py + 8, 4, 6);
                break;
        }
    }

    drawPlayer(x, y) {
        const px = Math.floor(x * this.tileSize);
        const py = Math.floor(y * this.tileSize);

        // 모자 (빨간색)
        this.ctx.fillStyle = GB_COLORS.RED;
        this.ctx.fillRect(px + 3, py + 1, 10, 5);
        this.ctx.fillRect(px + 2, py + 2, 12, 4);

        // 모자 흰색 부분
        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.fillRect(px + 4, py + 3, 8, 2);

        // 얼굴
        this.ctx.fillStyle = GB_COLORS.LIGHT;
        this.ctx.fillRect(px + 5, py + 6, 6, 5);

        // 눈
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 6, py + 8, 1, 1);
        this.ctx.fillRect(px + 9, py + 8, 1, 1);

        // 몸통 (빨간색 셔츠)
        this.ctx.fillStyle = GB_COLORS.RED;
        this.ctx.fillRect(px + 4, py + 11, 8, 6);

        // 팔
        this.ctx.fillStyle = GB_COLORS.RED;
        this.ctx.fillRect(px + 2, py + 12, 3, 4);
        this.ctx.fillRect(px + 11, py + 12, 3, 4);

        // 바지 (파란색)
        this.ctx.fillStyle = GB_COLORS.BLUE;
        this.ctx.fillRect(px + 5, py + 17, 3, 5);
        this.ctx.fillRect(px + 8, py + 17, 3, 5);

        // 신발
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 4, py + 21, 4, 2);
        this.ctx.fillRect(px + 8, py + 21, 4, 2);
    }

    drawPikachu(x, y) {
        const px = Math.floor(x * this.tileSize);
        const py = Math.floor(y * this.tileSize);

        // 귀
        this.ctx.fillStyle = GB_COLORS.YELLOW;
        this.ctx.fillRect(px + 2, py + 1, 3, 8);
        this.ctx.fillRect(px + 11, py + 1, 3, 8);
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 2, py + 1, 3, 3);
        this.ctx.fillRect(px + 11, py + 1, 3, 3);

        // 머리
        this.ctx.fillStyle = GB_COLORS.YELLOW;
        this.ctx.fillRect(px + 4, py + 5, 8, 6);
        this.ctx.fillRect(px + 3, py + 6, 10, 5);

        // 눈
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 5, py + 8, 2, 2);
        this.ctx.fillRect(px + 9, py + 8, 2, 2);

        // 볼 (빨간색)
        this.ctx.fillStyle = GB_COLORS.RED;
        this.ctx.fillRect(px + 3, py + 9, 2, 2);
        this.ctx.fillRect(px + 11, py + 9, 2, 2);

        // 몸통
        this.ctx.fillStyle = GB_COLORS.YELLOW;
        this.ctx.fillRect(px + 4, py + 11, 8, 7);

        // 팔
        this.ctx.fillRect(px + 2, py + 12, 3, 4);
        this.ctx.fillRect(px + 11, py + 12, 3, 4);

        // 다리
        this.ctx.fillRect(px + 5, py + 18, 2, 4);
        this.ctx.fillRect(px + 9, py + 18, 2, 4);

        // 꼬리
        this.ctx.fillRect(px + 12, py + 9, 3, 6);
        this.ctx.fillRect(px + 13, py + 7, 2, 4);
    }

    drawOverworld() {
        this.updateCamera();

        // 스케일 적용
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        // 배경
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);

        this.ctx.save();
        this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

        // 맵
        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(this.baseWidth / this.tileSize) + 1, this.map[0].length);
        const endY = Math.min(startY + Math.ceil(this.baseHeight / this.tileSize) + 1, this.map.length);

        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                this.drawTile(x, y, this.map[y][x]);
            }
        }

        // 피카츄
        this.drawPikachu(this.pikachu.x, this.pikachu.y);

        // 플레이어
        this.drawPlayer(this.player.x, this.player.y);

        this.ctx.restore();

        // UI
        this.drawUI();

        this.ctx.restore();
    }

    drawUI() {
        // 상단 정보창
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.baseWidth, 20);

        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.font = 'bold 10px monospace';
        this.ctx.fillText(`${this.party[0].name} Lv.${this.party[0].level}`, 5, 12);
        this.ctx.fillText(`HP: ${this.party[0].hp}/${this.party[0].maxHp}`, 80, 12);
    }

    render() {
        if (this.gameState === 'overworld') {
            this.drawOverworld();
        } else if (this.gameState === 'battle' && this.battle) {
            this.battle.render();
        }
    }

    gameLoop(timestamp) {
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// 전투 시스템
class Battle {
    constructor(game, wildPokemon) {
        this.game = game;
        this.enemy = wildPokemon;
        this.player = {...game.party[0]};

        this.state = 'intro';
        this.message = `야생의 ${this.enemy.name}이(가)\n나타났다!`;
        this.waitingForInput = false;

        this.menuCursor = 0;
        this.fightCursor = 0;

        this.moves = [
            { name: '전기충격', power: 40, type: 'electric' },
            { name: '몸통박치기', power: 35, type: 'normal' },
            { name: '꼬리흔들기', power: 0, type: 'status' },
            { name: '울음소리', power: 0, type: 'status' }
        ];

        this.enemyHpDisplay = this.enemy.hp;
        this.playerHpDisplay = this.player.hp;
    }

    handleInput(key) {
        if (!this.waitingForInput) return;

        if (this.state === 'menu') {
            if (key === 'ArrowUp' || key === 'w') {
                this.menuCursor = this.menuCursor < 2 ? this.menuCursor : this.menuCursor - 2;
            } else if (key === 'ArrowDown' || key === 's') {
                this.menuCursor = this.menuCursor >= 2 ? this.menuCursor : this.menuCursor + 2;
            } else if (key === 'ArrowLeft' || key === 'a') {
                if (this.menuCursor % 2 === 1) this.menuCursor--;
            } else if (key === 'ArrowRight' || key === 'd') {
                if (this.menuCursor % 2 === 0) this.menuCursor++;
            } else if (key === 'Enter' || key === ' ' || key === 'z') {
                this.selectMenu();
            }
        } else if (this.state === 'fight_menu') {
            if (key === 'ArrowUp' || key === 'w') {
                this.fightCursor = this.fightCursor < 2 ? this.fightCursor : this.fightCursor - 2;
            } else if (key === 'ArrowDown' || key === 's') {
                this.fightCursor = this.fightCursor >= 2 ? this.fightCursor : this.fightCursor + 2;
            } else if (key === 'ArrowLeft' || key === 'a') {
                if (this.fightCursor % 2 === 1) this.fightCursor--;
            } else if (key === 'ArrowRight' || key === 'd') {
                if (this.fightCursor % 2 === 0) this.fightCursor++;
            } else if (key === 'Enter' || key === ' ' || key === 'z') {
                this.selectMove();
            } else if (key === 'Escape' || key === 'x') {
                this.state = 'menu';
            }
        } else if (key === 'Enter' || key === ' ' || key === 'z') {
            this.advanceMessage();
        }
    }

    selectMenu() {
        this.waitingForInput = false;
        switch(this.menuCursor) {
            case 0:
                this.state = 'fight_menu';
                this.waitingForInput = true;
                break;
            case 1:
                this.message = '다른 포켓몬이 없습니다!';
                setTimeout(() => {
                    this.state = 'menu';
                    this.waitingForInput = true;
                }, 1000);
                break;
            case 2:
                this.message = '도구가 없습니다!';
                setTimeout(() => {
                    this.state = 'menu';
                    this.waitingForInput = true;
                }, 1000);
                break;
            case 3:
                this.tryRun();
                break;
        }
    }

    selectMove() {
        const move = this.moves[this.fightCursor];
        this.waitingForInput = false;
        this.state = 'attack';
        this.playerAttack(move);
    }

    playerAttack(move) {
        this.message = `피카츄의\n${move.name}!`;

        setTimeout(() => {
            if (move.power > 0) {
                const damage = this.calculateDamage(this.player, this.enemy, move);
                this.enemy.hp = Math.max(0, this.enemy.hp - damage);
                this.animateHPBar('enemy', damage);

                if (this.enemy.hp <= 0) {
                    setTimeout(() => this.win(), 1000);
                } else {
                    setTimeout(() => this.enemyTurn(), 1000);
                }
            } else {
                setTimeout(() => this.enemyTurn(), 800);
            }
        }, 1000);
    }

    enemyTurn() {
        this.state = 'enemy_turn';
        this.message = `${this.enemy.name}의\n몸통박치기!`;

        setTimeout(() => {
            const damage = Math.floor(Math.random() * 8) + 4;
            this.player.hp = Math.max(0, this.player.hp - damage);
            this.animateHPBar('player', damage);

            if (this.player.hp <= 0) {
                setTimeout(() => this.lose(), 1000);
            } else {
                setTimeout(() => {
                    this.state = 'menu';
                    this.message = '무엇을 할까?';
                    this.waitingForInput = true;
                }, 1000);
            }
        }, 1000);
    }

    animateHPBar(who, damage) {
        const target = who === 'enemy' ? this.enemy.hp : this.player.hp;
        const interval = setInterval(() => {
            if (who === 'enemy') {
                if (this.enemyHpDisplay > target) {
                    this.enemyHpDisplay--;
                } else {
                    clearInterval(interval);
                }
            } else {
                if (this.playerHpDisplay > target) {
                    this.playerHpDisplay--;
                } else {
                    clearInterval(interval);
                }
            }
        }, 30);
    }

    calculateDamage(attacker, defender, move) {
        const level = attacker.level;
        const attack = attacker.attack;
        const defense = defender.defense;
        const power = move.power;

        let damage = ((2 * level / 5 + 2) * power * attack / defense) / 50 + 2;
        damage = Math.floor(damage * (Math.random() * 0.15 + 0.85));

        return Math.max(1, Math.floor(damage));
    }

    tryRun() {
        if (Math.random() < 0.5) {
            this.message = '무사히 도망쳤다!';
            setTimeout(() => this.end(), 1500);
        } else {
            this.message = '도망칠 수 없다!';
            setTimeout(() => this.enemyTurn(), 1500);
        }
    }

    win() {
        this.message = `야생의 ${this.enemy.name}을(를)\n쓰러뜨렸다!`;
        this.game.party[0].hp = this.player.hp;
        setTimeout(() => this.end(), 2000);
    }

    lose() {
        this.message = '눈앞이 캄캄해졌다!';
        this.game.party[0].hp = this.game.party[0].maxHp;
        setTimeout(() => this.end(), 2000);
    }

    end() {
        this.game.gameState = 'overworld';
        this.game.battle = null;
    }

    advanceMessage() {
        if (this.state === 'intro') {
            this.state = 'menu';
            this.message = '무엇을 할까?';
            this.waitingForInput = true;
        }
    }

    render() {
        const ctx = this.game.ctx;

        ctx.save();
        ctx.scale(this.game.scale, this.game.scale);

        const w = this.game.baseWidth;
        const h = this.game.baseHeight;

        // 배경
        ctx.fillStyle = GB_COLORS.WHITE;
        ctx.fillRect(0, 0, w, h);

        // 그라데이션 배경
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 적 포켓몬 플랫폼
        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(100, 50, 40, 4);
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(100, 54, 40, 2);

        // 플레이어 포켓몬 플랫폼
        ctx.fillStyle = GB_COLORS.BROWN;
        ctx.fillRect(20, 90, 45, 4);
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(20, 94, 45, 2);

        // 적 포켓몬
        this.drawEnemyPokemon(110, 25);

        // 플레이어 피카츄
        this.drawPlayerPikachu(30, 65);

        // 적 정보창
        this.drawInfoBox(80, 10, 70, 22, this.enemy.name, this.enemy.level, this.enemyHpDisplay, this.enemy.maxHp, false);

        // 플레이어 정보창
        this.drawInfoBox(10, 58, 70, 28, this.player.name, this.player.level, this.playerHpDisplay, this.player.maxHp, true);

        // 메시지 박스
        this.drawTextBox(5, h - 40, w - 10, 35);
        const lines = this.message.split('\n');
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 10px monospace';
        lines.forEach((line, i) => {
            ctx.fillText(line, 12, h - 26 + i * 12);
        });

        // 메뉴
        if (this.state === 'menu') {
            this.drawBattleMenu();
        } else if (this.state === 'fight_menu') {
            this.drawFightMenu();
        }

        // 커서
        if (this.waitingForInput && Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = GB_COLORS.BLACK;
            ctx.fillRect(w - 15, h - 15, 6, 3);
        }

        ctx.restore();
    }

    drawInfoBox(x, y, w, h, name, level, hp, maxHp, showHpNum) {
        const ctx = this.game.ctx;

        // 박스
        ctx.fillStyle = GB_COLORS.WHITE;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = GB_COLORS.BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        // 텍스트
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(name, x + 5, y + 12);
        ctx.fillText(`Lv${level}`, x + w - 25, y + 12);

        // HP 바
        const hpBarY = showHpNum ? y + 18 : y + 16;
        this.drawHPBar(x + 5, hpBarY, w - 10, hp, maxHp);

        if (showHpNum) {
            ctx.fillText(`${Math.floor(hp)}/${maxHp}`, x + w - 35, y + 26);
        }
    }

    drawHPBar(x, y, w, hp, maxHp) {
        const ctx = this.game.ctx;

        // 배경
        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(x, y, w, 4);

        // HP
        const hpWidth = Math.floor((hp / maxHp) * w);
        const hpColor = hp > maxHp * 0.5 ? '#00ff00' :
                       hp > maxHp * 0.2 ? '#ffff00' : '#ff0000';
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, hpWidth, 4);
    }

    drawTextBox(x, y, w, h) {
        const ctx = this.game.ctx;

        ctx.fillStyle = GB_COLORS.WHITE;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = GB_COLORS.BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.strokeStyle = GB_COLORS.DARK;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    }

    drawBattleMenu() {
        const ctx = this.game.ctx;
        const w = this.game.baseWidth;
        const h = this.game.baseHeight;

        this.drawTextBox(w - 80, h - 40, 75, 35);

        const menu = ['FIGHT', 'PKMN', 'ITEM', 'RUN'];
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 10px monospace';

        menu.forEach((item, i) => {
            const mx = w - 72 + (i % 2) * 37;
            const my = h - 28 + Math.floor(i / 2) * 14;
            ctx.fillText(item, mx, my);

            if (i === this.menuCursor) {
                ctx.fillStyle = GB_COLORS.BLACK;
                ctx.fillRect(mx - 8, my - 6, 5, 2);
                ctx.fillStyle = GB_COLORS.BLACK;
            }
        });
    }

    drawFightMenu() {
        const ctx = this.game.ctx;
        const w = this.game.baseWidth;
        const h = this.game.baseHeight;

        this.drawTextBox(w - 80, h - 40, 75, 35);

        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 9px monospace';

        this.moves.forEach((move, i) => {
            const mx = w - 72 + (i % 2) * 37;
            const my = h - 28 + Math.floor(i / 2) * 14;
            ctx.fillText(move.name.substring(0, 8), mx, my);

            if (i === this.fightCursor) {
                ctx.fillRect(mx - 8, my - 6, 5, 2);
            }
        });
    }

    drawEnemyPokemon(x, y) {
        const ctx = this.game.ctx;

        // 몸통
        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(x, y + 15, 25, 18);

        // 머리
        ctx.fillRect(x + 3, y + 5, 19, 15);

        // 귀
        ctx.fillRect(x + 2, y + 2, 5, 7);
        ctx.fillRect(x + 18, y + 2, 5, 7);

        // 눈 (흰색)
        ctx.fillStyle = GB_COLORS.WHITE;
        ctx.fillRect(x + 6, y + 10, 5, 5);
        ctx.fillRect(x + 14, y + 10, 5, 5);

        // 눈동자
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(x + 7, y + 12, 2, 2);
        ctx.fillRect(x + 15, y + 12, 2, 2);

        // 입
        ctx.fillRect(x + 10, y + 16, 5, 2);
    }

    drawPlayerPikachu(x, y) {
        const ctx = this.game.ctx;

        // 피카츄 뒷모습
        ctx.fillStyle = GB_COLORS.YELLOW;

        // 귀
        ctx.fillRect(x + 3, y, 5, 12);
        ctx.fillRect(x + 22, y, 5, 12);
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(x + 3, y, 5, 4);
        ctx.fillRect(x + 22, y, 5, 4);

        // 머리
        ctx.fillStyle = GB_COLORS.YELLOW;
        ctx.fillRect(x + 6, y + 5, 18, 10);

        // 몸통
        ctx.fillRect(x + 6, y + 15, 18, 14);

        // 줄무늬
        ctx.fillStyle = GB_COLORS.YELLOW_DARK;
        ctx.fillRect(x + 8, y + 20, 14, 2);
        ctx.fillRect(x + 8, y + 24, 14, 2);

        // 꼬리
        ctx.fillStyle = GB_COLORS.YELLOW;
        ctx.fillRect(x + 24, y + 10, 6, 12);
        ctx.fillRect(x + 27, y + 6, 5, 10);
    }
}

// 게임 시작
let game;
window.onload = () => {
    game = new PokemonYellow();
};
