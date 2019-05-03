#!/bin/bash

counter(){
    for file in "$1"/* 
    do 
    if [ -d "$file" ]
    then 
            echo "$file"
            mkdir "docs/$file"
            documentation build "$file" -f md -o "docs/$file.md" --shallow
            counter "$file"
    fi
    done
}

counter "src"