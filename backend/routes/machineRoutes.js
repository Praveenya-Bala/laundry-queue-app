const express = require("express");
const router = express.Router();

const Machine = require("../models/Machine");
const Queue = require("../models/Queue");

// ✅ IMPORT MIDDLEWARE
const { verifyToken, isAdmin } = require("../middleware/auth");

// ✅ SET MAINTENANCE (ADMIN ONLY)
router.put("/:id/maintenance", verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    // clear queue
    await Queue.deleteMany({ machine: req.params.id });

    machine.status = "maintenance";
    machine.currentUser = null;

    await machine.save();

    res.json({ message: "Machine set to maintenance" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ENABLE MACHINE (ADMIN ONLY)
router.put("/:id/enable", verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    machine.status = "available";
    await machine.save();

    res.json({ message: "Machine enabled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE MACHINE
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    res.json(machine);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// USER STATUS
router.get("/status/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  const runningMachine = await Machine.findOne({
    currentUser: userId
  });

  const queueEntry = await Queue.findOne({ user: userId }).populate("machine");

  res.json({
    runningMachine,
    queuedMachine: queueEntry?.machine || null
  });
});

// ✅ ADD MACHINE (ADMIN ONLY)
router.post("/add", verifyToken, isAdmin, async (req, res) => {
  try {
    const machine = new Machine({ name: req.body.name });
    await machine.save();
    res.json(machine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE MACHINE (ADMIN ONLY)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ message: "Machine deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;