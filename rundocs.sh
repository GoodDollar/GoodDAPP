#!/bin/bash

counter(){
    deep=0
    for file in "$1"/* 
    do 
    if [ -d "$file" ]
    then 
            echo "$file"
            mkdir -p "docs/$file"
            documentation build "$file" -f md -o "docs/$file.md" --shallow
            if [[ $2 -gt $deep ]]
            then
                counter "$file"
            fi
            deep=$((deep+1))
    fi
    done
}

counter "src" 2