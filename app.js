import express from "express";
import { connectdb } from "./Mongo.js";
import { User } from "./model/user.js";
import { Bus } from "./model/buses.js";
import { Route } from "./model/routes.js";
import { cors } from "./utils/cors.js";
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
connectdb();
app.use(cors);
app.post("/login", async (req, res) => {
  const { password, username } = req.body;
  if (!password || !username) {
    return res
      .status(400)
      .json({ message: "please fill all the required fields" });
  }
  const userData = await User.findOne({ username, password });
  if (!userData) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  res.status(201).json({
    userData,
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password, username, address, city, gender, role } = req.body;

    // Check if any required field is missing
    if (
      !email ||
      !password ||
      !username ||
      !address ||
      !city ||
      !gender ||
      !role
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    const user = new User({
      email,
      password,
      username,
      address,
      city,
      gender,
      role,
    });

    // Save user data to the database
    const userData = await user.save();

    res.status(201).json({
      userData,
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Check for specific MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or username is already taken" });
    }

    res.status(500).json({ message: "An error occurred during signup" });
  }
});

app.put("/update-profile", async (req, res) => {
  try {
    const { username, password, email, address, city, gender } = req.body;

    // Find the user by email or any unique identifier
    const user = await User.findOne({ email });

    // If the user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    user.username = username;
    user.password = password; // You may want to handle password updates more securely
    user.address = address;
    user.city = city;
    user.gender = gender;

    // Save the updated user data
    const updatedUserData = await user.save();

    res.status(200).json({ userData: updatedUserData });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle specific errors, if needed
    res
      .status(500)
      .json({ message: "An error occurred during profile update" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ message: "Role parameter is required" });
    }
    let userModel = role;

    const users = await User.find({ role: userModel }, "-name");

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
});
app.put("/users/:id/suspend", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the status field
    user.status = user.status === "Active" ? "Suspended" : "Active";

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({
      message: `User ${updatedUser.status} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Change user status error:", error);
    res.status(500).json({ message: "An error occurred during status change" });
  }
});

app.post("/postRoute", async (req, res) => {
  const {
    price,
    arrivalTime,
    departureTime,
    bus,
    arrivalPlace,
    departurePlace,
  } = req.body;

  if (
    !price ||
    !arrivalTime ||
    !departureTime ||
    !bus ||
    !arrivalPlace ||
    !departurePlace
  ) {
    return res
      .status(400)
      .json({ message: "please fill all the required fields" });
  }
  const findBus = await Bus.findOne({ _id: bus });
  if (!findBus) {
    return res.status(404).json({ message: "Bus not found" });
  }

  const route = new Route({
    price,
    arrivalTime,
    departureTime,
    bus,
    arrivalPlace,
    departurePlace,
  });
  const routeData = await route.save();

  res.status(201).json({
    routeData,
  });
});

app.put("/updateRoute/:id", async (req, res) => {
  const {
    price,
    arrivalTime,
    departureTime,
    bus,
    arrivalPlace,
    departurePlace,
  } = req.body;

  try {
    if (
      !price ||
      !arrivalTime ||
      !departureTime ||
      !bus ||
      !arrivalPlace ||
      !departurePlace
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    // Check if the specified bus exists
    const findBus = await Bus.findById(bus);
    if (!findBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Find and update the route by ID
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      {
        price,
        arrivalTime,
        departureTime,
        bus,
        arrivalPlace,
        departurePlace,
      },
      { new: true } // Return the updated document
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({ updatedRoute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getRoutes", async (req, res) => {
  const routes = await Route.find().populate("bus");

  if (!routes) {
    return res.status(404).json({ message: "There no available bus" });
  }

  res.status(201).json({
    routes,
  });
});
app.get("/getRoute/:id", async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate("bus");

    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({ route });
  } catch (error) {
    console.error("Error getting route by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete specific route by ID
app.delete("/deleteRoute/:id", async (req, res) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);

    if (!deletedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/postBus", async (req, res) => {
  const { name, sits, plate, user } = req.body;

  if (!name || !sits || !plate || user) {
    return res
      .status(400)
      .json({ message: "please fill all the required fields" });
  }

  const busData = new Bus({
    name,
    sits,
    plate,
    user,
  });
  const saveBus = await busData.save();

  res.status(201).json({
    saveBus,
  });
});
app.put("/updateBus/:id", async (req, res) => {
  const { name, sits, plate } = req.body;
  const busId = req.params.id;

  try {
    // Check if the bus with the given _id exists
    const existingBus = await Bus.findById(busId);

    if (!existingBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Check if the provided plate number already exists in the database
    if (plate && plate !== existingBus.plate) {
      const plateExists = await Bus.findOne({ plate });

      if (plateExists) {
        return res.status(400).json({ message: "Plate number already exists" });
      }
    }

    // Update existing bus
    existingBus.name = name || existingBus.name;
    existingBus.sits = sits || existingBus.sits;
    existingBus.plate = plate || existingBus.plate;

    const updatedBus = await existingBus.save();

    res.status(200).json({
      updatedBus,
      message: "Bus updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/getBus/:id?", async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      const bus = await Bus.findById(id);

      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }

      res.status(200).json({ bus });
    } else {
      const savedBus = await Bus.find();
      res.status(200).json({ savedBus });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.delete("/getBus/:id", async (req, res) => {
  console.log("asd");
  try {
    const { id } = req.params;

    // Check if the bus with the given _id exists
    const existingBus = await Bus.findById(id);

    if (!existingBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Delete the bus
    await existingBus.deleteOne();

    res.status(200).json({ message: "Bus deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/getBus", async (req, res) => {
  const savedBus = await Bus.find();

  res.status(201).json({
    savedBus,
  });
});
app.get("/getBus/mypost/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Find buses posted by the specific user
    const userBuses = await Bus.find({ user: userId });

    res.status(200).json({
      savedBus: userBuses,
    });
  } catch (error) {
    console.error("Get user buses error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching user buses" });
  }
});

app.delete("/route", async (req, res) => {
  const savedBus = await Route.deleteMany();

  res.status(201).json({
    message: "deleted sucessfully",
  });
});
app.listen(PORT, () => {
  console.log("listening on port 3000");
});
