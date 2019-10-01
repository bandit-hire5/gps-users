import { isString } from "lodash";

export default (password) => {
  let type = "";

  //if (!isString(password) || !/((?=.*([\W]+|[_]+).*)(?=.*[\d]+.*)(?=.*[a-z]+.*)(?=.*[A-Z]+.*))/g.test(password)) {
  if (!isString(password)) {
    type = "INVALID_PASSWORD_ERR";
  } else if (password.length < 8 || password.length > 16) {
    type = "INVALID_PASSWORD_LENGTH_ERR";
  }

  return type;
};
