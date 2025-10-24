// 포켓몬스터 Yellow 버전 - 완전판
// Game Boy Color 팔레트
const GB_COLORS = {
    WHITE: '#ffffff',
    LIGHT: '#c0c0c0',
    DARK: '#606060',
    BLACK: '#000000',
    GRASS_LIGHT: '#88d850',
    GRASS_DARK: '#5ca84e',
    YELLOW: '#f8d030',
    YELLOW_DARK: '#f0b020',
    RED: '#f83028',
    BLUE: '#3890f8',
    BROWN: '#a85820',
    PURPLE: '#a040a0',
    ORANGE: '#f08030'
};

class PokemonYellow {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.baseWidth = 160;
        this.baseHeight = 144;

        this.updateCanvasSize();
        window.addEventListener('resize', () => this.updateCanvasSize());

        this.gameState = 'overworld';

        // 플레이어
        this.player = {
            x: 15,
            y: 20,
            direction: 'down',
            animFrame: 0,
            money: 3000
        };

        // 피카츄
        this.pikachu = {
            x: 15,
            y: 21,
            direction: 'down',
            targetX: 15,
            targetY: 21
        };

        // 파티
        this.party = [{
            name: '피카츄',
            level: 10,
            hp: 35,
            maxHp: 35,
            attack: 20,
            defense: 12,
            speed: 25,
            type: 'electric',
            moves: [
                { name: '전기충격', power: 40, type: 'electric', pp: 30, maxPp: 30 },
                { name: '몸통박치기', power: 40, type: 'normal', pp: 35, maxPp: 35 },
                { name: '전광석화', power: 40, type: 'normal', pp: 30, maxPp: 30 },
                { name: '10만볼트', power: 90, type: 'electric', pp: 15, maxPp: 15 }
            ]
        }];

        // 맵
        this.map = this.generateMap();
        this.tileSize = 16;

        // NPC 및 트레이너
        this.npcs = this.generateNPCs();
        this.defeatedTrainers = new Set();

        // 카메라
        this.camera = { x: 0, y: 0 };

        // 입력
        this.keys = {};
        this.lastKeyTime = 0;
        this.keyDelay = 150;

        // 전투
        this.battle = null;

        // 배지
        this.badges = [];

        // 체육관 입장 플래그
        this.gymEntered = false;

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
        const w = 40, h = 40;
        const map = [];

