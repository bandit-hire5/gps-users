if (process.argv.length < 3) {
    throw new Error('Invalid arguments count');
}

import { Up, Down } from "./seeds/index"

const command = process.argv[2];

switch (command) {
    case 'up':
        Up().then(() => {
            console.log('Success up');
        });
        break;
    case 'down':
        Down().then(() => {
            console.log('Success down');
        });
        break;
    default:
        throw new Error('Invalid command. Allowed up|down');
}
