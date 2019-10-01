import { up, down } from "./users"

const Up = async () => {
    await up()
};

const Down = async () => {
    await down()
};

export {
    Up,
    Down,
}