const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePDF = (bookings, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings.pdf"');

      doc.pipe(res);

      const logoPath = path.join(__dirname, '../public/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, { fit: [100, 100], align: 'center' });
        doc.moveDown();
      }

      doc.fontSize(20).text('Classroom Bookings Report', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text('Classroom | User | Date | Time | Status', { underline: true });
      doc.moveDown();

      bookings.forEach(booking => {
        doc.fontSize(10).text(
          `${booking.classroomName || 'N/A'} | ${booking.userName || 'N/A'} | ${booking.date || 'N/A'} | ${booking.startTime || 'N/A'} - ${booking.endTime || 'N/A'} | ${booking.status || 'N/A'}`
        );
        doc.moveDown();
      });

      // Finalize PDF and resolve when finished
      doc.end();
      doc.on('finish', resolve);
      doc.on('error', (err) => {
        console.error('PDF stream error:', err);
        reject(err);
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      reject(err);
    }
  });
};

// Generate PDF for users
exports.generateUserDataPDF = (users, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="users.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('User Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();
    doc.text('ID | Name | Email | Role | Created At', { underline: true });
    doc.moveDown();

    users.forEach(user => {
      doc.fontSize(10).text(
        `${user._id || 'N/A'} | ${user.name || 'N/A'} | ${user.email || 'N/A'} | ${user.role || 'N/A'} | ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`
      );
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('User PDF generation error:', err);
    if (!res.headersSent) res.status(500).send('Failed to generate PDF');
  }
};



// Generate PDF for classrooms
exports.generateClassroomDataPDF = (classrooms, res) => {
  try {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="classrooms.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('Classroom Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();
    doc.text('ID | Name | Building | Room | Capacity | Available | Features', { underline: true });
    doc.moveDown();

    classrooms.forEach(c => {
      doc.fontSize(10).text(
        `${c._id || 'N/A'} | ${c.name || 'N/A'} | ${c.building || 'N/A'} | ${c.roomNumber || 'N/A'} | ${c.capacity || 0} | ${c.available ? 'Yes' : 'No'} | ${Array.isArray(c.features) ? c.features.join(', ') : ''}`
      );
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Classroom PDF generation error:', err);
    if (!res.headersSent) res.status(500).send('Failed to generate PDF');
  }
};


// Generate CSV from bookings
exports.generateCSV = (bookings, res) => {
  try {
    // Define fields for CSV
    const fields = [
      { label: 'Booking ID', value: 'id' },
      { label: 'User Name', value: 'userName' },
      { label: 'Classroom', value: 'classroomName' },
      { label: 'Date', value: 'date' },
      { label: 'Start Time', value: 'startTime' },
      { label: 'End Time', value: 'endTime' },
      { label: 'Purpose', value: 'purpose' },
      { label: 'Status', value: 'status' },
      { label: 'Created At', value: 'createdAt' }
    ];
    
    // Transform data to ensure all fields are present
    const transformedBookings = bookings.map(booking => {
      return {
        id: booking.id || booking._id || '',
        userName: booking.userName || '',
        classroomName: booking.classroomName || '',
        date: booking.date || '',
        startTime: booking.startTime || '',
        endTime: booking.endTime || '',
        purpose: booking.purpose || '',
        status: booking.status || '',
        createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleString() : ''
      };
    });
    
    // Create parser with options
    const bookingFields = [
      { label: 'ID', value: 'id' },
      { label: 'User Name', value: 'userName' },
      { label: 'Classroom Name', value: 'classroomName' },
      { label: 'Date', value: 'date' },
      { label: 'Start Time', value: 'startTime' },
      { label: 'End Time', value: 'endTime' },
      { label: 'Purpose', value: 'purpose' },
      { label: 'Status', value: 'status' },
      { label: 'Created At', value: 'createdAt' }
    ];
    const json2csvParser = new Parser({ 
      fields: bookingFields,
      delimiter: ',',
      defaultValue: 'N/A',
      quote: '"',
      escapedQuote: '""'
    });
    
    // Parse data to CSV
    const csv = json2csvParser.parse(transformedBookings);
    
    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.header('Cache-Control', 'no-cache');
    res.header('Pragma', 'no-cache');
    
    // Send CSV
    res.send(csv);
    return true;
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

// Generate user data export in CSV format
exports.generateUserDataCSV = (users, res) => {
  try {
    // Define fields for CSV
    const userFields = [
      { label: 'User ID', value: 'id' },
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Role', value: 'role' },
      { label: 'Created At', value: 'createdAt' }
    ];
    
    // Transform data to ensure all fields are present
    const transformedUsers = users.map(user => {
      return {
        id: user.id || user._id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
      };
    });
    
    // Create parser with options
    const json2csvParser = new Parser({ 
      fields: userFields,
      delimiter: ',',
      defaultValue: 'N/A',
      quote: '"',
      escapedQuote: '""'
    });
    
    // Parse data to CSV
    const csv = json2csvParser.parse(transformedUsers);
    
    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="users.csv"');
    res.header('Cache-Control', 'no-cache');
    res.header('Pragma', 'no-cache');
    
    // Send CSV
    res.send(csv);
    return true;
  } catch (error) {
    console.error('Error generating user CSV:', error);
    throw error;
  }
};

// Generate classroom data export in CSV format
exports.generateClassroomDataCSV = (classrooms, res) => {
  try {
    // Define fields for CSV
    const classroomFields = [
      { label: 'Classroom ID', value: 'id' },
      { label: 'Name', value: 'name' },
      { label: 'Building', value: 'building' },
      { label: 'Room Number', value: 'roomNumber' },
      { label: 'Capacity', value: 'capacity' },
      { label: 'Available', value: 'available' },
      { label: 'Features', value: 'features' }
    ];
    
    // Transform data to ensure all fields are present
    const transformedClassrooms = classrooms.map(classroom => {
      return {
        id: classroom.id || classroom._id || '',
        name: classroom.name || '',
        building: classroom.building || '',
        roomNumber: classroom.roomNumber || '',
        capacity: classroom.capacity || 0,
        available: classroom.available ? 'Yes' : 'No',
        features: Array.isArray(classroom.features) ? classroom.features.join(', ') : ''
      };
    });
    
    // Create parser with options
    const json2csvParser = new Parser({ 
      fields: classroomFields,
      delimiter: ',',
      defaultValue: 'N/A',
      quote: '"',
      escapedQuote: '""'
    });
    
    // Parse data to CSV
    const csv = json2csvParser.parse(transformedClassrooms);
    
    // Set headers for download
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="classrooms.csv"');
    res.header('Cache-Control', 'no-cache');
    res.header('Pragma', 'no-cache');
    
    // Send CSV
    res.send(csv);
    return true;
  } catch (error) {
    console.error('Error generating classroom CSV:', error);
    throw error;
  }
};