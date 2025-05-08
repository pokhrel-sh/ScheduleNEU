import { useState } from "react";

interface Section {
  crn: number;
  days: string;
  time: string;
  course: string;
}

type Schedule = [number, Section[]];

const courses: Section[][] = [
  [
    { crn: 11409, days: "Monday",                      time: "10:30 AM - 11:35 AM", course: "Coop" },
    { crn: 11857, days: "Monday",                      time: "01:35 PM - 02:40 PM", course: "Coop" },
    { crn: 11695, days: "Tuesday",                     time: "01:35 PM - 02:40 PM", course: "Coop" },
    { crn: 11705, days: "Tuesday",                     time: "01:35 PM - 02:40 PM", course: "Coop" },
    { crn: 11858, days: "Tuesday",                     time: "01:35 PM - 02:40 PM", course: "Coop" },
    { crn: 11859, days: "Tuesday",                     time: "01:35 PM - 02:40 PM", course: "Coop" },
    { crn: 12103, days: "Wednesday",                   time: "01:35 PM - 02:40 PM", course: "Coop" },
    { crn: 12329, days: "Wednesday",                   time: "11:45 AM - 12:50 PM", course: "Coop" },
    { crn: 14588, days: "Wednesday",                   time: "11:45 AM - 12:50 PM", course: "Coop" },
    { crn: 15448, days: "Wednesday",                   time: "01:35 PM - 02:40 PM", course: "Coop" },
  ],
  [
    { crn: 13924, days: "Monday, Wednesday, Thursday", time: "08:00 AM - 09:05 AM", course: "Calc 2" },
    { crn: 11136, days: "Monday, Wednesday, Thursday", time: "08:00 AM - 09:05 AM", course: "Calc 2" },
    { crn: 12275, days: "Monday, Wednesday, Thursday", time: "09:15 AM - 10:20 AM", course: "Calc 2" },
    { crn: 11223, days: "Monday, Wednesday, Thursday", time: "09:15 AM - 10:20 AM", course: "Calc 2" },
    { crn: 13788, days: "Monday, Wednesday, Thursday", time: "09:15 AM - 10:20 AM", course: "Calc 2" },
    { crn: 15700, days: "Monday, Wednesday, Thursday", time: "09:15 AM - 10:20 AM", course: "Calc 2" },
    { crn: 10699, days: "Monday, Wednesday, Thursday", time: "10:30 AM - 11:35 AM", course: "Calc 2" },
    { crn: 12042, days: "Monday, Wednesday, Thursday", time: "10:30 AM - 11:35 AM", course: "Calc 2" },
    { crn: 12211, days: "Monday, Wednesday, Thursday", time: "01:35 PM - 02:40 PM", course: "Calc 2" },
    { crn: 14520, days: "Monday, Wednesday, Thursday", time: "01:35 PM - 02:40 PM", course: "Calc 2" },
  ],
  [
    { crn: 20125, days: "Monday, Wednesday, Friday",   time: "09:15 AM - 10:20 AM", course: "Data Structures" },
    { crn: 20126, days: "Monday, Wednesday, Friday",   time: "10:30 AM - 11:35 AM", course: "Data Structures" },
    { crn: 20127, days: "Monday, Wednesday, Friday",   time: "01:35 PM - 02:40 PM", course: "Data Structures" },
    { crn: 20128, days: "Tuesday, Thursday",           time: "09:50 AM - 11:30 AM", course: "Data Structures" },
    { crn: 20129, days: "Tuesday, Thursday",           time: "01:30 PM - 03:10 PM", course: "Data Structures" },
    { crn: 20130, days: "Tuesday, Thursday",           time: "03:25 PM - 05:05 PM", course: "Data Structures" },
    { crn: 20131, days: "Wednesday, Friday",          time: "08:00 AM - 09:05 AM", course: "Data Structures" },
    { crn: 20132, days: "Wednesday, Friday",          time: "02:50 PM - 03:55 PM", course: "Data Structures" },
    { crn: 20133, days: "Thursday, Friday",           time: "10:30 AM - 11:35 AM", course: "Data Structures" },
    { crn: 20134, days: "Thursday, Friday",           time: "04:35 PM - 05:40 PM", course: "Data Structures" },
  ],
  [
    { crn: 30125, days: "Monday",                      time: "08:00 AM - 10:00 AM", course: "Organic Chemistry" },
    { crn: 30126, days: "Monday",                      time: "10:30 AM - 12:30 PM", course: "Organic Chemistry" },
    { crn: 30127, days: "Tuesday",                     time: "09:50 AM - 11:50 AM", course: "Organic Chemistry" },
    { crn: 30128, days: "Tuesday",                     time: "01:30 PM - 03:30 PM", course: "Organic Chemistry" },
    { crn: 30129, days: "Wednesday",                   time: "08:00 AM - 10:00 AM", course: "Organic Chemistry" },
    { crn: 30130, days: "Wednesday",                   time: "10:30 AM - 12:30 PM", course: "Organic Chemistry" },
    { crn: 30131, days: "Thursday",                    time: "09:50 AM - 11:50 AM", course: "Organic Chemistry" },
    { crn: 30132, days: "Thursday",                    time: "01:30 PM - 03:30 PM", course: "Organic Chemistry" },
    { crn: 30133, days: "Friday",                      time: "08:00 AM - 10:00 AM", course: "Organic Chemistry" },
    { crn: 30134, days: "Friday",                      time: "10:30 AM - 12:30 PM", course: "Organic Chemistry" },
  ],
  [
    { crn: 40125, days: "Monday, Wednesday",           time: "08:00 AM - 09:05 AM", course: "Microeconomics" },
    { crn: 40126, days: "Monday, Wednesday",           time: "09:15 AM - 10:20 AM", course: "Microeconomics" },
    { crn: 40127, days: "Monday, Wednesday",           time: "10:30 AM - 11:35 AM", course: "Microeconomics" },
    { crn: 40128, days: "Monday, Wednesday",           time: "01:35 PM - 02:40 PM", course: "Microeconomics" },
    { crn: 40129, days: "Tuesday, Thursday",           time: "09:50 AM - 11:30 AM", course: "Microeconomics" },
    { crn: 40130, days: "Tuesday, Thursday",           time: "01:30 PM - 03:10 PM", course: "Microeconomics" },
    { crn: 40131, days: "Tuesday, Thursday",           time: "03:25 PM - 05:05 PM", course: "Microeconomics" },
    { crn: 40132, days: "Wednesday, Friday",           time: "02:50 PM - 03:55 PM", course: "Microeconomics" },
    { crn: 40133, days: "Wednesday, Friday",           time: "04:35 PM - 05:40 PM", course: "Microeconomics" },
    { crn: 40134, days: "Thursday, Friday",            time: "10:30 AM - 11:35 AM", course: "Microeconomics" },
  ],
];

