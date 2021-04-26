const express = require("express");
const expressWinston = require('express-winston');
const winston = require('winston');
const {logger, errorLogger, customLogger} = require('./logger.js'); // for transports.Console
const repo = require("./repository");

const url = require("url");
const prom = require("prom-client");

const app = express();
const port = 5001;

const router = express.Router();

const register = new prom.Registry();
const Monitor = require("./monitoring");
const monitoring = new Monitor.Monitoring(prom, register);

app.use(express.json());
app.use(beforeMiddleware);
app.use(logger);

app.use(router);

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

router.get("/metrics", async (req, res, next) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics())
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

router.get("/latest", async (req, res, next) => {
  res.json({ latest: LATEST });
  next();
  return;
});

router.post("/register", async (req, res, next) => {
  updateLatest(req);

  const { username, email, pwd } = req.body;
  let errorMessage;

  try
  {
      errorMessage = await repo.registerUser(username, email, pwd);
  }
  catch (error)
  {
    res.sendStatus(500);
    return next(error)
  }

  if (errorMessage) res.status(400).send(errorMessage)
  else res.sendStatus(204);
  next();
  return;
});

router.get("/msgs", async (req, res, next) => {
  updateLatest(req);
  var notFromSim = notReqFromSimulator(req);
  if (notFromSim) {
    res.status(notFromSim[0]).send(notFromSim[1]);
    next();
    return;
  }

  let limit = req.query.no;
  if (!limit) limit = 100;
  let result;

  try {
	result = await repo.simulatorGetAllMessagesAsync(limit)
  }
  catch (error) 
  {
	res.sendStatus(500)
	return next(error)
  }
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
  customLogger.log('info',"Recived request for messages, and returned " + filteredMsgs.length + " messages")
  next();
  return;
});

router.get("/msgs/:username", async (req, res, next) => {
  updateLatest(req);

  var notFromSim = notReqFromSimulator(req);
  if (notFromSim) {
    res.status(notFromSim[0]).send(notFromSim[1]);
    next();
    return;
  }
  let userid
  try {
	userid = await repo.getUserId(req.params.username)
  }
  catch (error) {
	res.sendStatus(500)
	return next(error)
  }

  if (!userid) {
    res.sendStatus(404);
    next();
    return;
  }

  let limit = req.query.no;
  if (!limit) limit = 100;

  let result
  try {
	result = await repo.simulatorGetUserMessagesAsync(userid, limit)
  }
  catch (error) {
	res.sendStatus(500)
	return next(error)
  }

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

router.post("/msgs/:username", async (req, res, next) => {
  updateLatest(req);
  customLogger.log('info',
    "Received a Post to /msgs/:username with username: " + req.params.username
  );

  var notFromSim = notReqFromSimulator(req);
  if (notFromSim) {
    res.status(notFromSim[0]).send(notFromSim[1]);
    next();
    return;
  }

  const text = req.body.content;
  let userid
  try {
	userid = await repo.getUserId(req.params.username)
  }
  catch (error) {
	res.sendStatus(500)
	return next(error)
  }

  if (userid == null || text == "") {
    customLogger.log('info',
      "   - Post failed: " +
        (userid == null ? "user does not exist" : "message is empty: " + text)
    );
    res.sendStatus(400);
    next();
    return;
  } else {
	try {
	  await repo.postMessageAsync(userid, text)
	}
	catch (error) {
	  res.sendStatus(500)
	  return next(error)
	}

    res.sendStatus(204);
    next();
    return;
  }
});

router.post("/fllws/:username", async (req, res, next) => {
  updateLatest(req);
  customLogger.log('info',`Recieved a Post follow request:\n request body:  ${JSON.stringify(req.body)}\n requst params: ${JSON.stringify(req.params)}`);

  const notReqFromSim = notReqFromSimulator(req);

  if (notReqFromSim) {
    res.status(notReqFromSim[0]).send(notReqFromSim[1]);
    next();
    return;
  }

  let userId
  try {
	userId = await repo.getUserId(req.params.username)
  }
  catch (error) {
	res.sendStatus(500)
	return next(error)
  }

  if (!userId) {
    res.sendStatus(404);
    next();
    return;
  }

  if (Object.keys(req.body).indexOf("follow") !== -1) {
    //if we should follow the given user
	let userToFollowId
	try {
	  userToFollowId = await repo.getUserId(req.body.follow)
	}
	catch (error) {
	  res.sendStatus(500)
	  return next(error)
	}

    if (userToFollowId == null) {
      res.status(404).send("Invalid user to follow");
      next();
      return;
    }
	try {
	  await repo.followUserAsync(userId, userToFollowId)
	}
	catch (error) {
	  res.sendStatus(500)
	  return next(error)
	}

    res.status(204).send("You are now following " + req.body.follow);
    next();
    return;
  }

  if (Object.keys(req.body).indexOf("unfollow") !== -1) {
    //if we should unfollow the given user
	let userToUnFollowId
	try {
	  userToUnFollowId = await repo.getUserId(req.body.unfollow)
	}
	catch (error) {
	  res.sendStatus(500)
	  return next(error)
	}

    if (userToUnFollowId == null) {
      res.sendStatus(404, "Invalid user to unfollow");
      next();
      return;
    }
	try {
	  await repo.unfollowUserAsync(userId, userToUnFollowId)
	}
	catch (error) {
	  res.sendStatus(500)
	  return next(error)
	}

    res.status(204).send("You have unfollowed " + req.body.unfollow);
    next();
    return;
  }
  next();
});

router.get("/fllws/:username", async (req, res, next) => {
  updateLatest(req);

  const notReqFromSim = notReqFromSimulator(req);

  if (notReqFromSim) {
    res.status(notReqFromSim[0]).send(notReqFromSim[1]);
    next();
    return;
  }

  let userId
  try {
	userId = await repo.getUserId(req.params.username)
  }
  catch (error) {
	res.sendStatus(500)
	return next(error)
  }


  if (!userId) {
    res.sendStatus(404);
    next();
    return;
  }

  let limit = req.query.no;
  if (limit == null) limit == 100;

  let result
  try {
	result = await repo.simulatorGetFollowersAsync(userId, limit)
  }
  catch (error) {
	res.sendStatus(500)
	return next(error)
  }


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

app.use(errorLogger);

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

