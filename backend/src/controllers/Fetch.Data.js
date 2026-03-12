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
