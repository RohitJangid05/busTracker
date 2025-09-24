const imagekit = require("../config/imageKitConfig");
const User = require("../model/userModel");

let uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { _id, role } = req.user;

    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/bus_app_profile_img",
      useUniqueFileName: true
    });


    const imageURL = imagekit.url({
      src: response.url,
      transformation: [
        { width: "500" },
        { quality: "auto" },
        { format: "webp" }
      ]
    });

    await User.findByIdAndUpdate(_id, { image: imageURL }, { new: true });

    res.redirect(`/${role}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

module.exports = uploadProfileImage;
