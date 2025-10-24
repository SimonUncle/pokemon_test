// 포켓몬스터 Yellow 버전 - Game Boy Style
// Game Boy Color 팔레트
const GB_COLORS = {
    LIGHTEST: '#9bbc0f',
    LIGHT: '#8bac0f',
    DARK: '#306230',
    DARKEST: '#0f380f'
};

class PokemonYellow {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 4; // 게임보이 해상도 160x144를 4배 확대
        this.width = 160;
        this.height = 144;

        this.gameState = 'overworld'; // 'overworld', 'battle', 'menu'
        this.textSpeed = 30; // 텍스트 타이핑 속도

        // 플레이어
        this.player = {
            x: 8,
            y: 8,
            direction: 'down',
            sprite: 0,
            animFrame: 0
        };

        // 피카츄 (따라오는 포켓몬)
        this.pikachu = {
            x: 8,
            y: 9,
            direction: 'down',
            targetX: 8,
            targetY: 9,
            animFrame: 0
        };

        // 플레이어 파티
        this.party = [{
            name: '피카츄',
            level: 5,
            hp: 20,
            maxHp: 20,
            attack: 12,
            defense: 8,
            speed: 18,
            exp: 0,
            type: 'electric'
        }];

        // 맵 생성 (20x18 타일)
        this.map = this.generateMap();
        this.tileSize = 8;

        // 카메라
        this.camera = { x: 0, y: 0 };

        // 입력
        this.keys = {};
        this.lastKeyTime = 0;
        this.keyDelay = 150;

        // 전투 시스템
        this.battle = null;

        // 컨트롤 설정
        this.setupControls();

