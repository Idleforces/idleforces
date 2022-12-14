import json
import random
import math
import requests
import time
from functools import reduce

response = requests.get(
    'https://codeforces.com/api/user.ratedList?activeOnly=true&includeRetired=false')
users = json.loads(response.content)

users_in_brackets = [[{
    "handle": user["handle"],
    "country": user.get("country"),
    "officialRating": user["rating"]
} for user in users["result"] if user["rating"] >=
    lower_bound and user["rating"] < lower_bound + 60] for lower_bound in range(-1000, 5000, 60)]

for bracket in users_in_brackets:
    random.shuffle(bracket)

users_in_brackets = [
    bracket[:math.floor(len(bracket) ** (3/4))] for bracket in users_in_brackets]

trimmedUsers = {
    "status": "OK",
    "timeOfSnapshot": int(1000 * time.mktime(time.gmtime(None))),
    "result": reduce(lambda x, y: x + y, users_in_brackets)
}

with open("./src/app/users/trimmedUsers.json", "w") as outfile:
    fp = json.dump(trimmedUsers, outfile)
