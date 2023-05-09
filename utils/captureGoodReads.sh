#!/bin/bash

start=3  # initialize counting variable
stop=4

while true; do
    # construct the URL with the current value of the counting variable
    #http://localhost:3000/api/openbiblioimport/getBookCovers?start=0&stop=5
    url="http://localhost:3000/api/openbiblioimport/getBookCovers?start=$start&stop=$stop"
    
    # execute curl with the constructed URL
    curl "$url"

    #["/book/show/6272266-ein-kater-ist-kein-sofakissen?from_search=true&amp;from_srp=true&amp;qid=v9iZDWawPy&amp;rank=1\">","/book/show/6272266-ein-kater-ist-kein-sofakissen?from_search=true&amp;from_srp=true&amp;qid=v9iZDWawPy&amp;rank=1\">","/book/show/109431607-ein-kater-ist-kein-sofakissen-ab-6-j?from_search=true&amp;from_srp=true&amp;qid=v9iZDWawPy&amp;rank=2\">","/book/show/109431607-ein-kater-ist-kein-sofakissen-ab-6-j?from_search=true&amp;from_srp=true&amp;qid=v9iZDWawPy&amp;rank=2\">"]
    
    # increment the counting variable
    ((start++))
    ((stop++))
    
    # wait for one second before executing the next iteration
    sleep 1
done