        // 게임 루프 시작
        this.lastTime = 0;
        this.gameLoop(0);
    }

    generateMap() {
        const w = 20, h = 18;
        const map = [];

        for (let y = 0; y < h; y++) {
            const row = [];
            for (let x = 0; x < w; x++) {
                // 테두리는 나무
                if (x === 0 || x === w-1 || y === 0 || y === h-1) {
                    row.push(2);
                }
                // 길
                else if ((x >= 7 && x <= 12 && y >= 7 && y <= 10) ||
                         (x >= 9 && x <= 10 && y >= 4 && y <= 13)) {
                    row.push(1);
                }
                // 집
                else if (x >= 3 && x <= 5 && y >= 3 && y <= 5) {
                    row.push(4);
                }
                // 긴 풀 (야생 포켓몬)
                else if (Math.random() < 0.25 && x > 2 && x < w-2 && y > 2 && y < h-2) {
                    row.push(3);
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

                    // 피카츄 업데이트
                    setTimeout(() => {
                        this.pikachu.x = this.pikachu.targetX;
                        this.pikachu.y = this.pikachu.targetY;
                        this.pikachu.animFrame = (this.pikachu.animFrame + 1) % 2;
                    }, 75);

                    // 긴 풀에서 랜덤 인카운터
                    if (this.map[newY][newX] === 3 && Math.random() < 0.1) {
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
        return tile !== 2 && tile !== 4; // 나무, 집 통과 불가
    }

    startBattle() {
        this.gameState = 'battle';
        const wildPokemon = this.getRandomWildPokemon();
        this.battle = new Battle(this, wildPokemon);
    }

    getRandomWildPokemon() {
        const wilds = [
            { name: '꼬렛', level: 2, type: 'normal', hp: 12, atk: 6, def: 5, spd: 8 },
            { name: '구구', level: 3, type: 'flying', hp: 15, atk: 7, def: 6, spd: 9 },
            { name: '캐터피', level: 2, type: 'bug', hp: 18, atk: 4, def: 4, spd: 6 },
            { name: '뿔충이', level: 3, type: 'bug', hp: 16, atk: 5, def: 5, spd: 7 }
        ];

        const chosen = wilds[Math.floor(Math.random() * wilds.length)];
        return {
            name: chosen.name,
            level: chosen.level + Math.floor(Math.random() * 2),
            hp: chosen.hp + chosen.level,
            maxHp: chosen.hp + chosen.level,
            attack: chosen.atk + chosen.level,
            defense: chosen.def,
            speed: chosen.spd,
            type: chosen.type
        };
    }

    updateCamera() {
        // 카메라를 플레이어 중심으로
        this.camera.x = Math.floor(this.player.x * this.tileSize - this.width / 2);
        this.camera.y = Math.floor(this.player.y * this.tileSize - this.height / 2);

        // 카메라 경계 제한
        const maxX = this.map[0].length * this.tileSize - this.width;
        const maxY = this.map.length * this.tileSize - this.height;
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }

    drawTile(x, y, tile) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        switch(tile) {
            case 0: // 일반 풀
                this.ctx.fillStyle = GB_COLORS.LIGHT;
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                // 작은 점들
                this.ctx.fillStyle = GB_COLORS.DARK;
                if ((x + y) % 2 === 0) {
                    this.ctx.fillRect(px + 2, py + 2, 1, 1);
                    this.ctx.fillRect(px + 5, py + 4, 1, 1);
                }
                break;
            case 1: // 길
                this.ctx.fillStyle = GB_COLORS.LIGHTEST;
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = GB_COLORS.LIGHT;
                if ((x + y) % 3 === 0) {
                    this.ctx.fillRect(px + 3, py + 3, 2, 1);
                }
                break;
            case 2: // 나무
                this.ctx.fillStyle = GB_COLORS.DARK;
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = GB_COLORS.DARKEST;
                this.ctx.fillRect(px + 2, py + 1, 4, 5);
                this.ctx.fillStyle = GB_COLORS.DARK;
                this.ctx.fillRect(px + 3, py + 5, 2, 2);
                break;
            case 3: // 긴 풀 (야생 포켓몬)
                this.ctx.fillStyle = GB_COLORS.DARK;
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = GB_COLORS.LIGHT;
                this.ctx.fillRect(px + 1, py + 2, 1, 3);
                this.ctx.fillRect(px + 3, py + 1, 1, 4);
                this.ctx.fillRect(px + 5, py + 2, 1, 3);
                break;
            case 4: // 집
                this.ctx.fillStyle = GB_COLORS.DARKEST;
                this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                this.ctx.fillStyle = GB_COLORS.DARK;
                this.ctx.fillRect(px + 1, py + 1, 6, 6);
                this.ctx.fillStyle = GB_COLORS.LIGHT;
                this.ctx.fillRect(px + 3, py + 4, 2, 3);
                break;
        }
    }

    drawPlayer(x, y) {
        // 플레이어 (트레이너 스프라이트)
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // 머리
        this.ctx.fillStyle = GB_COLORS.DARKEST;
        this.ctx.fillRect(px + 2, py + 1, 4, 2);

        // 모자
        this.ctx.fillStyle = GB_COLORS.DARKEST;
        this.ctx.fillRect(px + 1, py, 6, 2);
        this.ctx.fillRect(px + 2, py + 2, 1, 1);
        this.ctx.fillRect(px + 5, py + 2, 1, 1);

        // 몸통
        this.ctx.fillStyle = GB_COLORS.DARKEST;
        this.ctx.fillRect(px + 2, py + 3, 4, 3);

        // 다리
        const offset = this.player.animFrame === 0 ? 0 : 1;
        this.ctx.fillRect(px + 2, py + 6, 1, 2);
        this.ctx.fillRect(px + 5, py + 6, 1, 2);
    }

    drawPikachu(x, y) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // 피카츄 몸통 (간단한 버전)
        this.ctx.fillStyle = GB_COLORS.LIGHT;
        this.ctx.fillRect(px + 2, py + 3, 4, 3);

        // 머리
        this.ctx.fillRect(px + 2, py + 2, 4, 2);

        // 귀
        this.ctx.fillRect(px + 1, py, 1, 2);
        this.ctx.fillRect(px + 6, py, 1, 2);
        this.ctx.fillStyle = GB_COLORS.DARKEST;
        this.ctx.fillRect(px + 1, py, 1, 1);
        this.ctx.fillRect(px + 6, py, 1, 1);

        // 눈
        this.ctx.fillStyle = GB_COLORS.DARKEST;
        this.ctx.fillRect(px + 2, py + 3, 1, 1);
        this.ctx.fillRect(px + 5, py + 3, 1, 1);

        // 볼
        this.ctx.fillStyle = GB_COLORS.DARK;
        this.ctx.fillRect(px + 1, py + 4, 1, 1);
        this.ctx.fillRect(px + 6, py + 4, 1, 1);

        // 꼬리
        this.ctx.fillStyle = GB_COLORS.LIGHT;
        this.ctx.fillRect(px + 6, py + 2, 2, 3);
    }

    drawOverworld() {
        this.updateCamera();

        // 배경
        this.ctx.fillStyle = GB_COLORS.LIGHTEST;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // 맵 그리기
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                this.drawTile(x, y, this.map[y][x]);
            }
        }

        // 피카츄 먼저 그리기
        this.drawPikachu(this.pikachu.x, this.pikachu.y);

        // 플레이어 그리기
        this.drawPlayer(this.player.x, this.player.y);

        this.ctx.restore();

        // UI
        this.drawUI();
    }

    drawUI() {
        // 상단 정보창
        this.ctx.fillStyle = GB_COLORS.LIGHTEST;
        this.ctx.fillRect(0, 0, this.width, 10);

        this.ctx.fillStyle = GB_COLORS.DARKEST;
        this.ctx.fillRect(0, 10, this.width, 1);

        // 텍스트
        this.drawText(`${this.party[0].name} Lv${this.party[0].level}`, 2, 2, GB_COLORS.DARKEST);
        this.drawText(`HP:${this.party[0].hp}/${this.party[0].maxHp}`, 100, 2, GB_COLORS.DARKEST);
    }

    drawText(text, x, y, color = GB_COLORS.DARKEST) {
        this.ctx.fillStyle = color;
        this.ctx.font = '8px monospace';
        this.ctx.fillText(text, x, y + 6);
    }

    drawTextBox(text, x, y, w, h) {
        // 텍스트 박스 배경
        this.ctx.fillStyle = GB_COLORS.LIGHTEST;
        this.ctx.fillRect(x, y, w, h);

        // 테두리
        this.ctx.strokeStyle = GB_COLORS.DARKEST;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, w, h);

        // 내부 테두리
        this.ctx.strokeStyle = GB_COLORS.DARK;
        this.ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    }

    render() {
        if (this.gameState === 'overworld') {
            this.drawOverworld();
        } else if (this.gameState === 'battle' && this.battle) {
            this.battle.render();
        }
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

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

        this.state = 'intro'; // 'intro', 'menu', 'fight_menu', 'attack', 'enemy_turn', 'end'
        this.message = `야생의 ${this.enemy.name}이(가)\n나타났다!`;
        this.messageIndex = 0;
        this.messageTimer = 0;
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
                this.menuCursor = this.menuCursor === 0 || this.menuCursor === 1 ? this.menuCursor : this.menuCursor - 2;
            } else if (key === 'ArrowDown' || key === 's') {
                this.menuCursor = this.menuCursor === 2 || this.menuCursor === 3 ? this.menuCursor : this.menuCursor + 2;
            } else if (key === 'ArrowLeft' || key === 'a') {
                if (this.menuCursor % 2 === 1) this.menuCursor--;
            } else if (key === 'ArrowRight' || key === 'd') {
                if (this.menuCursor % 2 === 0) this.menuCursor++;
            } else if (key === 'Enter' || key === ' ' || key === 'z') {
                this.selectMenu();
            }
        } else if (this.state === 'fight_menu') {
            if (key === 'ArrowUp' || key === 'w') {
                this.fightCursor = this.fightCursor === 0 || this.fightCursor === 1 ? this.fightCursor : this.fightCursor - 2;
            } else if (key === 'ArrowDown' || key === 's') {
                this.fightCursor = this.fightCursor === 2 || this.fightCursor === 3 ? this.fightCursor : this.fightCursor + 2;
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
            case 0: // FIGHT
                this.state = 'fight_menu';
                this.waitingForInput = true;
                break;
            case 1: // PKMN
                this.message = '다른 포켓몬이 없습니다!';
                this.messageIndex = 0;
                this.waitingForInput = false;
                setTimeout(() => {
                    this.state = 'menu';
                    this.waitingForInput = true;
                }, 1000);
                break;
            case 2: // ITEM
                this.message = '도구가 없습니다!';
                this.messageIndex = 0;
                this.waitingForInput = false;
                setTimeout(() => {
                    this.state = 'menu';
                    this.waitingForInput = true;
                }, 1000);
                break;
            case 3: // RUN
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
        this.messageIndex = 0;

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
        this.messageIndex = 0;

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
                    this.messageIndex = 0;
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
            this.messageIndex = 0;
            setTimeout(() => this.end(), 1500);
        } else {
            this.message = '도망칠 수 없다!';
            this.messageIndex = 0;
            setTimeout(() => this.enemyTurn(), 1500);
        }
    }

    win() {
        this.message = `야생의 ${this.enemy.name}을(를)\n쓰러뜨렸다!`;
        this.messageIndex = 0;
        this.game.party[0].hp = this.player.hp;
        setTimeout(() => this.end(), 2000);
    }

    lose() {
        this.message = '눈앞이 캄캄해졌다!';
        this.messageIndex = 0;
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
            this.messageIndex = 0;
            this.waitingForInput = true;
        }
    }

    render() {
        const ctx = this.game.ctx;
        const w = this.game.width;
        const h = this.game.height;

        // 배경
        ctx.fillStyle = GB_COLORS.LIGHTEST;
        ctx.fillRect(0, 0, w, h);

        // 적 포켓몬 플랫폼
        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(100, 45, 40, 3);

        // 플레이어 포켓몬 플랫폼
        ctx.fillStyle = GB_COLORS.DARKEST;
        ctx.fillRect(20, 85, 40, 3);

        // 적 포켓몬 스프라이트
        this.drawEnemyPokemon(110, 25);

        // 플레이어 피카츄 (뒷모습)
        this.drawPlayerPikachu(30, 65);

        // 적 포켓몬 정보창
        this.game.drawTextBox(75, 8, 80, 18);
        this.game.drawText(this.enemy.name, 80, 11);
        this.game.drawText(`Lv${this.enemy.level}`, 135, 11);
        this.drawHP(80, 18, 70, this.enemyHpDisplay, this.enemy.maxHp);

        // 플레이어 포켓몬 정보창
        this.game.drawTextBox(5, 55, 80, 26);
        this.game.drawText(this.player.name, 10, 58);
        this.game.drawText(`Lv${this.player.level}`, 65, 58);
        this.drawHP(10, 65, 70, this.playerHpDisplay, this.player.maxHp);
        this.game.drawText(`${Math.floor(this.playerHpDisplay)}/${this.player.maxHp}`, 50, 72);

        // 메시지 박스
        this.game.drawTextBox(5, h - 35, w - 10, 30);

        // 메시지 표시
        const lines = this.message.split('\n');
        lines.forEach((line, i) => {
            this.game.drawText(line, 10, h - 28 + i * 10);
        });

        // 메뉴 또는 기술 선택
        if (this.state === 'menu') {
            this.drawBattleMenu();
        } else if (this.state === 'fight_menu') {
            this.drawFightMenu();
        }

        // 커서 깜빡임
        if (this.waitingForInput && Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = GB_COLORS.DARKEST;
            ctx.fillRect(w - 12, h - 12, 5, 2);
        }
    }

    drawBattleMenu() {
        const ctx = this.game.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.game.drawTextBox(w - 75, h - 35, 70, 30);

        const menu = ['FIGHT', 'PKMN', 'ITEM', 'RUN'];
        menu.forEach((item, i) => {
            const x = w - 70 + (i % 2) * 35;
            const y = h - 28 + Math.floor(i / 2) * 12;
            this.game.drawText(item, x, y);

            if (i === this.menuCursor) {
                ctx.fillStyle = GB_COLORS.DARKEST;
                ctx.fillRect(x - 5, y + 2, 3, 2);
            }
        });
    }

    drawFightMenu() {
        const ctx = this.game.ctx;
        const w = this.game.width;
        const h = this.game.height;

        this.game.drawTextBox(w - 75, h - 35, 70, 30);

        this.moves.forEach((move, i) => {
            const x = w - 70 + (i % 2) * 35;
            const y = h - 28 + Math.floor(i / 2) * 12;
            this.game.drawText(move.name.substring(0, 7), x, y);

            if (i === this.fightCursor) {
                ctx.fillStyle = GB_COLORS.DARKEST;
                ctx.fillRect(x - 5, y + 2, 3, 2);
            }
        });
    }

    drawHP(x, y, w, hp, maxHp) {
        const ctx = this.game.ctx;

        // HP 바 배경
        ctx.fillStyle = GB_COLORS.DARKEST;
        ctx.fillRect(x, y, w, 3);

        // HP 바
        const hpWidth = Math.floor((hp / maxHp) * w);
        const hpColor = hp > maxHp * 0.5 ? GB_COLORS.LIGHT :
                       hp > maxHp * 0.2 ? GB_COLORS.LIGHT : GB_COLORS.DARK;
        ctx.fillStyle = hpColor;
        ctx.fillRect(x, y, hpWidth, 3);
    }

    drawEnemyPokemon(x, y) {
        const ctx = this.game.ctx;

        // 간단한 포켓몬 실루엣
        ctx.fillStyle = GB_COLORS.DARKEST;

        // 몸통
        ctx.fillRect(x, y + 10, 16, 12);

        // 머리
        ctx.fillRect(x + 2, y + 2, 12, 10);

        // 귀/뿔
        ctx.fillRect(x + 1, y, 4, 4);
        ctx.fillRect(x + 11, y, 4, 4);

        // 눈 (흰색)
        ctx.fillStyle = GB_COLORS.LIGHTEST;
        ctx.fillRect(x + 4, y + 5, 3, 3);
        ctx.fillRect(x + 10, y + 5, 3, 3);

        // 눈동자
        ctx.fillStyle = GB_COLORS.DARKEST;
        ctx.fillRect(x + 5, y + 6, 1, 1);
        ctx.fillRect(x + 11, y + 6, 1, 1);
    }

    drawPlayerPikachu(x, y) {
        const ctx = this.game.ctx;

        // 피카츄 뒷모습 (더 큰 버전)
        ctx.fillStyle = GB_COLORS.DARK;

        // 몸통
        ctx.fillRect(x + 4, y + 10, 16, 14);

        // 머리
        ctx.fillRect(x + 6, y + 4, 12, 10);

        // 귀
        ctx.fillRect(x + 4, y, 4, 8);
        ctx.fillRect(x + 16, y, 4, 8);
        ctx.fillStyle = GB_COLORS.DARKEST;
        ctx.fillRect(x + 4, y, 4, 3);
        ctx.fillRect(x + 16, y, 4, 3);

        // 꼬리
        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(x + 20, y + 6, 6, 10);
        ctx.fillRect(x + 24, y + 2, 4, 8);
    }
}

// 게임 시작
let game;
window.onload = () => {
    game = new PokemonYellow();
};
