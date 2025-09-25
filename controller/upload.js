const imagekit = require("../config/imageKitConfig");
const User = require("../model/userModel");

let uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { _id, role } = req.user;

    const user = await User.findById(_id);

    if (user?.imageFileId) {
      try {
        await imagekit.deleteFile(user.imageFileId);
      } catch (deleteErr) {
        console.warn("Failed to delete old profile image:", deleteErr.message);
      }
    }

    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: `${_id}_profile.webp`,
      folder: "/bus_app_profile_img",
      useUniqueFileName: false,
      overwriteFile: true,
    });

    // Add version param to avoid caching issues
    const imageURL =
      imagekit.url({
        src: response.url,
        transformation: [
          { width: "500" },
          { quality: "auto" },
          { format: "webp" },
        ],
      }) + `?v=${Date.now()}`;

    // Save updated image + fileId
    await User.findByIdAndUpdate(
      _id,
      { image: imageURL, imageFileId: response.fileId },
      { new: true }
    );

    res.redirect(`/${role}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

module.exports = uploadProfileImage;
