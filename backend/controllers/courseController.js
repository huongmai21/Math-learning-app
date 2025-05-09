const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({ message: 'Invalid page or limit' });
    }

    const courses = await Course.find({
      $or: [{ teacher: req.user.id }, { students: req.user.id }],
    })
      .populate('teacher', 'username')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    res.json({ data: courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  const { title, description } = req.body;
  try {
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const course = new Course({
      title,
      description,
      teacher: req.user.id,
      students: [],
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacher.toString() === req.user.id) {
      return res.status(400).json({ message: 'Teachers cannot enroll in their own course' });
    }

    if (!course.students.includes(req.user.id)) {
      course.students.push(req.user.id);
      await course.save();
    }
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};