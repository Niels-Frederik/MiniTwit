const express = require("express");
// const { Op } = require('sequelize');
// const dotenv = require('dotenv').config();
const db = require("./entities");
const repo = require("./repository");
// const { Sequelize } = require('sequelize');
const url = require("url");
const prom = require("prom-client");

const app = express();
const port = 5001;

const register = new prom.Registry();
const Monitor = require("./monitoring");
const monitoring = new Monitor.Monitoring(prom, register);

app.use(express.json());
app.use(beforeMiddleware);

function beforeMiddleware(req, res, next) {
  const route = url.parse(req.url).pathname;
  if (route !== "/metrics") monitoring.request_counter.inc();
  next();
}

function afterMiddleware(req, res) {
  const route = url.parse(req.url).pathname;
  const response = res.statusCode.toString();
  switch (route) {
    case "/metrics":
      return;
    case "/register":
      monitoring.register_request_counter.inc();
      if (response[0] == "2") monitoring.register_success_counter.inc();
      else if (response[0] == "4") monitoring.register_failure_counter.inc();
      break;
    case "/msgs":
      monitoring.getMessages_request_counter.inc();
      if (response[0] == "2") monitoring.getMessages_success_counter.inc();
      else if (response[0] == "4") monitoring.getMessages_failure_counter.inc();
      break;
    case (route.match("/msgs/.+") || {}).input:
      if (req.method == "GET") {
        monitoring.getMessages_username_request_counter.inc();
        if (response[0] == "2")
          monitoring.getMessages_username_success_counter.inc();
        else if (response[0] == "4")
          monitoring.getMessages_username_failure_counter.inc();
      } else if (req.method == "POST") {
        monitoring.messages_request_counter.inc();
        if (response[0] == "2") monitoring.messages_success_counter.inc();
        else if (response[0] == "4") monitoring.messages_failure_counter.inc();
      }
      break;
    case (route.match("/fllws/.+") || {}).input:
      if (req.method == "GET") {
        monitoring.getFollows_request_counter.inc();
        if (response[0] == "2") monitoring.getFollows_success_counter.inc();
        else if (response[0] == "4")
          monitoring.getFollows_failure_counter.inc();
      } else if (req.method == "POST") {
        if (Object.keys(req.body).indexOf("follow") !== -1) {
          monitoring.follow_request_counter.inc();
          if (response[0] == "2") monitoring.follow_success_counter.inc();
          else if (response[0] == "4") monitoring.follow_failure_counter.inc();
        } else if (Object.keys(req.body).indexOf("unfollow") !== -1) {
          monitoring.unfollow_request_counter.inc();
          if (response[0] == "2") monitoring.unfollow_success_counter.inc();
          else if (response[0] == "4")
            monitoring.unfollow_failure_counter.inc();
        }
      }
      break;
  }
  if (response[0] == "1") monitoring.information_response_counter.inc();
  else if (response[0] == "2") monitoring.success_response_counter.inc();
  else if (response[0] == "3") monitoring.redirect_response_counter.inc();
  else if (response[0] == "4") monitoring.client_error_response_counter.inc();
  else if (response[0] == "5") monitoring.server_error_response_counter.inc();
}

app.get("/metrics", async (req, res, next) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
  next();
});

let LATEST = 0;

function notReqFromSimulator(req) {
  const fromSimulator = req.header("Authorization");
  if (fromSimulator != "Basic c2ltdWxhdG9yOnN1cGVyX3NhZmUh") {
    const error = "You are not authorized to use this resource!";
    return [403, error];
  }
}

function updateLatest(request) {
  const q = request.query.latest;
  LATEST = q == null ? LATEST : q;
}

app.get("/latest", async (req, res, next) => {
  res.json({ latest: LATEST });
  next();
  return;
});

app.post("/register", async (req, res, next) => {
  updateLatest(req);

  const { username, email, pwd } = req.body;
  const error = await repo.registerUser(username, email, pwd)

  if (error) res.status(400).send(error)
  else res.sendStatus(204);
  next();
  return;
});

app.get("/msgs", async (req, res, next) => {
  updateLatest(req);

  var notFromSim = notReqFromSimulator(req);
  if (notFromSim) {
    res.status(notFromSim[0]).send(notFromSim[1]);
    next();
    return;
  }

  let limit = req.query.no;
  if (!limit) limit = 100;
  const result = await repo.simulatorGetAllMessagesAsync(limit)
  //const result = await repo.simulatorGetAllMessagesAsync(req.query.no || 100)

  let filteredMsgs = [];
  result.forEach((msg) => {
    var filteredMsg = {};
    filteredMsg.content = msg.text;
    filteredMsg.pub_date = msg.pub_date;
    filteredMsg.user = msg.username;
    filteredMsgs.push(filteredMsg);
  });

  res.send(filteredMsgs);
  next();
  return;
});

