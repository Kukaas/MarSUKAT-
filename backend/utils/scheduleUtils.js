import Announcement from "../models/announcement.model.js";
import StudentOrder from "../models/studentOrder.model.js";

// Available time slots for measurements with max students per slot
export const TIME_SLOTS = [
  { time: "7:30 AM", maxStudents: 8 },  // 8 students
  { time: "8:30 AM", maxStudents: 8 },  // 8 students
  { time: "9:30 AM", maxStudents: 7 },  // 7 students
  { time: "10:30 AM", maxStudents: 7 }  // 7 students
];                                      // Total: 30 students

export const MAX_STUDENTS_PER_DAY = 30;

// Check if date is a weekday (Monday-Thursday)
export const isWeekday = (date) => {
  const day = date.getDay();
  return day >= 1 && day <= 4; // Monday (1) to Thursday (4)
};

// Format time slot
export const formatTimeSlot = (time) => {
  return time.split(" ")[0]; // Returns "7:30", "8:30", etc.
};

// Check if time slot has reached its limit
const hasReachedTimeSlotLimit = async (date, timeSlot) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const slotCount = await StudentOrder.countDocuments({
    "measurementSchedule.date": {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    "measurementSchedule.time": timeSlot.time,
    status: { $in: ["Approved", "Measured"] },
  });

  return slotCount >= timeSlot.maxStudents;
};

// Check if date has reached maximum students
const hasReachedDailyLimit = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyCount = await StudentOrder.countDocuments({
    "measurementSchedule.date": {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["Approved", "Measured"] },
  });

  return dailyCount >= MAX_STUDENTS_PER_DAY;
};

// Get next available schedule
export const getNextAvailableSchedule = async (startDate) => {
  // Always start from tomorrow for new schedules
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1);
  currentDate.setHours(0, 0, 0, 0);

  // Check for "No Measurement" announcement with case-insensitive search
  const noMeasurementAnnouncement = await Announcement.findOne({
    title: { $regex: /no\s*measurement/i },
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
  });

  if (noMeasurementAnnouncement) {
    // Start searching from the day after announcement ends
    const endDate = new Date(noMeasurementAnnouncement.endDate);
    currentDate.setTime(endDate.getTime() + 24 * 60 * 60 * 1000); // Add one day to end date

    // Ensure we're not starting on a weekend
    while (!isWeekday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Look for next 30 days maximum
  for (let i = 0; i < 30; i++) {
    // Skip to next day if current date is not a weekday
    if (!isWeekday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Check for "No Measurement" announcement on this date
    const dateSpecificAnnouncement = await Announcement.findOne({
      title: { $regex: /no\s*measurement/i },
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    // Skip this date if there's a "No Measurement" announcement
    if (dateSpecificAnnouncement) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Check if date has reached maximum students
    const reachedLimit = await hasReachedDailyLimit(currentDate);
    if (reachedLimit) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Check each time slot for this date
    for (const timeSlot of TIME_SLOTS) {
      // Check if this time slot has reached its limit
      const slotReachedLimit = await hasReachedTimeSlotLimit(
        currentDate,
        timeSlot
      );
      if (slotReachedLimit) {
        continue; // Try next time slot
      }

      // Return the first available slot
      return {
        date: new Date(currentDate),
        time: timeSlot.time,
      };
    }

    // Move to next day if no slots available today
    currentDate.setDate(currentDate.getDate() + 1);
  }

  throw new Error("No available slots found in the next 30 days");
};
