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

    airportLatitude = {}
    airportLongitude = {}

    for row in reader:
        airportLatitude[row['IATA']] = row['Latitude']
        airportLongitude[row['IATA']] = row['Longitude']

with open('data/cleaned_airport_data.csv', mode='w', newline='') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(['Source Airport', 'Destination Count', 'Latitude', 'Longitude'])

    for airport, count in airportDestinationCount.items():
        lat = airportLatitude.get(airport, '')
        lon = airportLongitude.get(airport, '')
        if lat and lon:
            writer.writerow([airport, count, lat, lon])