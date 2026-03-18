import db from "../config/db.js";

export const getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    console.log("Trip ID:", tripId);

    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    res.status(200).json({
      id: tripDoc.id,
      ...tripDoc.data()
    });

  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({
      error: error.message
    });
  }
};

export const getAllTrips = async (req, res) => {
  try {

    const tripsRef = db.collection("trips");
    const snapshot = await tripsRef.get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: "No trips found"
      });
    }

    const trips = [];

    snapshot.forEach(doc => {
      trips.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json(trips);

  } catch (error) {

    console.error("Error fetching trips:", error);

    res.status(500).json({
      error: error.message
    });

  }
};
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const tripRef = db.collection("trips").doc(tripId);
    const tripDoc = await tripRef.get();

    if (!tripDoc.exists) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await tripRef.delete();

    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params; // ✅ from params
    const { budget } = req.body;

    if (!tripId) {
      return res.status(400).json({ message: "Trip ID is required" });
    }

    const tripRef = db.collection("trips").doc(tripId);

    await tripRef.update({
      budget,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: "Trip updated successfully",
    });

  } catch (error) {
    console.error("Update error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};
