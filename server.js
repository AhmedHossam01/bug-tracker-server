const fs = require("fs");
const bodyParser = require("body-parser");
const jsonServer = require("json-server");
const jwt = require("jsonwebtoken");
const { default: faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const server = jsonServer.create();
const router = jsonServer.router("./database.json");
const userdb = JSON.parse(fs.readFileSync("./users.json", "UTF-8"));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "123456789";

const expiresIn = "7d";

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err
  );
}

// Check if the user exists in database
async function isAuthenticated({ email, password }) {
  const userdb = JSON.parse(fs.readFileSync("./users.json", "UTF-8"));
  const myUser = userdb.users.find((user) => user.email === email);

  if (!myUser) {
    return false;
  }

  const match = await bcrypt.compare(password, myUser.password);
  console.log(match);

  if (match) {
    return true;
  } else {
    return false;
  }
}

// Register New User
server.post("/auth/register", (req, res) => {
  console.log("register endpoint called; request body:");

  const { email, password } = req.body;

  if (userdb.users.find((user) => user.email === email)) {
    const status = 401;
    const message = "Email already exist";
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile("./users.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }

    // Get current users data
    var data = JSON.parse(data.toString());

    // Get the id of last user
    var last_item_id = data.users[data.users.length - 1].id;

    bcrypt.hash(password, saltRounds, function (err, hash) {
      //Add new user
      data.users.push({
        id: last_item_id + 1,
        email: email,
        password: hash,
      }); //add some data
      var writeData = fs.writeFile(
        "./users.json",
        JSON.stringify(data),
        (err, result) => {
          // WRITE
          if (err) {
            const status = 401;
            const message = err;
            res.status(status).json({ status, message });
            return;
          }
        }
      );
    });
  });

  // Create token for new user
  const access_token = createToken({ email, password });
  console.log("Access Token:" + access_token);
  res
    .status(200)
    .json({ access_token, user: { email, avatar: faker.image.avatar() } });
});

// Login to one of the users from ./users.json
server.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if ((await isAuthenticated({ email, password })) === false) {
    const status = 401;
    const message = "Incorrect email or password";
    res.status(status).json({ status, message });
    return;
  } else {
    const access_token = createToken({ email, password });
    res
      .status(200)
      .json({ access_token, user: { email, avatar: faker.image.avatar() } });
  }
});

server.get("/auth/check/:email", (req, res) => {
  const userdb = JSON.parse(fs.readFileSync("./users.json", "UTF-8"));
  const myUser = userdb.users.find((user) => user.email === req.params.email);

  if (myUser) {
    res.json({ result: false });
  } else {
    res.json({ result: true });
  }
});

server.get("/auth/me", (req, res) => {
  const userdb = JSON.parse(fs.readFileSync("./users.json", "UTF-8"));

  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error in authorization format";
    res.status(status).json({ status, message });
    return;
  }
  try {
    let verifyTokenResult;
    verifyTokenResult = verifyToken(req.headers.authorization.split(" ")[1]);

    if (verifyTokenResult instanceof Error) {
      const status = 401;
      const message = "Access token not provided";
      res.status(status).json({ status, message });
      return;
    }

    const { email, id } = userdb.users.find(
      (user) => user.email === verifyTokenResult.email
    );
    res.json({ email, id, avatar: faker.image.avatar() });
  } catch (err) {
    const status = 401;
    const message = "Error access_token is revoked";
    res.status(status).json({ status, message });
  }
});

server.use(/^(?!\/auth).*$/, (req, res, next) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error in authorization format";
    res.status(status).json({ status, message });
    return;
  }
  try {
    let verifyTokenResult;
    verifyTokenResult = verifyToken(req.headers.authorization.split(" ")[1]);

    if (verifyTokenResult instanceof Error) {
      const status = 401;
      const message = "Access token not provided";
      res.status(status).json({ status, message });
      return;
    }
    next();
  } catch (err) {
    const status = 401;
    const message = "Error access_token is revoked";
    res.status(status).json({ status, message });
  }
});

server.use(router);

server.listen(process.env.PORT || 8000, () => {
  console.log("Run Auth API Server");
});
