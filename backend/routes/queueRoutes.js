const express = require("express");
const router = express.Router();

const Queue = require("../models/Queue");
const Machine = require("../models/Machine");

// ✅ IMPORT MIDDLEWARE
const { verifyToken } = require("../middleware/auth");

/* GET queue */
router.get("/", verifyToken, async (req, res) => {
  try {
    const machines = await Machine.find()
      .populate("currentUser", "username");

    const queues = await Queue.find()
      .populate("user", "username");

    const result = machines.map((m) => {
      const machineQueue = queues
        .filter(q => q.machine.toString() === m._id.toString())
        .map(q => q.user);

      return {
        ...m.toObject(),
        queue: machineQueue
      };
    });

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

/* GET queue for ONE machine */
router.get("/:machineId", verifyToken, async (req, res) => {
  try {
    const queue = await Queue.find({ machine: req.params.machineId })
      .populate("user", "username")
      .sort({ joinedAt: 1 });

    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/join", verifyToken, async (req, res) => {
  try {
    const { machineId, userId } = req.body;

    console.log("JOIN DATA:", req.body); // 🔥 ADD THIS

    if (!machineId || !userId) {
      return res.status(400).json({
        message: "Missing machineId or userId"
      });
    }

    const machine = await Machine.findById(machineId);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    const alreadyQueued = await Queue.findOne({ user: userId });

    if (alreadyQueued) {
      return res.status(400).json({
        message: "You are already in another queue"
      });
    }

    await Queue.create({
      machine: machineId,
      user: userId
    });

    res.json({ message: "Joined queue" });

  } catch (err) {
    console.error("JOIN ERROR:", err); // 🔥 VERY IMPORTANT
    res.status(500).json({ message: err.message });
  }
});
/* LEAVE queue */
router.post("/leave", verifyToken, async (req, res) => {
  const { machineId, userId } = req.body;

  await Queue.findOneAndDelete({ machine: machineId, user: userId });

  res.json({ message: "Left queue" });
});

/* START machine */
router.post("/start", verifyToken, async (req, res) => {
  const { machineId, userId } = req.body;

  const machine = await Machine.findById(machineId);
  if (!machine) {
    return res.status(404).json({ message: "Machine not found" });
  }

  if (machine.status === "running") {
    return res.status(400).json({ message: "Machine already running" });
  }

  const first = await Queue.findOne({ machine: machineId }).sort({
    joinedAt: 1
  });

  if (!first || first.user.toString() !== userId) {
    return res.status(403).json({
      message: "Only first user can start the machine"
    });
  }

  machine.status = "running";
  machine.currentUser = userId;
  await machine.save();

  first.turnStartedAt = new Date();
  await first.save();

  res.json({ message: "Machine started" });
});

/* FINISH machine */
router.post("/finish", verifyToken, async (req, res) => {
  const { machineId, userId } = req.body;

  const machine = await Machine.findById(machineId);

  if (!machine || machine.currentUser?.toString() !== userId) {
    return res.status(403).json({ message: "Not allowed" });
  }

  await Queue.findOneAndDelete({
    machine: machineId,
    user: userId
  });

  machine.status = "available";
  machine.currentUser = null;
  await machine.save();

  res.json({ message: "Machine finished" });
});

module.exports = router;