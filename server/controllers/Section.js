const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    // Data fetch
    const { sectionName, courseID } = req.body;
    // Data validation
    if (!sectionName || !courseID) {
      return res.status(400).json({
        success: false,
        message: "missing Properties",
      });
    }
    // Create Section
    const newSection = await Section.create({ sectionname });
    // update Course with Section objectID
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseID,
      {
        $push: {
          couseContent: newSection._id,
        },
      },
      { new: true }
    );
    //HomeWork : Use populate to replace sections/sub-Sections both in the updateCourseDetails
    // return response
    return res.status(200).json({
      success: true,
      message: "Section Created Successfully.",
      updatedCourseDetails,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unabel to create, Please try again later.",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    // Data input
    const { sectionName, sectionId } = req.body;
    // Data Validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "missing Properties",
      });
    }
    // Update Data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Section updated successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to Update Section, Please try again later.",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    // Get ID - assuming that we are sending ID in params
    const { sectionId } = req.params;
    // Use findByIdAndDelete
    await Section.findByIdAndDelete(sectionId);
    // return response
     return res.status.json({
        success:true,
        message:"Section Deleted Successfully."
     })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to Delete Section, Please try again later.",
    });
  }
};
