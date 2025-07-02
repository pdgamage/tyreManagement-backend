const { RequestModel, RequestImageModel } = require("../models");

exports.createRequest = async (req, res) => {
  try {
    const requestData = req.body;

    // Convert numeric fields from string to number
    requestData.vehicleId = Number(requestData.vehicleId);
    requestData.quantity = Number(requestData.quantity);
    requestData.tubesQuantity = Number(requestData.tubesQuantity);
    requestData.presentKmReading = Number(requestData.presentKmReading);
    requestData.previousKmReading = Number(requestData.previousKmReading);
    requestData.userId = Number(requestData.userId);

    // Validate required fields
    const requiredFields = [
      "userId",
      "vehicleId",
      "vehicleNumber",
      "quantity",
      "tubesQuantity",
      "tireSize",
      "requestReason",
      "requesterName",
      "requesterEmail",
      "requesterPhone",
      "year",
      "vehicleBrand",
      "vehicleModel",
      "userSection",
      "lastReplacementDate",
      "existingTireMake",
      "tireSizeRequired",
      "costCenter",
      "presentKmReading",
      "previousKmReading",
      "tireWearPattern",
    ];
    for (const field of requiredFields) {
      if (
        requestData[field] === undefined ||
        requestData[field] === null ||
        requestData[field] === ""
      ) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${field}` });
      }
    }

    // 1. Create the request
    const result = await RequestModel.create(requestData);

    // 2. Save image URLs in request_images table
    if (Array.isArray(requestData.images)) {
      for (let i = 0; i < requestData.images.length; i++) {
        const imageUrl = requestData.images[i];
        if (imageUrl) {
          await RequestImageModel.create({
            requestId: result.id,
            imagePath: imageUrl,
            imageIndex: i,
          });
        }
      }
    }

    res.status(201).json({ requestId: result.id });
  } catch (err) {
    console.error("Error creating tire request:", err);
    res.status(500).json({ error: "Failed to create tire request" });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await RequestModel.findAll();
    res.json(Array.isArray(requests) ? requests : []);
  } catch (error) {
    console.error("Error in getAllRequests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await RequestModel.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    const images = await RequestImageModel.findAll({
      where: { requestId: req.params.id },
      order: [["imageIndex", "ASC"]],
    });
    const imageUrls = images.map((img) => img.imagePath);
    res.json({ ...request.toJSON(), images: imageUrls });
  } catch (error) {
    console.error("Error in getRequestById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const requests = await RequestModel.findAll({
      where: { userId },
      order: [["submittedAt", "DESC"]],
    });
    res.json(Array.isArray(requests) ? requests : []);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const id = req.params.id;
    await RequestImageModel.destroy({ where: { requestId: id } });
    const deleted = await RequestModel.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete request" });
  }
};
