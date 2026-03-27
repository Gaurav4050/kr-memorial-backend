const Doctor = require('../models/Doctor');
const { cloudinary } = require('../config/cloudinary');

exports.addDoctor = async (req, res) => {
  try {
    const { name, departmentId, specialty, qualification, experience, designation, languages, opdDays, opdTime, bio } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a doctor image' });
    }

    const doctor = await Doctor.create({
      name,
      departmentId,
      specialty,
      qualification,
      experience,
      designation,
      languages: languages ? languages.split(',') : [],
      opdDays,
      opdTime,
      bio,
      imageUrl: req.file.path, // Cloudinary URL automatically injected by multer-storage-cloudinary
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Extract Cloudinary public ID and delete
    const urlArray = doctor.imageUrl.split('/');
    const folderAndImage = urlArray.slice(urlArray.length - 2).join('/');
    const publicId = folderAndImage.split('.')[0];
    
    await cloudinary.uploader.destroy(publicId);

    await Doctor.deleteOne({ _id: doctor._id });

    res.status(200).json({ success: true, message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
