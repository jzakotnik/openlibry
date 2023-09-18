import os, unicodecsv as csv
# open and store the csv file
IDs = {}
with open('biblio_copy.csv','rb') as csvfile:
    timeReader = csv.reader(csvfile, delimiter = ',')
    # build dictionary with associated IDs
    for row in timeReader:
        IDs[row[0]+".jpg"] = row[3]+".jpg"
# move files
path = 'originalCovers/coverimages/'
tmpPath = 'convertedCovers/'
for oldname in os.listdir(path):
    # ignore files in path which aren't in the csv file
    if oldname in IDs:
        try:
            os.rename(os.path.join(path, oldname), os.path.join(tmpPath, IDs[oldname]))
        except:
            print ('File ' + oldname + ' could not be renamed to ' + IDs[oldname] + '!')