app.get("/msgs/:username", async (req, res, next) => {
  updateLatest(req);

  var notFromSim = notReqFromSimulator(req);
  if (notFromSim) {
    res.status(notFromSim[0]).send(notFromSim[1]);
    next();
    return;
  }

  const userid = await repo.getUserId(req.params.username);
  if (!userid) {
    res.sendStatus(404);
    next();
    return;
  }

  let limit = req.query.no;
  if (!limit) limit = 100;
  let result = null;
  // exists in repo
  result = await db.Messages.findAll({
    include: [
      {
        model: db.Users,
        attributes: [],
      },
    ],
    where: {
      flagged: 0,
      author_Id: userid,
    },
    raw: true,
    order: [["pub_date", "DESC"]],
    attributes: ["user.username", "text", "pub_date"],
    limit: limit,
  });

  let filteredMsgs = [];
  result.forEach((msg) => {
    var filteredMsg = {};
    filteredMsg.content = msg.text;
    filteredMsg.pub_date = msg.pub_date;
    filteredMsg.user = msg.username;
    filteredMsgs.push(filteredMsg);
  });

  res.json(filteredMsgs);
  next();
  return;
});

app.post("/msgs/:username", async (req, res, next) => {
  updateLatest(req);
  console.log(
    "Received a Post to /msgs/:username with username: " + req.params.username
  );

  var notFromSim = notReqFromSimulator(req);
  if (notFromSim) {
    res.status(notFromSim[0]).send(notFromSim[1]);
    next();
    return;
  }

  const text = req.body.content;
  const userid = await repo.getUserId(req.params.username);
  if (userid == null || text == "") {
    console.log(
      "   - Post failed: " +
        (userid == null ? "user does not exist" : "message is empty: " + text)
    );
    res.sendStatus(400);
    next();
    return;
  } else {
    // exists in repo
    const date = Math.floor(Date.now() / 1000);
    await db.Messages.create({
      author_id: userid,
      text: text,
      pub_date: date,
      flagged: 0,
    });
    res.sendStatus(204);
    next();
    return;
  }
});

app.post("/fllws/:username", async (req, res, next) => {
  updateLatest(req);
  console.log("Recieved a Post follow request:");
  console.log("request body: ", req.body);
  console.log("requst params: ", req.params);

  const notReqFromSim = notReqFromSimulator(req);

  if (notReqFromSim) {
    console.log("Request was not from simulator. Sending BadRequest");
    res.status(notReqFromSim[0]).send(notReqFromSim[1]);
    next();
    return;
  }

  const userId = await repo.getUserId(req.params.username);
  console.log("Who user read from req.params.username:");
  console.log(req.params.username);
  console.log("id: ", userId);
  if (!userId) {
    console.log("Who userId was null. Sending BadRequest");
    res.sendStatus(404);
    next();
    return;
  }

  if (Object.keys(req.body).indexOf("follow") !== -1) {
    //if we should follow the given user
    console.log("Follow request is of type follow");
    const userToFollowId = await repo.getUserId(req.body.follow);
    console.log("whom userId: ", userToFollowId);
    if (userToFollowId == null) {
      console.log("Whom userId was null. Sending BadRequest.");
      res.status(404).send("Invalid user to follow");
      next();
      return;
    }
    // exists in repo
    await db.Followers.create({
      who_id: userId,
      whom_id: userToFollowId,
    });
    console.log("Follow was a success!");
    res.status(204).send("You are now following " + req.body.follow);
    next();
    return;
  }

  if (Object.keys(req.body).indexOf("unfollow") !== -1) {
    //if we should unfollow the given user
    console.log("Follow request is of type unfollow");
    const userToUnFollowId = await repo.getUserId(req.body.unfollow);
    if (userToUnFollowId == null) {
      console.log("Whom userId was null. Sending BadRequest");
      res.sendStatus(404, "Invalid user to unfollow");
      next();
      return;
    }
    // exists in repo
    await db.Followers.destroy({
      where: {
        who_id: userId,
        whom_id: userToUnFollowId,
      },
    });
    console.log("Unfollow was a success!");
    res.status(204).send("You have unfollowed " + req.body.unfollow);
    next();
    return;
  }
  console.log(
    "We should not have ended here... Only within one of the if-branches!"
  );
  console.log();
  next();
});

app.get("/fllws/:username", async (req, res, next) => {
  updateLatest(req);

  const notReqFromSim = notReqFromSimulator(req);

  if (notReqFromSim) {
    res.status(notReqFromSim[0]).send(notReqFromSim[1]);
    next();
    return;
  }

  const userId = await repo.getUserId(req.params.username);

  if (!userId) {
    res.sendStatus(404);
    next();
    return;
  }

  let limit = req.query.no;
  if (limit == null) limit == 100;

  //exists in repo
  const result = await db.Followers.findAll({
    include: {
      model: db.Users,
      as: "who",
      attributes: [],
    },
    where: {
      whom_id: userId,
    },
    attributes: ["who.username"],
    raw: true,
    limit: limit,
  });

  let resultList = [];
  if (!result) {
    result.forEach((item) => {
      resultList.push(item["username"]);
    });
  }
  res.send({ followers: resultList });
  next();
  return;
});

app.use(afterMiddleware);

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

