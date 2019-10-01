import { Signup, Signin } from "../handlers";

export default (app) => {
    app.post('/signup', Signup);
    app.post('/signin', Signin);
};