const schedules: Schedule[] = [
  [1, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][0]]],
  [2, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][1]]],
  [3, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][2]]],
  [4, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][3]]],
  [5, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][4]]],
  [6, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][5]]],
  [7, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][6]]],
  [8, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][7]]],
  [9, [courses[0][9], courses[1][9], courses[2][9], courses[3][9], courses[4][8]]],
];

export default function Tutorials() {
    const [showSchedules, setShowSchedules] = useState(false);
  
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
            COMING SOON
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Expected to release the MVP late May, 2025
          </p>

          <div className="text-3xl">This is a demo program</div>
        </header>
  
        <div className="flex gap-8">
          <div className="w-1/2 space-y-6">
            {courses.map((group, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">{group[0].course}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {group.map((sec) => (
                    <div
                      key={sec.crn}
                      className="p-2 border rounded-lg flex flex-col"
                    >
                      <div className="font-medium text-sm">CRN {sec.crn}</div>
                      <div className="text-xs text-gray-600">{sec.days}</div>
                      <div className="text-xs text-gray-600">{sec.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
  
            <button
              onClick={() => setShowSchedules(true)}
              className="w-full py-2 bg-blue-600 text-white rounded-2xl shadow
                         hover:bg-blue-700 transition"
            >
              Generate Schedule
            </button>
          </div>
  
          {/* Right: Generated Schedules */}
          <div className="w-1/2 space-y-6">
            {showSchedules ? (
              schedules.map(([id, secs]) => (
                <div
                  key={id}
                  className="p-4 bg-white rounded-2xl shadow-md space-y-2"
                >
                  <div className="text-lg font-semibold">Schedule #{id}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secs.map((s) => (
                      <div key={s.crn} className="p-3 border rounded-lg">
                        <div className="font-medium">CRN {s.crn}</div>
                        <div className="text-sm">{s.days}</div>
                        <div className="text-sm">{s.time}</div>
                        <div className="text-xs text-gray-500">{s.course}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>No schedule generated yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  