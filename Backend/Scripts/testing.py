import time
from itertools import product, count

# Define tables, ensuring each has exactly 10 elements
tables = [
    [
        (11409, "Monday", "10:30 AM - 11:35 AM", "Coop"),
        (11857, "Monday", "01:35 PM - 02:40 PM", "Coop"),
        (11695, "Tuesday", "01:35 PM - 02:40 PM", "Coop"),
        (11705, "Tuesday", "01:35 PM - 02:40 PM", "Coop"),
        (11858, "Tuesday", "01:35 PM - 02:40 PM", "Coop"),
        (11859, "Tuesday", "01:35 PM - 02:40 PM", "Coop"),
        (12103, "Wednesday", "01:35 PM - 02:40 PM", "Coop"),
        (12329, "Wednesday", "11:45 AM - 12:50 PM", "Coop"),
        (14588, "Wednesday", "11:45 AM - 12:50 PM", "Coop"),
        (15448, "Wednesday", "01:35 PM - 02:40 PM", "Coop")
    ],
    [
        (13924, "Monday, Wednesday, Thursday", "08:00 AM - 09:05 AM", "Calc 2"),
        (11136, "Monday, Wednesday, Thursday", "08:00 AM - 09:05 AM", "Calc 2"),
        (12275, "Monday, Wednesday, Thursday", "09:15 AM - 10:20 AM", "Calc 2"),
        (11223, "Monday, Wednesday, Thursday", "09:15 AM - 10:20 AM", "Calc 2"),
        (13788, "Monday, Wednesday, Thursday", "09:15 AM - 10:20 AM", "Calc 2"),
        (15700, "Monday, Wednesday, Thursday", "09:15 AM - 10:20 AM", "Calc 2"),
        (10699, "Monday, Wednesday, Thursday", "10:30 AM - 11:35 AM", "Calc 2"),
        (12042, "Monday, Wednesday, Thursday", "10:30 AM - 11:35 AM", "Calc 2"),
        (12211, "Monday, Wednesday, Thursday", "01:35 PM - 02:40 PM", "Calc 2"),
        (14520, "Monday, Wednesday, Thursday", "01:35 PM - 02:40 PM", "Calc 2")
    ],
    [
        (20125, "Monday, Wednesday, Friday", "09:15 AM - 10:20 AM", "Data Structures"),
        (20126, "Monday, Wednesday, Friday", "10:30 AM - 11:35 AM", "Data Structures"),
        (20127, "Monday, Wednesday, Friday", "01:35 PM - 02:40 PM", "Data Structures"),
        (20128, "Tuesday, Thursday", "09:50 AM - 11:30 AM", "Data Structures"),
        (20129, "Tuesday, Thursday", "01:30 PM - 03:10 PM", "Data Structures"),
        (20130, "Tuesday, Thursday", "03:25 PM - 05:05 PM", "Data Structures"),
        (20131, "Wednesday, Friday", "08:00 AM - 09:05 AM", "Data Structures"),
        (20132, "Wednesday, Friday", "02:50 PM - 03:55 PM", "Data Structures"),
        (20133, "Thursday, Friday", "10:30 AM - 11:35 AM", "Data Structures"),
        (20134, "Thursday, Friday", "04:35 PM - 05:40 PM", "Data Structures")
    ],
    [
        (30125, "Monday", "08:00 AM - 10:00 AM", "Organic Chemistry"),
        (30126, "Monday", "10:30 AM - 12:30 PM", "Organic Chemistry"),
        (30127, "Tuesday", "09:50 AM - 11:50 AM", "Organic Chemistry"),
        (30128, "Tuesday", "01:30 PM - 03:30 PM", "Organic Chemistry"),
        (30129, "Wednesday", "08:00 AM - 10:00 AM", "Organic Chemistry"),
        (30130, "Wednesday", "10:30 AM - 12:30 PM", "Organic Chemistry"),
        (30131, "Thursday", "09:50 AM - 11:50 AM", "Organic Chemistry"),
        (30132, "Thursday", "01:30 PM - 03:30 PM", "Organic Chemistry"),
        (30133, "Friday", "08:00 AM - 10:00 AM", "Organic Chemistry"),
        (30134, "Friday", "10:30 AM - 12:30 PM", "Organic Chemistry")
    ],
    [
        (40125, "Monday, Wednesday", "08:00 AM - 09:05 AM", "Microeconomics"),
        (40126, "Monday, Wednesday", "09:15 AM - 10:20 AM", "Microeconomics"),
        (40127, "Monday, Wednesday", "10:30 AM - 11:35 AM", "Microeconomics"),
        (40128, "Monday, Wednesday", "01:35 PM - 02:40 PM", "Microeconomics"),
        (40129, "Tuesday, Thursday", "09:50 AM - 11:30 AM", "Microeconomics"),
        (40130, "Tuesday, Thursday", "01:30 PM - 03:10 PM", "Microeconomics"),
        (40131, "Tuesday, Thursday", "03:25 PM - 05:05 PM", "Microeconomics"),
        (40132, "Wednesday, Friday", "02:50 PM - 03:55 PM", "Microeconomics"),
        (40133, "Wednesday, Friday", "04:35 PM - 05:40 PM", "Microeconomics"),
        (40134, "Thursday, Friday", "10:30 AM - 11:35 AM", "Microeconomics")
    ]
    # [
    #     (50125, "Monday, Wednesday, Friday", "08:00 AM - 09:05 AM", "World History"),
    #     (50126, "Monday, Wednesday, Friday", "09:15 AM - 10:20 AM", "World History"),
    #     (50127, "Monday, Wednesday, Friday", "10:30 AM - 11:35 AM", "World History"),
    #     (50128, "Monday, Wednesday, Friday", "01:35 PM - 02:40 PM", "World History"),
    #     (50129, "Tuesday, Thursday", "09:50 AM - 11:30 AM", "World History"),
    #     (50130, "Tuesday, Thursday", "01:30 PM - 03:10 PM", "World History"),
    #     (50131, "Tuesday, Thursday", "03:25 PM - 05:05 PM", "World History"),
    #     (50132, "Tuesday, Thursday", "06:00 PM - 07:40 PM", "World History"),
    #     (50133, "Wednesday, Friday", "02:50 PM - 03:55 PM", "World History"),
    #     (50134, "Wednesday, Friday", "04:35 PM - 05:40 PM", "World History")
    # ]
    # [
    #     (60125, "Monday", "09:15 AM - 12:15 PM", "Art Studio"),
    #     (60126, "Monday", "01:35 PM - 04:35 PM", "Art Studio"),
    #     (60127, "Tuesday", "09:50 AM - 12:50 PM", "Art Studio"),
    #     (60128, "Tuesday", "01:30 PM - 04:30 PM", "Art Studio"),
    #     (60129, "Wednesday", "09:15 AM - 12:15 PM", "Art Studio"),
    #     (60130, "Wednesday", "01:35 PM - 04:35 PM", "Art Studio"),
    #     (60131, "Thursday", "09:50 AM - 12:50 PM", "Art Studio"),
    #     (60132, "Thursday", "01:30 PM - 04:30 PM", "Art Studio"),
    #     (60133, "Friday", "09:15 AM - 12:15 PM", "Art Studio"),
    #     (60134, "Friday", "01:35 PM - 04:35 PM", "Art Studio")
    # ]
]

# Function to check if two classes overlap
def overlap(class1, class2):
    if class1[1] == class2[1]:
        start1, end1 = map(lambda x: int(x.split()[0].replace(":", "")), class1[2].split(" - "))
        start2, end2 = map(lambda x: int(x.split()[0].replace(":", "")), class2[2].split(" - "))
        return not (end1 <= start2 or end2 <= start1)
    return False

# Generate non-overlapping class combinations
def generate_combinations():
    start_time = time.time()
    id_generator = count(1)
    all_combinations = []
    for comb in product(*tables):
        if len(set(cls[3] for cls in comb)) == len(tables) and not any(overlap(c1, c2) for c1, c2 in product(comb, comb) if c1 != c2):
            combination_id = next(id_generator)
            all_combinations.append((combination_id, comb))
    end_time = time.time()
    print(f"Generated {len(all_combinations)} valid combinations in {end_time - start_time:.6f} seconds")
    for comb in all_combinations:
        print(comb)
    print(f"Generated {len(all_combinations)} valid combinations in {end_time - start_time:.6f} seconds")


if __name__ == '__main__':
    generate_combinations()
