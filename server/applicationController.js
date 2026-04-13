const Student = require('../models/Student');
const Internship = require('../models/Internship'); // Assuming you have this model
const Application = require('../models/Application'); // Assuming you have this model

exports.applyForInternship = async (req, res) => {
  try {
    const { internshipId } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user

    // 1. Fetch Student Details
    const student = await Student.findOne({ user: userId });

    if (!student) {
      return res.status(404).json({ 
        message: 'Student profile not found. Please register as a student.' 
      });
    }

    // 2. Check if Profile is Complete (Must fill details)
    if (!student.isProfileComplete) {
      return res.status(400).json({
        success: false,
        error: 'PROFILE_INCOMPLETE',
        message: 'You must complete your profile details (CGPA, Year, etc.) before applying.',
        redirectTo: '/student/profile/edit'
      });
    }

    // 3. Fetch Internship Requirements
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found.' });
    }

    // 4. Check Eligibility (CGPA and Year)
    if (internship.minCgpa && student.cgpa < internship.minCgpa) {
      return res.status(400).json({
        success: false,
        error: 'NOT_ELIGIBLE',
        message: `Eligibility Check Failed: Minimum CGPA required is ${internship.minCgpa}. Your CGPA is ${student.cgpa}.`
      });
    }

    if (internship.minYear && student.currentYear < internship.minYear) {
      return res.status(400).json({
        success: false,
        error: 'NOT_ELIGIBLE',
        message: `Eligibility Check Failed: This internship is open for year ${internship.minYear} students and above.`
      });
    }

    // 5. If Eligible, Create Application
    const newApplication = new Application({
      student: student._id,
      internship: internship._id,
      status: 'Pending'
    });

    await newApplication.save();
    res.status(201).json({ success: true, message: 'Application submitted successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during application process.' });
  }
};