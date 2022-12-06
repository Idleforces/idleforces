import json
import numpy as np
import random

f = open('../users.json', encoding='utf8')
users = json.load(f)

users_in_brackets = [random.shuffle([{
    "handle": user["handle"],
    "country": user["country"],
    "officialRating": user["rating"]
} for user in users["result"] if user["rating"] >=
                      lower_bound and user["rating"] < lower_bound + 60]) for lower_bound in np.arange(-1000, 5000, 60)]

users_in_brackets = [bracket[:np.sqrt(len(bracket))] for bracket in users_in_brackets]
        
trimmedUsers = {
    "status": "OK",
    "result": np.array(users_in_brackets).flatten()
}

with open("../trimmedUsers.json", "w") as outfile:
    fp = json.dump(trimmedUsers, outfile)
