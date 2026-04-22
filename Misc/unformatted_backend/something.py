# any other file
from db_init import db
import json


section = db.get_section("20183", "202625")
info = db.get_display_info("30398", "202630")
term = db.get_terms()

print(section)
print(info)
print(term)