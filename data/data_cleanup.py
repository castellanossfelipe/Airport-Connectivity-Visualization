import csv

with open('data/original_data/routes.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    airportDestinationCount = {}

    for row in reader:

        sourceAirport = row['Source airport']

        if sourceAirport in airportDestinationCount:
            airportDestinationCount[sourceAirport] += 1
        else:
            airportDestinationCount[sourceAirport] = 1

with open('data/original_data/airports.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    airportName = {}
    airportCity = {}
    airportLatitude = {}
    airportLongitude = {}

    for row in reader:
        airport = row['IATA']
        airportName[airport] = row['Name']
        airportCity[airport] = row['City']
        airportLatitude[airport] = row['Latitude']
        airportLongitude[airport] = row['Longitude']

with open('data/cleaned_airport_data.csv', mode='w', newline='') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(['Name','City','IATA Code', 'Destination Count', 'Latitude', 'Longitude'])

    for iata, count in airportDestinationCount.items():
        name = airportName.get(iata, '')
        city = airportCity.get(iata, '')
        lat = airportLatitude.get(iata, '')
        lon = airportLongitude.get(iata, '')
        if lat and lon:
            writer.writerow([name, city, iata, count, lat, lon])