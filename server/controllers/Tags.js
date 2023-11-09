const Tag = require("../models/Tags");

//Create Tag Handler Function

exports.createTag = async (req, res) => {
  try {
    //Data fetch from model.
    const { name, description } = req.body;

    //Validation of data
    if (!name || !descriptions) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //Create entry in database
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    console.log(tagDetails);

    return res.status(200).json({
      success: true,
      message: "Tag created Successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//getAllTags handler function

exports.showAllTags = async (req, res) => {
  try {
    const allTgas = await Tag.find({}, { name: true, description: true });

    console.log(allTgas);

    return res.status(200).json({
      success: true,
      message: "All tags created successfully.",
      allTgas,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