        for (let y = 0; y < h; y++) {
            const row = [];
            for (let x = 0; x < w; x++) {
                if (x === 0 || x === w-1 || y === 0 || y === h-1) {
                    row.push(2); // 나무
                }
                // 체육관 (왼쪽 위)
                else if (x >= 5 && x <= 10 && y >= 5 && y <= 9) {
                    row.push(6); // 체육관
                }
                // 포켓몬 센터 (오른쪽 위)
                else if (x >= 25 && x <= 30 && y >= 5 && y <= 9) {
                    row.push(5); // 포켓몬 센터
                }
                // 길
                else if ((x >= 11 && x <= 24 && y >= 7 && y <= 9) ||
                         (x >= 13 && x <= 16 && y >= 5 && y <= 25) ||
                         (x >= 10 && x <= 20 && y >= 18 && y <= 20)) {
                    row.push(1);
                }
                // 집들
                else if ((x >= 18 && x <= 21 && y >= 12 && y <= 15) ||
                         (x >= 25 && x <= 28 && y >= 22 && y <= 25)) {
                    row.push(4);
                }
                // 긴 풀
                else if (Math.random() < 0.25 && x > 2 && x < w-2 && y > 10 && y < h-2) {
                    row.push(3);
                }
                else {
                    row.push(0); // 일반 풀
                }
            }
            map.push(row);
        }
        return map;
    }

    generateNPCs() {
        return [
            // 트레이너들
            { x: 14, y: 15, type: 'trainer', name: '꼬마', defeated: false, battleStarted: false, direction: 'down',
              pokemon: [
                { name: '뿔충이', level: 9, hp: 28, maxHp: 28, attack: 12, defense: 10, speed: 15, type: 'bug',
                  moves: [
                    { name: '몸통박치기', power: 40, type: 'normal' },
                    { name: '할퀴기', power: 35, type: 'normal' }
                  ]
                }
              ]
            },
            { x: 15, y: 22, type: 'trainer', name: '단발소녀', defeated: false, battleStarted: false, direction: 'left',
              pokemon: [
                { name: '참새', level: 10, hp: 30, maxHp: 30, attack: 15, defense: 8, speed: 18, type: 'flying',
                  moves: [
                    { name: '쪼기', power: 35, type: 'flying' },
                    { name: '울음소리', power: 0, type: 'normal' }
                  ]
                }
              ]
            },
            { x: 18, y: 19, type: 'trainer', name: '반바지소년', defeated: false, battleStarted: false, direction: 'right',
              pokemon: [
                { name: '꼬렛', level: 8, hp: 26, maxHp: 26, attack: 10, defense: 9, speed: 12, type: 'normal',
                  moves: [
                    { name: '몸통박치기', power: 40, type: 'normal' },
                    { name: '꼬리흔들기', power: 0, type: 'normal' }
                  ]
                },
                { name: '꼬렛', level: 9, hp: 28, maxHp: 28, attack: 11, defense: 10, speed: 13, type: 'normal',
                  moves: [
                    { name: '몸통박치기', power: 40, type: 'normal' },
                    { name: '전광석화', power: 40, type: 'normal' }
                  ]
                }
              ]
            },
            // 체육관 관장
            { x: 7, y: 7, type: 'gym_leader', name: '웅이', defeated: false, battleStarted: false, direction: 'down',
              badge: 'boulder',
              pokemon: [
                { name: '꼬마돌', level: 12, hp: 40, maxHp: 40, attack: 25, defense: 30, speed: 10, type: 'rock',
                  moves: [
                    { name: '몸통박치기', power: 40, type: 'normal' },
                    { name: '둥글게말기', power: 0, type: 'rock' }
                  ]
                },
                { name: '롱스톤', level: 14, hp: 50, maxHp: 50, attack: 30, defense: 35, speed: 12, type: 'rock',
                  moves: [
                    { name: '바위떨구기', power: 50, type: 'rock' },
                    { name: '몸통박치기', power: 40, type: 'normal' }
                  ]
                }
              ]
            },
            // 포켓몬 센터 간호사
            { x: 27, y: 7, type: 'nurse', name: '간호사', defeated: false, battleStarted: false, direction: 'down' }
        ];
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            const now = Date.now();

            if (this.gameState === 'battle' && this.battle) {
                this.battle.handleInput(e.key);
                return;
            }

            if (this.gameState === 'dialog') {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'z') {
                    this.closeDialog();
                }
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
                    case 'Enter':
                    case ' ':
                    case 'z':
                        this.interact();
                        return;
                }

                if (moved && this.canMove(newX, newY)) {
                    this.lastKeyTime = now;
                    this.pikachu.targetX = this.player.x;
                    this.pikachu.targetY = this.player.y;
                    this.player.x = newX;
                    this.player.y = newY;

                    setTimeout(() => {
                        this.pikachu.x = this.pikachu.targetX;
                        this.pikachu.y = this.pikachu.targetY;
                    }, 75);

                    // 트레이너 시야 체크
                    this.checkTrainerSight();

                    // 긴 풀에서 랜덤 인카운터
                    if (this.map[newY][newX] === 3 && Math.random() < 0.15) {
                        setTimeout(() => this.startWildBattle(), 200);
                    }

                    // 체육관 입장 (한 번만)
                    const oldTile = this.map[this.player.y - (newY - this.player.y)][this.player.x - (newX - this.player.x)];
                    if (this.map[newY][newX] === 6 && oldTile !== 6 && !this.gymEntered) {
                        this.gymEntered = true;
                        this.showDialog('체육관에 오신 것을 환영합니다!');
                    }
                    // 체육관을 나가면 플래그 리셋
                    if (this.map[newY][newX] !== 6 && oldTile === 6) {
                        this.gymEntered = false;
                    }

                    // 포켓몬 센터
                    if (this.map[newY][newX] === 5) {
                        this.healParty();
                    }
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    interact() {
        // 앞에 있는 NPC와 상호작용
        let frontX = this.player.x;
        let frontY = this.player.y;

        switch(this.player.direction) {
            case 'up': frontY--; break;
            case 'down': frontY++; break;
            case 'left': frontX--; break;
            case 'right': frontX++; break;
        }

        const npc = this.npcs.find(n => n.x === frontX && n.y === frontY);
        if (npc) {
            this.interactWithNPC(npc);
        }
    }

    interactWithNPC(npc) {
        if (npc.type === 'nurse') {
            this.healParty();
            return;
        }

        if (npc.type === 'trainer' || npc.type === 'gym_leader') {
            if (npc.defeated) {
                this.showDialog(`${npc.name}: 다음에 또 승부하자!`);
            } else {
                // 즉시 전투 시작
                this.startTrainerBattle(npc);
            }
        }
    }

    checkTrainerSight() {
        // 이미 전투 중이거나 전투 준비 중이면 무시
        if (this.gameState !== 'overworld') return;

        for (let npc of this.npcs) {
            if (npc.type !== 'trainer' && npc.type !== 'gym_leader') continue;
            if (npc.defeated) continue;
            if (npc.battleStarted) continue; // 이미 전투 시작된 트레이너

            const sightRange = 3;
            let inSight = false;

            switch(npc.direction) {
                case 'up':
                    inSight = npc.x === this.player.x &&
                             this.player.y < npc.y &&
                             npc.y - this.player.y <= sightRange;
                    break;
                case 'down':
                    inSight = npc.x === this.player.x &&
                             this.player.y > npc.y &&
                             this.player.y - npc.y <= sightRange;
                    break;
                case 'left':
                    inSight = npc.y === this.player.y &&
                             this.player.x < npc.x &&
                             npc.x - this.player.x <= sightRange;
                    break;
                case 'right':
                    inSight = npc.y === this.player.y &&
                             this.player.x > npc.x &&
                             this.player.x - npc.x <= sightRange;
                    break;
            }

            if (inSight) {
                npc.battleStarted = true; // 플래그 설정
                this.startTrainerBattle(npc);
                break;
            }
        }
    }

    healParty() {
        this.party.forEach(p => {
            p.hp = p.maxHp;
            if (p.moves) {
                p.moves.forEach(m => m.pp = m.maxPp);
            }
        });
        this.showDialog('포켓몬들이 완전히 회복되었습니다!');
    }

    showDialog(text) {
        this.gameState = 'dialog';
        this.dialogText = text;
    }

    closeDialog() {
        this.gameState = 'overworld';
        this.dialogText = null;
    }

    canMove(x, y) {
        if (x < 0 || x >= this.map[0].length || y < 0 || y >= this.map.length) {
            return false;
        }
        const tile = this.map[y][x];

        // NPC 충돌 체크
        const npc = this.npcs.find(n => n.x === x && n.y === y);
        if (npc) return false;

        return tile !== 2 && tile !== 4;
    }

    startWildBattle() {
        const wildPokemon = this.getRandomWildPokemon();
        this.gameState = 'battle';
        this.battle = new Battle(this, wildPokemon, 'wild');
    }

    startTrainerBattle(trainer) {
        this.gameState = 'battle';
        this.battle = new Battle(this, trainer.pokemon[0], 'trainer', trainer);
    }

    getRandomWildPokemon() {
        const wilds = [
            { name: '꼬렛', level: 3, type: 'normal', hp: 18, atk: 10, def: 8, spd: 12 },
            { name: '구구', level: 5, type: 'flying', hp: 22, atk: 12, def: 10, spd: 14 },
            { name: '캐터피', level: 3, type: 'bug', hp: 25, atk: 8, def: 8, spd: 10 },
            { name: '뿔충이', level: 4, type: 'bug', hp: 20, atk: 10, def: 9, spd: 11 },
            { name: '참새', level: 5, type: 'flying', hp: 20, atk: 14, def: 8, spd: 16 }
        ];

        const chosen = wilds[Math.floor(Math.random() * wilds.length)];
        const level = chosen.level + Math.floor(Math.random() * 3);

        return {
            name: chosen.name,
            level: level,
            hp: chosen.hp + level * 2,
            maxHp: chosen.hp + level * 2,
            attack: chosen.atk + level,
            defense: chosen.def,
            speed: chosen.spd,
            type: chosen.type,
            moves: [
                { name: '몸통박치기', power: 40, type: 'normal' },
                { name: '할퀴기', power: 35, type: 'normal' }
            ]
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
                this.ctx.fillStyle = GB_COLORS.BROWN;
                this.ctx.fillRect(px + 6, py + 8, 4, 6);
                this.ctx.fillStyle = GB_COLORS.GRASS_DARK;
                this.ctx.fillRect(px + 3, py + 2, 10, 8);
                this.ctx.fillStyle = GB_COLORS.BLACK;
                this.ctx.fillRect(px + 4, py + 3, 8, 6);
                break;
            case 3: // 긴 풀
                this.ctx.fillStyle = GB_COLORS.GRASS_DARK;
                this.ctx.fillRect(px, py, size, size);
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
            case 5: // 포켓몬 센터
                this.ctx.fillStyle = GB_COLORS.RED;
                this.ctx.fillRect(px, py, size, size);
                this.ctx.fillStyle = GB_COLORS.WHITE;
                this.ctx.fillRect(px + 4, py + 4, 8, 8);
                this.ctx.fillStyle = GB_COLORS.RED;
                this.ctx.fillRect(px + 6, py + 6, 4, 4);
                break;
            case 6: // 체육관
                this.ctx.fillStyle = GB_COLORS.DARK;
                this.ctx.fillRect(px, py, size, size);
                this.ctx.fillStyle = GB_COLORS.ORANGE;
                this.ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
                this.ctx.fillStyle = GB_COLORS.BLACK;
                this.ctx.fillRect(px + 6, py + 8, 4, 6);
                break;
        }
    }

    drawPlayer(x, y) {
        const px = Math.floor(x * this.tileSize);
        const py = Math.floor(y * this.tileSize);

        // 카툰 스타일 플레이어 (Red/Ash) - 깔끔한 아웃라인
        // 모자 (빨간색 with 검은 아웃라인)
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 3, py, 10, 1);
        this.ctx.fillRect(px + 2, py + 1, 12, 1);
        this.ctx.fillRect(px + 1, py + 2, 14, 1);
        this.ctx.fillRect(px + 1, py + 3, 1, 2);
        this.ctx.fillRect(px + 14, py + 3, 1, 2);

        this.ctx.fillStyle = GB_COLORS.RED;
        this.ctx.fillRect(px + 3, py + 1, 10, 1);
        this.ctx.fillRect(px + 2, py + 2, 12, 1);
        this.ctx.fillRect(px + 2, py + 3, 12, 2);

        // 모자 흰색 로고 (포켓볼)
        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.fillRect(px + 6, py + 2, 4, 2);
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 7, py + 3, 2, 1);

        // 얼굴 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 4, py + 5, 8, 1);
        this.ctx.fillRect(px + 3, py + 6, 1, 5);
        this.ctx.fillRect(px + 12, py + 6, 1, 5);
        this.ctx.fillRect(px + 4, py + 10, 8, 1);

        // 얼굴/피부
        this.ctx.fillStyle = '#ffd4a3';
        this.ctx.fillRect(px + 4, py + 6, 8, 4);

        // 머리카락
        this.ctx.fillStyle = '#5a3a1a';
        this.ctx.fillRect(px + 4, py + 6, 2, 1);
        this.ctx.fillRect(px + 10, py + 6, 2, 1);

        // 눈 (더 크고 선명하게)
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 5, py + 7, 2, 2);
        this.ctx.fillRect(px + 9, py + 7, 2, 2);

        // 입 (웃는 표정)
        this.ctx.fillRect(px + 6, py + 9, 4, 1);

        // 몸통 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 3, py + 11, 10, 1);
        this.ctx.fillRect(px + 2, py + 12, 1, 6);
        this.ctx.fillRect(px + 13, py + 12, 1, 6);
        this.ctx.fillRect(px + 3, py + 17, 10, 1);

        // 재킷 (빨간색)
        this.ctx.fillStyle = '#e63946';
        this.ctx.fillRect(px + 3, py + 12, 10, 5);

        // 재킷 흰색 칼라
        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.fillRect(px + 6, py + 12, 4, 2);

        // 재킷 지퍼
        this.ctx.fillStyle = GB_COLORS.DARK;
        this.ctx.fillRect(px + 7, py + 13, 2, 4);

        // 팔 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 0, py + 12, 3, 1);
        this.ctx.fillRect(px + 13, py + 12, 3, 1);
        this.ctx.fillRect(px + 0, py + 16, 3, 1);
        this.ctx.fillRect(px + 13, py + 16, 3, 1);

        // 팔
        this.ctx.fillStyle = '#e63946';
        this.ctx.fillRect(px + 0, py + 13, 3, 3);
        this.ctx.fillRect(px + 13, py + 13, 3, 3);

        // 손
        this.ctx.fillStyle = '#ffd4a3';
        this.ctx.fillRect(px + 0, py + 16, 2, 2);
        this.ctx.fillRect(px + 14, py + 16, 2, 2);

        // 바지 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 4, py + 18, 4, 1);
        this.ctx.fillRect(px + 8, py + 18, 4, 1);
        this.ctx.fillRect(px + 4, py + 22, 4, 1);
        this.ctx.fillRect(px + 8, py + 22, 4, 1);

        // 바지 (파란색)
        this.ctx.fillStyle = '#457b9d';
        this.ctx.fillRect(px + 4, py + 19, 4, 3);
        this.ctx.fillRect(px + 8, py + 19, 4, 3);

        // 신발 (검은색)
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 3, py + 22, 5, 2);
        this.ctx.fillRect(px + 8, py + 22, 5, 2);

        // 신발 하이라이트
        this.ctx.fillStyle = GB_COLORS.DARK;
        this.ctx.fillRect(px + 4, py + 22, 3, 1);
        this.ctx.fillRect(px + 9, py + 22, 3, 1);
    }

    drawPikachu(x, y) {
        const px = Math.floor(x * this.tileSize);
        const py = Math.floor(y * this.tileSize);

        // 카툰 스타일 피카츄 - 선명한 아웃라인
        // 귀 아웃라인 (번개 모양)
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 2, py, 3, 1);
        this.ctx.fillRect(px + 1, py + 1, 1, 2);
        this.ctx.fillRect(px + 2, py + 3, 1, 3);
        this.ctx.fillRect(px + 3, py + 5, 2, 1);

        this.ctx.fillRect(px + 11, py, 3, 1);
        this.ctx.fillRect(px + 14, py + 1, 1, 2);
        this.ctx.fillRect(px + 13, py + 3, 1, 3);
        this.ctx.fillRect(px + 11, py + 5, 2, 1);

        // 귀 (노란색)
        this.ctx.fillStyle = '#ffde00';
        this.ctx.fillRect(px + 2, py + 1, 3, 2);
        this.ctx.fillRect(px + 3, py + 3, 2, 2);

        this.ctx.fillRect(px + 11, py + 1, 3, 2);
        this.ctx.fillRect(px + 11, py + 3, 2, 2);

        // 귀 끝 (검은색)
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 2, py + 1, 2, 1);
        this.ctx.fillRect(px + 12, py + 1, 2, 1);

        // 머리 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 4, py + 4, 8, 1);
        this.ctx.fillRect(px + 3, py + 5, 1, 6);
        this.ctx.fillRect(px + 12, py + 5, 1, 6);

        // 머리
        this.ctx.fillStyle = '#ffde00';
        this.ctx.fillRect(px + 4, py + 5, 8, 6);

        // 눈 (더 크고 귀엽게)
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 5, py + 7, 2, 2);
        this.ctx.fillRect(px + 9, py + 7, 2, 2);

        // 눈 하이라이트
        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.fillRect(px + 6, py + 7, 1, 1);
        this.ctx.fillRect(px + 10, py + 7, 1, 1);

        // 볼 (빨간색 원형)
        this.ctx.fillStyle = '#ff5757';
        this.ctx.fillRect(px + 2, py + 9, 3, 2);
        this.ctx.fillRect(px + 11, py + 9, 3, 2);
        this.ctx.fillRect(px + 3, py + 8, 1, 1);
        this.ctx.fillRect(px + 12, py + 8, 1, 1);

        // 코
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 7, py + 9, 2, 1);

        // 입 (미소)
        this.ctx.fillRect(px + 6, py + 10, 1, 1);
        this.ctx.fillRect(px + 7, py + 10, 2, 1);
        this.ctx.fillRect(px + 9, py + 10, 1, 1);

        // 몸통 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 3, py + 11, 10, 1);
        this.ctx.fillRect(px + 2, py + 12, 1, 7);
        this.ctx.fillRect(px + 13, py + 12, 1, 7);
        this.ctx.fillRect(px + 3, py + 18, 10, 1);

        // 몸통
        this.ctx.fillStyle = '#ffde00';
        this.ctx.fillRect(px + 3, py + 12, 10, 6);

        // 몸통 갈색 줄무늬 (전기 타입 표시)
        this.ctx.fillStyle = '#d4a051';
        this.ctx.fillRect(px + 4, py + 14, 8, 1);
        this.ctx.fillRect(px + 5, py + 16, 6, 1);

        // 팔 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 0, py + 12, 3, 1);
        this.ctx.fillRect(px + 13, py + 12, 3, 1);

        // 팔
        this.ctx.fillStyle = '#ffde00';
        this.ctx.fillRect(px + 0, py + 13, 3, 4);
        this.ctx.fillRect(px + 13, py + 13, 3, 4);

        // 다리 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 4, py + 19, 3, 1);
        this.ctx.fillRect(px + 9, py + 19, 3, 1);
        this.ctx.fillRect(px + 4, py + 22, 4, 1);
        this.ctx.fillRect(px + 9, py + 22, 4, 1);

        // 다리
        this.ctx.fillStyle = '#ffde00';
        this.ctx.fillRect(px + 4, py + 20, 3, 2);
        this.ctx.fillRect(px + 9, py + 20, 3, 2);

        // 발
        this.ctx.fillStyle = '#d4a051';
        this.ctx.fillRect(px + 3, py + 22, 4, 2);
        this.ctx.fillRect(px + 9, py + 22, 4, 2);

        // 꼬리 (번개 모양) 아웃라인
        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(px + 12, py + 8, 4, 1);
        this.ctx.fillRect(px + 15, py + 4, 1, 5);
        this.ctx.fillRect(px + 14, py + 3, 2, 1);

        // 꼬리
        this.ctx.fillStyle = '#ffde00';
        this.ctx.fillRect(px + 12, py + 9, 3, 7);
        this.ctx.fillRect(px + 13, py + 6, 2, 4);
        this.ctx.fillRect(px + 14, py + 4, 1, 3);

        // 꼬리 갈색 줄무늬
        this.ctx.fillStyle = '#d4a051';
        this.ctx.fillRect(px + 12, py + 11, 3, 1);
        this.ctx.fillRect(px + 12, py + 14, 3, 1);
    }

    drawNPC(npc) {
        const px = Math.floor(npc.x * this.tileSize);
        const py = Math.floor(npc.y * this.tileSize);

        if (npc.type === 'trainer' || npc.type === 'gym_leader') {
            const isGym = npc.type === 'gym_leader';
            const shirtColor = isGym ? '#ff8c42' : '#3a86ff';
            const pantsColor = isGym ? '#2b2d42' : '#2d6a4f';

            // 모자 아웃라인 (트레이너만)
            if (!isGym) {
                this.ctx.fillStyle = GB_COLORS.BLACK;
                this.ctx.fillRect(px + 4, py + 1, 8, 1);
                this.ctx.fillRect(px + 3, py + 2, 10, 1);
                this.ctx.fillRect(px + 3, py + 3, 1, 1);
                this.ctx.fillRect(px + 12, py + 3, 1, 1);

                this.ctx.fillStyle = '#fb5607';
                this.ctx.fillRect(px + 4, py + 2, 8, 2);

                this.ctx.fillStyle = GB_COLORS.WHITE;
                this.ctx.fillRect(px + 6, py + 2, 4, 1);
            }

            // 얼굴 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 4, py + (isGym ? 3 : 4), 8, 1);
            this.ctx.fillRect(px + 3, py + (isGym ? 4 : 5), 1, 4);
            this.ctx.fillRect(px + 12, py + (isGym ? 4 : 5), 1, 4);
            this.ctx.fillRect(px + 4, py + (isGym ? 8 : 9), 8, 1);

            // 얼굴
            this.ctx.fillStyle = '#ffd4a3';
            this.ctx.fillRect(px + 4, py + (isGym ? 4 : 5), 8, 4);

            // 머리카락
            if (isGym) {
                // 체육관 관장 - 강한 인상
                this.ctx.fillStyle = '#2b2d42';
                this.ctx.fillRect(px + 4, py + 3, 8, 2);
                this.ctx.fillRect(px + 3, py + 4, 2, 2);
                this.ctx.fillRect(px + 11, py + 4, 2, 2);
            } else {
                // 일반 트레이너
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(px + 4, py + 4, 8, 1);
            }

            // 눈 (더 선명하게)
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 5, py + (isGym ? 5 : 6), 2, 2);
            this.ctx.fillRect(px + 9, py + (isGym ? 5 : 6), 2, 2);

            // 눈 하이라이트
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 6, py + (isGym ? 5 : 6), 1, 1);
            this.ctx.fillRect(px + 10, py + (isGym ? 5 : 6), 1, 1);

            // 입
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 6, py + (isGym ? 7 : 8), 4, 1);

            // 몸통 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 3, py + (isGym ? 9 : 10), 10, 1);
            this.ctx.fillRect(px + 2, py + (isGym ? 10 : 11), 1, 6);
            this.ctx.fillRect(px + 13, py + (isGym ? 10 : 11), 1, 6);

            // 셔츠
            this.ctx.fillStyle = shirtColor;
            this.ctx.fillRect(px + 3, py + (isGym ? 10 : 11), 10, 6);

            // 셔츠 디테일 (칼라)
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 6, py + (isGym ? 10 : 11), 4, 1);

            // 팔 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 0, py + (isGym ? 10 : 11), 3, 1);
            this.ctx.fillRect(px + 13, py + (isGym ? 10 : 11), 3, 1);

            // 팔
            this.ctx.fillStyle = shirtColor;
            this.ctx.fillRect(px + 0, py + (isGym ? 11 : 12), 3, 4);
            this.ctx.fillRect(px + 13, py + (isGym ? 11 : 12), 3, 4);

            // 바지 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 4, py + (isGym ? 16 : 17), 4, 1);
            this.ctx.fillRect(px + 8, py + (isGym ? 16 : 17), 4, 1);

            // 바지
            this.ctx.fillStyle = pantsColor;
            this.ctx.fillRect(px + 4, py + (isGym ? 17 : 18), 4, 4);
            this.ctx.fillRect(px + 8, py + (isGym ? 17 : 18), 4, 4);

            // 신발
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 3, py + (isGym ? 21 : 22), 5, 2);
            this.ctx.fillRect(px + 8, py + (isGym ? 21 : 22), 5, 2);

            // 시야 표시 (느낌표)
            if (!npc.defeated && !npc.battleStarted) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(px + 7, py - 5, 2, 4);
                this.ctx.fillRect(px + 7, py - 1, 2, 1);
            }
        } else if (npc.type === 'nurse') {
            // 간호사 조이 카툰 스타일
            // 모자 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 4, py + 1, 8, 1);
            this.ctx.fillRect(px + 3, py + 2, 10, 1);

            // 모자
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 4, py + 2, 8, 2);

            // 모자 십자
            this.ctx.fillStyle = '#ff5757';
            this.ctx.fillRect(px + 7, py + 2, 2, 2);
            this.ctx.fillRect(px + 6, py + 2, 4, 1);

            // 얼굴 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 4, py + 4, 8, 1);
            this.ctx.fillRect(px + 3, py + 5, 1, 4);
            this.ctx.fillRect(px + 12, py + 5, 1, 4);
            this.ctx.fillRect(px + 4, py + 9, 8, 1);

            // 얼굴
            this.ctx.fillStyle = '#ffd4a3';
            this.ctx.fillRect(px + 4, py + 5, 8, 4);

            // 분홍 머리
            this.ctx.fillStyle = '#ff6ba8';
            this.ctx.fillRect(px + 3, py + 5, 1, 3);
            this.ctx.fillRect(px + 12, py + 5, 1, 3);
            this.ctx.fillRect(px + 4, py + 9, 2, 2);
            this.ctx.fillRect(px + 10, py + 9, 2, 2);

            // 눈 (더 크게)
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 5, py + 6, 2, 2);
            this.ctx.fillRect(px + 9, py + 6, 2, 2);

            // 눈 하이라이트
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 6, py + 6, 1, 1);
            this.ctx.fillRect(px + 10, py + 6, 1, 1);

            // 입 (미소)
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 5, py + 8, 6, 1);

            // 유니폼 아웃라인
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(px + 3, py + 10, 10, 1);
            this.ctx.fillRect(px + 2, py + 11, 1, 8);
            this.ctx.fillRect(px + 13, py + 11, 1, 8);

            // 유니폼
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 3, py + 11, 10, 8);

            // 십자 (빨간색)
            this.ctx.fillStyle = '#ff5757';
            this.ctx.fillRect(px + 7, py + 13, 2, 4);
            this.ctx.fillRect(px + 6, py + 14, 4, 2);

            // 팔
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 0, py + 12, 3, 4);
            this.ctx.fillRect(px + 13, py + 12, 3, 4);

            // 손
            this.ctx.fillStyle = '#ffd4a3';
            this.ctx.fillRect(px + 0, py + 16, 2, 2);
            this.ctx.fillRect(px + 14, py + 16, 2, 2);

            // 치마
            this.ctx.fillStyle = '#ff6ba8';
            this.ctx.fillRect(px + 3, py + 19, 10, 3);

            // 다리
            this.ctx.fillStyle = '#ffd4a3';
            this.ctx.fillRect(px + 4, py + 22, 3, 2);
            this.ctx.fillRect(px + 9, py + 22, 3, 2);

            // 신발
            this.ctx.fillStyle = GB_COLORS.WHITE;
            this.ctx.fillRect(px + 3, py + 23, 4, 1);
            this.ctx.fillRect(px + 9, py + 23, 4, 1);
        }
    }

    drawOverworld() {
        this.updateCamera();

        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);

        this.ctx.save();
        this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

        const startX = Math.floor(this.camera.x / this.tileSize);
        const startY = Math.floor(this.camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(this.baseWidth / this.tileSize) + 1, this.map[0].length);
        const endY = Math.min(startY + Math.ceil(this.baseHeight / this.tileSize) + 1, this.map.length);

        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                this.drawTile(x, y, this.map[y][x]);
            }
        }

        // NPC 그리기
        for (let npc of this.npcs) {
            if (npc.x >= startX && npc.x < endX && npc.y >= startY && npc.y < endY) {
                this.drawNPC(npc);
            }
        }

        this.drawPikachu(this.pikachu.x, this.pikachu.y);
        this.drawPlayer(this.player.x, this.player.y);

        this.ctx.restore();

        // UI
        this.drawUI();

        // 다이얼로그
        if (this.gameState === 'dialog' && this.dialogText) {
            this.drawDialog();
        }

        this.ctx.restore();
    }

    drawUI() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.baseWidth, 20);

        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.font = 'bold 8px monospace';
        this.ctx.fillText(`${this.party[0].name} Lv${this.party[0].level}`, 3, 10);
        this.ctx.fillText(`HP:${this.party[0].hp}/${this.party[0].maxHp}`, 70, 10);
        this.ctx.fillText(`₩${this.player.money}`, 3, 18);

        // 배지
        if (this.badges.length > 0) {
            this.ctx.fillText(`🏅${this.badges.length}`, 130, 10);
        }
    }

    drawDialog() {
        const boxH = 30;
        const boxY = this.baseHeight - boxH - 5;

        this.ctx.fillStyle = GB_COLORS.WHITE;
        this.ctx.fillRect(5, boxY, this.baseWidth - 10, boxH);
        this.ctx.strokeStyle = GB_COLORS.BLACK;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(5, boxY, this.baseWidth - 10, boxH);

        this.ctx.fillStyle = GB_COLORS.BLACK;
        this.ctx.font = 'bold 8px monospace';

        const words = this.dialogText.split(' ');
        let line = '';
        let y = boxY + 12;

        for (let word of words) {
            const testLine = line + word + ' ';
            if (this.ctx.measureText(testLine).width > this.baseWidth - 20) {
                this.ctx.fillText(line, 10, y);
                line = word + ' ';
                y += 10;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, 10, y);

        // 화살표
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.fillStyle = GB_COLORS.BLACK;
            this.ctx.fillRect(this.baseWidth - 15, boxY + boxH - 10, 6, 3);
        }
    }

    render() {
        if (this.gameState === 'overworld' || this.gameState === 'dialog') {
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
    constructor(game, enemyPokemon, battleType = 'wild', trainer = null) {
        this.game = game;
        // 깊은 복사로 수정
        this.enemy = JSON.parse(JSON.stringify(enemyPokemon));
        this.player = JSON.parse(JSON.stringify(game.party[0]));
        this.battleType = battleType;
        this.trainer = trainer;
        this.trainerPokemonIndex = 0;

        this.state = 'intro';
        this.message = battleType === 'trainer' ?
            `${trainer.name}이(가) 승부를 걸어왔다!\n가라! ${this.enemy.name}!` :
            `야생의 ${this.enemy.name}이(가)\n나타났다!`;
        this.waitingForInput = false;

        this.menuCursor = 0;
        this.fightCursor = 0;

        this.enemyHpDisplay = this.enemy.hp;
        this.playerHpDisplay = this.player.hp;

        this.resultShown = false;

        // 800ms 후 자동으로 메뉴로 전환 (더 빠르게)
        setTimeout(() => {
            this.state = 'menu';
            this.message = '무엇을 할까?';
            this.waitingForInput = true;
        }, 800);
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
                this.message = '무엇을 할까?';
            }
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
                setTimeout(() => {
                    this.state = 'menu';
                    this.message = '무엇을 할까?';
                    this.waitingForInput = true;
                }, 800);
                break;
            case 2: // ITEM
                this.message = '도구가 없습니다!';
                setTimeout(() => {
                    this.state = 'menu';
                    this.message = '무엇을 할까?';
                    this.waitingForInput = true;
                }, 800);
                break;
            case 3: // RUN
                this.tryRun();
                break;
        }
    }

    selectMove() {
        const move = this.player.moves[this.fightCursor];
        if (!move || move.pp <= 0) {
            this.message = 'PP가 부족합니다!';
            this.waitingForInput = false;
            setTimeout(() => {
                this.state = 'fight_menu';
                this.waitingForInput = true;
            }, 800);
            return;
        }

        this.waitingForInput = false;
        this.state = 'attack';
        this.playerAttack(move);
    }

    playerAttack(move) {
        // PP 감소 (플레이어 원본에서)
        const playerMove = this.game.party[0].moves.find(m => m.name === move.name);
        if (playerMove) playerMove.pp--;

        this.message = `피카츄의\n${move.name}!`;
        this.waitingForInput = false;

        setTimeout(() => {
            const damage = this.calculateDamage(this.player, this.enemy, move);
            this.enemy.hp = Math.max(0, this.enemy.hp - damage);
            this.animateHPBar('enemy', damage);

            if (this.enemy.hp <= 0) {
                setTimeout(() => {
                    this.enemyFainted();
                }, 800);
            } else {
                setTimeout(() => this.enemyTurn(), 800);
            }
        }, 600);
    }

    enemyTurn() {
        this.state = 'enemy_turn';
        this.waitingForInput = false;

        // 적 포켓몬의 moves가 있는지 확인
        if (!this.enemy.moves || this.enemy.moves.length === 0) {
            console.error('Enemy has no moves!');
            this.state = 'menu';
            this.message = '무엇을 할까?';
            this.waitingForInput = true;
            return;
        }

        const enemyMove = this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)];
        this.message = `${this.enemy.name}의\n${enemyMove.name}!`;

        setTimeout(() => {
            const damage = this.calculateDamage(this.enemy, this.player, enemyMove);
            this.player.hp = Math.max(0, this.player.hp - damage);
            this.animateHPBar('player', damage);

            if (this.player.hp <= 0) {
                setTimeout(() => this.lose(), 800);
            } else {
                setTimeout(() => {
                    this.state = 'menu';
                    this.message = '무엇을 할까?';
                    this.waitingForInput = true;
                }, 800);
            }
        }, 600);
    }

    enemyFainted() {
        this.message = `${this.enemy.name}은(는)\n쓰러졌다!`;
        this.waitingForInput = false;

        if (this.battleType === 'trainer' && this.trainer) {
            // 트레이너의 다음 포켓몬 확인
            this.trainerPokemonIndex++;
            if (this.trainerPokemonIndex < this.trainer.pokemon.length) {
                setTimeout(() => {
                    this.enemy = JSON.parse(JSON.stringify(this.trainer.pokemon[this.trainerPokemonIndex]));
                    this.enemyHpDisplay = this.enemy.hp;
                    this.message = `${this.trainer.name}이(가)\n${this.enemy.name}을(를) 꺼냈다!`;
                    setTimeout(() => {
                        this.state = 'menu';
                        this.message = '무엇을 할까?';
                        this.waitingForInput = true;
                    }, 1000);
                }, 1000);
                return;
            }
        }

        setTimeout(() => this.win(), 1000);
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
        if (move.power === 0) return 0;

        const level = attacker.level;
        const attack = attacker.attack;
        const defense = defender.defense;
        const power = move.power;

        let damage = ((2 * level / 5 + 2) * power * attack / defense) / 50 + 2;

        // 타입 상성
        if (move.type === 'electric' && (defender.type === 'flying' || defender.type === 'water')) {
            damage *= 2;
        }
        if (move.type === 'electric' && (defender.type === 'grass' || defender.type === 'rock' || defender.type === 'ground')) {
            damage *= 0.5;
        }

        damage = Math.floor(damage * (Math.random() * 0.15 + 0.85));
        return Math.max(1, Math.floor(damage));
    }

    tryRun() {
        this.waitingForInput = false;

        if (this.battleType === 'trainer') {
            this.message = '트레이너전에서는\n도망칠 수 없다!';
            setTimeout(() => {
                this.state = 'menu';
                this.message = '무엇을 할까?';
                this.waitingForInput = true;
            }, 1000);
            return;
        }

        if (Math.random() < 0.5) {
            this.message = '무사히 도망쳤다!';
            setTimeout(() => this.end(), 1000);
        } else {
            this.message = '도망칠 수 없다!';
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    win() {
        const exp = this.enemy.level * 20;
        const money = this.enemy.level * 50;
        this.waitingForInput = false;

        if (this.battleType === 'trainer') {
            this.message = `${this.trainer.name}을(를)\n이겼다!\n상금 ₩${money}을 받았다!`;
            this.game.player.money += money;
            this.trainer.defeated = true;

            // 체육관 관장을 이겼다면 배지 획득
            if (this.trainer.type === 'gym_leader' && this.trainer.badge) {
                setTimeout(() => {
                    this.game.badges.push(this.trainer.badge);
                    this.message = `${this.trainer.badge} 배지를\n획득했다!`;
                    setTimeout(() => this.end(), 1500);
                }, 1500);
                return;
            }
        } else {
            this.message = `야생의 ${this.enemy.name}을(를)\n쓰러뜨렸다!`;
        }

        // 플레이어 HP 업데이트
        this.game.party[0].hp = this.player.hp;
        setTimeout(() => this.end(), 1800);
    }

    lose() {
        this.message = '눈앞이 캄캄해졌다!';
        this.waitingForInput = false;

        // 전체 회복
        this.game.party[0].hp = this.game.party[0].maxHp;
        this.game.party[0].moves.forEach(m => m.pp = m.maxPp);
        this.game.player.money = Math.floor(this.game.player.money / 2);

        setTimeout(() => this.end(), 1800);
    }

    end() {
        this.game.gameState = 'overworld';
        this.game.battle = null;
    }

    render() {
        const ctx = this.game.ctx;

        ctx.save();
        ctx.scale(this.game.scale, this.game.scale);

        const w = this.game.baseWidth;
        const h = this.game.baseHeight;

        // 배경
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 플랫폼
        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(100, 50, 40, 4);
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(100, 54, 40, 2);

        ctx.fillStyle = GB_COLORS.BROWN;
        ctx.fillRect(20, 90, 45, 4);
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(20, 94, 45, 2);

        // 포켓몬
        this.drawEnemyPokemon(110, 25);
        this.drawPlayerPikachu(30, 65);

        // 정보창
        this.drawInfoBox(80, 10, 70, 22, this.enemy.name, this.enemy.level, this.enemyHpDisplay, this.enemy.maxHp, false);
        this.drawInfoBox(10, 58, 70, 28, this.player.name, this.player.level, this.playerHpDisplay, this.player.maxHp, true);

        // 메시지 박스
        this.drawTextBox(5, h - 40, w - 10, 35);
        const lines = this.message.split('\n');
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 8px monospace';
        lines.forEach((line, i) => {
            ctx.fillText(line, 12, h - 26 + i * 10);
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

        ctx.fillStyle = GB_COLORS.WHITE;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = GB_COLORS.BLACK;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 8px monospace';
        ctx.fillText(name, x + 5, y + 10);
        ctx.fillText(`Lv${level}`, x + w - 20, y + 10);

        const hpBarY = showHpNum ? y + 16 : y + 14;
        this.drawHPBar(x + 5, hpBarY, w - 10, hp, maxHp);

        if (showHpNum) {
            ctx.fillText(`${Math.floor(hp)}/${maxHp}`, x + w - 30, y + 24);
        }
    }

    drawHPBar(x, y, w, hp, maxHp) {
        const ctx = this.game.ctx;

        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(x, y, w, 4);

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
        ctx.font = 'bold 8px monospace';

        menu.forEach((item, i) => {
            const mx = w - 72 + (i % 2) * 37;
            const my = h - 28 + Math.floor(i / 2) * 13;
            ctx.fillText(item, mx, my);

            if (i === this.menuCursor) {
                ctx.fillRect(mx - 8, my - 5, 5, 2);
            }
        });
    }

    drawFightMenu() {
        const ctx = this.game.ctx;
        const w = this.game.baseWidth;
        const h = this.game.baseHeight;

        this.drawTextBox(w - 80, h - 40, 75, 35);

        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.font = 'bold 7px monospace';

        this.player.moves.forEach((move, i) => {
            const mx = w - 72 + (i % 2) * 37;
            const my = h - 28 + Math.floor(i / 2) * 13;
            ctx.fillText(move.name.substring(0, 8), mx, my);
            ctx.font = 'bold 6px monospace';
            ctx.fillText(`${move.pp}/${move.maxPp}`, mx, my + 8);
            ctx.font = 'bold 7px monospace';

            if (i === this.fightCursor) {
                ctx.fillRect(mx - 8, my - 5, 5, 2);
            }
        });
    }

    drawEnemyPokemon(x, y) {
        const ctx = this.game.ctx;

        ctx.fillStyle = GB_COLORS.DARK;
        ctx.fillRect(x, y + 15, 25, 18);
        ctx.fillRect(x + 3, y + 5, 19, 15);
        ctx.fillRect(x + 2, y + 2, 5, 7);
        ctx.fillRect(x + 18, y + 2, 5, 7);

        ctx.fillStyle = GB_COLORS.WHITE;
        ctx.fillRect(x + 6, y + 10, 5, 5);
        ctx.fillRect(x + 14, y + 10, 5, 5);

        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(x + 7, y + 12, 2, 2);
        ctx.fillRect(x + 15, y + 12, 2, 2);
        ctx.fillRect(x + 10, y + 16, 5, 2);
    }

    drawPlayerPikachu(x, y) {
        const ctx = this.game.ctx;

        ctx.fillStyle = GB_COLORS.YELLOW;
        ctx.fillRect(x + 3, y, 5, 12);
        ctx.fillRect(x + 22, y, 5, 12);
        ctx.fillStyle = GB_COLORS.BLACK;
        ctx.fillRect(x + 3, y, 5, 4);
        ctx.fillRect(x + 22, y, 5, 4);

        ctx.fillStyle = GB_COLORS.YELLOW;
        ctx.fillRect(x + 6, y + 5, 18, 10);
        ctx.fillRect(x + 6, y + 15, 18, 14);

        ctx.fillStyle = GB_COLORS.YELLOW_DARK;
        ctx.fillRect(x + 8, y + 20, 14, 2);
        ctx.fillRect(x + 8, y + 24, 14, 2);

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
