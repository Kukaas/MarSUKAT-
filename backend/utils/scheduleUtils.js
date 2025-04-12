import Announcement from "../models/announcement.model.js";
import StudentOrder from "../models/studentOrder.model.js";

// Available time slots for measurements with max students per slot
export const TIME_SLOTS = [
  { time: "7:30 AM", maxStudents: 4 },  // First slot
  { time: "7:50 AM", maxStudents: 4 },  // Second slot
  { time: "8:10 AM", maxStudents: 4 },  // Third slot
  { time: "8:30 AM", maxStudents: 4 },  // Fourth slot
  { time: "8:50 AM", maxStudents: 4 },  // Fifth slot
  { time: "9:10 AM", maxStudents: 4 },  // Sixth slot
  { time: "9:30 AM", maxStudents: 4 },  // Seventh slot
  { time: "9:50 AM", maxStudents: 4 },
  { time: "10:10 AM", maxStudents: 4 },
  { time: "10:30 AM", maxStudents: 4 },
  { time: "10:50 AM", maxStudents: 4 },
  { time: "11:10 AM", maxStudents: 4 },
  { time: "11:30 AM", maxStudents: 4 }
];                                      // Total: 52 students

export const MAX_STUDENTS_PER_DAY = 52;

// Check if date is a weekday (Monday-Thursday)
export const isWeekday = (date) => {
  const day = date.getDay();
  return day >= 1 && day <= 4; // Monday (1) to Thursday (4)
};

// Get next valid weekday
const getNextValidWeekday = (date) => {
  const nextDate = new Date(date);
  do {
    nextDate.setDate(nextDate.getDate() + 1);
  } while (!isWeekday(nextDate));
  return nextDate;
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
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 1);
  currentDate.setHours(0, 0, 0, 0);

  if (!isWeekday(currentDate)) {
    currentDate = getNextValidWeekday(currentDate);
  }

  // Check for "No Measurement" announcement with case-insensitive search
  const noMeasurementAnnouncement = await Announcement.findOne({
    title: { $regex: /no\s*measurement/i },
    startDate: { $lte: currentDate },
    endDate: { $gte: currentDate },
  });

  if (noMeasurementAnnouncement) {
    // Start searching from the day after announcement ends
    const endDate = new Date(noMeasurementAnnouncement.endDate);
    currentDate = getNextValidWeekday(endDate);
  }

  // Look for next 30 days maximum
  for (let i = 0; i < 30; i++) {
    // Skip to next day if current date is not a weekday
    if (!isWeekday(currentDate)) {
      currentDate = getNextValidWeekday(currentDate);
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
      currentDate = getNextValidWeekday(currentDate);
      continue;
    }

    // Check if date has reached maximum students
    const reachedLimit = await hasReachedDailyLimit(currentDate);
    if (reachedLimit) {
      currentDate = getNextValidWeekday(currentDate);
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
    currentDate = getNextValidWeekday(currentDate);
  }

  throw new Error("No available slots found in the next 30 days");
};
