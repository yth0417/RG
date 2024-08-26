import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 300;
    this.atk = 50;;
  }

  attack(monster) {
    if (Math.random() < 0.8) {
      const damage = Math.floor(Math.random() * 21) + this.atk - 10;
      // 플레이어의 공격
      monster.hp -= damage;
      return damage;
    } else {
      return 0; // 공격 실패
    }
  }

  doubleAttack(monster) {
    // 플레이어의 공격
    const damage1 = this.attack(monster);
    const damage2 = this.attack(monster);
    if (damage1 > 0 && damage2 > 0) {
      return damage1 + damage2;
    } else {
      // 둘 중 하나라도 실패하면 둘 다 실패한다.
      return 0;
    }
  }

  block(monster) {
    const monsterdamage = monster.attack(this);
    const blockDamage = Math.floor(monsterdamage / 2);
    this.hp += monsterdamage - blockDamage;
    return blockDamage;
  }

  statUp() {
    const hpHeal = Math.floor(Math.random() * 101) + 10;
    const atkUp = Math.floor(Math.random() * 6) + 5;

    this.hp += hpHeal;
    this.atk += atkUp;
  }
}

class Monster {
  constructor(stage) {
    this.hp = 500 + stage * 20 + Math.floor(Math.random() * 31) + 1;
    this.atk = 11 + stage * 5 + Math.floor(Math.random() * 11) + 1;
  }

  attack(player) {
    if (Math.random() < 0.6) {
      // 몬스터의 공격
      const monsterDamage = Math.floor(Math.random() * 21) + this.atk - 10;
      player.hp -= monsterDamage;
      return monsterDamage;
    } else {
      return 0;
    }
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(`| Player Hp: ${player.hp} , Attack: ${player.atk}`,) +
    chalk.redBright(`| Monster Hp: ${monster.hp} , Attack: ${monster.atk}`,),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  logs.push(chalk.redBright(`야생의 몬스터와 마주쳤습니다!`));

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다.(80%) 2. 연속 공격한다.(64%) 3. 방어한다. 4. 도망친다.(40%)`,
      ),
    );

    const choice = readlineSync.question('당신의 선택은? ');

    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        const damage = player.attack(monster);
        if (damage > 0) {
          logs.push(`monster에게 ${damage}의 피해! monster 체력이 ${monster.hp}이 되었습니다.`);
        } else {
          logs.push(chalk.red(`공격이 빗나갔습니다!`));
        }

        if (monster.hp > 0) {
          const monsterDamage = monster.attack(player);
          if (monsterDamage > 0) {
            logs.push(chalk.red(`player에게 ${monsterDamage}의 피해! player 체력이 ${player.hp}이 되었습니다.`));
            if (player.hp > 0) {
              logs.push(chalk.green('플레이어가 피해를 견뎠습니다.'));
            }
          } else {
            logs.push(chalk.red('몬스터의 공격이 빗나갔습니다!'));
          }
        } else {
          logs.push(chalk.green('몬스터를 물리쳤습니다!'));
        }
        break;

      case '2':
        const doubleDamage = player.doubleAttack(monster);
        if (doubleDamage > 0) {
          logs.push(`monster에게 ${doubleDamage}의 연속 피해! monster 체력이 ${monster.hp}이 되었습니다.`);
        } else {
          logs.push(chalk.red(`연속 공격이 빗나갔습니다!`));
        }

        if (monster.hp > 0) {
          const monsterDamage = monster.attack(player);
          if (monsterDamage > 0) {
            logs.push(chalk.red(`player에게 ${monsterDamage}의 피해! player 체력이 ${player.hp}이 되었습니다.`));
            if (player.hp > 0) {
              logs.push(chalk.green('플레이어가 피해를 견뎠습니다.'));
            }
          } else {
            logs.push(chalk.red('몬스터의 공격이 빗나갔습니다!'));
          }
        } else {
          logs.push(chalk.green('몬스터를 물리쳤습니다!'));
        }
        break;

      case '3':
        logs.push(chalk.blue('플레이어가 방어하여 몬스터의 공격 피해가 반감됩니다.'));
        const blockDamage = player.block(monster);
        logs.push(chalk.red(`player는 방어하여 ${blockDamage}의 피해! player 체력이 ${player.hp}이 되었습니다.`));
        break;

      case '4':
        if (Math.random() < 0.4) {
          console.log(chalk.yellow('플레이어가 도망쳤습니다!'));
          return 'escaped';  // 도망치면 현재 배틀 종료 및 다음 스테이지로 이동
        } else {
          logs.push(chalk.red('도망에 실패했습니다!'));
        }
        break;

      default:
        logs.push(chalk.red('올바른 선택을 하세요.'));
        break;
    }

    // 플레이어의 선택에 따라 다음 행동 처리
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    const battleEnd = await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건

    if (player.hp < 0) {
      console.log(chalk.green(`\nStage ${stage}에서 플레이어가 힘을 다하였습니다. 다시 도전하세요!`));
      break;
    }

    if (battleEnd === 'escaped') {
      console.log(chalk.yellow(`\nStage ${stage}에서 도망쳤습니다! 다음 스테이지로 이동합니다.\n`));
    }
    player.statUp();
    stage++;
  }

  if (stage > 10) {
    console.log(chalk.red('축하합니다! 모든 스테이지를 클리어했습니다!'));
  }
}